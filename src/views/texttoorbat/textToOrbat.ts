/**
 * Text-to-ORBAT parser and SIDC builder.
 *
 * This module is the main entry point for consumers. It re-exports all icon
 * and echelon constants for backward compatibility and delegates pattern
 * matching to a {@link MappingRegistry} instance (defaulting to the built-in
 * registry when none is supplied).
 */

import { nanoid } from "nanoid";
import {
  makeSpatialIllusionsNode,
  type SpatialIllusionsOrbat,
} from "@/types/externalModels";
import type { Scenario, Side, SideGroup, Unit } from "@/types/scenarioModels";
import type { SidValue } from "@/symbology/values";
import { defaultRegistry, normalizeInput, type MappingRegistry } from "./mappingRegistry";
import { createShortUnitName } from "@/utils";

// ---------------------------------------------------------------------------
// Re-exports (only items that consumers import from this module)
// ---------------------------------------------------------------------------

export {
  MappingRegistry,
  defaultRegistry,
  type CompiledPattern,
  type AllMappingData,
} from "./mappingRegistry";

// Import values we need locally
import {
  ICON_UNSPECIFIED,
  buildIconSidc,
  extractEntityCode,
  extractSymbolSet,
} from "./iconRegistry";
import { ECHELON_UNSPECIFIED } from "./echelonRegistry";

// Derived constants from the default registry, used by PatternMappingModal
export const ECHELON_PATTERNS = defaultRegistry.echelonPatterns;
export const ICON_CODE_TO_NAME = defaultRegistry.iconCodeToName;
export const ECHELON_CODE_TO_NAME = defaultRegistry.echelonCodeToName;
export const ECHELON_HIERARCHY = defaultRegistry.echelonHierarchy;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedUnit {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  sidc: string;
  children: ParsedUnit[];
  level: number;
}

export type CommaFieldOrder = "shortName,name,description" | "name,shortName,description";

export interface ParseTextOptions {
  registry?: MappingRegistry;
  useCommaSeparator?: boolean;
  commaFieldOrder?: CommaFieldOrder;
  standardIdentity?: string;
  defaultStartingEchelon?: string;
}

// Indentation configuration
export const INDENT_SIZE = 2;

// Standard identity for friendly units
const FRIENDLY_SI = "3";
// Symbol set for land units
const UNIT_SYMBOL_SET = "10";

// ---------------------------------------------------------------------------
// Internal: designator boundary normalisation
// ---------------------------------------------------------------------------

const UNIT_DESIGNATOR_PATTERN = /^(?:\d+(?:st|nd|rd|th)?|[ivxlcdm]+|[a-z])$/i;

function normalizeMetadataWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

interface NormalizedUnitLine {
  displayName: string;
  metadataName: string;
}

function stripComment(line: string): string {
  const commentIndex = line.indexOf("#");
  if (commentIndex === -1) {
    return line;
  }
  return line.slice(0, commentIndex);
}

function normalizeUnitLine(line: string): NormalizedUnitLine {
  const metadataSegments: string[] = [];
  let displayName = stripComment(line);

  displayName = displayName.replace(/\[([^[\]]*)\]/g, (match, inner: string) => {
    const normalized = normalizeMetadataWhitespace(inner);
    if (normalized) metadataSegments.push(normalized);
    return normalized ? " " : "";
  });

  const slashSlashIndex = displayName.indexOf("//");
  if (slashSlashIndex !== -1) {
    const metadata = normalizeMetadataWhitespace(displayName.slice(slashSlashIndex + 2));
    if (metadata) metadataSegments.push(metadata);
    displayName = displayName.slice(0, slashSlashIndex);
  }

  const pipeCount = [...displayName].filter((char) => char === "|").length;
  if (pipeCount === 1) {
    const pipeIndex = displayName.indexOf("|");
    const metadata = normalizeMetadataWhitespace(displayName.slice(pipeIndex + 1));
    if (metadata) metadataSegments.push(metadata);
    displayName = displayName.slice(0, pipeIndex);
  } else if (pipeCount >= 2) {
    displayName = displayName.replace(/\|([^|]*)\|/g, (match, inner: string) => {
      const normalized = normalizeMetadataWhitespace(inner);
      if (normalized) metadataSegments.push(normalized);
      return normalized ? " " : "";
    });
  }

  const normalizedDisplayName = normalizeMetadataWhitespace(displayName);
  return {
    displayName: normalizedDisplayName,
    metadataName: metadataSegments.join(" "),
  };
}

