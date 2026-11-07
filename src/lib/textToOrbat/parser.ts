/**
 * Text parsing and SIDC inference: turns indented text into a unit tree whose
 * symbols are guessed from names, metadata and the parent unit.
 */

import { nanoid } from "nanoid";
import { normalizeInput, type MappingRegistry } from "./mappingRegistry";
import {
  ICON_UNSPECIFIED,
  buildIconSidc,
  extractEntityCode,
  extractSymbolSet,
} from "./iconRegistry";
import { ECHELON_UNSPECIFIED } from "./echelonRegistry";
import { readUnitLine } from "./lineSyntax";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A unit read from one line of text. */
export interface ParsedUnit {
  /** Random id, new on every parse. */
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  /** 20-character MIL-STD-2525D/E SIDC. */
  sidc: string;
  children: ParsedUnit[];
  /** Depth in the tree, 0 for root units. */
  level: number;
}

/** The fields the text format can express; any richer unit type fits. */
export interface TextUnit {
  name: string;
  shortName?: string;
  description?: string;
  subUnits?: TextUnit[];
}

/** A plain unit tree, shaped like ORBAT Mapper's and tactrace's `Unit`. */
export interface OrbatUnit {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  sidc: string;
  subUnits: OrbatUnit[];
}

/**
 * How comma-separated fields map to unit fields. `"off"` keeps commas in the
 * name.
 */
export type CommaFieldOrder = "shortName,name,description" | "name,shortName,description";

export interface ParseOptions {
  /** How to split comma-separated fields. Default: no splitting. */
  fields?: "off" | CommaFieldOrder;
  /** SIDC standard identity digit. Default `"3"` (friend). */
  standardIdentity?: string;
  /**
   * Echelon code given to root units whose echelon cannot be inferred.
   * Default `"18"` (brigade); deeper levels step down the hierarchy.
   */
  startingEchelon?: string;
}

/** Indentation step used when writing text. */
export const INDENT_SIZE = 2;

const FRIENDLY_SI = "3";
const LAND_UNIT_SYMBOL_SET = "10";

// ---------------------------------------------------------------------------
// Internal: designator boundary normalisation
// ---------------------------------------------------------------------------

const UNIT_DESIGNATOR_PATTERN = /^(?:\d+(?:st|nd|rd|th)?|[ivxlcdm]+|[a-z])$/i;

