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
    sidc: "10001000001211000100",
    label: "Air Assault Infantry",
    aliases: ["air assault infantry", "aaslt inf", "air assault"],
  },
  {
    sidc: "10001000001211004700",
    label: "Airborne Infantry",
    aliases: ["airborne infantry", "abn inf", "para inf", "parachute infantry"],
  },
  {
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
    sidc: "10001000001303000000",
    label: "Artillery",
    aliases: ["r.a.", "royal artillery"],
  },
  {
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
      "RM",
    ],
  },
  {
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
    sidc: "10001000001211020000",
    label: "Mechanized Infantry",
    aliases: ["mechanized infantry", "mech inf", "mech infantry", "panzergrenadier"],
  },
  {
    sidc: "10001000001211040000",
    label: "Motorized Infantry",
    aliases: ["motorized infantry", "mot inf", "mot infantry", "motorised"],
  },
  {
    sidc: "10001000001215000000",
    label: "Sniper",
    aliases: ["sniper", "marksman", "sharpshooter", "designated marksman"],
  },
  {
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
    sidc: "10003000001202060000",
    label: "Littoral Combat Ship",
    aliases: ["littoral combat ship", "littoral", "LCS"],
  },
  {
    sidc: "10003000001203000000",
    label: "Amphibious Warfare Ship",
    aliases: [
      "amphibious warfare ship",
      "amphibious assault ship",
      "amphibious transport",
      "landing ship",
      "landing craft",
      "dock landing",
      "LPD",
      "LHD",
      "LHA",
      "LPH",
      "LSD",
      "LST",
    ],
  },
  // ── Amphibious ──────────────────────────────────────────────────────
  {
    sidc: "10001000001202000000",
    label: "Amphibious",
    aliases: ["amphibious", "amphib", "amph", "landing"],
  },

  // ── Anti-tank (must precede armor — contains "tank") ────────────────
  {
    sidc: "10001000001204000000",
    label: "Anti-Tank",
    aliases: [
      "anti tank",
      "anti armo(u)r(ed)",
      "panzerjager",
      "panzerabwehr",
      "tank destroyer",
      "td",
      "AT",
    ],
  },

  // ── Armor and cavalry ──────────────────────────────────────────────
  {
    sidc: "10001000001205010000",
    label: "Light Armor",
    aliases: ["light armo(u)r(ed)", "light tank", "lt armor", "lt tk"],
  },
  {
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
    sidc: "10003000001204000000",
    label: "Mine Warfare Ship",
    aliases: [
      "mine warfare ship",
      "mine layer",
      "mine sweeper",
      "mine hunter",
      "mine countermeasure",
      "MCM",
      "MCH",
    ],
  },
  // ── Air defense (must precede artillery) ────────────────────────────
  {
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
      "ad",
    ],
  },

  // ── Artillery types (more specific first) ───────────────────────────
  {
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
    sidc: "10001000001308000000",
    label: "Mortar",
    aliases: ["mortar", "morser", "mortaio", "granatwerfer", "mort", "mtr"],
  },
  {
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
    sidc: "10001000001206000300",
    label: "Attack Helicopter",
    aliases: ["attack helicopter", "apache", "cobra", "attack aviation"],
    patterns: [/\bAH[- ]?\d+\b/i],
  },
  {
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
    sidc: "10001000001101000000",
    label: "Air Force",
    aliases: ["air force", "luftwaffe", "aeronautica", "raf", "usaf", "tactical air"],
  },

  // ── Combat support ──────────────────────────────────────────────────
  {
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
    sidc: "10001000001211000000",
    label: "Guards",
    aliases: ["guard(s)"],
  },
  {
    sidc: "10001000001416000000",
    label: "Security",
    aliases: ["security", "guard(s)", "wach", "protection", "force protection", "sec"],
  },

  // ── NBC/Chemical ────────────────────────────────────────────────────
  {
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
    sidc: "10001000001102000000",
    label: "Civil Affairs",
    aliases: ["civil affairs", "ca", "cimic", "zivil militar", "cmo"],
  },
  {
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
    sidc: "10003000001301070000",
    label: "Hospital Ship",
    aliases: ["hospital ship", "lazarettschiff", "navire hopital"],
  },
  {
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
    sidc: "10003000001210010000",
    label: "Navy Task Element",
    aliases: ["navy task element", "TE"],
  },
  {
    sidc: "10003000001210020000",
    label: "Navy Task Force",
    aliases: ["navy task force", "TF"],
  },
  {
    sidc: "10003000001210030000",
    label: "Navy Task Group",
    aliases: ["navy task group", "task group", "TG"],
  },
  {
    sidc: "10003000001210040000",
    label: "Navy Task Unit",
    aliases: ["navy task unit", "TU"],
  },
  {
    sidc: "10003000001210050000",
    label: "Convoy",
    aliases: ["convoy"],
  },
  // ── Naval (ground-based naval units) ────────────────────────────────
  {
    sidc: "10001000001701000000",
    label: "Naval",
    aliases: ["naval", "navy", "marine corps", "kriegsmarine", "seebataillon"],
  },

  // ── Sea surface vessels (symbol set 30) ─────────────────────────────
  {
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
      "CV",
      "CVX",
    ],
  },
  {
    sidc: "10003000001201000001",
    label: "Aircraft Carrier (CVN)",
    aliases: ["CVN"],
  },
  {
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
      "BB",
    ],
  },
  {
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
      "CA",
      "CG",
      "CL",
    ],
  },
  {
    sidc: "10003000001202030000",
    label: "Destroyer",
    aliases: [
      "destroyer",
      "zerstorer",
      "zerstoerer",
      "contre torpilleur",
      "cacciatorpediniere",
      "destructor",
      "DD",
      "DDG",
    ],
  },
  {
    sidc: "10003000001202040000",
    label: "Frigate",
    aliases: [
      "frigate",
      "fregatte",
      "fregate",
      "fregata",
      "fragata",
      "escort",
      "FF",
      "FFG",
    ],
  },
  {
    sidc: "10003000001202050000",
    label: "Corvette",
    aliases: ["corvette", "korvette", "corvetta", "corbeta"],
  },
  {
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
      "PB",
      "PC",
      "PT",
    ],
  },
  {
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
      "SS",
      "SSN",
      "SSK",
      "SSG",
      "SSB",
    ],
  },

  {
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
    sidc: "10003000001401090000",
    label: "Tanker",
    aliases: ["tanker ship", "oil tanker", "tanker"],
  },

  // ── Headquarters ────────────────────────────────────────────────────
  {
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
// Constants
// ---------------------------------------------------------------------------

export const ICON_UNSPECIFIED = "0000000000";
