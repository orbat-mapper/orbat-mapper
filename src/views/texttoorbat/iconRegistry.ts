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
// Helpers
// ---------------------------------------------------------------------------

/** Extract the 2-character symbol set from a 20-char SIDC (positions 4-5). */
export function extractSymbolSet(sidc: string): string {
  return sidc.substring(4, 6);
}

/** Extract the 10-character entity code from a 20-char SIDC (positions 10-19). */
export function extractEntityCode(sidc: string): string {
  return sidc.substring(10, 20);
}

/** Build a 20-char template SIDC from an entity code and optional symbol set. */
export function buildIconSidc(entityCode: string, symbolSet = "10"): string {
  return `1000${symbolSet}0000${entityCode}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IconDefinition {
  /** Internal key for debug display, e.g. "ICON_INFANTRY" */
  name: string;
  /** 20-character SIDC template (SI=0, status=0, hqtfd=0, echelon=00) */
  sidc: string;
  /** Human-readable label shown in the UI */
  label: string;
  /** Case-insensitive aliases compiled into a `\b(…)\b` regex automatically */
  aliases?: string[];
  /** Raw regex patterns for special cases (e.g. case-sensitive short-forms) */
  patterns?: RegExp[];
}

// ---------------------------------------------------------------------------
// Built-in definitions (order = matching priority)
// ---------------------------------------------------------------------------

export const BUILTIN_ICON_DEFINITIONS: IconDefinition[] = [
  // ── Infantry types (more specific first) ────────────────────────────
  {
    name: "ICON_AIR_ASSAULT_INFANTRY",
    sidc: "10001000001211000100",
    label: "Air Assault Infantry",
    aliases: ["air\\s*assault\\s*infantry", "aaslt\\s*inf", "air\\s*assault"],
  },
  {
    name: "ICON_AIRBORNE_INFANTRY",
    sidc: "10001000001211004700",
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
    sidc: "10001000001211000001",
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
    sidc: "10001000001303000000",
    label: "Royal Artillery (RA)",
    aliases: ["ra", "R\\.?A\\.?", "royal\\s+artillery"],
  },
  {
    name: "ICON_MARINE_INFANTRY",
    sidc: "10001000001211004600",
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
    sidc: "10001000001211004600",
    label: "Royal Marines (RM)",
    patterns: [/\bRM\b/],
  },
  {
    name: "ICON_MOUNTAIN_INFANTRY",
    sidc: "10001000001211000027",
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
    sidc: "10001000001211000019",
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
    sidc: "10001000001211020000",
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
    sidc: "10001000001211040000",
    label: "Motorized Infantry",
    aliases: ["motorized\\s*infantry", "mot\\s*inf", "mot\\s*infantry", "motorised"],
  },
  {
    name: "ICON_SNIPER",
    sidc: "10001000001215000000",
    label: "Sniper",
    aliases: ["sniper", "marksman", "sharpshooter", "designated\\s*marksman"],
  },
  {
    name: "ICON_INFANTRY",
    sidc: "10001000001211000000",
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
    sidc: "10003000001202060000",
    label: "Littoral Combat Ship",
    aliases: ["littoral\\s*combat\\s*ship", "littoral"],
  },
  {
    name: "ICON_LITTORAL_COMBAT_SHIP",
    sidc: "10003000001202060000",
    label: "Littoral Combat Ship (LCS)",
    patterns: [/\bLCS\b/],
  },
  {
    name: "ICON_AMPHIBIOUS_WARFARE_SHIP",
    sidc: "10003000001203000000",
    label: "Amphibious Warfare Ship",
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
    sidc: "10003000001203000000",
    label: "Amphibious Warfare Ship (LH/LPD)",
    patterns: [/\bL[HSPDC]{1,2}\b/],
  },
  // ── Amphibious ──────────────────────────────────────────────────────
  {
    name: "ICON_AMPHIBIOUS",
    sidc: "10001000001202000000",
    label: "Amphibious",
    aliases: ["amphibious", "amphib", "amph", "landing"],
  },

  // ── Anti-tank (must precede armor — contains "tank") ────────────────
  {
    name: "ICON_ANTITANK",
    sidc: "10001000001204000000",
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
    sidc: "10001000001204000000",
    label: "Anti-Tank (AT)",
    patterns: [/\bAT\b/],
  },

  // ── Armor and cavalry ──────────────────────────────────────────────
  {
    name: "ICON_LIGHT_ARMOR",
    sidc: "10001000001205010000",
    label: "Light Armor",
    aliases: ["light\\s*armou?r(?:ed)?", "light\\s*tank", "lt\\s*armor", "lt\\s*tk"],
  },
  {
    name: "ICON_ARMOR",
    sidc: "10001000001205000000",
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
    sidc: "10001000001213000000",
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
    sidc: "10001000001213000000",
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
    sidc: "10003000001204000000",
    label: "Mine Warfare Ship",
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
    sidc: "10003000001204000000",
    label: "Mine Warfare Ship (MCM)",
    patterns: [/\bMC[MH]\b/],
  },
  // ── Air defense (must precede artillery) ────────────────────────────
  {
    name: "ICON_AIR_DEFENSE",
    sidc: "10001000001301000000",
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
    sidc: "10001000001303020000",
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
    sidc: "10001000001303010000",
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
    sidc: "10001000001303000000",
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
    sidc: "10001000001308000000",
    label: "Mortar",
    aliases: ["mortar", "mörser", "mortaio", "granatwerfer", "mort", "mtr"],
  },
  {
    name: "ICON_MISSILE",
    sidc: "10001000001307000000",
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
    sidc: "10001000001206000300",
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
    sidc: "10001000001206000000",
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
    sidc: "10001000001101000000",
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
    sidc: "10001000001407010000",
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
    sidc: "10001000001407000000",
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
    sidc: "10001000001110000000",
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
    sidc: "10001000001412000000",
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
    sidc: "10001000001211000000",
    label: "Guards",
    aliases: ["guard", "guards?"],
  },
  {
    name: "ICON_SECURITY",
    sidc: "10001000001416000000",
    label: "Security",
    aliases: ["security", "guards?", "wach", "protection", "force\\s*protection", "sec"],
  },

  // ── NBC/Chemical ────────────────────────────────────────────────────
  {
    name: "ICON_CHEMICAL",
    sidc: "10001000001401000000",
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
    sidc: "10001000001505000000",
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
    sidc: "10001000001510000000",
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
    sidc: "10001000001102000000",
    label: "Civil Affairs",
    aliases: ["civil\\s*affairs", "ca", "cimic", "zivil[- ]?militär", "cmo"],
  },
  {
    name: "ICON_PSYCHOLOGICAL_OPS",
    sidc: "10001000001106000000",
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

  // ── Sea surface noncombatant vessels (symbol set 30) ────────────────
  {
    name: "ICON_AUXILIARY_SHIP",
    sidc: "10003000001301000000",
    label: "Auxiliary Ship",
    aliases: [
      "auxiliary\\s*ship",
      "auxiliary\\s*vessel",
      "support\\s*ship",
      "supply\\s*ship",
      "tender",
      "replenishment",
      "oiler",
      "icebreaker",
      "fleet\\s*auxiliary",
    ],
  },

  // ── Sustainment / logistics ─────────────────────────────────────────
  {
    name: "ICON_SUPPLY",
    sidc: "10001000001634000000",
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
    sidc: "10001000001611000000",
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
    sidc: "10003000001301070000",
    label: "Hospital Ship",
    aliases: ["hospital\\s*ship", "lazarettschiff", "navire[- ]?hôpital"],
  },
  {
    name: "ICON_MEDICAL",
    sidc: "10001000001613000000",
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
    sidc: "10001000001636000000",
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
    sidc: "10001000001217000000",
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

  // ── Navy task organization / sea surface vessels (symbol set 30) ─────
  {
    name: "ICON_NAVY_TASK_ELEMENT",
    sidc: "10003000001210010000",
    label: "Navy Task Element",
    aliases: ["navy\\s*task\\s*element"],
    patterns: [/\bTE\b/],
  },
  {
    name: "ICON_NAVY_TASK_FORCE",
    sidc: "10003000001210020000",
    label: "Navy Task Force",
    aliases: ["navy\\s*task\\s*force"],
    patterns: [/\bTF\b/],
  },
  {
    name: "ICON_NAVY_TASK_GROUP",
    sidc: "10003000001210030000",
    label: "Navy Task Group",
    aliases: ["navy\\s*task\\s*group", "task\\s*group"],
    patterns: [/\bTG\b/],
  },
  {
    name: "ICON_NAVY_TASK_UNIT",
    sidc: "10003000001210040000",
    label: "Navy Task Unit",
    aliases: ["navy\\s*task\\s*unit"],
    patterns: [/\bTU\b/],
  },
  {
    name: "ICON_CONVOY",
    sidc: "10003000001210050000",
    label: "Convoy",
    aliases: ["convoy"],
  },
  // ── Naval (ground-based naval units) ────────────────────────────────
  {
    name: "ICON_NAVAL",
    sidc: "10001000001701000000",
    label: "Naval",
    aliases: ["naval", "navy", "marine\\s*corps", "kriegsmarine", "seebataillon"],
  },

  // ── Sea surface vessels (symbol set 30) ─────────────────────────────
  {
    name: "ICON_CARRIER",
    sidc: "10003000001201000000",
    label: "Aircraft Carrier",
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
    name: "ICON_NUCLEAR_CARRIER",
    sidc: "10003000001201000001",
    label: "Aircraft Carrier (CVN)",
    patterns: [/\bCVN\b/i],
  },
  {
    name: "ICON_CARRIER",
    sidc: "10003000001201000000",
    label: "Aircraft Carrier (CV/CVX)",
    patterns: [/(?:\bCVX?\b|\bCV(?=-))/i],
  },
  {
    name: "ICON_BATTLESHIP",
    sidc: "10003000001202010000",
    label: "Battleship",
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
    sidc: "10003000001202010000",
    label: "Battleship (BB)",
    patterns: [/\bBB\b/i],
  },
  {
    name: "ICON_CRUISER",
    sidc: "10003000001202020000",
    label: "Cruiser",
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
    sidc: "10003000001202020000",
    label: "Cruiser (CA/CG/CL)",
    patterns: [/\bC[AGLX]\b/i],
  },
  {
    name: "ICON_DESTROYER",
    sidc: "10003000001202030000",
    label: "Destroyer",
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
    sidc: "10003000001202030000",
    label: "Destroyer (DD)",
    patterns: [/\bDD[GX]?\b/i],
  },
  {
    name: "ICON_FRIGATE",
    sidc: "10003000001202040000",
    label: "Frigate",
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
    sidc: "10003000001202040000",
    label: "Frigate (FF)",
    patterns: [/\bFF[GX]?\b/i],
  },
  {
    name: "ICON_CORVETTE",
    sidc: "10003000001202050000",
    label: "Corvette",
    aliases: ["corvette", "korvette", "corvetta", "corbeta"],
  },
  {
    name: "ICON_PATROL_BOAT",
    sidc: "10003000001205000000",
    label: "Patrol Boat",
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
    sidc: "10003000001205000000",
    label: "Patrol Boat (PB/PC)",
    patterns: [/\bP[BCT]\b/i],
  },
  {
    name: "ICON_SUBMARINE",
    sidc: "10003500001101000000",
    label: "Submarine",
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
    sidc: "10003500001101000000",
    label: "Submarine (SS)",
    patterns: [/\bSS[BGKN]?\b/i],
  },

  {
    name: "ICON_CARGO_SHIP",
    sidc: "10003000001401010000",
    label: "Cargo Ship",
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
    sidc: "10003000001401090000",
    label: "Tanker",
    aliases: ["tanker\\s*ship", "oil\\s*tanker", "tanker"],
  },

  // ── Headquarters ────────────────────────────────────────────────────
  {
    name: "ICON_HEADQUARTERS",
    sidc: "10001000001800009800",
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

/** All ICON_XXX constant values keyed by name (10-char entity codes for backward compat) */
const _codes: Record<string, string> = {};
for (const d of uniqueDefs) {
  _codes[d.name] = extractEntityCode(d.sidc);
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
export const ICON_NAVY_TASK_ELEMENT = _codes["ICON_NAVY_TASK_ELEMENT"];
export const ICON_NAVY_TASK_FORCE = _codes["ICON_NAVY_TASK_FORCE"];
export const ICON_NAVY_TASK_GROUP = _codes["ICON_NAVY_TASK_GROUP"];
export const ICON_NAVY_TASK_UNIT = _codes["ICON_NAVY_TASK_UNIT"];
export const ICON_CONVOY = _codes["ICON_CONVOY"];
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
