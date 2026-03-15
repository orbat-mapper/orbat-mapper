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
import { defaultRegistry, type MappingRegistry } from "./mappingRegistry";

// ---------------------------------------------------------------------------
// Re-exports (only items that consumers import from this module)
// ---------------------------------------------------------------------------

export {
  MappingRegistry,
  defaultRegistry,
  type CompiledPattern,
  type UserIconMapping,
  type UserMappingData,
} from "./mappingRegistry";

// Import values we need locally
import { ICON_UNSPECIFIED } from "./iconRegistry";
import { ECHELON_UNSPECIFIED } from "./echelonRegistry";

// Derived constants from the default registry, used by PatternMappingModal
// and IconBrowserModal
export const ICON_PATTERNS = defaultRegistry.iconPatterns;
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
  sidc: string;
  children: ParsedUnit[];
  level: number;
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
  const normalizedName = normalizeEchelonTokenBoundaries(name, registry);
  for (const { pattern, code } of registry.echelonPatterns) {
    if (pattern.test(normalizedName)) {
      return code;
    }
  }
  return ECHELON_UNSPECIFIED;
}

/**
 * Get echelon code based on hierarchy level (fallback).
 */
export function getEchelonCode(
  level: number,
  registry: MappingRegistry = defaultRegistry,
): string {
  const hierarchy = registry.echelonHierarchy;
  if (level < hierarchy.length) {
    return hierarchy[level];
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
  code: string;
  symbolSet?: string;
}

/**
 * Detect symbol icon code and optional symbol set from unit name.
 */
export function getIconMatchFromName(
  name: string,
  registry: MappingRegistry = defaultRegistry,
): IconMatch {
  for (const { pattern, code, symbolSet } of registry.iconPatterns) {
    if (pattern.test(name)) {
      return { code, symbolSet };
    }
  }
  return { code: ICON_UNSPECIFIED };
}

/**
 * Detect symbol icon code from unit name using keyword patterns.
 */
export function getIconCodeFromName(
  name: string,
  registry: MappingRegistry = defaultRegistry,
): string {
  return getIconMatchFromName(name, registry).code;
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
): string {
  const version = "10";
  const context = "0";
  const si = FRIENDLY_SI;
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
    echelon = getEchelonCode(level, registry);
  }

  // Detect symbol icon from name, fall back to parent icon if not detected
  const iconMatch = getIconMatchFromName(name, registry);
  let entity = iconMatch.code;
  const matchedSymbolSet = iconMatch.symbolSet;
  if (entity === ICON_UNSPECIFIED && parentIcon && parentIcon !== ICON_UNSPECIFIED) {
    entity = parentIcon;
  }

  // Use the symbol set from the matched icon definition if available
  const symbolSet = matchedSymbolSet ?? UNIT_SYMBOL_SET;

  // Naval and other non-land symbol sets don't use land echelons
  if (matchedSymbolSet && matchedSymbolSet !== UNIT_SYMBOL_SET) {
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

/**
 * Parse indented text into a hierarchical unit structure.
 */
export function parseTextToUnits(
  text: string,
  registry: MappingRegistry = defaultRegistry,
): ParsedUnit[] {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const result: ParsedUnit[] = [];
  const stack: { unit: ParsedUnit; indent: number; echelon: string; icon: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    const name = trimmed.trim();

    if (!name) continue;

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
    const sidc = buildSidc(level, name, parentEchelon, parentIcon, registry);
    const unitEchelon = getEchelonFromSidc(sidc);
    const unitIcon = getIconFromSidc(sidc);

    const unit: ParsedUnit = {
      id: nanoid(),
      name,
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
    sidc: unit.sidc,
    subUnits: unit.children.map((child) => convertParsedUnitToOrbatMapperUnit(child)),
  };
}

export function convertParsedUnitsToOrbatMapperScenario(units: ParsedUnit[]): Scenario {
  const scenarioId = nanoid();
  const now = new Date().toISOString();

  const subUnits = units.map((unit) => convertParsedUnitToOrbatMapperUnit(unit));

  const friendlyGroup: SideGroup = {
    id: nanoid(),
    name: "Units",
    subUnits,
  };

  const friendlySide: Side = {
    id: nanoid(),
    name: "Friendly",
    standardIdentity: "3",
    groups: [friendlyGroup],
  };

  const scenario: Scenario = {
    type: "ORBAT-mapper",
    id: scenarioId,
    version: "2.0.0",
    meta: {
      createdDate: now,
      lastModifiedDate: now,
    },
    name: "Text to ORBAT Scenario",
    sides: [friendlySide],
    events: [],
    layers: [],
    mapLayers: [],
  };

  return scenario;
}
