"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICON_CHEMICAL = exports.ICON_HEADQUARTERS = exports.ICON_TRANSPORTATION = exports.ICON_ANTITANK = exports.ICON_MORTAR = exports.ICON_MISSILE = exports.ICON_SPECIAL_FORCES = exports.ICON_MILITARY_POLICE = exports.ICON_MEDICAL = exports.ICON_MAINTENANCE = exports.ICON_SUPPLY = exports.ICON_SIGNAL = exports.ICON_COMBAT_ENGINEER = exports.ICON_ENGINEER = exports.ICON_ATTACK_HELICOPTER = exports.ICON_AVIATION = exports.ICON_AIR_DEFENSE = exports.ICON_ROCKET_ARTILLERY = exports.ICON_SELF_PROPELLED_ARTILLERY = exports.ICON_ARTILLERY = exports.ICON_RECONNAISSANCE = exports.ICON_CAVALRY = exports.ICON_LIGHT_ARMOR = exports.ICON_ARMOR = exports.ICON_MARINE_INFANTRY = exports.ICON_MOUNTAIN_INFANTRY = exports.ICON_AIR_ASSAULT_INFANTRY = exports.ICON_AIRBORNE_INFANTRY = exports.ICON_LIGHT_INFANTRY = exports.ICON_MOTORIZED_INFANTRY = exports.ICON_MECHANIZED_INFANTRY = exports.ICON_INFANTRY = exports.ICON_UNSPECIFIED = exports.ECHELON_HIERARCHY = exports.ECHELON_PATTERNS = exports.ECHELON_CODE_TO_NAME = exports.ECHELON_ARMY_GROUP = exports.ECHELON_ARMY = exports.ECHELON_CORPS = exports.ECHELON_DIVISION = exports.ECHELON_BRIGADE = exports.ECHELON_REGIMENT = exports.ECHELON_BATTALION = exports.ECHELON_COMPANY = exports.ECHELON_PLATOON = exports.ECHELON_SECTION = exports.ECHELON_SQUAD = exports.ECHELON_TEAM = exports.ECHELON_UNSPECIFIED = exports.INDENT_SIZE = void 0;
exports.ICON_PATTERNS = exports.ICON_CODE_TO_NAME = exports.ICON_SECURITY = exports.ICON_PARACHUTE = exports.ICON_AMPHIBIOUS = exports.ICON_SNIPER = exports.ICON_AIR_FORCE = exports.ICON_NAVAL = exports.ICON_PSYCHOLOGICAL_OPS = exports.ICON_CIVIL_AFFAIRS = exports.ICON_MILITARY_INTELLIGENCE = exports.ICON_ELECTRONIC_WARFARE = exports.ICON_NBC = void 0;
exports.getNextLowerEchelon = getNextLowerEchelon;
exports.getIconCodeFromName = getIconCodeFromName;
exports.getEchelonCodeFromName = getEchelonCodeFromName;
exports.getEchelonCode = getEchelonCode;
exports.buildSidc = buildSidc;
exports.getEchelonFromSidc = getEchelonFromSidc;
exports.getIconFromSidc = getIconFromSidc;
exports.parseTextToUnits = parseTextToUnits;
exports.convertParsedUnitToSpatialIllusions = convertParsedUnitToSpatialIllusions;
exports.convertParsedUnitsToSpatialIllusions = convertParsedUnitsToSpatialIllusions;
exports.convertParsedUnitsToOrbatMapperScenario = convertParsedUnitsToOrbatMapperScenario;
var nanoid_1 = require("nanoid");
var externalModels_1 = require("@/types/externalModels");
// Indentation configuration
exports.INDENT_SIZE = 2;
// Standard identity for friendly units
var FRIENDLY_SI = "3";
// Symbol set for land units
var UNIT_SYMBOL_SET = "10";
// Echelon constants (SIDC two-character codes)
exports.ECHELON_UNSPECIFIED = "00";
exports.ECHELON_TEAM = "11";
exports.ECHELON_SQUAD = "12";
exports.ECHELON_SECTION = "13";
exports.ECHELON_PLATOON = "14";
exports.ECHELON_COMPANY = "15";
exports.ECHELON_BATTALION = "16";
exports.ECHELON_REGIMENT = "17";
exports.ECHELON_BRIGADE = "18";
exports.ECHELON_DIVISION = "21";
exports.ECHELON_CORPS = "22";
exports.ECHELON_ARMY = "23";
exports.ECHELON_ARMY_GROUP = "24";
// Map echelon codes to their variable names for debug display
exports.ECHELON_CODE_TO_NAME = (_a = {},
    _a[exports.ECHELON_UNSPECIFIED] = "ECHELON_UNSPECIFIED",
    _a[exports.ECHELON_TEAM] = "ECHELON_TEAM",
    _a[exports.ECHELON_SQUAD] = "ECHELON_SQUAD",
    _a[exports.ECHELON_SECTION] = "ECHELON_SECTION",
    _a[exports.ECHELON_PLATOON] = "ECHELON_PLATOON",
    _a[exports.ECHELON_COMPANY] = "ECHELON_COMPANY",
    _a[exports.ECHELON_BATTALION] = "ECHELON_BATTALION",
    _a[exports.ECHELON_REGIMENT] = "ECHELON_REGIMENT",
    _a[exports.ECHELON_BRIGADE] = "ECHELON_BRIGADE",
    _a[exports.ECHELON_DIVISION] = "ECHELON_DIVISION",
    _a[exports.ECHELON_CORPS] = "ECHELON_CORPS",
    _a[exports.ECHELON_ARMY] = "ECHELON_ARMY",
    _a[exports.ECHELON_ARMY_GROUP] = "ECHELON_ARMY_GROUP",
    _a);
