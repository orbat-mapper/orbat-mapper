import { nanoid } from "nanoid";
import {
  makeSpatialIllusionsNode,
  type SpatialIllusionsOrbat,
} from "@/types/externalModels";
import type { Scenario, Side, SideGroup, Unit } from "@/types/scenarioModels";

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

// Map echelon codes to their variable names for debug display
export const ECHELON_CODE_TO_NAME: Record<string, string> = {
  [ECHELON_UNSPECIFIED]: "ECHELON_UNSPECIFIED",
  [ECHELON_TEAM]: "ECHELON_TEAM",
  [ECHELON_SQUAD]: "ECHELON_SQUAD",
  [ECHELON_SECTION]: "ECHELON_SECTION",
  [ECHELON_PLATOON]: "ECHELON_PLATOON",
  [ECHELON_COMPANY]: "ECHELON_COMPANY",
  [ECHELON_BATTALION]: "ECHELON_BATTALION",
  [ECHELON_REGIMENT]: "ECHELON_REGIMENT",
  [ECHELON_BRIGADE]: "ECHELON_BRIGADE",
  [ECHELON_DIVISION]: "ECHELON_DIVISION",
  [ECHELON_CORPS]: "ECHELON_CORPS",
  [ECHELON_ARMY]: "ECHELON_ARMY",
  [ECHELON_ARMY_GROUP]: "ECHELON_ARMY_GROUP",
};

