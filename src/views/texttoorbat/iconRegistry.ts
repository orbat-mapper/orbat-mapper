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
  /** Plain-text aliases. Use (text) for optional segments. Compiled to regex automatically. */
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
    aliases: ["air assault infantry", "aaslt inf", "air assault"],
  },
  {
    name: "ICON_AIRBORNE_INFANTRY",
    sidc: "10001000001211004700",
    label: "Airborne Infantry",
    aliases: ["airborne infantry", "abn inf", "para inf", "parachute infantry"],
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
      "fallschirmjager",
      "fallschirmjaeger",
    ],
  },
  // RA (Royal Artillery) — must precede Marine Infantry so "29 Cdo RA" matches artillery, not marines
  {
    name: "ICON_ARTILLERY",
    sidc: "10001000001303000000",
    label: "Artillery",
    aliases: ["r.a.", "royal artillery"],
  },
  {
    name: "ICON_MARINE_INFANTRY",
    sidc: "10001000001211004600",
    label: "Marine Infantry",
    aliases: [
      "marine infantry",
      "marine(s)",
      "usmc",
      "naval infantry",
      "cdo",
      "seebataillon",
      "marineinfanterie",
      "royal marine(s)",
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
      "mountain infantry",
      "mtn inf",
      "alpine",
      "gebirgsjager",
      "gebirgsjaeger",
      "gebirgs",
    ],
  },
  {
    name: "ICON_LIGHT_INFANTRY",
    sidc: "10001000001211000019",
    label: "Light Infantry",
    aliases: [
      "light infantry",
      "lt inf",
      "lti",
      "jager",
      "jaeger",
      "chasseur",
      "bersaglieri",
    ],
  },
  {
    name: "ICON_MECHANIZED_INFANTRY",
    sidc: "10001000001211020000",
    label: "Mechanized Infantry",
    aliases: ["mechanized infantry", "mech inf", "mech infantry", "panzergrenadier"],
  },
  {
    name: "ICON_MOTORIZED_INFANTRY",
    sidc: "10001000001211040000",
    label: "Motorized Infantry",
    aliases: ["motorized infantry", "mot inf", "mot infantry", "motorised"],
  },
  {
    name: "ICON_SNIPER",
    sidc: "10001000001215000000",
    label: "Sniper",
    aliases: ["sniper", "marksman", "sharpshooter", "designated marksman"],
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
      "rifle(s)",
      "riflemen",
      "foot",
    ],
  },

  {
    name: "ICON_LITTORAL_COMBAT_SHIP",
    sidc: "10003000001202060000",
    label: "Littoral Combat Ship",
    aliases: ["littoral combat ship", "littoral"],
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
      "amphibious warfare ship",
      "amphibious assault ship",
      "amphibious transport",
      "landing ship",
      "landing craft",
      "dock landing",
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
      "anti tank",
      "anti armo(u)r(ed)",
      "panzerjager",
      "panzerabwehr",
      "tank destroyer",
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
    aliases: ["light armo(u)r(ed)", "light tank", "lt armor", "lt tk"],
  },
  {
    name: "ICON_ARMOR",
    sidc: "10001000001205000000",
    label: "Armor",
    aliases: [
      "armo(u)r(ed)",
      "tank",
      "panzer",
      "pz",
      "pzr",
      "char",
      "carro armato",
      "carri",
      "tanque",
      "blind(e)",
      "blindado",
      "tk(r)",
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
      "hussar(s)",
      "dragoon(s)",
      "lancer(s)",
      "uhlan(s)",
      "ulanen",
      "kavallerie",
      "chevau leger(s)",
      "cuirassier(s)",
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
      "aufklarung",
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
      "mine warfare ship",
      "mine layer",
      "mine sweeper",
      "mine hunter",
      "mine countermeasure",
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
      "air defense",
      "air defence",
      "anti air(craft)",
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
      "rocket artillery",
      "mlrs",
      "multiple launch",
      "katyusha",
      "nebelwerfer",
      "grad",
      "himars",
      "werfer",
    ],
    patterns: [/\bBM[- ]?\d+\b/i],
  },
  {
    name: "ICON_SELF_PROPELLED_ARTILLERY",
    sidc: "10001000001303010000",
    label: "Self-Propelled Artillery",
    aliases: [
      "self propelled artillery",
      "spa",
      "sp artillery",
      "sturmgeschutz",
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
      "field artillery",
      "fa",
      "howitzer",
      "how",
      "gun",
      "kanone",
      "geschutz",
      "batteria",
      "cannon",
    ],
  },
  {
    name: "ICON_MORTAR",
    sidc: "10001000001308000000",
    label: "Mortar",
    aliases: ["mortar", "morser", "mortaio", "granatwerfer", "mort", "mtr"],
  },
  {
    name: "ICON_MISSILE",
    sidc: "10001000001307000000",
    label: "Missile",
    aliases: [
      "missile",
      "guided missile",
      "atgm",
      "ssm",
      "srbm",
      "mrbm",
      "irbm",
      "cruise missile",
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
    aliases: ["attack helicopter", "apache", "cobra", "attack aviation"],
    patterns: [/\bAH[- ]?\d+\b/i],
  },
  {
    name: "ICON_AVIATION",
    sidc: "10001000001206000000",
    label: "Aviation",
    aliases: [
      "aviation",
      "helicopter",
      "rotary wing",
      "heli",
      "helikopter",
      "hubschrauber",
      "air mobile",
      "avn",
    ],
  },
  {
    name: "ICON_AIR_FORCE",
    sidc: "10001000001101000000",
    label: "Air Force",
    aliases: ["air force", "luftwaffe", "aeronautica", "raf", "usaf", "tactical air"],
  },

  // ── Combat support ──────────────────────────────────────────────────
  {
    name: "ICON_COMBAT_ENGINEER",
    sidc: "10001000001407010000",
    label: "Combat Engineer",
    aliases: [
      "combat engineer",
      "assault engineer",
      "assault pioneer",
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
      "pionier(e)",
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
      "signal(s)",
      "sig",
      "communication(s)",
      "comm(s)",
      "fernmelde",
      "nachricht",
      "transmission(s)",
      "radio",
    ],
  },
  {
    name: "ICON_MILITARY_POLICE",
    sidc: "10001000001412000000",
    label: "Military Police",
    aliases: [
      "military police",
      "mp",
      "feldjager",
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
    aliases: ["guard(s)"],
  },
  {
    name: "ICON_SECURITY",
    sidc: "10001000001416000000",
    label: "Security",
    aliases: ["security", "guard(s)", "wach", "protection", "force protection", "sec"],
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
      "electronic warfare",
      "ew",
      "elint",
      "sigint",
      "jamming",
      "elektronische kampffuhrung",
      "cyber",
    ],
  },
  {
    name: "ICON_MILITARY_INTELLIGENCE",
    sidc: "10001000001510000000",
    label: "Military Intelligence",
    aliases: [
      "military intelligence",
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
    aliases: ["civil affairs", "ca", "cimic", "zivil militar", "cmo"],
  },
  {
    name: "ICON_PSYCHOLOGICAL_OPS",
    sidc: "10001000001106000000",
    label: "Psychological Operations",
    aliases: [
      "psychological op(s)",
      "psychological operation(s)",
      "psyop",
      "psyops",
      "miso",
      "propaganda",
      "io",
      "info op(s)",
    ],
  },

  // ── Sea surface noncombatant vessels (symbol set 30) ────────────────
  {
    name: "ICON_AUXILIARY_SHIP",
    sidc: "10003000001301000000",
    label: "Auxiliary Ship",
    aliases: [
      "auxiliary ship",
      "auxiliary vessel",
      "support ship",
      "supply ship",
      "tender",
      "replenishment",
      "oiler",
      "icebreaker",
      "fleet auxiliary",
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
    aliases: ["hospital ship", "lazarettschiff", "navire hopital"],
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
      "sanitat",
      "sanitaets",
      "field hospital",
      "aid station",
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
      "motor transport",
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
      "special forces",
      "sf",
      "special ops",
      "sof",
      "ranger(s)",
      "commando(s)",
      "sas",
      "seal(s)",
      "delta",
      "ksk",
      "green beret(s)",
      "brandenburger",
      "pathfinder(s)",
      "lrrp",
      "lrs",
    ],
  },

  // ── Navy task organization / sea surface vessels (symbol set 30) ─────
  {
    name: "ICON_NAVY_TASK_ELEMENT",
    sidc: "10003000001210010000",
    label: "Navy Task Element",
    aliases: ["navy task element"],
    patterns: [/\bTE\b/],
  },
  {
    name: "ICON_NAVY_TASK_FORCE",
    sidc: "10003000001210020000",
    label: "Navy Task Force",
    aliases: ["navy task force"],
    patterns: [/\bTF\b/],
  },
  {
    name: "ICON_NAVY_TASK_GROUP",
    sidc: "10003000001210030000",
    label: "Navy Task Group",
    aliases: ["navy task group", "task group"],
    patterns: [/\bTG\b/],
  },
  {
    name: "ICON_NAVY_TASK_UNIT",
    sidc: "10003000001210040000",
    label: "Navy Task Unit",
    aliases: ["navy task unit"],
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
    aliases: ["naval", "navy", "marine corps", "kriegsmarine", "seebataillon"],
  },

  // ── Sea surface vessels (symbol set 30) ─────────────────────────────
  {
    name: "ICON_CARRIER",
    sidc: "10003000001201000000",
    label: "Aircraft Carrier",
    aliases: [
      "aircraft carrier",
      "carrier",
      "flattop",
      "supercarrier",
      "flugzeugtrager",
      "flugzeugtraeger",
      "porte avion(s)",
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
      "heavy cruiser",
      "light cruiser",
      "battle cruiser",
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
      "zerstorer",
      "zerstoerer",
      "contre torpilleur",
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
    aliases: ["frigate", "fregatte", "fregate", "fregata", "fragata", "escort"],
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
      "patrol boat",
      "patrol craft",
      "patrol ship",
      "fast attack craft",
      "torpedo boat",
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
      "u boot",
      "u boat",
      "sous marin",
      "sottomarino",
      "sottomarine",
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
      "cargo ship",
      "merchant ship",
      "merchant vessel",
      "freighter",
      "frachter",
      "transport ship",
      "liberty ship",
    ],
  },
  {
    name: "ICON_TANKER_SHIP",
    sidc: "10003000001401090000",
    label: "Tanker",
    aliases: ["tanker ship", "oil tanker", "tanker"],
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
      "command post",
      "cp",
      "toc",
      "tactical operation(s) center",
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