// Echelon codes mapped to common unit type keywords
exports.ECHELON_PATTERNS = [
    {
        pattern: /\b(army\s*group|heeresgruppe|front|theater|theatre)\b/i,
        code: exports.ECHELON_ARMY_GROUP,
        label: "Army Group",
    },
    { pattern: /\b(army|armee|field\s*army)\b/i, code: exports.ECHELON_ARMY, label: "Army" },
    { pattern: /\b(corps|korps|mef)\b/i, code: exports.ECHELON_CORPS, label: "Corps" },
    {
        pattern: /\b(division|div|divn)\b/i,
        code: exports.ECHELON_DIVISION,
        label: "Division",
    },
    {
        pattern: /\b(brigade|bde|bgde|brig|combat\s*team|bct|rct)\b/i,
        code: exports.ECHELON_BRIGADE,
        label: "Brigade",
    },
    {
        pattern: /\b(regiment|regt|rgmt|rgt|group|grp|gp|abteilung|abt)\b/i,
        code: exports.ECHELON_REGIMENT,
        label: "Regiment",
    },
    {
        pattern: /\b(battalion|btn|bn|btln|bataillon|squadron|sqdn|sqn|sq)\b/i,
        code: exports.ECHELON_BATTALION,
        label: "Battalion",
    },
    {
        pattern: /\b(company|coy|co|cmp|kompanie|kp|battery|btry|bty|batterie|troop|trp|flight|flt)\b/i,
        code: exports.ECHELON_COMPANY,
        label: "Company",
    },
    {
        pattern: /\b(platoon|plt|pl|ptn|zug|detachment|det|element|elem)\b/i,
        code: exports.ECHELON_PLATOON,
        label: "Platoon",
    },
    { pattern: /\b(section|sect|sec|sctn)\b/i, code: exports.ECHELON_SECTION, label: "Section" },
    { pattern: /\b(squad|sqd|gruppe)\b/i, code: exports.ECHELON_SQUAD, label: "Squad" },
    {
        pattern: /\b(team|tm|crew|cell|fireteam|fire\s*team)\b/i,
        code: exports.ECHELON_TEAM,
        label: "Team",
    },
];
// Echelon hierarchy for inferring child echelons (from largest to smallest)
exports.ECHELON_HIERARCHY = [
    exports.ECHELON_ARMY_GROUP,
    exports.ECHELON_ARMY,
    exports.ECHELON_CORPS,
    exports.ECHELON_DIVISION,
    exports.ECHELON_BRIGADE,
    exports.ECHELON_REGIMENT,
    exports.ECHELON_BATTALION,
    exports.ECHELON_COMPANY,
    exports.ECHELON_PLATOON,
    exports.ECHELON_SECTION,
    exports.ECHELON_SQUAD,
    exports.ECHELON_TEAM,
];
// Entity codes (mainIcon) for symbol set 10 (Land Unit)
// Format: entity (2) + entityType (2) + entitySubType (2) + modifier1 (2) + modifier2 (2) = 10 characters
exports.ICON_UNSPECIFIED = "0000000000";
exports.ICON_INFANTRY = "1211000000";
exports.ICON_MECHANIZED_INFANTRY = "1211020000";
exports.ICON_MOTORIZED_INFANTRY = "1211040000";
exports.ICON_LIGHT_INFANTRY = "1211000019";
exports.ICON_AIRBORNE_INFANTRY = "1211004700";
exports.ICON_AIR_ASSAULT_INFANTRY = "1211000100";
exports.ICON_MOUNTAIN_INFANTRY = "1211000027";
exports.ICON_MARINE_INFANTRY = "1211004600";
exports.ICON_ARMOR = "1205000000";
exports.ICON_LIGHT_ARMOR = "1205010000";
exports.ICON_CAVALRY = "1213000000";
exports.ICON_RECONNAISSANCE = "1213000000";
exports.ICON_ARTILLERY = "1303000000";
exports.ICON_SELF_PROPELLED_ARTILLERY = "1303010000";
exports.ICON_ROCKET_ARTILLERY = "1303020000";
exports.ICON_AIR_DEFENSE = "1301000000";
exports.ICON_AVIATION = "1206000000";
exports.ICON_ATTACK_HELICOPTER = "1206000300";
exports.ICON_ENGINEER = "1407000000";
exports.ICON_COMBAT_ENGINEER = "1407010000";
exports.ICON_SIGNAL = "1110000000";
exports.ICON_SUPPLY = "1634000000";
exports.ICON_MAINTENANCE = "1611000000";
exports.ICON_MEDICAL = "1613000000";
exports.ICON_MILITARY_POLICE = "1412000000";
exports.ICON_SPECIAL_FORCES = "1217000000";
exports.ICON_MISSILE = "1307000000";
exports.ICON_MORTAR = "1308000000";
exports.ICON_ANTITANK = "1204000000";
exports.ICON_TRANSPORTATION = "1636000000";
exports.ICON_HEADQUARTERS = "1800009800";
exports.ICON_CHEMICAL = "1401000000";
exports.ICON_NBC = "1403000000";
exports.ICON_ELECTRONIC_WARFARE = "1505000000";
exports.ICON_MILITARY_INTELLIGENCE = "1510000000";
exports.ICON_CIVIL_AFFAIRS = "1102000000";
exports.ICON_PSYCHOLOGICAL_OPS = "1106000000";
exports.ICON_NAVAL = "1701000000";
exports.ICON_AIR_FORCE = "1101000000";
exports.ICON_SNIPER = "1215000000";
exports.ICON_AMPHIBIOUS = "1202000000";
exports.ICON_PARACHUTE = "1211000001";
exports.ICON_SECURITY = "1416000000";
// Map icon codes to their variable names for debug display
// Note: Some icons share the same code (e.g., ICON_SNIPER=ICON_LIGHT_INFANTRY, ICON_CAVALRY=ICON_RECONNAISSANCE)
// We only include one entry per unique code
exports.ICON_CODE_TO_NAME = (_b = {},
    _b[exports.ICON_UNSPECIFIED] = "ICON_UNSPECIFIED",
    _b[exports.ICON_INFANTRY] = "ICON_INFANTRY",
    _b[exports.ICON_MECHANIZED_INFANTRY] = "ICON_MECHANIZED_INFANTRY",
    _b[exports.ICON_MOTORIZED_INFANTRY] = "ICON_MOTORIZED_INFANTRY",
    _b[exports.ICON_SNIPER] = "ICON_SNIPER",
    _b[exports.ICON_LIGHT_INFANTRY] = "ICON_LIGHT_INFANTRY",
    _b[exports.ICON_AIRBORNE_INFANTRY] = "ICON_AIRBORNE_INFANTRY",
    _b[exports.ICON_AIR_ASSAULT_INFANTRY] = "ICON_AIR_ASSAULT_INFANTRY",
    _b[exports.ICON_MOUNTAIN_INFANTRY] = "ICON_MOUNTAIN_INFANTRY",
    _b[exports.ICON_MARINE_INFANTRY] = "ICON_MARINE_INFANTRY",
    _b[exports.ICON_ARMOR] = "ICON_ARMOR",
    _b[exports.ICON_LIGHT_ARMOR] = "ICON_LIGHT_ARMOR",
    _b[exports.ICON_CAVALRY] = "ICON_CAVALRY", // Also ICON_RECONNAISSANCE
    _b[exports.ICON_ARTILLERY] = "ICON_ARTILLERY",
    _b[exports.ICON_SELF_PROPELLED_ARTILLERY] = "ICON_SELF_PROPELLED_ARTILLERY",
    _b[exports.ICON_ROCKET_ARTILLERY] = "ICON_ROCKET_ARTILLERY",
    _b[exports.ICON_AIR_DEFENSE] = "ICON_AIR_DEFENSE",
    _b[exports.ICON_AVIATION] = "ICON_AVIATION",
    _b[exports.ICON_ATTACK_HELICOPTER] = "ICON_ATTACK_HELICOPTER",
    _b[exports.ICON_ENGINEER] = "ICON_ENGINEER",
    _b[exports.ICON_COMBAT_ENGINEER] = "ICON_COMBAT_ENGINEER",
    _b[exports.ICON_SIGNAL] = "ICON_SIGNAL",
    _b[exports.ICON_SUPPLY] = "ICON_SUPPLY",
    _b[exports.ICON_MAINTENANCE] = "ICON_MAINTENANCE",
    _b[exports.ICON_MEDICAL] = "ICON_MEDICAL",
    _b[exports.ICON_MILITARY_POLICE] = "ICON_MILITARY_POLICE",
    _b[exports.ICON_SPECIAL_FORCES] = "ICON_SPECIAL_FORCES",
    _b[exports.ICON_MISSILE] = "ICON_MISSILE",
    _b[exports.ICON_MORTAR] = "ICON_MORTAR",
    _b[exports.ICON_ANTITANK] = "ICON_ANTITANK",
    _b[exports.ICON_TRANSPORTATION] = "ICON_TRANSPORTATION",
    _b[exports.ICON_HEADQUARTERS] = "ICON_HEADQUARTERS",
    _b[exports.ICON_CHEMICAL] = "ICON_CHEMICAL", // Also ICON_NBC
    _b[exports.ICON_ELECTRONIC_WARFARE] = "ICON_ELECTRONIC_WARFARE",
    _b[exports.ICON_MILITARY_INTELLIGENCE] = "ICON_MILITARY_INTELLIGENCE",
    _b[exports.ICON_CIVIL_AFFAIRS] = "ICON_CIVIL_AFFAIRS",
    _b[exports.ICON_PSYCHOLOGICAL_OPS] = "ICON_PSYCHOLOGICAL_OPS",
    _b[exports.ICON_NAVAL] = "ICON_NAVAL",
    _b[exports.ICON_AIR_FORCE] = "ICON_AIR_FORCE",
    _b[exports.ICON_AMPHIBIOUS] = "ICON_AMPHIBIOUS",
    _b[exports.ICON_PARACHUTE] = "ICON_PARACHUTE",
    _b[exports.ICON_SECURITY] = "ICON_SECURITY",
    _b);