/** Split concatenated designators such as "2bn" into "2 bn". */
function normalizeEchelonTokenBoundaries(
  name: string,
  registry: MappingRegistry,
): string {
  const suffixes = registry.concatenatedSuffixes;
  return name
    .split(/(\s+)/)
    .map((segment) => {
      if (!segment.trim()) return segment;

      const match = segment.match(/^([A-Za-z0-9]+)([^A-Za-z0-9]*)$/);
      if (!match) return segment;

      const [, core, trailing] = match;
      const lowerCore = core.toLowerCase();

      for (const suffix of suffixes) {
        if (!lowerCore.endsWith(suffix) || core.length <= suffix.length) continue;

        const prefix = core.slice(0, core.length - suffix.length);
        if (!UNIT_DESIGNATOR_PATTERN.test(prefix)) continue;

        const suffixOriginal = core.slice(core.length - suffix.length);
        return `${prefix} ${suffixOriginal}${trailing}`;
      }

      return segment;
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Echelon helpers
// ---------------------------------------------------------------------------

/**
 * Get the next lower echelon code in the hierarchy.
 */
export function getNextLowerEchelon(
  parentEchelon: string,
  registry: MappingRegistry,
): string {
  const hierarchy = registry.echelonHierarchy;
  const idx = hierarchy.indexOf(parentEchelon);
  if (idx === -1 || idx >= hierarchy.length - 1) {
    return ECHELON_UNSPECIFIED;
  }
  return hierarchy[idx + 1];
}

/**
 * Detect echelon code from unit name using keyword patterns.
 */
export function getEchelonCodeFromName(name: string, registry: MappingRegistry): string {
  const normalizedName = normalizeInput(normalizeEchelonTokenBoundaries(name, registry));
  for (const { pattern, code } of registry.echelonPatterns) {
    if (pattern.test(normalizedName)) {
      return code;
    }
  }
  return ECHELON_UNSPECIFIED;
}

/**
 * Get echelon code based on hierarchy level (fallback).
 * If a starting echelon is provided, level 0 maps to that echelon.
 * Otherwise defaults to brigade (index 4).
 */
export function getEchelonCode(
  level: number,
  registry: MappingRegistry,
  startingEchelon?: string,
): string {
  const hierarchy = registry.echelonHierarchy;
  let startIdx = 4; // default: brigade
  if (startingEchelon) {
    const found = hierarchy.indexOf(startingEchelon);
    if (found >= 0) startIdx = found;
  }
  const idx = level + startIdx;
  if (idx < hierarchy.length) {
    return hierarchy[idx];
  }
  return hierarchy[hierarchy.length - 1];
}

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------

/**
 * Detect symbol icon and return a full 20-char template SIDC from unit name.
 */
export function getIconMatchFromName(
  name: string,
  registry: MappingRegistry,
): { sidc: string } {
  const normalized = normalizeInput(name);
  for (const { pattern, code } of registry.iconPatterns) {
    if (pattern.test(normalized)) {
      return { sidc: code };
    }
  }
  return { sidc: buildIconSidc(ICON_UNSPECIFIED) };
}

// ---------------------------------------------------------------------------
// SIDC building
// ---------------------------------------------------------------------------

export interface SidcInput {
  /** Depth in the tree, used when nothing else gives an echelon. */
  level: number;
  /** The unit name (comma fields included). */
  displayName: string;
  /** Metadata text, matched before the name. */
  metadataName?: string;
  parentEchelon?: string;
  parentIcon?: string;
  standardIdentity?: string;
  startingEchelon?: string;
}

export interface SymbolInference {
  sidc: string;
  /** Echelon code matched in the metadata or name, before any fallback. */
  matchedEchelon: string;
  /** Template SIDC of the icon matched in the metadata or name. */
  matchedIcon: string;
}

/**
 * Infer a SIDC. Echelon: metadata, then name, then one below the parent, then
 * the level. Icon: metadata, then name, then the parent's icon. Symbol sets
 * other than land units get no echelon.
 */
export function inferSymbol(
  input: SidcInput,
  registry: MappingRegistry,
): SymbolInference {
  const { level, displayName, metadataName, parentEchelon, parentIcon } = input;
  const si = input.standardIdentity ?? FRIENDLY_SI;

  let matchedEchelon =
    (metadataName && getEchelonCodeFromName(metadataName, registry)) ||
    ECHELON_UNSPECIFIED;

  if (matchedEchelon === ECHELON_UNSPECIFIED) {
    matchedEchelon = getEchelonCodeFromName(displayName, registry);
  }

  let echelon = matchedEchelon;

  if (
    echelon === ECHELON_UNSPECIFIED &&
    parentEchelon &&
    parentEchelon !== ECHELON_UNSPECIFIED
  ) {
    echelon = getNextLowerEchelon(parentEchelon, registry);
  }

  if (echelon === ECHELON_UNSPECIFIED) {
    echelon = getEchelonCode(level, registry, input.startingEchelon);
  }

  const metadataIconMatch = metadataName
    ? getIconMatchFromName(metadataName, registry)
    : undefined;
  const iconMatch =
    metadataIconMatch && extractEntityCode(metadataIconMatch.sidc) !== ICON_UNSPECIFIED
      ? metadataIconMatch
      : getIconMatchFromName(displayName, registry);

  let entity = extractEntityCode(iconMatch.sidc);
  const symbolSet = extractSymbolSet(iconMatch.sidc);
  if (entity === ICON_UNSPECIFIED && parentIcon && parentIcon !== ICON_UNSPECIFIED) {
    entity = parentIcon;
  }

  // Naval and other non-land symbol sets don't use land echelons
  if (symbolSet !== LAND_UNIT_SYMBOL_SET) {
    echelon = ECHELON_UNSPECIFIED;
  }

  return {
    // version, context, SI, symbol set, status, HQ/TF/dummy, echelon, entity
    sidc: "10" + "0" + si + symbolSet + "0" + "0" + echelon + entity,
    matchedEchelon,
    matchedIcon: iconMatch.sidc,
  };
}

/**
 * Extract echelon code from SIDC (positions 8-9).
 */
export function getEchelonFromSidc(sidc: string): string {
  return sidc.substring(8, 10);
}

// ---------------------------------------------------------------------------
// Text parsing
// ---------------------------------------------------------------------------

interface CommaSplitResult {
  name: string;
  shortName?: string;
  description?: string;
}

function splitCommaFields(displayName: string, order: CommaFieldOrder): CommaSplitResult {
  const parts = displayName.split(",").map((p) => p.trim());
  if (parts.length === 1) {
    return { name: parts[0] };
  }
  if (order === "name,shortName,description") {
    if (parts.length >= 3) {
      return {
        name: parts[0],
        shortName: parts[1] || undefined,
        description: parts.slice(2).join(", ") || undefined,
      };
    }
    return { name: parts[0], shortName: parts[1] || undefined };
  }
  // shortName,name,description
  if (parts.length >= 3) {
    return {
      shortName: parts[0] || undefined,
      name: parts[1],
      description: parts.slice(2).join(", ") || undefined,
    };
  }
  return { shortName: parts[0] || undefined, name: parts[1] };
}

/**
 * Parse indented text into a hierarchical unit structure.
 */
export function parseTextToUnits(
  text: string,
  registry: MappingRegistry,
  options: ParseOptions = {},
): ParsedUnit[] {
  const fieldOrder = options.fields ?? "off";

  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const result: ParsedUnit[] = [];
  const stack: { unit: ParsedUnit; indent: number; echelon: string; icon: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    const { displayName, metadataName } = readUnitLine(trimmed.trim());

    if (!displayName) continue;

    const fields =
      fieldOrder === "off"
        ? { name: displayName }
        : splitCommaFields(displayName, fieldOrder);

    // Find parent based on indentation
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const level = stack.length;
    const parent = stack[stack.length - 1];

    // The full display name (all comma parts) is used for matching
    const { sidc } = inferSymbol(
      {
        level,
        displayName,
        metadataName,
        parentEchelon: parent?.echelon,
        parentIcon: parent?.icon,
        standardIdentity: options.standardIdentity,
        startingEchelon: options.startingEchelon,
      },
      registry,
    );

    const unit: ParsedUnit = {
      id: nanoid(12),
      name: fields.name,
      ...(fields.shortName !== undefined && { shortName: fields.shortName }),
      ...(fields.description !== undefined && { description: fields.description }),
      sidc,
      children: [],
      level,
    };

    if (parent) {
      parent.unit.children.push(unit);
    } else {
      result.push(unit);
    }

    stack.push({
      unit,
      indent,
      echelon: getEchelonFromSidc(sidc),
      icon: extractEntityCode(sidc),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

/** Convert parsed units to a plain unit tree with fresh ids. */
export function toUnits(units: ParsedUnit[]): OrbatUnit[] {
  return units.map((unit) => ({
    id: nanoid(),
    name: unit.name,
    ...(unit.shortName !== undefined && { shortName: unit.shortName }),
    ...(unit.description !== undefined && { description: unit.description }),
    sidc: unit.sidc,
    subUnits: toUnits(unit.children),
  }));
}

/** Text for one unit: `name[, shortName[, description]]`. */
export function formatUnitFields(unit: TextUnit): string {
  let line = unit.name;
  if (unit.shortName || unit.description) {
    line += ", " + (unit.shortName ?? "");
    if (unit.description) {
      line += ", " + unit.description;
    }
  }
  return line;
}

/**
 * Write units as indented text in `name,shortName,description` order, the
 * inverse of parsing with that field order.
 */
export function unitsToText(units: TextUnit[], depth = 0): string {
  const indent = " ".repeat(INDENT_SIZE * depth);
  return units
    .map((unit) => {
      const children = unit.subUnits?.length
        ? "\n" + unitsToText(unit.subUnits, depth + 1)
        : "";
      return indent + formatUnitFields(unit) + children;
    })
    .join("\n");
}
