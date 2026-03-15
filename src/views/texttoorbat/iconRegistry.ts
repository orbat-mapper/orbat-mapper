/**
 * Icon registry — single source of truth for all icon definitions.
 *
 * Each icon is defined once as an {@link IconDefinition}. Constants, name maps
 * and pattern lists are derived automatically.
 *
 * ORDER MATTERS: more-specific entries must precede general ones so that the
 * first-match-wins logic in {@link getIconCodeFromName} resolves correctly.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IconDefinition {
  /** Internal key for debug display, e.g. "ICON_INFANTRY" */
  name: string;
  /** 10-character SIDC entity code (entity + entityType + entitySubType + mod1 + mod2) */
  code: string;
  /** Human-readable label shown in the UI */
  label: string;
  /** Case-insensitive aliases compiled into a `\b(…)\b` regex automatically */
  aliases?: string[];
  /** Raw regex patterns for special cases (e.g. case-sensitive short-forms) */
  patterns?: RegExp[];
  /** Symbol set override (default: "10" for land units). E.g. "30" for sea surface. */
  symbolSet?: string;
}

// ---------------------------------------------------------------------------
// Built-in definitions (order = matching priority)
// ---------------------------------------------------------------------------

export const BUILTIN_ICON_DEFINITIONS: IconDefinition[] = [
  // ── Infantry types (more specific first) ────────────────────────────
  {
    name: "ICON_AIR_ASSAULT_INFANTRY",
    code: "1211000100",
    label: "Air Assault Infantry",
    aliases: ["air\\s*assault\\s*infantry", "aaslt\\s*inf", "air\\s*assault"],
  },
  {
    name: "ICON_AIRBORNE_INFANTRY",
    code: "1211004700",
    label: "Airborne Infantry",
    aliases: [
      "airborne\\s*infantry",
      "abn\\s*inf",
      "para\\s*inf",
      "parachute\\s*infantry",
    ],
  },
  {
    name: "ICON_PARACHUTE",
    code: "1211000001",
    label: "Airborne/Parachute",
    aliases: [
      "airborne",
      "abn",
      "parachute",
      "para",
      "paratrooper",
      "fallschirmjäger",
      "fallschirmjaeger",
    ],
  },
  // RA (Royal Artillery) — must precede generic artillery
  {
    name: "ICON_ARTILLERY",
    code: "1303000000",
    label: "Royal Artillery (RA)",
    aliases: ["ra", "R\\.?A\\.?", "royal\\s+artillery"],
  },
  {
    name: "ICON_MARINE_INFANTRY",
    code: "1211004600",
    label: "Marine Infantry",
    aliases: [
      "marine\\s*infantry",
      "marines?",
      "usmc",
      "naval\\s*infantry",
      "cdo",
      "seebataillon",
      "marineinfanterie",
      "royal\\s*marines?",
    ],
  },
  {
    name: "ICON_MARINE_INFANTRY",
    code: "1211004600",
    label: "Royal Marines (RM)",
    patterns: [/\bRM\b/],
  },
  {
    name: "ICON_MOUNTAIN_INFANTRY",
    code: "1211000027",
    label: "Mountain Infantry",
    aliases: [
      "mountain\\s*infantry",
      "mtn\\s*inf",
      "alpine",
      "gebirgsjäger",
      "gebirgsjaeger",
      "gebirgs",
    ],
  },
  {
    name: "ICON_LIGHT_INFANTRY",
    code: "1211000019",
    label: "Light Infantry",
    aliases: [
      "light\\s*infantry",
      "lt\\s*inf",
      "lti",
      "jäger",
      "jaeger",
      "jager",
      "chasseur",
      "bersaglieri",
    ],
  },
  {
    name: "ICON_MECHANIZED_INFANTRY",
    code: "1211020000",
    label: "Mechanized Infantry",
    aliases: [
      "mechanized\\s*infantry",
      "mech\\s*inf",
      "mech\\s*infantry",
      "panzergrenadier",
    ],
  },
  {
    name: "ICON_MOTORIZED_INFANTRY",
    code: "1211040000",
    label: "Motorized Infantry",
    aliases: ["motorized\\s*infantry", "mot\\s*inf", "mot\\s*infantry", "motorised"],
  },
  {
    name: "ICON_SNIPER",
    code: "1215000000",
    label: "Sniper",
    aliases: ["sniper", "marksman", "sharpshooter", "designated\\s*marksman"],
  },
  {
    name: "ICON_INFANTRY",
    code: "1211000000",
    label: "Infantry",
    aliases: [
      "infantry",
      "inf",
      "infanterie",
      "infanteria",
      "fanteria",
      "rifles?",
      "riflemen?",
      "foot",
    ],
  },

  {
    name: "ICON_LITTORAL_COMBAT_SHIP",
    code: "1202060000",
    label: "Littoral Combat Ship",
    symbolSet: "30",
    aliases: ["littoral\\s*combat\\s*ship", "littoral"],
  },
  {
    name: "ICON_LITTORAL_COMBAT_SHIP",
    code: "1202060000",
    label: "Littoral Combat Ship (LCS)",
    symbolSet: "30",
    patterns: [/\bLCS\b/],
  },
  {
    name: "ICON_AMPHIBIOUS_WARFARE_SHIP",
    code: "1203000000",
    label: "Amphibious Warfare Ship",
    symbolSet: "30",
    aliases: [
      "amphibious\\s*warfare\\s*ship",
      "amphibious\\s*assault\\s*ship",
      "amphibious\\s*transport",
      "landing\\s*ship",
      "landing\\s*craft",
      "dock\\s*landing",
    ],
  },
  {
    name: "ICON_AMPHIBIOUS_WARFARE_SHIP",
    code: "1203000000",
    label: "Amphibious Warfare Ship (LH/LPD)",
    symbolSet: "30",
    patterns: [/\bL[HSPDC]{1,2}\b/],
  },
  // ── Amphibious ──────────────────────────────────────────────────────
  {
    name: "ICON_AMPHIBIOUS",
    code: "1202000000",
    label: "Amphibious",
    aliases: ["amphibious", "amphib", "amph", "landing"],
  },

  // ── Anti-tank (must precede armor — contains "tank") ────────────────
  {
    name: "ICON_ANTITANK",
    code: "1204000000",
    label: "Anti-Tank",
    aliases: [
      "anti[- ]?tank",
      "anti[- ]?armou?r(?:ed)?",
      "panzerjäger",
      "panzerabwehr",
      "tank\\s*destroyer",
      "td",
    ],
  },
  {
    name: "ICON_ANTITANK",
    code: "1204000000",
    label: "Anti-Tank (AT)",
    patterns: [/\bAT\b/],
  },

  // ── Armor and cavalry ──────────────────────────────────────────────
  {
    name: "ICON_LIGHT_ARMOR",
    code: "1205010000",
    label: "Light Armor",
    aliases: ["light\\s*armou?r(?:ed)?", "light\\s*tank", "lt\\s*armor", "lt\\s*tk"],
  },
  {
    name: "ICON_ARMOR",
    code: "1205000000",
    label: "Armor",
    aliases: [
      "armou?r(?:ed)?",
      "tank",
      "panzer",
      "pz",
      "pzr",
      "char",
      "carro\\s*armato",
      "carri",
      "tanque",
      "blind[eé]?",
      "blindado",
      "tkr?",
    ],
  },
  {
    name: "ICON_CAVALRY",
    code: "1213000000",
    label: "Cavalry",
    aliases: [
      "cavalry",
      "cav",
      "cvlry",
      "hussars?",
      "dragoons?",
      "lancers?",
      "uhlans?",
      "ulanen",
      "kavallerie",
      "chevau[- ]?légers?",
      "cuirassiers?",
    ],
  },
  {
    name: "ICON_RECONNAISSANCE",
    code: "1213000000",
    label: "Reconnaissance",
    aliases: [
      "reconnaissance",
      "recon",
      "recce",
      "rcn",
      "aufklärung",
      "aufklaerung",
      "aufkl",
      "scout",
      "scouting",
      "esploratori",
      "erk",
      "erkund",
    ],
  },

  {
    name: "ICON_MINE_WARFARE_SHIP",
    code: "1204000000",
    label: "Mine Warfare Ship",
    symbolSet: "30",
    aliases: [
      "mine\\s*warfare\\s*ship",
      "mine\\s*layer",
      "mine\\s*sweeper",
      "mine\\s*hunter",
      "mine\\s*countermeasure",
      "minesweeper",
      "minehunter",
      "minelayer",
    ],
  },
  {
    name: "ICON_MINE_WARFARE_SHIP",
    code: "1204000000",
    label: "Mine Warfare Ship (MCM)",
    symbolSet: "30",
    patterns: [/\bMC[MH]\b/],
  },
  // ── Air defense (must precede artillery) ────────────────────────────
  {
    name: "ICON_AIR_DEFENSE",
    code: "1301000000",
    label: "Air Defense",
    aliases: [
      "air\\s*defen[cs]e",
      "anti[- ]?air(?:craft)?",
      "flak",
      "aaa",
      "ada",
      "sam",
      "shorad",
      "manpad",
      "fla",
      "fliegerabwehr",
      "adad",
      "patriot",
      "stinger",
      "avenger",
    ],
  },

  // ── Artillery types (more specific first) ───────────────────────────
  {
    name: "ICON_ROCKET_ARTILLERY",
    code: "1303020000",
    label: "Rocket Artillery",
    aliases: [
      "rocket\\s*artillery",
      "mlrs",
      "multiple\\s*launch",
      "katyusha",
      "nebelwerfer",
      "grad",
      "himars",
      "bm[- ]?\\d+",
      "werfer",
    ],
  },
  {
    name: "ICON_SELF_PROPELLED_ARTILLERY",
    code: "1303010000",
    label: "Self-Propelled Artillery",
    aliases: [
      "self[- ]?propelled\\s*artillery",
      "spa",
      "sp\\s*artillery",
      "sturmgeschütz",
      "stug",
      "panzerhaubitze",
      "pzh",
    ],
  },
  {
    name: "ICON_ARTILLERY",
    code: "1303000000",
    label: "Artillery",
    aliases: [
      "artillery",
      "arty",
      "art",
      "artillerie",
      "artl",
      "field\\s*artillery",
      "fa",
      "howitzer",
      "how",
      "gun",
      "kanone",
      "geschütz",
      "batteria",
      "cannon",
    ],
  },
  {
    name: "ICON_MORTAR",
    code: "1308000000",
    label: "Mortar",
    aliases: ["mortar", "mörser", "mortaio", "granatwerfer", "mort", "mtr"],
  },
  {
    name: "ICON_MISSILE",
    code: "1307000000",
    label: "Missile",
    aliases: [
      "missile",
      "guided\\s*missile",
      "atgm",
      "ssm",
      "srbm",
      "mrbm",
      "irbm",
      "cruise\\s*missile",
      "mlr",
      "tow",
      "javelin",
      "hellfire",
    ],
  },

  // ── Aviation ────────────────────────────────────────────────────────
  {
    name: "ICON_ATTACK_HELICOPTER",
    code: "1206000300",
    label: "Attack Helicopter",
    aliases: [
      "attack\\s*helicopter",
      "apache",
      "cobra",
      "ah[- ]?\\d+",
      "attack\\s*aviation",
    ],
  },
  {
    name: "ICON_AVIATION",
    code: "1206000000",
    label: "Aviation",
    aliases: [
      "aviation",
      "helicopter",
      "rotary\\s*wing",
      "heli",
      "helikopter",
      "hubschrauber",
      "air\\s*mobile",
      "airmobile",
      "avn",
    ],
  },
  {
    name: "ICON_AIR_FORCE",
    code: "1101000000",
    label: "Air Force",
    aliases: [
      "air\\s*force",
      "airforce",
      "luftwaffe",
      "aeronautica",
      "raf",
      "usaf",
      "tactical\\s*air",
    ],
  },

  // ── Combat support ──────────────────────────────────────────────────
  {
    name: "ICON_COMBAT_ENGINEER",
    code: "1407010000",
    label: "Combat Engineer",
    aliases: [
      "combat\\s*engineer",
      "assault\\s*engineer",
      "assault\\s*pioneer",
      "sapper",
      "breacher",
    ],
  },
  {
    name: "ICON_ENGINEER",
    code: "1407000000",
    label: "Engineer",
    aliases: [
      "engineer",
      "eng",
      "engr",
      "pioniere?",
      "pionier",
      "pioneer",
      "genie",
      "genio",
      "construction",
      "bridging",
    ],
  },
  {
    name: "ICON_SIGNAL",
    code: "1110000000",
    label: "Signal",
    aliases: [
      "signals?",
      "sig",
      "communications?",
      "comms?",
      "fernmelde",
      "nachricht",
      "transmissions?",
      "radio",
    ],
  },
  {
    name: "ICON_MILITARY_POLICE",
    code: "1412000000",
    label: "Military Police",
    aliases: [
      "military\\s*police",
      "mp",
      "feldjäger",
      "feldjaeger",
      "gendarmerie",
      "carabinieri",
      "provost",
      "pm",
    ],
  },
  {
    name: "ICON_INFANTRY",
    code: "1211000000",
    label: "Guards",
    aliases: ["guard", "guards?"],
  },
  {
    name: "ICON_SECURITY",
    code: "1416000000",
    label: "Security",
    aliases: ["security", "guards?", "wach", "protection", "force\\s*protection", "sec"],
  },

  // ── NBC/Chemical ────────────────────────────────────────────────────
  {
    name: "ICON_CHEMICAL",
    code: "1401000000",
    label: "Chemical/NBC",
    aliases: [
      "chemical",
      "chem",
      "cbrn",
      "cbrne",
      "nbc",
      "abc",
      "decontamination",
      "nebel",
      "smoke",
      "gas",
      "decon",
    ],
  },

  // ── Electronic Warfare & Intelligence ───────────────────────────────
  {
    name: "ICON_ELECTRONIC_WARFARE",
    code: "1505000000",
    label: "Electronic Warfare",
    aliases: [
      "electronic\\s*warfare",
      "ew",
      "elint",
      "sigint",
      "ew\\s*unit",
      "jamming",
      "elektronische\\s*kampfführung",
      "cyber",
    ],
  },
  {
    name: "ICON_MILITARY_INTELLIGENCE",
    code: "1510000000",
    label: "Military Intelligence",
    aliases: [
      "military\\s*intelligence",
      "mi",
      "g2",
      "s2",
      "intel",
      "intelligence",
      "intell",
      "int",
    ],
  },
  {
    name: "ICON_CIVIL_AFFAIRS",
    code: "1102000000",
    label: "Civil Affairs",
    aliases: ["civil\\s*affairs", "ca", "cimic", "zivil[- ]?militär", "cmo"],
  },
  {
    name: "ICON_PSYCHOLOGICAL_OPS",
    code: "1106000000",
    label: "Psychological Operations",
    aliases: [
      "psychological\\s*op(?:eration)?s?",
      "psyop",
      "psyops",
      "miso",
      "propaganda",
      "io",
      "info\\s*ops?",
    ],
  },

  // ── Sustainment / logistics ─────────────────────────────────────────
  {
    name: "ICON_SUPPLY",
    code: "1634000000",
    label: "Supply",
    aliases: [
      "supply",
      "logistics",
      "log",
      "nachschub",
      "versorgung",
      "sustainment",
      "css",
      "logistik",
      "supp",
      "sust",
    ],
  },
  {
    name: "ICON_MAINTENANCE",
    code: "1611000000",
    label: "Maintenance",
    aliases: [
      "maintenance",
      "maint",
      "mnt",
      "repair",
      "instandsetzung",
      "werkstatt",
      "ordnance",
      "recovery",
      "wrecker",
    ],
  },
  {
    name: "ICON_HOSPITAL_SHIP",
    code: "1301070000",
    label: "Hospital Ship",
    symbolSet: "30",
    aliases: ["hospital\\s*ship", "lazarettschiff", "navire[- ]?hôpital"],
  },
  {
    name: "ICON_MEDICAL",
    code: "1613000000",
    label: "Medical",
    aliases: [
      "medical",
      "medic",
      "med",
      "hospital",
      "ambulance",
      "sanität",
      "sanitäts",
      "sanitaets",
      "field\\s*hospital",
      "aid\\s*station",
      "evac",
      "medevac",
      "casevac",
      "fst",
    ],
  },
  {
    name: "ICON_TRANSPORTATION",
    code: "1636000000",
    label: "Transportation",
    aliases: [
      "transport",
      "transportation",
      "trans",
      "trns",
      "truck",
      "motor\\s*transport",
      "kraftfahr",
      "lkw",
      "lorry",
      "lorries",
      "mvt",
      "movement",
    ],
  },

  // ── Special operations ──────────────────────────────────────────────
  {
    name: "ICON_SPECIAL_FORCES",
    code: "1217000000",
    label: "Special Forces",
    aliases: [
      "special\\s*forces",
      "sf",
      "special\\s*ops",
      "sof",
      "rangers?",
      "commando",
      "commandos",
      "sas",
      "seals?",
      "delta",
      "ksk",
      "green\\s*berets?",
      "brandenburger",
      "pathfinders?",
      "lrrp",
      "lrs",
    ],
  },

  // ── Naval (ground-based naval units) ────────────────────────────────
  {
    name: "ICON_NAVAL",
    code: "1701000000",
    label: "Naval",
    aliases: ["naval", "navy", "marine\\s*corps", "kriegsmarine", "seebataillon"],
  },

  // ── Sea surface vessels (symbol set 30) ─────────────────────────────
  {
    name: "ICON_CARRIER",
    code: "1201000000",
    label: "Aircraft Carrier",
    symbolSet: "30",
    aliases: [
      "aircraft\\s*carrier",
      "carrier",
      "flattop",
      "supercarrier",
      "flugzeugträger",
      "flugzeugtraeger",
      "porte[- ]?avions?",
      "portaerei",
    ],
  },
  {
    name: "ICON_CARRIER",
    code: "1201000000",
    label: "Aircraft Carrier (CV)",
    symbolSet: "30",
    patterns: [/\bCV[NX]?\b/],
  },
  {
    name: "ICON_BATTLESHIP",
    code: "1202010000",
    label: "Battleship",
    symbolSet: "30",
    aliases: [
      "battleship",
      "schlachtschiff",
      "linienschiff",
      "cuirassé",
      "cuirasse",
      "corazzata",
      "acorazado",
      "dreadnought",
    ],
  },
  {
    name: "ICON_BATTLESHIP",
    code: "1202010000",
    label: "Battleship (BB)",
    symbolSet: "30",
    patterns: [/\bBB\b/],
  },
  {
    name: "ICON_CRUISER",
    code: "1202020000",
    label: "Cruiser",
    symbolSet: "30",
    aliases: [
      "cruiser",
      "kreuzer",
      "croiseur",
      "incrociatore",
      "crucero",
      "heavy\\s*cruiser",
      "light\\s*cruiser",
      "battle\\s*cruiser",
    ],
  },
  {
    name: "ICON_CRUISER",
    code: "1202020000",
    label: "Cruiser (CA/CG/CL)",
    symbolSet: "30",
    patterns: [/\bC[AGLX]\b/],
  },
  {
    name: "ICON_DESTROYER",
    code: "1202030000",
    label: "Destroyer",
    symbolSet: "30",
    aliases: [
      "destroyer",
      "zerstörer",
      "zerstoerer",
      "contre[- ]?torpilleur",
      "cacciatorpediniere",
      "destructor",
    ],
  },
  {
    name: "ICON_DESTROYER",
    code: "1202030000",
    label: "Destroyer (DD)",
    symbolSet: "30",
    patterns: [/\bDD[GX]?\b/],
  },
  {
    name: "ICON_FRIGATE",
    code: "1202040000",
    label: "Frigate",
    symbolSet: "30",
    aliases: [
      "frigate",
      "fregatte",
      "frégate",
      "fregate",
      "fregata",
      "fragata",
      "escort",
    ],
  },
  {
    name: "ICON_FRIGATE",
    code: "1202040000",
    label: "Frigate (FF)",
    symbolSet: "30",
    patterns: [/\bFF[GX]?\b/],
  },
  {
    name: "ICON_CORVETTE",
    code: "1202050000",
    label: "Corvette",
    symbolSet: "30",
    aliases: ["corvette", "korvette", "corvetta", "corbeta"],
  },
  {
    name: "ICON_PATROL_BOAT",
    code: "1205000000",
    label: "Patrol Boat",
    symbolSet: "30",
    aliases: [
      "patrol\\s*boat",
      "patrol\\s*craft",
      "patrol\\s*ship",
      "fast\\s*attack\\s*craft",
      "torpedo\\s*boat",
      "schnellboot",
      "vedette",
    ],
  },
  {
    name: "ICON_PATROL_BOAT",
    code: "1205000000",
    label: "Patrol Boat (PB/PC)",
    symbolSet: "30",
    patterns: [/\bP[BCT]\b/],
  },
  {
    name: "ICON_SUBMARINE",
    code: "1101000000",
    label: "Submarine",
    symbolSet: "35",
    aliases: [
      "submarine",
      "sub",
      "u[- ]?boot",
      "u[- ]?boat",
      "sous[- ]?marin",
      "sottomarin[eo]",
      "submarino",
      "unterseeboot",
    ],
  },
  {
    name: "ICON_SUBMARINE",
    code: "1101000000",
    label: "Submarine (SS)",
    symbolSet: "35",
    patterns: [/\bSS[BGKN]?\b/],
  },

  // ── Sea surface noncombatant vessels (symbol set 30) ────────────────
  {
    name: "ICON_AUXILIARY_SHIP",
    code: "1301000000",
    label: "Auxiliary Ship",
    symbolSet: "30",
    aliases: [
      "auxiliary\\s*ship",
      "auxiliary\\s*vessel",
      "support\\s*ship",
      "supply\\s*ship",
      "tender",
      "replenishment",
      "oiler",
      "fleet\\s*auxiliary",
    ],
  },
  {
    name: "ICON_CARGO_SHIP",
    code: "1401010000",
    label: "Cargo Ship",
    symbolSet: "30",
    aliases: [
      "cargo\\s*ship",
      "merchant\\s*ship",
      "merchant\\s*vessel",
      "freighter",
      "frachter",
      "transport\\s*ship",
      "liberty\\s*ship",
    ],
  },
  {
    name: "ICON_TANKER_SHIP",
    code: "1401090000",
    label: "Tanker",
    symbolSet: "30",
    aliases: ["tanker\\s*ship", "oil\\s*tanker", "tanker"],
  },

  // ── Headquarters ────────────────────────────────────────────────────
  {
    name: "ICON_HEADQUARTERS",
    code: "1800009800",
    label: "Headquarters",
    aliases: [
      "headquarters",
      "hq",
      "hqs",
      "hauptquartier",
      "stab",
      "command\\s*post",
      "cp",
      "toc",
      "tactical\\s*operations?\\s*center",
    ],
  },
];