// Symbol icon patterns - maps unit name keywords to entity codes
// ORDER MATTERS: More specific patterns must come before general ones
exports.ICON_PATTERNS = [
    // Infantry types (more specific first)
    {
        pattern: /\b(air\s*assault\s*infantry|aaslt\s*inf|air\s*assault)\b/i,
        code: exports.ICON_AIR_ASSAULT_INFANTRY,
        label: "Air Assault Infantry",
    },
    {
        pattern: /\b(airborne\s*infantry|abn\s*inf|para\s*inf|parachute\s*infantry)\b/i,
        code: exports.ICON_AIRBORNE_INFANTRY,
        label: "Airborne Infantry",
    },
    {
        pattern: /\b(airborne|abn|parachute|para|paratrooper|fallschirmjäger|fallschirmjaeger)\b/i,
        code: exports.ICON_PARACHUTE,
        label: "Airborne/Parachute",
    },
    // Treat 'RA' (R.A., Royal Artillery) as artillery even when abbreviated (e.g., "29 Cdo RA")
    {
        pattern: /\b(ra|R\.?A\.?|royal\s+artillery)\b/i,
        code: exports.ICON_ARTILLERY,
        label: "Royal Artillery (RA)",
    },
    {
        pattern: /\b(marine\s*infantry|marines?|usmc|naval\s*infantry|cdo|seebataillon|marineinfanterie|royal\s*marines?)\b/i,
        code: exports.ICON_MARINE_INFANTRY,
        label: "Marine Infantry",
    },
    {
        pattern: /\bRM\b/,
        code: exports.ICON_MARINE_INFANTRY,
        label: "Royal Marines (RM)",
    },
    {
        pattern: /\b(mountain\s*infantry|mtn\s*inf|alpine|gebirgsjäger|gebirgsjaeger|gebirgs)\b/i,
        code: exports.ICON_MOUNTAIN_INFANTRY,
        label: "Mountain Infantry",
    },
    {
        pattern: /\b(light\s*infantry|lt\s*inf|lti|jäger|jaeger|jager|chasseur|bersaglieri)\b/i,
        code: exports.ICON_LIGHT_INFANTRY,
        label: "Light Infantry",
    },
    {
        pattern: /\b(mechanized\s*infantry|mech\s*inf|mech\s*infantry|panzergrenadier)\b/i,
        code: exports.ICON_MECHANIZED_INFANTRY,
        label: "Mechanized Infantry",
    },
    {
        pattern: /\b(motorized\s*infantry|mot\s*inf|mot\s*infantry|motorised)\b/i,
        code: exports.ICON_MOTORIZED_INFANTRY,
        label: "Motorized Infantry",
    },
    {
        pattern: /\b(sniper|marksman|sharpshooter|designated\s*marksman)\b/i,
        code: exports.ICON_SNIPER,
        label: "Sniper",
    },
    {
        pattern: /\b(infantry|inf|infanterie|infanteria|fanteria|rifles?|riflemen?|foot)\b/i,
        code: exports.ICON_INFANTRY,
        label: "Infantry",
    },
    // Amphibious
    {
        pattern: /\b(amphibious|amphib|amph|landing)\b/i,
        code: exports.ICON_AMPHIBIOUS,
        label: "Amphibious",
    },
    // Anti-tank must come before armor (contains "tank")
    // AT is case-sensitive (uppercase only), anti-tank/antitank is case-insensitive
    {
        pattern: /\b(anti[- ]?tank|anti[- ]?armou?r(ed)?|panzerjäger|panzerabwehr|tank\s*destroyer|td)\b/i,
        code: exports.ICON_ANTITANK,
        label: "Anti-Tank",
    },
    {
        pattern: /\bAT\b/,
        code: exports.ICON_ANTITANK,
        label: "Anti-Tank (AT)",
    },
    // Armor and cavalry
    {
        pattern: /\b(light\s*armou?r(ed)?|light\s*tank|lt\s*armor|lt\s*tk)\b/i,
        code: exports.ICON_LIGHT_ARMOR,
        label: "Light Armor",
    },
    {
        pattern: /\b(armou?r(ed)?|tank|panzer|pz|pzr|char|carro\s*armato|carri|tanque|blind[eé]?|blindado|tkr?)\b/i,
        code: exports.ICON_ARMOR,
        label: "Armor",
    },
    {
        pattern: /\b(cavalry|cav|cvlry|hussars?|dragoons?|lancers?|uhlans?|ulanen|kavallerie|chevau[- ]?légers?|cuirassiers?)\b/i,
        code: exports.ICON_CAVALRY,
        label: "Cavalry",
    },
    {
        pattern: /\b(reconnaissance|recon|recce|rcn|aufklärung|aufklaerung|aufkl|scout|scouting|esploratori|erk|erkund)\b/i,
        code: exports.ICON_RECONNAISSANCE,
        label: "Reconnaissance",
    },
    // Air defense must come before artillery (e.g., "Air Defense Artillery")
    {
        pattern: /\b(air\s*defen[cs]e|anti[- ]?air(craft)?|flak|aaa|ada|sam|shorad|manpad|fla|fliegerabwehr|adad|patriot|stinger|avenger)\b/i,
        code: exports.ICON_AIR_DEFENSE,
        label: "Air Defense",
    },
    // Artillery types (more specific first)
    {
        pattern: /\b(rocket\s*artillery|mlrs|multiple\s*launch|katyusha|nebelwerfer|grad|himars|bm[- ]?\d+|werfer)\b/i,
        code: exports.ICON_ROCKET_ARTILLERY,
        label: "Rocket Artillery",
    },
    {
        pattern: /\b(self[- ]?propelled\s*artillery|spa|sp\s*artillery|sturmgeschütz|stug|panzerhaubitze|pzh)\b/i,
        code: exports.ICON_SELF_PROPELLED_ARTILLERY,
        label: "Self-Propelled Artillery",
    },
    {
        pattern: /\b(artillery|arty|art|artillerie|artl|field\s*artillery|fa|howitzer|how|gun|kanone|geschütz|batteria|cannon)\b/i,
        code: exports.ICON_ARTILLERY,
        label: "Artillery",
    },
    {
        pattern: /\b(mortar|mörser|mortaio|granatwerfer|mort|mtr)\b/i,
        code: exports.ICON_MORTAR,
        label: "Mortar",
    },
    {
        pattern: /\b(missile|guided\s*missile|atgm|ssm|srbm|mrbm|irbm|cruise\s*missile|mlr|tow|javelin|hellfire)\b/i,
        code: exports.ICON_MISSILE,
        label: "Missile",
    },
    // Aviation
    {
        pattern: /\b(attack\s*helicopter|apache|cobra|ah[- ]?\d+|attack\s*aviation)\b/i,
        code: exports.ICON_ATTACK_HELICOPTER,
        label: "Attack Helicopter",
    },
    {
        pattern: /\b(aviation|helicopter|rotary\s*wing|heli|helikopter|hubschrauber|air\s*mobile|airmobile|avn)\b/i,
        code: exports.ICON_AVIATION,
        label: "Aviation",
    },
    {
        pattern: /\b(air\s*force|airforce|luftwaffe|aeronautica|raf|usaf|tactical\s*air)\b/i,
        code: exports.ICON_AIR_FORCE,
        label: "Air Force",
    },
    // Combat support
    {
        pattern: /\b(combat\s*engineer|assault\s*engineer|assault\s*pioneer|sapper|breacher)\b/i,
        code: exports.ICON_COMBAT_ENGINEER,
        label: "Combat Engineer",
    },
    {
        pattern: /\b(engineer|eng|engr|pioniere?|pionier|pioneer|genie|genio|construction|bridging)\b/i,
        code: exports.ICON_ENGINEER,
        label: "Engineer",
    },
    {
        pattern: /\b(signals?|sig|communications?|comms?|fernmelde|nachricht|transmissions?|radio)\b/i,
        code: exports.ICON_SIGNAL,
        label: "Signal",
    },
    {
        pattern: /\b(military\s*police|mp|feldjäger|feldjaeger|gendarmerie|carabinieri|provost|pm)\b/i,
        code: exports.ICON_MILITARY_POLICE,
        label: "Military Police",
    },
    {
        pattern: /\b(guard|guards?)\b/i,
        code: exports.ICON_INFANTRY,
        label: "Guards",
    },
    {
        pattern: /\b(security|guards?|wach|protection|force\s*protection|sec)\b/i,
        code: exports.ICON_SECURITY,
        label: "Security",
    },
    // NBC/Chemical
    {
        pattern: /\b(chemical|chem|cbrn|cbrne|nbc|abc|decontamination|nebel|smoke|gas|decon)\b/i,
        code: exports.ICON_CHEMICAL,
        label: "Chemical/NBC",
    },
    // Electronic Warfare & Intelligence
    {
        pattern: /\b(electronic\s*warfare|ew|elint|sigint|ew\s*unit|jamming|elektronische\s*kampfführung|cyber)\b/i,
        code: exports.ICON_ELECTRONIC_WARFARE,
        label: "Electronic Warfare",
    },
    {
        pattern: /\b(military\s*intelligence|mi|g2|s2|intel|intelligence|intell|int)\b/i,
        code: exports.ICON_MILITARY_INTELLIGENCE,
        label: "Military Intelligence",
    },
    {
        pattern: /\b(civil\s*affairs|ca|cimic|zivil[- ]?militär|cmo)\b/i,
        code: exports.ICON_CIVIL_AFFAIRS,
        label: "Civil Affairs",
    },
    {
        pattern: /\b(psychological\s*op(eration)?s?|psyop|psyops|miso|propaganda|io|info\s*ops?)\b/i,
        code: exports.ICON_PSYCHOLOGICAL_OPS,
        label: "Psychological Operations",
    },
    // Sustainment/logistics
    {
        pattern: /\b(supply|logistics|log|nachschub|versorgung|sustainment|css|logistik|supp|sust)\b/i,
        code: exports.ICON_SUPPLY,
        label: "Supply",
    },
    {
        pattern: /\b(maintenance|maint|mnt|repair|instandsetzung|werkstatt|ordnance|recovery|wrecker)\b/i,
        code: exports.ICON_MAINTENANCE,
        label: "Maintenance",
    },
    {
        pattern: /\b(medical|medic|med|hospital|ambulance|sanität|sanitäts|sanitaets|field\s*hospital|aid\s*station|evac|medevac|casevac|fst)\b/i,
        code: exports.ICON_MEDICAL,
        label: "Medical",
    },
    {
        pattern: /\b(transport|transportation|trans|trns|truck|motor\s*transport|kraftfahr|lkw|lorry|lorries|mvt|movement)\b/i,
        code: exports.ICON_TRANSPORTATION,
        label: "Transportation",
    },
    // Special operations
    {
        pattern: /\b(special\s*forces|sf|special\s*ops|sof|rangers?|commando|commandos|sas|seals?|delta|ksk|green\s*berets?|brandenburger|pathfinders?|lrrp|lrs)\b/i,
        code: exports.ICON_SPECIAL_FORCES,
        label: "Special Forces",
    },
    // Naval (ground-based naval units)
    {
        pattern: /\b(naval|navy|marine\s*corps|kriegsmarine|seebataillon)\b/i,
        code: exports.ICON_NAVAL,
        label: "Naval",
    },
    // Headquarters
    {
        pattern: /\b(headquarters|hq|hqs|hauptquartier|stab|command\s*post|cp|toc|tactical\s*operations?\s*center)\b/i,
        code: exports.ICON_HEADQUARTERS,
        label: "Headquarters",
    },
];
/**
 * Get the next lower echelon code in the hierarchy
 */