// Echelon codes mapped to common unit type keywords
export const ECHELON_PATTERNS: { pattern: RegExp; code: string; label: string }[] = [
  {
    pattern: /\b(army\s*group|heeresgruppe|front|theater|theatre)\b/i,
    code: ECHELON_ARMY_GROUP,
    label: "Army Group",
  },
  { pattern: /\b(army|armee|field\s*army)\b/i, code: ECHELON_ARMY, label: "Army" },
  { pattern: /\b(corps|korps|mef)\b/i, code: ECHELON_CORPS, label: "Corps" },
  {
    pattern: /\b(division|div|divn)\b/i,
    code: ECHELON_DIVISION,
    label: "Division",
  },
  {
    pattern: /\b(brigade|bde|bgde|brig|combat\s*team|bct|rct)\b/i,
    code: ECHELON_BRIGADE,
    label: "Brigade",
  },
  {
    pattern: /\b(regiment|regt|rgmt|rgt|group|grp|gp|abteilung|abt)\b/i,
    code: ECHELON_REGIMENT,
    label: "Regiment",
  },
  {
    pattern: /\b(battalion|btn|bn|btln|bataillon|squadron|sqdn|sqn|sq)\b/i,
    code: ECHELON_BATTALION,
    label: "Battalion",
  },
  {
    pattern:
      /\b(company|coy|co|cmp|kompanie|kp|battery|btry|bty|batterie|troop|trp|flight|flt)\b/i,
    code: ECHELON_COMPANY,
    label: "Company",
  },
  {
    pattern: /\b(platoon|plt|pl|ptn|zug|detachment|det|element|elem)\b/i,
    code: ECHELON_PLATOON,
    label: "Platoon",
  },
  { pattern: /\b(section|sect|sec|sctn)\b/i, code: ECHELON_SECTION, label: "Section" },
  { pattern: /\b(squad|sqd|gruppe)\b/i, code: ECHELON_SQUAD, label: "Squad" },
  {
    pattern: /\b(team|tm|crew|cell|fireteam|fire\s*team)\b/i,
    code: ECHELON_TEAM,
    label: "Team",
  },
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

// Entity codes (mainIcon) for symbol set 10 (Land Unit)
// Format: entity (2) + entityType (2) + entitySubType (2) + modifier1 (2) + modifier2 (2) = 10 characters
export const ICON_UNSPECIFIED = "0000000000";
export const ICON_INFANTRY = "1211000000";
export const ICON_MECHANIZED_INFANTRY = "1211020000";
export const ICON_MOTORIZED_INFANTRY = "1211040000";
export const ICON_LIGHT_INFANTRY = "1211000019";
export const ICON_AIRBORNE_INFANTRY = "1211004700";
export const ICON_AIR_ASSAULT_INFANTRY = "1211000100";
export const ICON_MOUNTAIN_INFANTRY = "1211000027";
export const ICON_MARINE_INFANTRY = "1211004600";
export const ICON_ARMOR = "1205000000";
export const ICON_LIGHT_ARMOR = "1205010000";
export const ICON_CAVALRY = "1213000000";
export const ICON_RECONNAISSANCE = "1213000000";
export const ICON_ARTILLERY = "1303000000";
export const ICON_SELF_PROPELLED_ARTILLERY = "1303010000";
export const ICON_ROCKET_ARTILLERY = "1303020000";
export const ICON_AIR_DEFENSE = "1301000000";
export const ICON_AVIATION = "1206000000";
export const ICON_ATTACK_HELICOPTER = "1206000300";
export const ICON_ENGINEER = "1407000000";
export const ICON_COMBAT_ENGINEER = "1407010000";
export const ICON_SIGNAL = "1110000000";
export const ICON_SUPPLY = "1634000000";
export const ICON_MAINTENANCE = "1611000000";
export const ICON_MEDICAL = "1613000000";
export const ICON_MILITARY_POLICE = "1412000000";
export const ICON_SPECIAL_FORCES = "1217000000";
export const ICON_MISSILE = "1307000000";
export const ICON_MORTAR = "1308000000";
export const ICON_ANTITANK = "1204000000";
export const ICON_TRANSPORTATION = "1636000000";
export const ICON_HEADQUARTERS = "1800009800";
export const ICON_CHEMICAL = "1401000000";
export const ICON_NBC = "1403000000";
export const ICON_ELECTRONIC_WARFARE = "1505000000";
export const ICON_MILITARY_INTELLIGENCE = "1510000000";
export const ICON_CIVIL_AFFAIRS = "1102000000";
export const ICON_PSYCHOLOGICAL_OPS = "1106000000";
export const ICON_NAVAL = "1701000000";
export const ICON_AIR_FORCE = "1101000000";
export const ICON_SNIPER = "1215000000";
export const ICON_AMPHIBIOUS = "1202000000";
export const ICON_PARACHUTE = "1211000001";
export const ICON_SECURITY = "1416000000";

// Map icon codes to their variable names for debug display
// Note: Some icons share the same code (e.g., ICON_SNIPER=ICON_LIGHT_INFANTRY, ICON_CAVALRY=ICON_RECONNAISSANCE)
// We only include one entry per unique code
export const ICON_CODE_TO_NAME: Record<string, string> = {
  [ICON_UNSPECIFIED]: "ICON_UNSPECIFIED",
  [ICON_INFANTRY]: "ICON_INFANTRY",
  [ICON_MECHANIZED_INFANTRY]: "ICON_MECHANIZED_INFANTRY",
  [ICON_MOTORIZED_INFANTRY]: "ICON_MOTORIZED_INFANTRY",
  [ICON_SNIPER]: "ICON_SNIPER",
  [ICON_LIGHT_INFANTRY]: "ICON_LIGHT_INFANTRY",
  [ICON_AIRBORNE_INFANTRY]: "ICON_AIRBORNE_INFANTRY",
  [ICON_AIR_ASSAULT_INFANTRY]: "ICON_AIR_ASSAULT_INFANTRY",
  [ICON_MOUNTAIN_INFANTRY]: "ICON_MOUNTAIN_INFANTRY",
  [ICON_MARINE_INFANTRY]: "ICON_MARINE_INFANTRY",
  [ICON_ARMOR]: "ICON_ARMOR",
  [ICON_LIGHT_ARMOR]: "ICON_LIGHT_ARMOR",
  [ICON_CAVALRY]: "ICON_CAVALRY", // Also ICON_RECONNAISSANCE
  [ICON_ARTILLERY]: "ICON_ARTILLERY",
  [ICON_SELF_PROPELLED_ARTILLERY]: "ICON_SELF_PROPELLED_ARTILLERY",
  [ICON_ROCKET_ARTILLERY]: "ICON_ROCKET_ARTILLERY",
  [ICON_AIR_DEFENSE]: "ICON_AIR_DEFENSE",
  [ICON_AVIATION]: "ICON_AVIATION",
  [ICON_ATTACK_HELICOPTER]: "ICON_ATTACK_HELICOPTER",
  [ICON_ENGINEER]: "ICON_ENGINEER",
  [ICON_COMBAT_ENGINEER]: "ICON_COMBAT_ENGINEER",
  [ICON_SIGNAL]: "ICON_SIGNAL",
  [ICON_SUPPLY]: "ICON_SUPPLY",
  [ICON_MAINTENANCE]: "ICON_MAINTENANCE",
  [ICON_MEDICAL]: "ICON_MEDICAL",
  [ICON_MILITARY_POLICE]: "ICON_MILITARY_POLICE",
  [ICON_SPECIAL_FORCES]: "ICON_SPECIAL_FORCES",
  [ICON_MISSILE]: "ICON_MISSILE",
  [ICON_MORTAR]: "ICON_MORTAR",
  [ICON_ANTITANK]: "ICON_ANTITANK",
  [ICON_TRANSPORTATION]: "ICON_TRANSPORTATION",
  [ICON_HEADQUARTERS]: "ICON_HEADQUARTERS",
  [ICON_CHEMICAL]: "ICON_CHEMICAL", // Also ICON_NBC
  [ICON_ELECTRONIC_WARFARE]: "ICON_ELECTRONIC_WARFARE",
  [ICON_MILITARY_INTELLIGENCE]: "ICON_MILITARY_INTELLIGENCE",
  [ICON_CIVIL_AFFAIRS]: "ICON_CIVIL_AFFAIRS",
  [ICON_PSYCHOLOGICAL_OPS]: "ICON_PSYCHOLOGICAL_OPS",
  [ICON_NAVAL]: "ICON_NAVAL",
  [ICON_AIR_FORCE]: "ICON_AIR_FORCE",
  [ICON_AMPHIBIOUS]: "ICON_AMPHIBIOUS",
  [ICON_PARACHUTE]: "ICON_PARACHUTE",
  [ICON_SECURITY]: "ICON_SECURITY",
};

// Symbol icon patterns - maps unit name keywords to entity codes
// ORDER MATTERS: More specific patterns must come before general ones
export const ICON_PATTERNS: { pattern: RegExp; code: string; label: string }[] = [
  // Infantry types (more specific first)
  {
    pattern: /\b(air\s*assault\s*infantry|aaslt\s*inf|air\s*assault)\b/i,
    code: ICON_AIR_ASSAULT_INFANTRY,
    label: "Air Assault Infantry",
  },
  {
    pattern: /\b(airborne\s*infantry|abn\s*inf|para\s*inf|parachute\s*infantry)\b/i,
    code: ICON_AIRBORNE_INFANTRY,
    label: "Airborne Infantry",
  },
  {
    pattern:
      /\b(airborne|abn|parachute|para|paratrooper|fallschirmjäger|fallschirmjaeger)\b/i,
    code: ICON_PARACHUTE,
    label: "Airborne/Parachute",
  },
  // Treat 'RA' (R.A., Royal Artillery) as artillery even when abbreviated (e.g., "29 Cdo RA")
  {
    pattern: /\b(ra|R\.?A\.?|royal\s+artillery)\b/i,
    code: ICON_ARTILLERY,
    label: "Royal Artillery (RA)",
  },
  {
    pattern:
      /\b(marine\s*infantry|marines?|usmc|naval\s*infantry|cdo|seebataillon|marineinfanterie|royal\s*marines?)\b/i,
    code: ICON_MARINE_INFANTRY,
    label: "Marine Infantry",
  },
  {
    pattern: /\bRM\b/,
    code: ICON_MARINE_INFANTRY,
    label: "Royal Marines (RM)",
  },
  {
    pattern:
      /\b(mountain\s*infantry|mtn\s*inf|alpine|gebirgsjäger|gebirgsjaeger|gebirgs)\b/i,
    code: ICON_MOUNTAIN_INFANTRY,
    label: "Mountain Infantry",
  },
  {
    pattern:
      /\b(light\s*infantry|lt\s*inf|lti|jäger|jaeger|jager|chasseur|bersaglieri)\b/i,
    code: ICON_LIGHT_INFANTRY,
    label: "Light Infantry",
  },
  {
    pattern: /\b(mechanized\s*infantry|mech\s*inf|mech\s*infantry|panzergrenadier)\b/i,
    code: ICON_MECHANIZED_INFANTRY,
    label: "Mechanized Infantry",
  },
  {
    pattern: /\b(motorized\s*infantry|mot\s*inf|mot\s*infantry|motorised)\b/i,
    code: ICON_MOTORIZED_INFANTRY,
    label: "Motorized Infantry",
  },
  {
    pattern: /\b(sniper|marksman|sharpshooter|designated\s*marksman)\b/i,
    code: ICON_SNIPER,
    label: "Sniper",
  },
  {
    pattern: /\b(infantry|inf|infanterie|infanteria|fanteria|rifles?|riflemen?|foot)\b/i,
    code: ICON_INFANTRY,
    label: "Infantry",
  },

  // Amphibious
  {
    pattern: /\b(amphibious|amphib|amph|landing)\b/i,
    code: ICON_AMPHIBIOUS,
    label: "Amphibious",
  },

  // Anti-tank must come before armor (contains "tank")
  // AT is case-sensitive (uppercase only), anti-tank/antitank is case-insensitive
  {
    pattern:
      /\b(anti[- ]?tank|anti[- ]?armou?r(ed)?|panzerjäger|panzerabwehr|tank\s*destroyer|td)\b/i,
    code: ICON_ANTITANK,
    label: "Anti-Tank",
  },
  {
    pattern: /\bAT\b/,
    code: ICON_ANTITANK,
    label: "Anti-Tank (AT)",
  },

  // Armor and cavalry
  {
    pattern: /\b(light\s*armou?r(ed)?|light\s*tank|lt\s*armor|lt\s*tk)\b/i,
    code: ICON_LIGHT_ARMOR,
    label: "Light Armor",
  },
  {
    pattern:
      /\b(armou?r(ed)?|tank|panzer|pz|pzr|char|carro\s*armato|carri|tanque|blind[eé]?|blindado|tkr?)\b/i,
    code: ICON_ARMOR,
    label: "Armor",
  },
  {
    pattern:
      /\b(cavalry|cav|cvlry|hussars?|dragoons?|lancers?|uhlans?|ulanen|kavallerie|chevau[- ]?légers?|cuirassiers?)\b/i,
    code: ICON_CAVALRY,
    label: "Cavalry",
  },
  {
    pattern:
      /\b(reconnaissance|recon|recce|rcn|aufklärung|aufklaerung|aufkl|scout|scouting|esploratori|erk|erkund)\b/i,
    code: ICON_RECONNAISSANCE,
    label: "Reconnaissance",
  },

  // Air defense must come before artillery (e.g., "Air Defense Artillery")
  {
    pattern:
      /\b(air\s*defen[cs]e|anti[- ]?air(craft)?|flak|aaa|ada|sam|shorad|manpad|fla|fliegerabwehr|adad|patriot|stinger|avenger)\b/i,
    code: ICON_AIR_DEFENSE,
    label: "Air Defense",
  },

  // Artillery types (more specific first)
  {
    pattern:
      /\b(rocket\s*artillery|mlrs|multiple\s*launch|katyusha|nebelwerfer|grad|himars|bm[- ]?\d+|werfer)\b/i,
    code: ICON_ROCKET_ARTILLERY,
    label: "Rocket Artillery",
  },
  {
    pattern:
      /\b(self[- ]?propelled\s*artillery|spa|sp\s*artillery|sturmgeschütz|stug|panzerhaubitze|pzh)\b/i,
    code: ICON_SELF_PROPELLED_ARTILLERY,
    label: "Self-Propelled Artillery",
  },
  {
    pattern:
      /\b(artillery|arty|art|artillerie|artl|field\s*artillery|fa|howitzer|how|gun|kanone|geschütz|batteria|cannon)\b/i,
    code: ICON_ARTILLERY,
    label: "Artillery",
  },
  {
    pattern: /\b(mortar|mörser|mortaio|granatwerfer|mort|mtr)\b/i,
    code: ICON_MORTAR,
    label: "Mortar",
  },
  {
    pattern:
      /\b(missile|guided\s*missile|atgm|ssm|srbm|mrbm|irbm|cruise\s*missile|mlr|tow|javelin|hellfire)\b/i,
    code: ICON_MISSILE,
    label: "Missile",
  },

  // Aviation
  {
    pattern: /\b(attack\s*helicopter|apache|cobra|ah[- ]?\d+|attack\s*aviation)\b/i,
    code: ICON_ATTACK_HELICOPTER,
    label: "Attack Helicopter",
  },
  {
    pattern:
      /\b(aviation|helicopter|rotary\s*wing|heli|helikopter|hubschrauber|air\s*mobile|airmobile|avn)\b/i,
    code: ICON_AVIATION,
    label: "Aviation",
  },
  {
    pattern: /\b(air\s*force|airforce|luftwaffe|aeronautica|raf|usaf|tactical\s*air)\b/i,
    code: ICON_AIR_FORCE,
    label: "Air Force",
  },

  // Combat support
  {
    pattern:
      /\b(combat\s*engineer|assault\s*engineer|assault\s*pioneer|sapper|breacher)\b/i,
    code: ICON_COMBAT_ENGINEER,
    label: "Combat Engineer",
  },
  {
    pattern:
      /\b(engineer|eng|engr|pioniere?|pionier|pioneer|genie|genio|construction|bridging)\b/i,
    code: ICON_ENGINEER,
    label: "Engineer",
  },
  {
    pattern:
      /\b(signals?|sig|communications?|comms?|fernmelde|nachricht|transmissions?|radio)\b/i,
    code: ICON_SIGNAL,
    label: "Signal",
  },
  {
    pattern:
      /\b(military\s*police|mp|feldjäger|feldjaeger|gendarmerie|carabinieri|provost|pm)\b/i,
    code: ICON_MILITARY_POLICE,
    label: "Military Police",
  },
  {
    pattern: /\b(guard|guards?)\b/i,
    code: ICON_INFANTRY,
    label: "Guards",
  },
  {
    pattern: /\b(security|guards?|wach|protection|force\s*protection|sec)\b/i,
    code: ICON_SECURITY,
    label: "Security",
  },

  // NBC/Chemical
  {
    pattern:
      /\b(chemical|chem|cbrn|cbrne|nbc|abc|decontamination|nebel|smoke|gas|decon)\b/i,
    code: ICON_CHEMICAL,
    label: "Chemical/NBC",
  },

  // Electronic Warfare & Intelligence
  {
    pattern:
      /\b(electronic\s*warfare|ew|elint|sigint|ew\s*unit|jamming|elektronische\s*kampfführung|cyber)\b/i,
    code: ICON_ELECTRONIC_WARFARE,
    label: "Electronic Warfare",
  },
  {
    pattern: /\b(military\s*intelligence|mi|g2|s2|intel|intelligence|intell|int)\b/i,
    code: ICON_MILITARY_INTELLIGENCE,
    label: "Military Intelligence",
  },
  {
    pattern: /\b(civil\s*affairs|ca|cimic|zivil[- ]?militär|cmo)\b/i,
    code: ICON_CIVIL_AFFAIRS,
    label: "Civil Affairs",
  },
  {
    pattern:
      /\b(psychological\s*op(eration)?s?|psyop|psyops|miso|propaganda|io|info\s*ops?)\b/i,
    code: ICON_PSYCHOLOGICAL_OPS,
    label: "Psychological Operations",
  },

  // Sustainment/logistics
  {
    pattern:
      /\b(supply|logistics|log|nachschub|versorgung|sustainment|css|logistik|supp|sust)\b/i,
    code: ICON_SUPPLY,
    label: "Supply",
  },
  {
    pattern:
      /\b(maintenance|maint|mnt|repair|instandsetzung|werkstatt|ordnance|recovery|wrecker)\b/i,
    code: ICON_MAINTENANCE,
    label: "Maintenance",
  },
  {
    pattern:
      /\b(medical|medic|med|hospital|ambulance|sanität|sanitäts|sanitaets|field\s*hospital|aid\s*station|evac|medevac|casevac|fst)\b/i,
    code: ICON_MEDICAL,
    label: "Medical",
  },
  {
    pattern:
      /\b(transport|transportation|trans|trns|truck|motor\s*transport|kraftfahr|lkw|lorry|lorries|mvt|movement)\b/i,
    code: ICON_TRANSPORTATION,
    label: "Transportation",
  },

  // Special operations
  {
    pattern:
      /\b(special\s*forces|sf|special\s*ops|sof|rangers?|commando|commandos|sas|seals?|delta|ksk|green\s*berets?|brandenburger|pathfinders?|lrrp|lrs)\b/i,
    code: ICON_SPECIAL_FORCES,
    label: "Special Forces",
  },

  // Naval (ground-based naval units)
  {
    pattern: /\b(naval|navy|marine\s*corps|kriegsmarine|seebataillon)\b/i,
    code: ICON_NAVAL,
    label: "Naval",
  },

  // Headquarters
  {
    pattern:
      /\b(headquarters|hq|hqs|hauptquartier|stab|command\s*post|cp|toc|tactical\s*operations?\s*center)\b/i,
    code: ICON_HEADQUARTERS,
    label: "Headquarters",
  },
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
 * Detect symbol icon code from unit name using keyword patterns
 */
export function getIconCodeFromName(name: string): string {
  for (const { pattern, code } of ICON_PATTERNS) {
    if (pattern.test(name)) {
      return code;
    }
  }
  return ICON_UNSPECIFIED;
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
export function buildSidc(
  level: number,
  name: string,
  parentEchelon?: string,
  parentIcon?: string,
): string {
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

  // Detect symbol icon from name, fall back to parent icon if not detected
  let entity = getIconCodeFromName(name);
  if (entity === ICON_UNSPECIFIED && parentIcon && parentIcon !== ICON_UNSPECIFIED) {
    entity = parentIcon;
  }

  return version + context + si + symbolSet + status + hqtfd + echelon + entity;
}

/**
 * Extract echelon code from SIDC (positions 8-9)
 */
export function getEchelonFromSidc(sidc: string): string {
  return sidc.substring(8, 10);
}

/**
 * Extract icon/entity code from SIDC (positions 10-19, 10 characters)
 */
export function getIconFromSidc(sidc: string): string {
  return sidc.substring(10, 20);
}

/**
 * Parse indented text into a hierarchical unit structure
 */
export function parseTextToUnits(text: string): ParsedUnit[] {
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
    const sidc = buildSidc(level, name, parentEchelon, parentIcon);
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