// ---------------------------------------------------------------------------
// Derived constants (backward-compatible re-exports)
// ---------------------------------------------------------------------------

function uniqueByName(defs: IconDefinition[]): IconDefinition[] {
  const seen = new Set<string>();
  return defs.filter((d) => {
    if (seen.has(d.name)) return false;
    seen.add(d.name);
    return true;
  });
}

const uniqueDefs = uniqueByName(BUILTIN_ICON_DEFINITIONS);

/** All ICON_XXX constant values keyed by name */
const _codes: Record<string, string> = {};
for (const d of uniqueDefs) {
  _codes[d.name] = d.code;
}

// Individual constants for backward compatibility
export const ICON_UNSPECIFIED = "0000000000";
export const ICON_INFANTRY = _codes["ICON_INFANTRY"];
export const ICON_MECHANIZED_INFANTRY = _codes["ICON_MECHANIZED_INFANTRY"];
export const ICON_MOTORIZED_INFANTRY = _codes["ICON_MOTORIZED_INFANTRY"];
export const ICON_LIGHT_INFANTRY = _codes["ICON_LIGHT_INFANTRY"];
export const ICON_AIRBORNE_INFANTRY = _codes["ICON_AIRBORNE_INFANTRY"];
export const ICON_AIR_ASSAULT_INFANTRY = _codes["ICON_AIR_ASSAULT_INFANTRY"];
export const ICON_MOUNTAIN_INFANTRY = _codes["ICON_MOUNTAIN_INFANTRY"];
export const ICON_MARINE_INFANTRY = _codes["ICON_MARINE_INFANTRY"];
export const ICON_ARMOR = _codes["ICON_ARMOR"];
export const ICON_LIGHT_ARMOR = _codes["ICON_LIGHT_ARMOR"];
export const ICON_CAVALRY = _codes["ICON_CAVALRY"];
export const ICON_RECONNAISSANCE = _codes["ICON_RECONNAISSANCE"];
export const ICON_ARTILLERY = _codes["ICON_ARTILLERY"];
export const ICON_SELF_PROPELLED_ARTILLERY = _codes["ICON_SELF_PROPELLED_ARTILLERY"];
export const ICON_ROCKET_ARTILLERY = _codes["ICON_ROCKET_ARTILLERY"];
export const ICON_AIR_DEFENSE = _codes["ICON_AIR_DEFENSE"];
export const ICON_AVIATION = _codes["ICON_AVIATION"];
export const ICON_ATTACK_HELICOPTER = _codes["ICON_ATTACK_HELICOPTER"];
export const ICON_ENGINEER = _codes["ICON_ENGINEER"];
export const ICON_COMBAT_ENGINEER = _codes["ICON_COMBAT_ENGINEER"];
export const ICON_SIGNAL = _codes["ICON_SIGNAL"];
export const ICON_SUPPLY = _codes["ICON_SUPPLY"];
export const ICON_MAINTENANCE = _codes["ICON_MAINTENANCE"];
export const ICON_MEDICAL = _codes["ICON_MEDICAL"];
export const ICON_MILITARY_POLICE = _codes["ICON_MILITARY_POLICE"];
export const ICON_SPECIAL_FORCES = _codes["ICON_SPECIAL_FORCES"];
export const ICON_MISSILE = _codes["ICON_MISSILE"];
export const ICON_MORTAR = _codes["ICON_MORTAR"];
export const ICON_ANTITANK = _codes["ICON_ANTITANK"];
export const ICON_TRANSPORTATION = _codes["ICON_TRANSPORTATION"];
export const ICON_HEADQUARTERS = _codes["ICON_HEADQUARTERS"];
export const ICON_CHEMICAL = _codes["ICON_CHEMICAL"];
export const ICON_NBC = _codes["ICON_CHEMICAL"]; // alias
export const ICON_ELECTRONIC_WARFARE = _codes["ICON_ELECTRONIC_WARFARE"];
export const ICON_MILITARY_INTELLIGENCE = _codes["ICON_MILITARY_INTELLIGENCE"];
export const ICON_CIVIL_AFFAIRS = _codes["ICON_CIVIL_AFFAIRS"];
export const ICON_PSYCHOLOGICAL_OPS = _codes["ICON_PSYCHOLOGICAL_OPS"];
export const ICON_NAVAL = _codes["ICON_NAVAL"];
export const ICON_AIR_FORCE = _codes["ICON_AIR_FORCE"];
export const ICON_SNIPER = _codes["ICON_SNIPER"];
export const ICON_AMPHIBIOUS = _codes["ICON_AMPHIBIOUS"];
export const ICON_PARACHUTE = _codes["ICON_PARACHUTE"];
export const ICON_SECURITY = _codes["ICON_SECURITY"];