function getNextLowerEchelon(parentEchelon) {
    var idx = exports.ECHELON_HIERARCHY.indexOf(parentEchelon);
    if (idx === -1 || idx >= exports.ECHELON_HIERARCHY.length - 1) {
        return exports.ECHELON_UNSPECIFIED; // Unspecified
    }
    return exports.ECHELON_HIERARCHY[idx + 1];
}
/**
 * Detect symbol icon code from unit name using keyword patterns
 */
function getIconCodeFromName(name) {
    for (var _i = 0, ICON_PATTERNS_1 = exports.ICON_PATTERNS; _i < ICON_PATTERNS_1.length; _i++) {
        var _a = ICON_PATTERNS_1[_i], pattern = _a.pattern, code = _a.code;
        if (pattern.test(name)) {
            return code;
        }
    }
    return exports.ICON_UNSPECIFIED;
}
/**
 * Detect echelon code from unit name using keyword patterns
 */
function getEchelonCodeFromName(name) {
    for (var _i = 0, ECHELON_PATTERNS_1 = exports.ECHELON_PATTERNS; _i < ECHELON_PATTERNS_1.length; _i++) {
        var _a = ECHELON_PATTERNS_1[_i], pattern = _a.pattern, code = _a.code;
        if (pattern.test(name)) {
            return code;
        }
    }
    return exports.ECHELON_UNSPECIFIED; // Unspecified
}
/**
 * Get echelon code based on hierarchy level (fallback)
 */