function normalizeEchelonTokenBoundaries(
  name: string,
  registry: MappingRegistry = defaultRegistry,
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
  registry: MappingRegistry = defaultRegistry,
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
export function getEchelonCodeFromName(
  name: string,
  registry: MappingRegistry = defaultRegistry,
): string {
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
  registry: MappingRegistry = defaultRegistry,
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
 * Result of matching a name against icon patterns.
 */
export interface IconMatch {
  /** Full 20-char template SIDC for the matched icon. */
  sidc: string;
}

/**
 * Detect symbol icon and return a full template SIDC from unit name.
 */
export function getIconMatchFromName(
  name: string,
  registry: MappingRegistry = defaultRegistry,
): IconMatch {
  const normalized = normalizeInput(name);
  for (const { pattern, code } of registry.iconPatterns) {
    if (pattern.test(normalized)) {
      return { sidc: code };
    }
  }
  return { sidc: buildIconSidc(ICON_UNSPECIFIED) };
}

/**
 * Detect symbol icon code from unit name using keyword patterns.
 * Returns a 10-char entity code for backward compatibility.
 */
export function getIconCodeFromName(
  name: string,
  registry: MappingRegistry = defaultRegistry,
): string {
  return extractEntityCode(getIconMatchFromName(name, registry).sidc);
}

// ---------------------------------------------------------------------------
// SIDC building
// ---------------------------------------------------------------------------

/**
 * Build a 2525D SIDC for a unit.
 */
export function buildSidc(
  level: number,
  name: string,
  parentEchelon?: string,
  parentIcon?: string,
  registry: MappingRegistry = defaultRegistry,
  si: string = FRIENDLY_SI,
  startingEchelon?: string,
): string {
  const version = "10";
  const context = "0";
  const status = "0";
  const hqtfd = "0";

  // Try to detect echelon from name first
  let echelon = getEchelonCodeFromName(name, registry);

  // If not detected from name, infer from parent echelon
  if (
    echelon === ECHELON_UNSPECIFIED &&
    parentEchelon &&
    parentEchelon !== ECHELON_UNSPECIFIED
  ) {
    echelon = getNextLowerEchelon(parentEchelon, registry);
  }

  // If still not determined, fall back to level-based
  if (echelon === ECHELON_UNSPECIFIED) {
    echelon = getEchelonCode(level, registry, startingEchelon);
  }

  // Detect symbol icon from name, fall back to parent icon if not detected
  const iconMatch = getIconMatchFromName(name, registry);
  let entity = extractEntityCode(iconMatch.sidc);
  const matchedSymbolSet = extractSymbolSet(iconMatch.sidc);
  if (entity === ICON_UNSPECIFIED && parentIcon && parentIcon !== ICON_UNSPECIFIED) {
    entity = parentIcon;
  }

  // Use the symbol set from the matched icon definition if available
  const symbolSet = matchedSymbolSet;

  // Naval and other non-land symbol sets don't use land echelons
  if (matchedSymbolSet !== UNIT_SYMBOL_SET) {
    echelon = ECHELON_UNSPECIFIED;
  }

  return version + context + si + symbolSet + status + hqtfd + echelon + entity;
}

function buildSidcWithMetadataPriority(
  level: number,
  displayName: string,
  metadataName: string,
  parentEchelon?: string,
  parentIcon?: string,
  registry: MappingRegistry = defaultRegistry,
  si: string = FRIENDLY_SI,
  startingEchelon?: string,
): string {
  const version = "10";
  const context = "0";
  const status = "0";
  const hqtfd = "0";

  let echelon =
    (metadataName && getEchelonCodeFromName(metadataName, registry)) ||
    ECHELON_UNSPECIFIED;

  if (echelon === ECHELON_UNSPECIFIED) {
    echelon = getEchelonCodeFromName(displayName, registry);
  }

  if (
    echelon === ECHELON_UNSPECIFIED &&
    parentEchelon &&
    parentEchelon !== ECHELON_UNSPECIFIED
  ) {
    echelon = getNextLowerEchelon(parentEchelon, registry);
  }

  if (echelon === ECHELON_UNSPECIFIED) {
    echelon = getEchelonCode(level, registry, startingEchelon);
  }

  const unspecifiedSidc = buildIconSidc(ICON_UNSPECIFIED);
  const metadataIconMatch = metadataName
    ? getIconMatchFromName(metadataName, registry)
    : { sidc: unspecifiedSidc };
  const displayIconMatch = getIconMatchFromName(displayName, registry);
  const iconMatch =
    extractEntityCode(metadataIconMatch.sidc) !== ICON_UNSPECIFIED
      ? metadataIconMatch
      : displayIconMatch;

  let entity = extractEntityCode(iconMatch.sidc);
  const matchedSymbolSet = extractSymbolSet(iconMatch.sidc);
  if (entity === ICON_UNSPECIFIED && parentIcon && parentIcon !== ICON_UNSPECIFIED) {
    entity = parentIcon;
  }

  const symbolSet = matchedSymbolSet;

  if (matchedSymbolSet !== UNIT_SYMBOL_SET) {
    echelon = ECHELON_UNSPECIFIED;
  }

  return version + context + si + symbolSet + status + hqtfd + echelon + entity;
}

/**
 * Extract echelon code from SIDC (positions 8-9).
 */
export function getEchelonFromSidc(sidc: string): string {
  return sidc.substring(8, 10);
}

/**
 * Extract icon/entity code from SIDC (positions 10-19, 10 characters).
 */
export function getIconFromSidc(sidc: string): string {
  return sidc.substring(10, 20);
}

// ---------------------------------------------------------------------------
// Text parsing
// ---------------------------------------------------------------------------

interface CommaSplitResult {
  name: string;
  shortName?: string;
  description?: string;
}

function splitCommaFields(
  displayName: string,
  order: CommaFieldOrder = "shortName,name,description",
): CommaSplitResult {
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
  // shortName,name,description (default)
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
  registryOrOptions?: MappingRegistry | ParseTextOptions,
): ParsedUnit[] {
  let registry: MappingRegistry = defaultRegistry;
  let useCommaSeparator = false;
  let commaFieldOrder: CommaFieldOrder = "shortName,name,description";
  let si = FRIENDLY_SI;
  let startingEchelon: string | undefined;
  if (registryOrOptions) {
    if ("iconPatterns" in registryOrOptions) {
      registry = registryOrOptions;
    } else {
      registry = registryOrOptions.registry ?? defaultRegistry;
      useCommaSeparator = registryOrOptions.useCommaSeparator ?? false;
      commaFieldOrder = registryOrOptions.commaFieldOrder ?? "shortName,name,description";
      si = registryOrOptions.standardIdentity ?? FRIENDLY_SI;
      startingEchelon = registryOrOptions.defaultStartingEchelon;
    }
  }

  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const result: ParsedUnit[] = [];
  const stack: { unit: ParsedUnit; indent: number; echelon: string; icon: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    const normalizedLine = normalizeUnitLine(trimmed.trim());
    const displayName = normalizedLine.displayName;

    if (!displayName) continue;

    const fields = useCommaSeparator
      ? splitCommaFields(displayName, commaFieldOrder)
      : { name: displayName };

    // Use the full display name (all comma parts) for SIDC pattern matching
    const nameForMatching = displayName;

    // Determine the level based on indentation
    let level = 0;
    if (stack.length > 0) {
      // Find parent based on indentation
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      level = stack.length;
    }

    // Get parent's echelon and icon if available
    const parentEchelon = stack.length > 0 ? stack[stack.length - 1].echelon : undefined;
    const parentIcon = stack.length > 0 ? stack[stack.length - 1].icon : undefined;
    const sidc = buildSidcWithMetadataPriority(
      level,
      nameForMatching,
      normalizedLine.metadataName,
      parentEchelon,
      parentIcon,
      registry,
      si,
      startingEchelon,
    );
    const unitEchelon = getEchelonFromSidc(sidc);
    const unitIcon = getIconFromSidc(sidc);

    const unit: ParsedUnit = {
      id: nanoid(12),
      name: fields.name,
      ...(fields.shortName !== undefined && { shortName: fields.shortName }),
      ...(fields.description !== undefined && { description: fields.description }),
      sidc,
      children: [],
      level,
    };

    if (stack.length === 0) {
      result.push(unit);
    } else {
      stack[stack.length - 1].unit.children.push(unit);
    }

    stack.push({ unit, indent, echelon: unitEchelon, icon: unitIcon });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

export function convertParsedUnitToSpatialIllusions(
  unit: ParsedUnit,
): SpatialIllusionsOrbat {
  const subOrganizations = unit.children.map((child) =>
    convertParsedUnitToSpatialIllusions(child),
  );
  return makeSpatialIllusionsNode(
    {
      uniqueDesignation: unit.name,
      sidc: unit.sidc,
    },
    subOrganizations,
  );
}

export function convertParsedUnitsToSpatialIllusions(
  units: ParsedUnit[],
): SpatialIllusionsOrbat {
  if (units.length === 0) {
    return makeSpatialIllusionsNode({
      uniqueDesignation: "ORBAT",
      sidc: "10031000001211000000",
    });
  }

  // Spatial Illusions only supports a single root unit
  return convertParsedUnitToSpatialIllusions(units[0]);
}

function convertParsedUnitToOrbatMapperUnit(unit: ParsedUnit): Unit {
  return {
    id: unit.id,
    name: unit.name,
    ...(unit.shortName !== undefined && { shortName: unit.shortName }),
    ...(unit.description !== undefined && { description: unit.description }),
    sidc: unit.sidc,
    subUnits: unit.children.map((child) => convertParsedUnitToOrbatMapperUnit(child)),
  };
}

export function serializeParsedUnitToScenarioUnit(unit: ParsedUnit): Unit {
  return {
    id: nanoid(),
    name: unit.name,
    ...(unit.shortName !== undefined && { shortName: unit.shortName }),
    ...(unit.description !== undefined && { description: unit.description }),
    sidc: unit.sidc,
    subUnits: unit.children.map((child) => serializeParsedUnitToScenarioUnit(child)),
  };
}

export function serializeParsedUnitsToScenarioUnits(units: ParsedUnit[]): Unit[] {
  return units.map((unit) => serializeParsedUnitToScenarioUnit(unit));
}

export function serializeUnitsToIndentedText(units: Unit[], depth = 0): string {
  const indent = "  ".repeat(depth);
  return units
    .map((unit) => {
      let line = indent + unit.name;
      // Append shortName and description using comma-separated format
      if (unit.shortName || unit.description) {
        line += ", " + (unit.shortName ?? "");
        if (unit.description) {
          line += ", " + unit.description;
        }
      }
      const children = unit.subUnits?.length
        ? "\n" + serializeUnitsToIndentedText(unit.subUnits, depth + 1)
        : "";
      return line + children;
    })
    .join("\n");
}

export interface ShortNameGenerationOptions {
  maxLength?: number;
  uppercase?: boolean;
  allowWhitespace?: boolean;
  forceLength?: boolean;
}

function flattenParsedUnits(units: ParsedUnit[]): ParsedUnit[] {
  return units.flatMap((unit) => [unit, ...flattenParsedUnits(unit.children)]);
}

function flattenScenarioUnits(units: Unit[]): Unit[] {
  return units.flatMap((unit) => [unit, ...flattenScenarioUnits(unit.subUnits ?? [])]);
}

function findMarkupStartIndex(body: string): number {
  const candidates: number[] = [];

  const slashSlashIndex = body.indexOf("//");
  if (slashSlashIndex !== -1) candidates.push(slashSlashIndex);

  const pipeIndex = body.indexOf("|");
  if (pipeIndex !== -1) candidates.push(pipeIndex);

  const bracketStart = body.indexOf("[");
  if (bracketStart !== -1 && body.indexOf("]", bracketStart + 1) !== -1) {
    candidates.push(bracketStart);
  }

  if (candidates.length === 0) return body.length;

  let start = Math.min(...candidates);
  if (start > 0 && body[start - 1] === " ") {
    start -= 1;
  }
  return start;
}

function buildNameShortNameDescriptionText(unit: ParsedUnit | Unit): string {
  let line = unit.name;
  if (unit.shortName || unit.description) {
    line += ", " + (unit.shortName ?? "");
    if (unit.description) {
      line += ", " + unit.description;
    }
  }
  return line;
}

export function applyGeneratedShortNamesToText(
  text: string,
  originalUnits: ParsedUnit[],
  updatedUnits: Unit[],
) {
  const originalFlatUnits = flattenParsedUnits(originalUnits);
  const updatedFlatUnits = flattenScenarioUnits(updatedUnits);
  const lines = text.split("\n");
  let unitIndex = 0;
  let updatedCount = 0;

  const nextLine = lines.map((line) => {
    const trimmedStart = line.trimStart();
    const normalizedLine = normalizeUnitLine(trimmedStart.trim());
    if (!normalizedLine.displayName) {
      return line;
    }

    const originalUnit = originalFlatUnits[unitIndex];
    const updatedUnit = updatedFlatUnits[unitIndex];
    unitIndex += 1;

    if (!originalUnit || !updatedUnit) {
      return line;
    }

    const originalShortName = originalUnit.shortName?.trim() ?? "";
    const updatedShortName = updatedUnit.shortName?.trim() ?? "";
    const originalDescription = originalUnit.description ?? "";
    const updatedDescription = updatedUnit.description ?? "";

    if (
      originalShortName === updatedShortName &&
      originalDescription === updatedDescription &&
      originalUnit.name === updatedUnit.name
    ) {
      return line;
    }

    const indentLength = line.length - trimmedStart.length;
    const indent = line.slice(0, indentLength);

    const commentIndex = line.indexOf("#", indentLength);
    const bodyEnd = commentIndex === -1 ? line.length : commentIndex;
    const body = line.slice(indentLength, bodyEnd);
    const comment = commentIndex === -1 ? "" : line.slice(commentIndex);

    const markupStart = findMarkupStartIndex(body);
    const markup = body.slice(markupStart);

    updatedCount += 1;
    return `${indent}${buildNameShortNameDescriptionText(updatedUnit)}${markup}${comment}`;
  });

  return {
    text: nextLine.join("\n"),
    updatedCount,
  };
}

interface GenerateMissingShortNamesResult {
  units: Unit[];
  generatedCount: number;
}

function cloneUnit(unit: Unit): Unit {
  return {
    ...unit,
    subUnits: unit.subUnits?.map((child) => cloneUnit(child)),
  };
}

function generateMissingShortNamesForSiblings(
  units: Unit[],
): GenerateMissingShortNamesResult {
  return generateMissingShortNamesForSiblingsWithOptions(units, {});
}

function generateMissingShortNamesForSiblingsWithOptions(
  units: Unit[],
  options: ShortNameGenerationOptions,
): GenerateMissingShortNamesResult {
  const clonedUnits = units.map((unit) => cloneUnit(unit));
  const siblingNames = clonedUnits.map((unit) => unit.name);
  const reservedShortNames = clonedUnits
    .map((unit) => unit.shortName?.trim())
    .filter((shortName): shortName is string => Boolean(shortName));

  let generatedCount = 0;

  for (const unit of clonedUnits) {
    if (!unit.shortName?.trim()) {
      const generatedShortName = createShortUnitName(unit.name, {
        maxLength: options.maxLength ?? 8,
        otherNames: siblingNames,
        existingShortNames: reservedShortNames,
        uppercase: options.uppercase ?? true,
        allowWhitespace: options.allowWhitespace ?? true,
        forceLength: options.forceLength ?? false,
      });

      if (generatedShortName && generatedShortName.trim() !== unit.name.trim()) {
        unit.shortName = generatedShortName;
        reservedShortNames.push(generatedShortName);
        generatedCount += 1;
      }
    }

    if (unit.subUnits?.length) {
      const childResult = generateMissingShortNamesForSiblingsWithOptions(
        unit.subUnits,
        options,
      );
      unit.subUnits = childResult.units;
      generatedCount += childResult.generatedCount;
    }
  }

  return { units: clonedUnits, generatedCount };
}

export function generateMissingShortNames(
  units: Unit[],
): GenerateMissingShortNamesResult {
  return generateMissingShortNamesForSiblings(units);
}

export function generateMissingShortNamesWithOptions(
  units: Unit[],
  options: ShortNameGenerationOptions,
): GenerateMissingShortNamesResult {
  return generateMissingShortNamesForSiblingsWithOptions(units, options);
}

export function clearAllShortNames(units: Unit[]): Unit[] {
  return units.map((unit) => ({
    ...unit,
    shortName: undefined,
    subUnits: unit.subUnits ? clearAllShortNames(unit.subUnits) : unit.subUnits,
  }));
}

const SI_NAMES: Record<string, string> = {
  "0": "Pending",
  "1": "Unknown",
  "2": "Assumed Friend",
  "3": "Friendly",
  "4": "Neutral",
  "5": "Suspect",
  "6": "Hostile",
};

export function convertParsedUnitsToOrbatMapperScenario(
  units: ParsedUnit[],
  standardIdentity: string = "3",
): Scenario {
  const scenarioId = nanoid(12);
  const now = new Date().toISOString();

  const subUnits = units.map((unit) => convertParsedUnitToOrbatMapperUnit(unit));

  const friendlyGroup: SideGroup = {
    id: nanoid(),
    name: "Units",
    subUnits,
  };

  const side: Side = {
    id: nanoid(),
    name: SI_NAMES[standardIdentity] ?? "Friendly",
    standardIdentity: standardIdentity as SidValue,
    groups: [friendlyGroup],
  };

  const scenario: Scenario = {
    type: "ORBAT-mapper",
    id: scenarioId,
    version: "3.0.0",
    meta: {
      createdDate: now,
      lastModifiedDate: now,
    },
    name: "Text to ORBAT Scenario",
    sides: [side],
    events: [],
    layerStack: [{ id: nanoid(), kind: "overlay", name: "Features", items: [] }],
  };

  return scenario;
}
