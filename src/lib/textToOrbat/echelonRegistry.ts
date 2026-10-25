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
  /** 2-character SIDC echelon code */
  code: string;
  /** Human-readable label shown in the UI */
  label: string;
  /** Plain-text aliases. Use (text) for optional segments. Compiled to regex automatically. */
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
    code: "24",
    label: "Army Group",
    aliases: ["army group", "heeresgruppe", "front", "theater", "theatre"],
  },
  {
    code: "23",
    label: "Army",
    aliases: ["army", "armee", "field army"],
  },
  {
    code: "22",
    label: "Corps",
    aliases: ["corps", "korps", "mef"],
    concatenatedSuffixes: ["mef"],
  },
  {
    code: "21",
    label: "Division",
    aliases: ["division", "div", "divn"],
    concatenatedSuffixes: ["divn", "div"],
  },
  {
    code: "18",
    label: "Brigade",
    aliases: ["brigade", "bde", "bgde", "brig", "combat team", "bct", "rct"],
    concatenatedSuffixes: ["bgde", "brig", "bde", "bct", "rct"],
  },
  {
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
    code: "13",
    label: "Section",
    aliases: ["section", "sect", "sec", "sctn"],
    concatenatedSuffixes: ["sctn", "sect", "sec"],
  },
  {
    code: "12",
    label: "Squad",
    aliases: ["squad", "sqd", "gruppe"],
    concatenatedSuffixes: ["sqd"],
  },
  {
    code: "11",
    label: "Team",
    aliases: ["team", "tm", "crew", "cell", "fireteam", "fire team"],
    concatenatedSuffixes: ["tm"],
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ECHELON_UNSPECIFIED = "00";