function getEchelonCode(level) {
    if (level < exports.ECHELON_HIERARCHY.length) {
        return exports.ECHELON_HIERARCHY[level];
    }
    return exports.ECHELON_HIERARCHY[exports.ECHELON_HIERARCHY.length - 1];
}
/**
 * Build a 2525D SIDC for a unit
 */
function buildSidc(level, name, parentEchelon, parentIcon) {
    var version = "10";
    var context = "0";
    var si = FRIENDLY_SI;
    var symbolSet = UNIT_SYMBOL_SET;
    var status = "0";
    var hqtfd = "0";
    // Try to detect echelon from name first
    var echelon = getEchelonCodeFromName(name);
    // If not detected from name, infer from parent echelon
    if (echelon === exports.ECHELON_UNSPECIFIED &&
        parentEchelon &&
        parentEchelon !== exports.ECHELON_UNSPECIFIED) {
        echelon = getNextLowerEchelon(parentEchelon);
    }
    // If still not determined, fall back to level-based
    if (echelon === exports.ECHELON_UNSPECIFIED) {
        echelon = getEchelonCode(level);
    }
    // Detect symbol icon from name, fall back to parent icon if not detected
    var entity = getIconCodeFromName(name);
    if (entity === exports.ICON_UNSPECIFIED && parentIcon && parentIcon !== exports.ICON_UNSPECIFIED) {
        entity = parentIcon;
    }
    return version + context + si + symbolSet + status + hqtfd + echelon + entity;
}
/**
 * Extract echelon code from SIDC (positions 8-9)
 */