// Naval vessel icons (sea surface symbol set 30)
export const ICON_CARRIER = _codes["ICON_CARRIER"];
export const ICON_BATTLESHIP = _codes["ICON_BATTLESHIP"];
export const ICON_CRUISER = _codes["ICON_CRUISER"];
export const ICON_DESTROYER = _codes["ICON_DESTROYER"];
export const ICON_FRIGATE = _codes["ICON_FRIGATE"];
export const ICON_CORVETTE = _codes["ICON_CORVETTE"];
export const ICON_LITTORAL_COMBAT_SHIP = _codes["ICON_LITTORAL_COMBAT_SHIP"];
export const ICON_AMPHIBIOUS_WARFARE_SHIP = _codes["ICON_AMPHIBIOUS_WARFARE_SHIP"];
export const ICON_MINE_WARFARE_SHIP = _codes["ICON_MINE_WARFARE_SHIP"];
export const ICON_PATROL_BOAT = _codes["ICON_PATROL_BOAT"];
export const ICON_SUBMARINE = _codes["ICON_SUBMARINE"];
export const ICON_AUXILIARY_SHIP = _codes["ICON_AUXILIARY_SHIP"];
export const ICON_HOSPITAL_SHIP = _codes["ICON_HOSPITAL_SHIP"];
export const ICON_CARGO_SHIP = _codes["ICON_CARGO_SHIP"];
export const ICON_TANKER_SHIP = _codes["ICON_TANKER_SHIP"];
