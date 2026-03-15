/**
 * Echelon registry — single source of truth for all echelon definitions.
 *
 * Each echelon is defined once as an {@link EchelonDefinition}. Constants,
 * pattern lists and the echelon hierarchy are derived automatically.
 *
 * Array order = hierarchy order (largest → smallest) AND matching priority.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EchelonDefinition {
  /** Internal key, e.g. "ECHELON_DIVISION" */
  name: string;
  /** 2-character SIDC echelon code */
  code: string;
  /** Human-readable label shown in the UI */
  label: string;
  /** Case-insensitive aliases compiled into a `\b(…)\b` regex */
  aliases?: string[];
  /** Raw regex patterns for special cases */
  patterns?: RegExp[];
  /** Abbreviation suffixes that may be concatenated to designators (e.g., "2bn") */
  concatenatedSuffixes?: string[];
}

// ---------------------------------------------------------------------------
// Built-in definitions (order = hierarchy largest → smallest)
// ---------------------------------------------------------------------------

export const BUILTIN_ECHELON_DEFINITIONS: EchelonDefinition[] = [
  {
    name: "ECHELON_ARMY_GROUP",
    code: "24",
    label: "Army Group",
    aliases: ["army\\s*group", "heeresgruppe", "front", "theater", "theatre"],
  },
  {
    name: "ECHELON_ARMY",
    code: "23",
    label: "Army",
    aliases: ["army", "armee", "field\\s*army"],
  },
  {
    name: "ECHELON_CORPS",
    code: "22",
    label: "Corps",
    aliases: ["corps", "korps", "mef"],
    concatenatedSuffixes: ["mef"],
  },
  {
    name: "ECHELON_DIVISION",
    code: "21",
    label: "Division",
    aliases: ["division", "div", "divn"],
    concatenatedSuffixes: ["divn", "div"],
  },
  {
    name: "ECHELON_BRIGADE",
    code: "18",
    label: "Brigade",
    aliases: ["brigade", "bde", "bgde", "brig", "combat\\s*team", "bct", "rct"],
    concatenatedSuffixes: ["bgde", "brig", "bde", "bct", "rct"],
  },
  {
    name: "ECHELON_REGIMENT",
    code: "17",
    label: "Regiment",
    aliases: [
      "regiment",
      "regt",
      "rgmt",
      "rgt",
      "group",
      "grp",
      "gp",
      "abteilung",
      "abt",
    ],
    concatenatedSuffixes: ["regt", "rgmt", "rgt", "grp", "abt", "gp"],
  },
  {
    name: "ECHELON_BATTALION",
    code: "16",
    label: "Battalion",
    aliases: [
      "battalion",
      "btn",
      "bn",
      "btln",
      "bataillon",
      "squadron",
      "sqdn",
      "sqn",
      "sq",
    ],
    concatenatedSuffixes: ["btn", "btln", "sqdn", "sqn", "bn", "sq"],
  },
  {
    name: "ECHELON_COMPANY",
    code: "15",
    label: "Company",
    aliases: [
      "company",
      "coy",
      "co",
      "cmp",
      "kompanie",
      "kp",
      "battery",
      "btry",
      "bty",
      "batterie",
      "troop",
      "trp",
      "flight",
      "flt",
    ],
    concatenatedSuffixes: ["coy", "cmp", "btry", "bty", "trp", "flt", "co", "kp"],
  },
  {
    name: "ECHELON_PLATOON",
    code: "14",
    label: "Platoon",
    aliases: [
      "platoon",
      "plt",
      "pl",
      "ptn",
      "zug",
      "detachment",
      "det",
      "element",
      "elem",
    ],
    concatenatedSuffixes: ["ptn", "plt", "pl"],
  },
  {
    name: "ECHELON_SECTION",
    code: "13",
    label: "Section",
    aliases: ["section", "sect", "sec", "sctn"],
    concatenatedSuffixes: ["sctn", "sect", "sec"],
  },
  {
    name: "ECHELON_SQUAD",
    code: "12",
    label: "Squad",
    aliases: ["squad", "sqd", "gruppe"],
    concatenatedSuffixes: ["sqd"],
  },
  {
    name: "ECHELON_TEAM",
    code: "11",
    label: "Team",
    aliases: ["team", "tm", "crew", "cell", "fireteam", "fire\\s*team"],
    concatenatedSuffixes: ["tm"],
  },
];

// ---------------------------------------------------------------------------
// Derived constants (backward-compatible re-exports)
// ---------------------------------------------------------------------------

const _codes: Record<string, string> = {};
for (const d of BUILTIN_ECHELON_DEFINITIONS) {
  _codes[d.name] = d.code;
}

export const ECHELON_UNSPECIFIED = "00";
export const ECHELON_TEAM = _codes["ECHELON_TEAM"];
export const ECHELON_SQUAD = _codes["ECHELON_SQUAD"];
export const ECHELON_SECTION = _codes["ECHELON_SECTION"];
export const ECHELON_PLATOON = _codes["ECHELON_PLATOON"];
export const ECHELON_COMPANY = _codes["ECHELON_COMPANY"];
export const ECHELON_BATTALION = _codes["ECHELON_BATTALION"];
export const ECHELON_REGIMENT = _codes["ECHELON_REGIMENT"];
export const ECHELON_BRIGADE = _codes["ECHELON_BRIGADE"];
export const ECHELON_DIVISION = _codes["ECHELON_DIVISION"];
export const ECHELON_CORPS = _codes["ECHELON_CORPS"];
export const ECHELON_ARMY = _codes["ECHELON_ARMY"];
export const ECHELON_ARMY_GROUP = _codes["ECHELON_ARMY_GROUP"];