function getEchelonFromSidc(sidc) {
    return sidc.substring(8, 10);
}
/**
 * Extract icon/entity code from SIDC (positions 10-19, 10 characters)
 */
function getIconFromSidc(sidc) {
    return sidc.substring(10, 20);
}
/**
 * Parse indented text into a hierarchical unit structure
 */
function parseTextToUnits(text) {
    var lines = text.split("\n").filter(function (line) { return line.trim().length > 0; });
    var result = [];
    var stack = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var trimmed = line.trimStart();
        var indent = line.length - trimmed.length;
        var name_1 = trimmed.trim();
        if (!name_1)
            continue;
        // Determine the level based on indentation
        var level = 0;
        if (stack.length > 0) {
            // Find parent based on indentation
            while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }
            level = stack.length;
        }
        // Get parent's echelon and icon if available
        var parentEchelon = stack.length > 0 ? stack[stack.length - 1].echelon : undefined;
        var parentIcon = stack.length > 0 ? stack[stack.length - 1].icon : undefined;
        var sidc = buildSidc(level, name_1, parentEchelon, parentIcon);
        var unitEchelon = getEchelonFromSidc(sidc);
        var unitIcon = getIconFromSidc(sidc);
        var unit = {
            id: (0, nanoid_1.nanoid)(),
            name: name_1,
            sidc: sidc,
            children: [],
            level: level,
        };
        if (stack.length === 0) {
            result.push(unit);
        }
        else {
            stack[stack.length - 1].unit.children.push(unit);
        }
        stack.push({ unit: unit, indent: indent, echelon: unitEchelon, icon: unitIcon });
    }
    return result;
}
function convertParsedUnitToSpatialIllusions(unit) {
    var subOrganizations = unit.children.map(function (child) {
        return convertParsedUnitToSpatialIllusions(child);
    });
    return (0, externalModels_1.makeSpatialIllusionsNode)({
        uniqueDesignation: unit.name,
        sidc: unit.sidc,
    }, subOrganizations);
}
function convertParsedUnitsToSpatialIllusions(units) {
    if (units.length === 0) {
        return (0, externalModels_1.makeSpatialIllusionsNode)({
            uniqueDesignation: "ORBAT",
            sidc: "10031000001211000000",
        });
    }
    // Spatial Illusions only supports a single root unit
    return convertParsedUnitToSpatialIllusions(units[0]);
}
function convertParsedUnitToOrbatMapperUnit(unit) {
    return {
        id: unit.id,
        name: unit.name,
        sidc: unit.sidc,
        subUnits: unit.children.map(function (child) { return convertParsedUnitToOrbatMapperUnit(child); }),
    };
}
function convertParsedUnitsToOrbatMapperScenario(units) {
    var scenarioId = (0, nanoid_1.nanoid)();
    var now = new Date().toISOString();
    var subUnits = units.map(function (unit) { return convertParsedUnitToOrbatMapperUnit(unit); });
    var friendlyGroup = {
        id: (0, nanoid_1.nanoid)(),
        name: "Units",
        subUnits: subUnits,
    };
    var friendlySide = {
        id: (0, nanoid_1.nanoid)(),
        name: "Friendly",
        standardIdentity: "3",
        groups: [friendlyGroup],
    };
    var scenario = {
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
