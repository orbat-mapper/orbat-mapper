import { nanoid } from "nanoid";

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

// Echelon constants (SIDC two-character codes)
export const ECHELON_UNSPECIFIED = "00";
export const ECHELON_TEAM = "11";
export const ECHELON_SQUAD = "12";
export const ECHELON_SECTION = "13";
export const ECHELON_PLATOON = "14";
export const ECHELON_COMPANY = "15";
export const ECHELON_BATTALION = "16";
export const ECHELON_REGIMENT = "17";
export const ECHELON_BRIGADE = "18";
export const ECHELON_DIVISION = "21";
export const ECHELON_CORPS = "22";
export const ECHELON_ARMY = "23";
export const ECHELON_ARMY_GROUP = "24";

// Echelon codes mapped to common unit type keywords
export const ECHELON_PATTERNS: { pattern: RegExp; code: string; label: string }[] = [
  {
    pattern: /\b(army\s*group|front|theater)\b/i,
    code: ECHELON_ARMY_GROUP,
    label: "Army Group",
  },
  { pattern: /\b(army)\b/i, code: ECHELON_ARMY, label: "Army" },
  { pattern: /\b(corps|mef)\b/i, code: ECHELON_CORPS, label: "Corps" },
  { pattern: /\b(division|div)\b/i, code: ECHELON_DIVISION, label: "Division" },
  { pattern: /\b(brigade|bde|bgde)\b/i, code: ECHELON_BRIGADE, label: "Brigade" },
  {
    pattern: /\b(regiment|regt|rgmt|group|grp)\b/i,
    code: ECHELON_REGIMENT,
    label: "Regiment",
  },
  {
    pattern: /\b(battalion|btn|bn|squadron|sqdn|sqn)\b/i,
    code: ECHELON_BATTALION,
    label: "Battalion",
  },
  {
    pattern: /\b(company|coy|co|battery|btry|bty|troop|trp)\b/i,
    code: ECHELON_COMPANY,
    label: "Company",
  },
  {
    pattern: /\b(platoon|plt|pl|detachment|det)\b/i,
    code: ECHELON_PLATOON,
    label: "Platoon",
  },
  { pattern: /\b(section|sect|sec)\b/i, code: ECHELON_SECTION, label: "Section" },
  { pattern: /\b(squad|sqd)\b/i, code: ECHELON_SQUAD, label: "Squad" },
  { pattern: /\b(team|tm|crew)\b/i, code: ECHELON_TEAM, label: "Team" },
];

// Echelon hierarchy for inferring child echelons (from largest to smallest)
export const ECHELON_HIERARCHY = [
  ECHELON_ARMY_GROUP,
  ECHELON_ARMY,
  ECHELON_CORPS,
  ECHELON_DIVISION,
  ECHELON_BRIGADE,
  ECHELON_REGIMENT,
  ECHELON_BATTALION,
  ECHELON_COMPANY,
  ECHELON_PLATOON,
  ECHELON_SECTION,
  ECHELON_SQUAD,
  ECHELON_TEAM,
];

/**
 * Get the next lower echelon code in the hierarchy
 */
export function getNextLowerEchelon(parentEchelon: string): string {
  const idx = ECHELON_HIERARCHY.indexOf(parentEchelon);
  if (idx === -1 || idx >= ECHELON_HIERARCHY.length - 1) {
    return ECHELON_UNSPECIFIED; // Unspecified
  }
  return ECHELON_HIERARCHY[idx + 1];
}

/**
 * Detect echelon code from unit name using keyword patterns
 */
export function getEchelonCodeFromName(name: string): string {
  for (const { pattern, code } of ECHELON_PATTERNS) {
    if (pattern.test(name)) {
      return code;
    }
  }
  return ECHELON_UNSPECIFIED; // Unspecified
}

/**
 * Get echelon code based on hierarchy level (fallback)
 */
export function getEchelonCode(level: number): string {
  if (level < ECHELON_HIERARCHY.length) {
    return ECHELON_HIERARCHY[level];
  }
  return ECHELON_HIERARCHY[ECHELON_HIERARCHY.length - 1];
}

/**
 * Build a 2525D SIDC for a unit
 */
export function buildSidc(level: number, name: string, parentEchelon?: string): string {
  const version = "10";
  const context = "0";
  const si = FRIENDLY_SI;
  const symbolSet = UNIT_SYMBOL_SET;
  const status = "0";
  const hqtfd = "0";

  // Try to detect echelon from name first
  let echelon = getEchelonCodeFromName(name);

  // If not detected from name, infer from parent echelon
  if (
    echelon === ECHELON_UNSPECIFIED &&
    parentEchelon &&
    parentEchelon !== ECHELON_UNSPECIFIED
  ) {
    echelon = getNextLowerEchelon(parentEchelon);
  }

  // If still not determined, fall back to level-based
  if (echelon === ECHELON_UNSPECIFIED) {
    echelon = getEchelonCode(level);
  }

  const entity = "000000";
  const modifiers = "0000";

  return (
    version + context + si + symbolSet + status + hqtfd + echelon + entity + modifiers
  );
}

/**
 * Extract echelon code from SIDC (positions 8-9)
 */
export function getEchelonFromSidc(sidc: string): string {
  return sidc.substring(8, 10);
}

/**
 * Parse indented text into a hierarchical unit structure
 */
export function parseTextToUnits(text: string): ParsedUnit[] {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const result: ParsedUnit[] = [];
  const stack: { unit: ParsedUnit; indent: number; echelon: string }[] = [];

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

    // Get parent's echelon if available
    const parentEchelon = stack.length > 0 ? stack[stack.length - 1].echelon : undefined;
    const sidc = buildSidc(level, name, parentEchelon);
    const unitEchelon = getEchelonFromSidc(sidc);

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

    stack.push({ unit, indent, echelon: unitEchelon });
  }

  return result;
}
