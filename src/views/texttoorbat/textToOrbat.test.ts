import { describe, expect, it } from "vitest";
import {
  BUILTIN_ICON_DEFINITIONS,
  extractEntityCode,
  ICON_UNSPECIFIED,
} from "./iconRegistry";
import {
  applyGeneratedShortNamesToText,
  clearAllShortNames,
  buildSidc,
  convertParsedUnitsToOrbatMapperScenario,
  convertParsedUnitsToSpatialIllusions,
  generateMissingShortNames,
  generateMissingShortNamesWithOptions,
  getEchelonCode,
  getEchelonCodeFromName,
  getEchelonFromSidc,
  getIconCodeFromName,
  getNextLowerEchelon,
  parseTextToUnits,
  serializeParsedUnitsToScenarioUnits,
  serializeUnitsToIndentedText,
} from "./textToOrbat.ts";

/** Look up the 10-char entity code for a built-in icon by label. */
function iconCode(label: string): string {
  const def = BUILTIN_ICON_DEFINITIONS.find((d) => d.label === label);
  if (!def) throw new Error(`No icon definition with label "${label}"`);
  return extractEntityCode(def.sidc);
}

const ICON_AIR_ASSAULT_INFANTRY = iconCode("Air Assault Infantry");
const ICON_AIR_DEFENSE = iconCode("Air Defense");
const ICON_AIR_FORCE = iconCode("Air Force");
const ICON_AIRBORNE_INFANTRY = iconCode("Airborne Infantry");
const ICON_AMPHIBIOUS = iconCode("Amphibious");
const ICON_AMPHIBIOUS_WARFARE_SHIP = iconCode("Amphibious Warfare Ship");
const ICON_ANTITANK = iconCode("Anti-Tank");
const ICON_ARMOR = iconCode("Armor");
const ICON_ARTILLERY = iconCode("Artillery");
const ICON_ATTACK_HELICOPTER = iconCode("Attack Helicopter");
const ICON_AUXILIARY_SHIP = iconCode("Auxiliary Ship");
const ICON_AVIATION = iconCode("Aviation");
const ICON_BATTLESHIP = iconCode("Battleship");
const ICON_CARGO_SHIP = iconCode("Cargo Ship");
const ICON_CARRIER = iconCode("Aircraft Carrier");
const ICON_CAVALRY = iconCode("Cavalry");
const ICON_CHEMICAL = iconCode("Chemical/NBC");
const ICON_CIVIL_AFFAIRS = iconCode("Civil Affairs");
const ICON_COMBAT_ENGINEER = iconCode("Combat Engineer");
const ICON_CORVETTE = iconCode("Corvette");
const ICON_CRUISER = iconCode("Cruiser");
const ICON_DESTROYER = iconCode("Destroyer");
const ICON_ELECTRONIC_WARFARE = iconCode("Electronic Warfare");
const ICON_ENGINEER = iconCode("Engineer");
const ICON_FRIGATE = iconCode("Frigate");
const ICON_HEADQUARTERS = iconCode("Headquarters");
const ICON_HOSPITAL_SHIP = iconCode("Hospital Ship");
const ICON_INFANTRY = iconCode("Infantry");
const ICON_LIGHT_ARMOR = iconCode("Light Armor");
const ICON_LIGHT_INFANTRY = iconCode("Light Infantry");
const ICON_LITTORAL_COMBAT_SHIP = iconCode("Littoral Combat Ship");
const ICON_MAINTENANCE = iconCode("Maintenance");
const ICON_MARINE_INFANTRY = iconCode("Marine Infantry");
const ICON_MECHANIZED_INFANTRY = iconCode("Mechanized Infantry");
const ICON_MEDICAL = iconCode("Medical");
const ICON_MILITARY_INTELLIGENCE = iconCode("Military Intelligence");
const ICON_MILITARY_POLICE = iconCode("Military Police");
const ICON_MINE_WARFARE_SHIP = iconCode("Mine Warfare Ship");
const ICON_MISSILE = iconCode("Missile");
const ICON_MORTAR = iconCode("Mortar");
const ICON_MOTORIZED_INFANTRY = iconCode("Motorized Infantry");
const ICON_MOUNTAIN_INFANTRY = iconCode("Mountain Infantry");
const ICON_NAVAL = iconCode("Naval");
const ICON_NAVY_TASK_ELEMENT = iconCode("Navy Task Element");
const ICON_NAVY_TASK_FORCE = iconCode("Navy Task Force");
const ICON_NAVY_TASK_GROUP = iconCode("Navy Task Group");
const ICON_NAVY_TASK_UNIT = iconCode("Navy Task Unit");
const ICON_CONVOY = iconCode("Convoy");
const ICON_PARACHUTE = iconCode("Airborne/Parachute");
const ICON_PATROL_BOAT = iconCode("Patrol Boat");
const ICON_PSYCHOLOGICAL_OPS = iconCode("Psychological Operations");
const ICON_RECONNAISSANCE = iconCode("Reconnaissance");
const ICON_ROCKET_ARTILLERY = iconCode("Rocket Artillery");
const ICON_SECURITY = iconCode("Security");
const ICON_SELF_PROPELLED_ARTILLERY = iconCode("Self-Propelled Artillery");
const ICON_SIGNAL = iconCode("Signal");
const ICON_SNIPER = iconCode("Sniper");
const ICON_SPECIAL_FORCES = iconCode("Special Forces");
const ICON_SUBMARINE = iconCode("Submarine");
const ICON_SUPPLY = iconCode("Supply");
const ICON_TANKER_SHIP = iconCode("Tanker");
const ICON_TRANSPORTATION = iconCode("Transportation");

describe("getEchelonCodeFromName", () => {
  it("detects Division from full word", () => {
    expect(getEchelonCodeFromName("1st Infantry Division")).toBe("21");
  });

  it("detects Division from abbreviation", () => {
    expect(getEchelonCodeFromName("1st Inf Div")).toBe("21");
  });

  it("detects Brigade", () => {
    expect(getEchelonCodeFromName("1st Brigade")).toBe("18");
    expect(getEchelonCodeFromName("1st Bde")).toBe("18");
  });

  it("detects concatenated Brigade abbreviations", () => {
    expect(getEchelonCodeFromName("1bde")).toBe("18");
  });

  it("detects Regiment", () => {
    expect(getEchelonCodeFromName("Artillery Regiment")).toBe("17");
    expect(getEchelonCodeFromName("1st Regt")).toBe("17");
  });

  it("detects Battalion", () => {
    expect(getEchelonCodeFromName("1st Battalion")).toBe("16");
    expect(getEchelonCodeFromName("1st Bn")).toBe("16");
    expect(getEchelonCodeFromName("2nd Btn")).toBe("16");
  });

  it("detects concatenated Battalion abbreviations", () => {
    expect(getEchelonCodeFromName("2bn")).toBe("16");
    expect(getEchelonCodeFromName("2btn")).toBe("16");
  });

  it("detects Squadron", () => {
    expect(getEchelonCodeFromName("1st Cavalry Squadron")).toBe("16");
    expect(getEchelonCodeFromName("1st Sqn")).toBe("16");
  });

  it("detects Company", () => {
    expect(getEchelonCodeFromName("Alpha Company")).toBe("15");
    expect(getEchelonCodeFromName("A Coy")).toBe("15");
    expect(getEchelonCodeFromName("A Co")).toBe("15");
  });

  it("detects concatenated Company abbreviations", () => {
    expect(getEchelonCodeFromName("Aco")).toBe("15");
  });

  it("detects Battery", () => {
    expect(getEchelonCodeFromName("1st Battery")).toBe("15");
    expect(getEchelonCodeFromName("A Btry")).toBe("15");
  });

  it("detects Troop", () => {
    expect(getEchelonCodeFromName("A Troop")).toBe("15");
    expect(getEchelonCodeFromName("1st Trp")).toBe("15");
  });

  it("detects Platoon", () => {
    expect(getEchelonCodeFromName("1st Platoon")).toBe("14");
    expect(getEchelonCodeFromName("1st Plt")).toBe("14");
  });

  it("detects concatenated Platoon abbreviations", () => {
    expect(getEchelonCodeFromName("3plt")).toBe("14");
  });

  it("detects Detachment", () => {
    expect(getEchelonCodeFromName("Forward Detachment")).toBe("14");
    expect(getEchelonCodeFromName("Recon Det")).toBe("14");
  });

  it("detects Section", () => {
    expect(getEchelonCodeFromName("Mortar Section")).toBe("13");
    expect(getEchelonCodeFromName("1st Sect")).toBe("13");
  });

  it("detects Squad", () => {
    expect(getEchelonCodeFromName("1st Squad")).toBe("12");
    expect(getEchelonCodeFromName("Alpha Sqd")).toBe("12");
  });

  it("detects Team", () => {
    expect(getEchelonCodeFromName("Fire Team")).toBe("11");
    expect(getEchelonCodeFromName("Alpha Tm")).toBe("11");
  });

  it("detects Crew", () => {
    expect(getEchelonCodeFromName("Tank Crew")).toBe("11");
  });

  it("detects Corps", () => {
    expect(getEchelonCodeFromName("XVIII Airborne Corps")).toBe("22");
  });

  it("detects Army", () => {
    expect(getEchelonCodeFromName("3rd Army")).toBe("23");
  });

  it("detects Army Group", () => {
    expect(getEchelonCodeFromName("12th Army Group")).toBe("24");
  });

  it("detects Front", () => {
    expect(getEchelonCodeFromName("1st Belorussian Front")).toBe("24");
  });

  it("returns 00 for unrecognized names", () => {
    expect(getEchelonCodeFromName("Headquarters")).toBe("00");
    expect(getEchelonCodeFromName("Support Unit")).toBe("00");
    expect(getEchelonCodeFromName("Alpha")).toBe("00");
  });

  it("is case insensitive", () => {
    expect(getEchelonCodeFromName("1ST INFANTRY DIVISION")).toBe("21");
    expect(getEchelonCodeFromName("1st infantry division")).toBe("21");
  });
});

describe("convertParsedUnitsToOrbatMapperScenario", () => {
  it("creates a canonical v3 scenario with a default overlay layer", () => {
    const scenario = convertParsedUnitsToOrbatMapperScenario([]);

    expect(scenario.version).toBe("3.0.0");
    expect(scenario.layerStack).toHaveLength(1);
    expect(scenario.layerStack[0]).toMatchObject({
      kind: "overlay",
      name: "Features",
      items: [],
    });
    expect(scenario.layers).toBeUndefined();
    expect(scenario.mapLayers).toBeUndefined();
  });
});

describe("getNextLowerEchelon", () => {
  it("returns Brigade for Division", () => {
    expect(getNextLowerEchelon("21")).toBe("18");
  });

  it("returns Regiment for Brigade", () => {
    expect(getNextLowerEchelon("18")).toBe("17");
  });

  it("returns Battalion for Regiment", () => {
    expect(getNextLowerEchelon("17")).toBe("16");
  });

  it("returns Company for Battalion", () => {
    expect(getNextLowerEchelon("16")).toBe("15");
  });

  it("returns 00 for Team (lowest)", () => {
    expect(getNextLowerEchelon("11")).toBe("00");
  });

  it("returns 00 for unknown echelon", () => {
    expect(getNextLowerEchelon("99")).toBe("00");
  });
});

describe("getEchelonCode", () => {
  it("returns Brigade for level 0", () => {
    expect(getEchelonCode(0)).toBe("18");
  });

  it("returns Company for level 3", () => {
    expect(getEchelonCode(3)).toBe("15");
  });

  it("returns Team for very deep levels", () => {
    expect(getEchelonCode(100)).toBe("11");
  });
});

describe("buildSidc", () => {
  it("returns 20-character SIDC", () => {
    const sidc = buildSidc(0, "1st Infantry Division");
    expect(sidc).toHaveLength(20);
  });

  it("starts with version 10", () => {
    const sidc = buildSidc(0, "1st Infantry Division");
    expect(sidc.substring(0, 2)).toBe("10");
  });

  it("uses friendly standard identity", () => {
    const sidc = buildSidc(0, "1st Infantry Division");
    expect(sidc.substring(3, 4)).toBe("3");
  });

  it("uses land unit symbol set", () => {
    const sidc = buildSidc(0, "1st Infantry Division");
    expect(sidc.substring(4, 6)).toBe("10");
  });

  it("detects echelon from name", () => {
    const sidc = buildSidc(0, "1st Infantry Division");
    expect(getEchelonFromSidc(sidc)).toBe("21");
  });

  it("infers echelon from parent when name has no keyword", () => {
    const sidc = buildSidc(1, "Alpha", "21"); // parent is Division
    expect(getEchelonFromSidc(sidc)).toBe("18"); // should be Brigade
  });

  it("falls back to level-based echelon when no parent", () => {
    const sidc = buildSidc(3, "Headquarters");
    expect(getEchelonFromSidc(sidc)).toBe("15"); // level 3 = Company (brigade + 3)
  });

  it("name detection takes priority over parent inference", () => {
    const sidc = buildSidc(1, "1st Battalion", "21"); // parent is Division, but name says Battalion
    expect(getEchelonFromSidc(sidc)).toBe("16"); // should be Battalion from name
  });
});

describe("parseTextToUnits", () => {
  it("parses single unit", () => {
    const units = parseTextToUnits("1st Infantry Division");
    expect(units).toHaveLength(1);
    expect(units[0].name).toBe("1st Infantry Division");
    expect(units[0].level).toBe(0);
    expect(units[0].children).toHaveLength(0);
  });

  it("parses flat list as siblings", () => {
    const text = `1st Division
2nd Division
3rd Division`;
    const units = parseTextToUnits(text);
    expect(units).toHaveLength(3);
    expect(units[0].name).toBe("1st Division");
    expect(units[1].name).toBe("2nd Division");
    expect(units[2].name).toBe("3rd Division");
  });

  it("parses indented units as children", () => {
    const text = `1st Division
  1st Brigade
  2nd Brigade`;
    const units = parseTextToUnits(text);
    expect(units).toHaveLength(1);
    expect(units[0].children).toHaveLength(2);
    expect(units[0].children[0].name).toBe("1st Brigade");
    expect(units[0].children[1].name).toBe("2nd Brigade");
  });

  it("parses multi-level hierarchy", () => {
    const text = `1st Infantry Division
  1st Brigade
    1st Battalion
    2nd Battalion
  2nd Brigade
    3rd Battalion`;
    const units = parseTextToUnits(text);

    expect(units).toHaveLength(1);
    const div = units[0];
    expect(div.name).toBe("1st Infantry Division");
    expect(div.children).toHaveLength(2);

    const bde1 = div.children[0];
    expect(bde1.name).toBe("1st Brigade");
    expect(bde1.children).toHaveLength(2);
    expect(bde1.children[0].name).toBe("1st Battalion");
    expect(bde1.children[1].name).toBe("2nd Battalion");

    const bde2 = div.children[1];
    expect(bde2.name).toBe("2nd Brigade");
    expect(bde2.children).toHaveLength(1);
    expect(bde2.children[0].name).toBe("3rd Battalion");
  });

  it("detects echelons from names", () => {
    const text = `1st Infantry Division
  1st Brigade
    1st Battalion`;
    const units = parseTextToUnits(text);

    expect(getEchelonFromSidc(units[0].sidc)).toBe("21"); // Division
    expect(getEchelonFromSidc(units[0].children[0].sidc)).toBe("18"); // Brigade
    expect(getEchelonFromSidc(units[0].children[0].children[0].sidc)).toBe("16"); // Battalion
  });

  it("detects echelons from concatenated abbreviations in hierarchy", () => {
    const text = `1div
  1bde
    2bn
      Aco
        3plt`;
    const units = parseTextToUnits(text);

    expect(getEchelonFromSidc(units[0].sidc)).toBe("21"); // Division
    expect(getEchelonFromSidc(units[0].children[0].sidc)).toBe("18"); // Brigade
    expect(getEchelonFromSidc(units[0].children[0].children[0].sidc)).toBe("16"); // Battalion
    expect(getEchelonFromSidc(units[0].children[0].children[0].children[0].sidc)).toBe(
      "15",
    ); // Company
    expect(
      getEchelonFromSidc(units[0].children[0].children[0].children[0].children[0].sidc),
    ).toBe("14"); // Platoon
  });

  it("infers echelons from parent when names lack keywords", () => {
    const text = `1st Infantry Division
  Alpha
    Red`;
    const units = parseTextToUnits(text);

    expect(getEchelonFromSidc(units[0].sidc)).toBe("21"); // Division from name
    expect(getEchelonFromSidc(units[0].children[0].sidc)).toBe("18"); // Brigade inferred from parent
    expect(getEchelonFromSidc(units[0].children[0].children[0].sidc)).toBe("17"); // Regiment inferred
  });

  it("handles mixed keyword and non-keyword names", () => {
    const text = `1st Infantry Division
  Alpha
  Artillery Regiment
    1st Battery`;
    const units = parseTextToUnits(text);

    const div = units[0];
    expect(getEchelonFromSidc(div.sidc)).toBe("21"); // Division

    const alpha = div.children[0];
    expect(getEchelonFromSidc(alpha.sidc)).toBe("18"); // Brigade inferred

    const arty = div.children[1];
    expect(getEchelonFromSidc(arty.sidc)).toBe("17"); // Regiment from name

    const battery = arty.children[0];
    expect(getEchelonFromSidc(battery.sidc)).toBe("15"); // Company from "Battery"
  });

  it("handles empty input", () => {
    expect(parseTextToUnits("")).toHaveLength(0);
    expect(parseTextToUnits("   ")).toHaveLength(0);
    expect(parseTextToUnits("\n\n\n")).toHaveLength(0);
  });

  it("ignores blank lines", () => {
    const text = `1st Division

  1st Brigade

    1st Battalion`;
    const units = parseTextToUnits(text);
    expect(units).toHaveLength(1);
    expect(units[0].children).toHaveLength(1);
    expect(units[0].children[0].children).toHaveLength(1);
  });

  it("handles tabs as indentation", () => {
    const text = "1st Division\n\t1st Brigade\n\t\t1st Battalion";
    const units = parseTextToUnits(text);
    expect(units).toHaveLength(1);
    expect(units[0].children).toHaveLength(1);
    expect(units[0].children[0].children).toHaveLength(1);
  });

  it("assigns unique IDs to each unit", () => {
    const text = `1st Division
  1st Brigade
  2nd Brigade`;
    const units = parseTextToUnits(text);

    const ids = [units[0].id, units[0].children[0].id, units[0].children[1].id];
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it("assigns correct level to each unit", () => {
    const text = `1st Division
  1st Brigade
    1st Battalion
      Alpha Company`;
    const units = parseTextToUnits(text);

    expect(units[0].level).toBe(0);
    expect(units[0].children[0].level).toBe(1);
    expect(units[0].children[0].children[0].level).toBe(2);
    expect(units[0].children[0].children[0].children[0].level).toBe(3);
  });

  it("handles dedent correctly", () => {
    const text = `1st Division
  1st Brigade
    1st Battalion
  2nd Brigade`;
    const units = parseTextToUnits(text);

    expect(units[0].children).toHaveLength(2);
    expect(units[0].children[0].name).toBe("1st Brigade");
    expect(units[0].children[0].children).toHaveLength(1);
    expect(units[0].children[1].name).toBe("2nd Brigade");
    expect(units[0].children[1].children).toHaveLength(0);
  });

  it("handles multiple root units", () => {
    const text = `1st Division
  1st Brigade
2nd Division
  2nd Brigade`;
    const units = parseTextToUnits(text);

    expect(units).toHaveLength(2);
    expect(units[0].name).toBe("1st Division");
    expect(units[0].children[0].name).toBe("1st Brigade");
    expect(units[1].name).toBe("2nd Division");
    expect(units[1].children[0].name).toBe("2nd Brigade");
  });

  it("uses balanced pipe metadata for parsing but hides it from the unit name", () => {
    const units = parseTextToUnits("Alpha Company |mechanized infantry|");

    expect(units[0].name).toBe("Alpha Company");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });

  it("uses single-pipe trailing metadata for parsing but hides it from the unit name", () => {
    const units = parseTextToUnits("Alpha Company |mechanized infantry");

    expect(units[0].name).toBe("Alpha Company");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });

  it("uses bracket metadata for echelon detection while hiding it from the unit name", () => {
    const units = parseTextToUnits("Alpha [brigade]");

    expect(units[0].name).toBe("Alpha");
    expect(getEchelonFromSidc(units[0].sidc)).toBe("18");
  });

  it("lets metadata override visible-name echelon detection", () => {
    const units = parseTextToUnits("1st Infantry Division | bn");

    expect(units[0].name).toBe("1st Infantry Division");
    expect(getEchelonFromSidc(units[0].sidc)).toBe("16");
  });

  it("combines visible text with hidden metadata for parsing", () => {
    const units = parseTextToUnits("1st Brigade |mechanized infantry|");

    expect(units[0].name).toBe("1st Brigade");
    expect(getEchelonFromSidc(units[0].sidc)).toBe("18");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });

  it("supports multiple metadata segments on one line", () => {
    const units = parseTextToUnits("Alpha [brigade] |mechanized infantry|");

    expect(units[0].name).toBe("Alpha");
    expect(getEchelonFromSidc(units[0].sidc)).toBe("18");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });

  it("preserves inheritance when parent and child use hidden metadata", () => {
    const text = `1st Division |tank|
  Alpha [brigade]
    Bravo`;
    const units = parseTextToUnits(text);

    expect(units[0].name).toBe("1st Division");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_ARMOR);

    expect(units[0].children[0].name).toBe("Alpha");
    expect(getEchelonFromSidc(units[0].children[0].sidc)).toBe("18");
    expect(units[0].children[0].sidc.substring(10, 20)).toBe(ICON_ARMOR);

    expect(units[0].children[0].children[0].name).toBe("Bravo");
    expect(units[0].children[0].children[0].sidc.substring(10, 20)).toBe(ICON_ARMOR);
  });

  it("ignores an empty single trailing pipe", () => {
    const units = parseTextToUnits("Alpha Company |");

    expect(units[0].name).toBe("Alpha Company");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_UNSPECIFIED);
  });

  it("ignores trailing comments after a unit definition", () => {
    const units = parseTextToUnits("Alpha [brigade] |mechanized infantry| # note");

    expect(units[0].name).toBe("Alpha");
    expect(getEchelonFromSidc(units[0].sidc)).toBe("18");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });

  it("ignores comment-only lines", () => {
    const text = `# top-level note
1st Division
  # brigade note
  1st Brigade`;
    const units = parseTextToUnits(text);

    expect(units).toHaveLength(1);
    expect(units[0].name).toBe("1st Division");
    expect(units[0].children).toHaveLength(1);
    expect(units[0].children[0].name).toBe("1st Brigade");
  });

  it("keeps unmatched brackets as literal text", () => {
    const units = parseTextToUnits("Alpha [brigade");

    expect(units[0].name).toBe("Alpha [brigade");
    expect(getEchelonFromSidc(units[0].sidc)).toBe("18");
  });
});

describe("conversion helpers with hidden metadata", () => {
  it("exports scenario units without hidden metadata in the name", () => {
    const units = parseTextToUnits("Alpha [brigade] |mechanized infantry|");
    const scenarioUnits = serializeParsedUnitsToScenarioUnits(units);

    expect(scenarioUnits[0].name).toBe("Alpha");
    expect(scenarioUnits[0].sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });

  it("exports Spatial Illusions designations without hidden metadata in the name", () => {
    const units = parseTextToUnits("Alpha [brigade] |mechanized infantry|");
    const orbat = convertParsedUnitsToSpatialIllusions(units);

    expect(orbat.options.uniqueDesignation).toBe("Alpha");
    expect(orbat.options.sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });
});

describe("getEchelonFromSidc", () => {
  it("extracts echelon code from positions 8-9", () => {
    const sidc = "10031000210000000000";
    expect(getEchelonFromSidc(sidc)).toBe("21");
  });
});

describe("getIconCodeFromName", () => {
  describe("Infantry types", () => {
    it("detects basic infantry", () => {
      expect(getIconCodeFromName("1st Infantry Division")).toBe(ICON_INFANTRY);
      expect(getIconCodeFromName("1st Inf Bn")).toBe(ICON_INFANTRY);
      expect(getIconCodeFromName("Rifles Company")).toBe(ICON_INFANTRY);
      expect(getIconCodeFromName("1st Foot Regiment")).toBe(ICON_INFANTRY);
    });

    it("detects mechanized infantry", () => {
      expect(getIconCodeFromName("1st Mechanized Infantry Division")).toBe(
        ICON_MECHANIZED_INFANTRY,
      );
      expect(getIconCodeFromName("1st Mech Inf Bn")).toBe(ICON_MECHANIZED_INFANTRY);
      expect(getIconCodeFromName("Panzergrenadier Battalion")).toBe(
        ICON_MECHANIZED_INFANTRY,
      );
    });

    it("detects motorized infantry", () => {
      expect(getIconCodeFromName("1st Motorized Infantry Division")).toBe(
        ICON_MOTORIZED_INFANTRY,
      );
      expect(getIconCodeFromName("1st Mot Inf Bn")).toBe(ICON_MOTORIZED_INFANTRY);
      expect(getIconCodeFromName("Motorised Company")).toBe(ICON_MOTORIZED_INFANTRY);
    });

    it("detects light infantry", () => {
      expect(getIconCodeFromName("Light Infantry Battalion")).toBe(ICON_LIGHT_INFANTRY);
      expect(getIconCodeFromName("Lt Inf Company")).toBe(ICON_LIGHT_INFANTRY);
      expect(getIconCodeFromName("Jäger Battalion")).toBe(ICON_LIGHT_INFANTRY);
      expect(getIconCodeFromName("Chasseur Regiment")).toBe(ICON_LIGHT_INFANTRY);
      expect(getIconCodeFromName("Bersaglieri Brigade")).toBe(ICON_LIGHT_INFANTRY);
    });

    it("detects airborne infantry", () => {
      expect(getIconCodeFromName("Airborne Division")).toBe(ICON_PARACHUTE);
      expect(getIconCodeFromName("82nd Abn Division")).toBe(ICON_PARACHUTE);
      expect(getIconCodeFromName("Parachute Regiment")).toBe(ICON_PARACHUTE);
      expect(getIconCodeFromName("Para Battalion")).toBe(ICON_PARACHUTE);
      expect(getIconCodeFromName("Fallschirmjäger Division")).toBe(ICON_PARACHUTE);
      expect(getIconCodeFromName("Airborne Infantry Battalion")).toBe(
        ICON_AIRBORNE_INFANTRY,
      );
      expect(getIconCodeFromName("Abn Inf Company")).toBe(ICON_AIRBORNE_INFANTRY);
    });

    it("detects air assault infantry", () => {
      expect(getIconCodeFromName("Air Assault Brigade")).toBe(ICON_AIR_ASSAULT_INFANTRY);
      expect(getIconCodeFromName("AASLT Inf Battalion")).toBe(ICON_AIR_ASSAULT_INFANTRY);
    });

    it("detects mountain infantry", () => {
      expect(getIconCodeFromName("Mountain Infantry Division")).toBe(
        ICON_MOUNTAIN_INFANTRY,
      );
      expect(getIconCodeFromName("Mtn Inf Brigade")).toBe(ICON_MOUNTAIN_INFANTRY);
      expect(getIconCodeFromName("Alpine Regiment")).toBe(ICON_MOUNTAIN_INFANTRY);
      expect(getIconCodeFromName("Gebirgsjäger Battalion")).toBe(ICON_MOUNTAIN_INFANTRY);
    });

    it("detects marine infantry", () => {
      expect(getIconCodeFromName("Marine Division")).toBe(ICON_MARINE_INFANTRY);
      expect(getIconCodeFromName("Marines Regiment")).toBe(ICON_MARINE_INFANTRY);
      expect(getIconCodeFromName("USMC Battalion")).toBe(ICON_MARINE_INFANTRY);
      expect(getIconCodeFromName("Naval Infantry Brigade")).toBe(ICON_MARINE_INFANTRY);
      expect(getIconCodeFromName("Royal Marines Commando")).toBe(ICON_MARINE_INFANTRY);
      expect(getIconCodeFromName("40 Commando RM")).toBe(ICON_MARINE_INFANTRY);
      expect(getIconCodeFromName("RM Battalion")).toBe(ICON_MARINE_INFANTRY);
    });

    it("detects sniper units", () => {
      expect(getIconCodeFromName("Sniper Platoon")).toBe(ICON_SNIPER);
      expect(getIconCodeFromName("Marksman Section")).toBe(ICON_SNIPER);
    });
  });

  describe("Armor and cavalry", () => {
    it("detects armor units", () => {
      expect(getIconCodeFromName("1st Armored Division")).toBe(ICON_ARMOR);
      expect(getIconCodeFromName("1st Armour Brigade")).toBe(ICON_ARMOR);
      expect(getIconCodeFromName("1st Tank Battalion")).toBe(ICON_ARMOR);
      expect(getIconCodeFromName("1st Panzer Division")).toBe(ICON_ARMOR);
      expect(getIconCodeFromName("1st Pz Battalion")).toBe(ICON_ARMOR);
      expect(getIconCodeFromName("Char Regiment")).toBe(ICON_ARMOR);
      expect(getIconCodeFromName("Blindé Brigade")).toBe(ICON_ARMOR);
    });

    it("detects light armor units", () => {
      expect(getIconCodeFromName("Light Armor Battalion")).toBe(ICON_LIGHT_ARMOR);
      expect(getIconCodeFromName("Light Tank Company")).toBe(ICON_LIGHT_ARMOR);
      expect(getIconCodeFromName("Lt Tk Squadron")).toBe(ICON_LIGHT_ARMOR);
    });

    it("detects cavalry units", () => {
      expect(getIconCodeFromName("1st Cavalry Regiment")).toBe(ICON_CAVALRY);
      expect(getIconCodeFromName("1st Cav Squadron")).toBe(ICON_CAVALRY);
      expect(getIconCodeFromName("Hussars Regiment")).toBe(ICON_CAVALRY);
      expect(getIconCodeFromName("Dragoons Squadron")).toBe(ICON_CAVALRY);
      expect(getIconCodeFromName("Lancers Regiment")).toBe(ICON_CAVALRY);
      expect(getIconCodeFromName("Cuirassiers Regiment")).toBe(ICON_CAVALRY);
    });

    it("detects reconnaissance units", () => {
      expect(getIconCodeFromName("1st Reconnaissance Battalion")).toBe(
        ICON_RECONNAISSANCE,
      );
      expect(getIconCodeFromName("1st Recon Troop")).toBe(ICON_RECONNAISSANCE);
      expect(getIconCodeFromName("1st Recce Squadron")).toBe(ICON_RECONNAISSANCE);
      expect(getIconCodeFromName("Aufklärung Battalion")).toBe(ICON_RECONNAISSANCE);
      expect(getIconCodeFromName("Scout Platoon")).toBe(ICON_RECONNAISSANCE);
      expect(getIconCodeFromName("Rcn Company")).toBe(ICON_RECONNAISSANCE);
    });
  });

  describe("Artillery", () => {
    it("detects artillery units", () => {
      expect(getIconCodeFromName("1st Artillery Regiment")).toBe(ICON_ARTILLERY);
      expect(getIconCodeFromName("1st Field Artillery Battalion")).toBe(ICON_ARTILLERY);
      expect(getIconCodeFromName("1st FA Bn")).toBe(ICON_ARTILLERY);
      expect(getIconCodeFromName("1st Arty Regt")).toBe(ICON_ARTILLERY);
      expect(getIconCodeFromName("Howitzer Battery")).toBe(ICON_ARTILLERY);
      expect(getIconCodeFromName("Cannon Company")).toBe(ICON_ARTILLERY);
      expect(getIconCodeFromName("1st Art Bn")).toBe(ICON_ARTILLERY);
      // shorthand 'RA' (e.g., "29 Cdo RA") should map to artillery
      expect(getIconCodeFromName("29 Cdo RA")).toBe(ICON_ARTILLERY);
      expect(getIconCodeFromName("29 Cdo R.A.")).toBe(ICON_ARTILLERY);
      expect(getIconCodeFromName("RA Battery")).toBe(ICON_ARTILLERY);
    });

    it("detects self-propelled artillery", () => {
      expect(getIconCodeFromName("Self-Propelled Artillery Battalion")).toBe(
        ICON_SELF_PROPELLED_ARTILLERY,
      );
      expect(getIconCodeFromName("SP Artillery Regiment")).toBe(
        ICON_SELF_PROPELLED_ARTILLERY,
      );
      expect(getIconCodeFromName("StuG Brigade")).toBe(ICON_SELF_PROPELLED_ARTILLERY);
      expect(getIconCodeFromName("Panzerhaubitze Battery")).toBe(
        ICON_SELF_PROPELLED_ARTILLERY,
      );
    });

    it("detects rocket artillery", () => {
      expect(getIconCodeFromName("Rocket Artillery Battalion")).toBe(
        ICON_ROCKET_ARTILLERY,
      );
      expect(getIconCodeFromName("MLRS Battery")).toBe(ICON_ROCKET_ARTILLERY);
      expect(getIconCodeFromName("HIMARS Platoon")).toBe(ICON_ROCKET_ARTILLERY);
      expect(getIconCodeFromName("Katyusha Regiment")).toBe(ICON_ROCKET_ARTILLERY);
      expect(getIconCodeFromName("Nebelwerfer Battalion")).toBe(ICON_ROCKET_ARTILLERY);
      expect(getIconCodeFromName("BM-21 Battery")).toBe(ICON_ROCKET_ARTILLERY);
    });

    it("detects mortar units", () => {
      expect(getIconCodeFromName("Heavy Mortar Company")).toBe(ICON_MORTAR);
      expect(getIconCodeFromName("Mort Platoon")).toBe(ICON_MORTAR);
      expect(getIconCodeFromName("Granatwerfer Company")).toBe(ICON_MORTAR);
    });

    it("detects missile units", () => {
      expect(getIconCodeFromName("Missile Battalion")).toBe(ICON_MISSILE);
      expect(getIconCodeFromName("ATGM Platoon")).toBe(ICON_MISSILE);
      expect(getIconCodeFromName("TOW Section")).toBe(ICON_MISSILE);
      expect(getIconCodeFromName("Javelin Team")).toBe(ICON_MISSILE);
    });
  });

  describe("Air defense", () => {
    it("detects air defense units", () => {
      expect(getIconCodeFromName("1st Air Defense Artillery")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("1st Air Defence Battalion")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("1st Anti-Aircraft Battery")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("1st AAA Battalion")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("1st Flak Regiment")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("SAM Battery")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("SHORAD Battalion")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("Patriot Battery")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("Stinger Platoon")).toBe(ICON_AIR_DEFENSE);
      expect(getIconCodeFromName("63 AD Squadron")).toBe(ICON_AIR_DEFENSE);
    });
  });

  describe("Anti-tank", () => {
    it("detects anti-tank units", () => {
      expect(getIconCodeFromName("1st Anti-Tank Battalion")).toBe(ICON_ANTITANK);
      expect(getIconCodeFromName("1st Antitank Company")).toBe(ICON_ANTITANK);
      expect(getIconCodeFromName("1st AT Platoon")).toBe(ICON_ANTITANK);
      expect(getIconCodeFromName("Panzerjäger Battalion")).toBe(ICON_ANTITANK);
      expect(getIconCodeFromName("Tank Destroyer Company")).toBe(ICON_ANTITANK);
    });
  });

  describe("Aviation", () => {
    it("detects aviation units", () => {
      expect(getIconCodeFromName("1st Aviation Battalion")).toBe(ICON_AVIATION);
      expect(getIconCodeFromName("1st Helicopter Regiment")).toBe(ICON_AVIATION);
      expect(getIconCodeFromName("Avn Brigade")).toBe(ICON_AVIATION);
      expect(getIconCodeFromName("Airmobile Battalion")).toBe(ICON_AVIATION);
      expect(getIconCodeFromName("Hubschrauber Regiment")).toBe(ICON_AVIATION);
    });

    it("detects attack helicopter units", () => {
      expect(getIconCodeFromName("Attack Helicopter Battalion")).toBe(
        ICON_ATTACK_HELICOPTER,
      );
      expect(getIconCodeFromName("Apache Squadron")).toBe(ICON_ATTACK_HELICOPTER);
      expect(getIconCodeFromName("AH-64 Company")).toBe(ICON_ATTACK_HELICOPTER);
    });

    it("detects air force units", () => {
      expect(getIconCodeFromName("Air Force Wing")).toBe(ICON_AIR_FORCE);
      expect(getIconCodeFromName("Luftwaffe Squadron")).toBe(ICON_AIR_FORCE);
      expect(getIconCodeFromName("USAF Element")).toBe(ICON_AIR_FORCE);
      expect(getIconCodeFromName("Tactical Air Support")).toBe(ICON_AIR_FORCE);
    });
  });

  describe("Combat support", () => {
    it("detects engineer units", () => {
      expect(getIconCodeFromName("1st Engineer Battalion")).toBe(ICON_ENGINEER);
      expect(getIconCodeFromName("1st Eng Company")).toBe(ICON_ENGINEER);
      expect(getIconCodeFromName("Bridging Company")).toBe(ICON_ENGINEER);
      expect(getIconCodeFromName("Construction Battalion")).toBe(ICON_ENGINEER);
      expect(getIconCodeFromName("Pionier Battalion")).toBe(ICON_ENGINEER);
    });

    it("detects combat engineer units", () => {
      expect(getIconCodeFromName("Combat Engineer Company")).toBe(ICON_COMBAT_ENGINEER);
      expect(getIconCodeFromName("Assault Engineer Platoon")).toBe(ICON_COMBAT_ENGINEER);
      expect(getIconCodeFromName("Sapper Platoon")).toBe(ICON_COMBAT_ENGINEER);
      expect(getIconCodeFromName("Breacher Team")).toBe(ICON_COMBAT_ENGINEER);
    });

    it("detects signal units", () => {
      expect(getIconCodeFromName("1st Signal Battalion")).toBe(ICON_SIGNAL);
      expect(getIconCodeFromName("1st Communications Company")).toBe(ICON_SIGNAL);
      expect(getIconCodeFromName("Sig Company")).toBe(ICON_SIGNAL);
      expect(getIconCodeFromName("Radio Platoon")).toBe(ICON_SIGNAL);
      expect(getIconCodeFromName("Comms Detachment")).toBe(ICON_SIGNAL);
      expect(getIconCodeFromName("Fernmelde Battalion")).toBe(ICON_SIGNAL);
    });

    it("detects military police units", () => {
      expect(getIconCodeFromName("1st Military Police Company")).toBe(
        ICON_MILITARY_POLICE,
      );
      expect(getIconCodeFromName("1st MP Battalion")).toBe(ICON_MILITARY_POLICE);
      expect(getIconCodeFromName("Feldjäger Company")).toBe(ICON_MILITARY_POLICE);
      expect(getIconCodeFromName("Provost Company")).toBe(ICON_MILITARY_POLICE);
    });

    it("detects security units", () => {
      expect(getIconCodeFromName("Security Battalion")).toBe(ICON_SECURITY);
      expect(getIconCodeFromName("Guard Company")).toBe(ICON_INFANTRY);
      expect(getIconCodeFromName("Force Protection Platoon")).toBe(ICON_SECURITY);
    });
  });

  describe("NBC/Chemical", () => {
    it("detects chemical units", () => {
      expect(getIconCodeFromName("Chemical Battalion")).toBe(ICON_CHEMICAL);
      expect(getIconCodeFromName("CBRN Company")).toBe(ICON_CHEMICAL);
      expect(getIconCodeFromName("NBC Platoon")).toBe(ICON_CHEMICAL);
      expect(getIconCodeFromName("Decon Company")).toBe(ICON_CHEMICAL);
      expect(getIconCodeFromName("Smoke Platoon")).toBe(ICON_CHEMICAL);
    });
  });

  describe("Intelligence and Electronic Warfare", () => {
    it("detects electronic warfare units", () => {
      expect(getIconCodeFromName("Electronic Warfare Battalion")).toBe(
        ICON_ELECTRONIC_WARFARE,
      );
      expect(getIconCodeFromName("EW Company")).toBe(ICON_ELECTRONIC_WARFARE);
      expect(getIconCodeFromName("SIGINT Platoon")).toBe(ICON_ELECTRONIC_WARFARE);
      expect(getIconCodeFromName("Cyber Company")).toBe(ICON_ELECTRONIC_WARFARE);
    });

    it("detects intelligence units", () => {
      expect(getIconCodeFromName("Military Intelligence Battalion")).toBe(
        ICON_MILITARY_INTELLIGENCE,
      );
      expect(getIconCodeFromName("MI Company")).toBe(ICON_MILITARY_INTELLIGENCE);
      expect(getIconCodeFromName("G2 Section")).toBe(ICON_MILITARY_INTELLIGENCE);
      expect(getIconCodeFromName("Intel Platoon")).toBe(ICON_MILITARY_INTELLIGENCE);
    });

    it("detects civil affairs units", () => {
      expect(getIconCodeFromName("Civil Affairs Battalion")).toBe(ICON_CIVIL_AFFAIRS);
      expect(getIconCodeFromName("CA Company")).toBe(ICON_CIVIL_AFFAIRS);
      expect(getIconCodeFromName("CIMIC Team")).toBe(ICON_CIVIL_AFFAIRS);
    });

    it("detects psychological operations units", () => {
      expect(getIconCodeFromName("Psychological Operations Battalion")).toBe(
        ICON_PSYCHOLOGICAL_OPS,
      );
      expect(getIconCodeFromName("PSYOP Company")).toBe(ICON_PSYCHOLOGICAL_OPS);
      expect(getIconCodeFromName("MISO Detachment")).toBe(ICON_PSYCHOLOGICAL_OPS);
      expect(getIconCodeFromName("Info Ops Team")).toBe(ICON_PSYCHOLOGICAL_OPS);
    });
  });

  describe("Sustainment", () => {
    it("detects supply units", () => {
      expect(getIconCodeFromName("1st Supply Battalion")).toBe(ICON_SUPPLY);
      expect(getIconCodeFromName("1st Logistics Brigade")).toBe(ICON_SUPPLY);
      expect(getIconCodeFromName("Log Company")).toBe(ICON_SUPPLY);
      expect(getIconCodeFromName("Sustainment Battalion")).toBe(ICON_SUPPLY);
      expect(getIconCodeFromName("CSS Company")).toBe(ICON_SUPPLY);
    });

    it("detects maintenance units", () => {
      expect(getIconCodeFromName("1st Maintenance Battalion")).toBe(ICON_MAINTENANCE);
      expect(getIconCodeFromName("Maint Company")).toBe(ICON_MAINTENANCE);
      expect(getIconCodeFromName("Ordnance Battalion")).toBe(ICON_MAINTENANCE);
      expect(getIconCodeFromName("Recovery Platoon")).toBe(ICON_MAINTENANCE);
      expect(getIconCodeFromName("Wrecker Section")).toBe(ICON_MAINTENANCE);
    });

    it("detects medical units", () => {
      expect(getIconCodeFromName("1st Medical Battalion")).toBe(ICON_MEDICAL);
      expect(getIconCodeFromName("1st Hospital")).toBe(ICON_MEDICAL);
      expect(getIconCodeFromName("Med Company")).toBe(ICON_MEDICAL);
      expect(getIconCodeFromName("MEDEVAC Platoon")).toBe(ICON_MEDICAL);
      expect(getIconCodeFromName("CASEVAC Team")).toBe(ICON_MEDICAL);
      expect(getIconCodeFromName("FST Alpha")).toBe(ICON_MEDICAL);
      expect(getIconCodeFromName("Aid Station")).toBe(ICON_MEDICAL);
    });

    it("detects transportation units", () => {
      expect(getIconCodeFromName("1st Transportation Battalion")).toBe(
        ICON_TRANSPORTATION,
      );
      expect(getIconCodeFromName("1st Truck Company")).toBe(ICON_TRANSPORTATION);
      expect(getIconCodeFromName("Trans Company")).toBe(ICON_TRANSPORTATION);
      expect(getIconCodeFromName("MVT Platoon")).toBe(ICON_TRANSPORTATION);
      expect(getIconCodeFromName("Movement Control Team")).toBe(ICON_TRANSPORTATION);
    });
  });

  describe("Special operations", () => {
    it("detects special forces units", () => {
      expect(getIconCodeFromName("1st Special Forces Group")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("1st Rangers Battalion")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("1st Commando Company")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("SF Team")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("SAS Squadron")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("SEAL Team")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("Delta Force")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("KSK Company")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("Green Berets Detachment")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("LRRP Platoon")).toBe(ICON_SPECIAL_FORCES);
      expect(getIconCodeFromName("Pathfinder Company")).toBe(ICON_SPECIAL_FORCES);
    });
  });

  describe("Amphibious and Naval", () => {
    it("detects amphibious units", () => {
      expect(getIconCodeFromName("Amphibious Battalion")).toBe(ICON_AMPHIBIOUS);
      expect(getIconCodeFromName("Landing Force")).toBe(ICON_AMPHIBIOUS);
    });

    it("detects naval units", () => {
      expect(getIconCodeFromName("Naval Support Group")).toBe(ICON_NAVAL);
      expect(getIconCodeFromName("Navy Detachment")).toBe(ICON_NAVAL);
    });
  });

  describe("Sea surface vessels", () => {
    it("detects carrier", () => {
      expect(getIconCodeFromName("Aircraft Carrier")).toBe(ICON_CARRIER);
      expect(getIconCodeFromName("CV-6")).toBe(ICON_CARRIER);
      expect(getIconCodeFromName("CVX")).toBe(ICON_CARRIER);
      expect(getIconCodeFromName("CVN-78")).toBe("1201000001");
    });

    it("detects battleship", () => {
      expect(getIconCodeFromName("Battleship")).toBe(ICON_BATTLESHIP);
      expect(getIconCodeFromName("BB Missouri")).toBe(ICON_BATTLESHIP);
    });

    it("detects cruiser", () => {
      expect(getIconCodeFromName("Cruiser Division")).toBe(ICON_CRUISER);
      expect(getIconCodeFromName("CG Ticonderoga")).toBe(ICON_CRUISER);
    });

    it("detects destroyer", () => {
      expect(getIconCodeFromName("Destroyer Squadron")).toBe(ICON_DESTROYER);
      expect(getIconCodeFromName("DDG Arleigh Burke")).toBe(ICON_DESTROYER);
    });

    it("detects frigate", () => {
      expect(getIconCodeFromName("Frigate")).toBe(ICON_FRIGATE);
      expect(getIconCodeFromName("FFG Perry")).toBe(ICON_FRIGATE);
      expect(getIconCodeFromName("KMN Nansen ff")).toBe(ICON_FRIGATE);
    });

    it("detects corvette", () => {
      expect(getIconCodeFromName("Corvette")).toBe(ICON_CORVETTE);
    });

    it("detects littoral combat ship", () => {
      expect(getIconCodeFromName("Littoral Combat Ship")).toBe(ICON_LITTORAL_COMBAT_SHIP);
      expect(getIconCodeFromName("LCS Freedom")).toBe(ICON_LITTORAL_COMBAT_SHIP);
    });

    it("detects amphibious warfare ship", () => {
      expect(getIconCodeFromName("Amphibious Assault Ship")).toBe(
        ICON_AMPHIBIOUS_WARFARE_SHIP,
      );
      expect(getIconCodeFromName("Landing Ship")).toBe(ICON_AMPHIBIOUS_WARFARE_SHIP);
    });

    it("detects mine warfare ship", () => {
      expect(getIconCodeFromName("Minesweeper")).toBe(ICON_MINE_WARFARE_SHIP);
      expect(getIconCodeFromName("MCM Avenger")).toBe(ICON_MINE_WARFARE_SHIP);
    });

    it("detects navy task organization", () => {
      expect(getIconCodeFromName("Navy Task Element")).toBe(ICON_NAVY_TASK_ELEMENT);
      expect(getIconCodeFromName("TE 1")).toBe(ICON_NAVY_TASK_ELEMENT);
      expect(getIconCodeFromName("Navy Task Force")).toBe(ICON_NAVY_TASK_FORCE);
      expect(getIconCodeFromName("TF 38")).toBe(ICON_NAVY_TASK_FORCE);
      expect(getIconCodeFromName("Navy Task Group")).toBe(ICON_NAVY_TASK_GROUP);
      expect(getIconCodeFromName("Task Group 20")).toBe(ICON_NAVY_TASK_GROUP);
      expect(getIconCodeFromName("TG 58.1")).toBe(ICON_NAVY_TASK_GROUP);
      expect(getIconCodeFromName("Navy Task Unit")).toBe(ICON_NAVY_TASK_UNIT);
      expect(getIconCodeFromName("TU 77.4.3")).toBe(ICON_NAVY_TASK_UNIT);
      expect(getIconCodeFromName("Convoy PQ-17")).toBe(ICON_CONVOY);
    });

    it("detects patrol boat", () => {
      expect(getIconCodeFromName("Patrol Boat")).toBe(ICON_PATROL_BOAT);
      expect(getIconCodeFromName("Torpedo Boat")).toBe(ICON_PATROL_BOAT);
    });

    it("detects submarine", () => {
      expect(getIconCodeFromName("Submarine")).toBe(ICON_SUBMARINE);
      expect(getIconCodeFromName("U-Boat")).toBe(ICON_SUBMARINE);
      expect(getIconCodeFromName("SSN Virginia")).toBe(ICON_SUBMARINE);
    });

    it("detects auxiliary ship", () => {
      expect(getIconCodeFromName("Auxiliary Ship")).toBe(ICON_AUXILIARY_SHIP);
      expect(getIconCodeFromName("Fleet Auxiliary")).toBe(ICON_AUXILIARY_SHIP);
      expect(getIconCodeFromName("Icebreaker")).toBe(ICON_AUXILIARY_SHIP);
      expect(getIconCodeFromName("ARA Isla de los Estados - supply ship")).toBe(
        ICON_AUXILIARY_SHIP,
      );
    });

    it("detects hospital ship", () => {
      expect(getIconCodeFromName("Hospital Ship")).toBe(ICON_HOSPITAL_SHIP);
    });

    it("detects cargo ship", () => {
      expect(getIconCodeFromName("Cargo Ship")).toBe(ICON_CARGO_SHIP);
      expect(getIconCodeFromName("Liberty Ship")).toBe(ICON_CARGO_SHIP);
    });

    it("detects tanker", () => {
      expect(getIconCodeFromName("Tanker")).toBe(ICON_TANKER_SHIP);
      expect(getIconCodeFromName("Oil Tanker")).toBe(ICON_TANKER_SHIP);
    });
  });

  describe("Headquarters", () => {
    it("detects headquarters units", () => {
      expect(getIconCodeFromName("Division Headquarters")).toBe(ICON_HEADQUARTERS);
      expect(getIconCodeFromName("Brigade HQ")).toBe(ICON_HEADQUARTERS);
      expect(getIconCodeFromName("Command Post")).toBe(ICON_HEADQUARTERS);
      expect(getIconCodeFromName("CP Alpha")).toBe(ICON_HEADQUARTERS);
      expect(getIconCodeFromName("Tactical Operations Center")).toBe(ICON_HEADQUARTERS);
      expect(getIconCodeFromName("TOC")).toBe(ICON_HEADQUARTERS);
      expect(getIconCodeFromName("Hauptquartier")).toBe(ICON_HEADQUARTERS);
      expect(getIconCodeFromName("Stab Company")).toBe(ICON_HEADQUARTERS);
    });
  });

  describe("Edge cases", () => {
    it("returns unspecified for unrecognized names", () => {
      expect(getIconCodeFromName("Alpha")).toBe(ICON_UNSPECIFIED);
      expect(getIconCodeFromName("Support Element")).toBe(ICON_UNSPECIFIED);
    });

    it("is case insensitive", () => {
      expect(getIconCodeFromName("1ST INFANTRY DIVISION")).toBe(ICON_INFANTRY);
      expect(getIconCodeFromName("1st infantry division")).toBe(ICON_INFANTRY);
    });
  });
});

describe("buildSidc with icon detection", () => {
  it("sets infantry icon for infantry units", () => {
    const sidc = buildSidc(0, "1st Infantry Division");
    // Entity code is at positions 10-15 (6 chars)
    const entityCode = sidc.substring(10, 20);
    expect(entityCode).toBe(ICON_INFANTRY);
  });

  it("sets armor icon for tank units", () => {
    const sidc = buildSidc(0, "1st Tank Battalion");
    const entityCode = sidc.substring(10, 20);
    expect(entityCode).toBe(ICON_ARMOR);
  });

  it("sets artillery icon for artillery units", () => {
    const sidc = buildSidc(0, "1st Artillery Regiment");
    const entityCode = sidc.substring(10, 20);
    expect(entityCode).toBe(ICON_ARTILLERY);
  });

  it("inherits parent icon when unit type cannot be determined", () => {
    // "Alpha" has no recognizable unit type, should inherit from parent
    const sidc = buildSidc(1, "Alpha", "16", ICON_INFANTRY);
    const entityCode = sidc.substring(10, 20);
    expect(entityCode).toBe(ICON_INFANTRY);
  });

  it("uses detected icon over parent icon when unit type is recognized", () => {
    // "Artillery Battery" should use artillery icon, not parent's infantry icon
    const sidc = buildSidc(1, "Artillery Battery", "15", ICON_INFANTRY);
    const entityCode = sidc.substring(10, 20);
    expect(entityCode).toBe(ICON_ARTILLERY);
  });

  it("returns unspecified when no icon detected and no parent icon", () => {
    const sidc = buildSidc(0, "Alpha");
    const entityCode = sidc.substring(10, 20);
    expect(entityCode).toBe(ICON_UNSPECIFIED);
  });
});

describe("buildSidc with naval units", () => {
  it("uses sea surface symbol set (30) for surface vessels", () => {
    const sidc = buildSidc(0, "Destroyer");
    expect(sidc.substring(4, 6)).toBe("30");
  });

  it("uses sea subsurface symbol set (35) for submarines", () => {
    const sidc = buildSidc(0, "Submarine");
    expect(sidc.substring(4, 6)).toBe("35");
  });

  it("sets echelon to 00 for naval units", () => {
    const sidc = buildSidc(0, "Carrier");
    expect(getEchelonFromSidc(sidc)).toBe("00");
  });

  it("sets echelon to 00 even when name contains echelon keyword", () => {
    const sidc = buildSidc(0, "Destroyer Squadron");
    expect(sidc.substring(4, 6)).toBe("30");
    expect(getEchelonFromSidc(sidc)).toBe("00");
  });

  it("sets echelon to 00 even with parent echelon", () => {
    const sidc = buildSidc(1, "Frigate", "21");
    expect(sidc.substring(4, 6)).toBe("30");
    expect(getEchelonFromSidc(sidc)).toBe("00");
  });

  it("still uses land symbol set for non-naval units", () => {
    const sidc = buildSidc(0, "1st Infantry Division");
    expect(sidc.substring(4, 6)).toBe("10");
  });
});

describe("parseTextToUnits with icon inheritance", () => {
  it("child units inherit parent icon when type not detected", () => {
    const text = `1st Infantry Division
  Alpha
  Bravo`;
    const units = parseTextToUnits(text);

    expect(units[0].name).toBe("1st Infantry Division");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_INFANTRY);

    // Alpha and Bravo should inherit Infantry icon from parent
    expect(units[0].children[0].name).toBe("Alpha");
    expect(units[0].children[0].sidc.substring(10, 20)).toBe(ICON_INFANTRY);

    expect(units[0].children[1].name).toBe("Bravo");
    expect(units[0].children[1].sidc.substring(10, 20)).toBe(ICON_INFANTRY);
  });

  it("grandchild units inherit icon through hierarchy", () => {
    const text = `1st Tank Division
  1st Brigade
    Alpha
    Bravo`;
    const units = parseTextToUnits(text);

    // Tank Division -> armor icon
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_ARMOR);

    // 1st Brigade inherits armor from Tank Division
    expect(units[0].children[0].sidc.substring(10, 20)).toBe(ICON_ARMOR);

    // Alpha and Bravo inherit armor through the chain
    expect(units[0].children[0].children[0].sidc.substring(10, 20)).toBe(ICON_ARMOR);
    expect(units[0].children[0].children[1].sidc.substring(10, 20)).toBe(ICON_ARMOR);
  });

  it("child with specific type overrides parent icon", () => {
    const text = `1st Infantry Division
  Artillery Battery
  Alpha`;
    const units = parseTextToUnits(text);

    // Parent is infantry
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_INFANTRY);

    // Artillery Battery should have artillery icon, not inherited infantry
    expect(units[0].children[0].sidc.substring(10, 20)).toBe(ICON_ARTILLERY);

    // Alpha should still inherit infantry from parent
    expect(units[0].children[1].sidc.substring(10, 20)).toBe(ICON_INFANTRY);
  });
});

describe("comma separator mode", () => {
  const opts = { useCommaSeparator: true };

  it("single value sets name only", () => {
    const units = parseTextToUnits("Alpha Company", opts);
    expect(units[0].name).toBe("Alpha Company");
    expect(units[0].shortName).toBeUndefined();
    expect(units[0].description).toBeUndefined();
  });

  it("two values set shortName and name", () => {
    const units = parseTextToUnits("A, Alpha Company", opts);
    expect(units[0].shortName).toBe("A");
    expect(units[0].name).toBe("Alpha Company");
    expect(units[0].description).toBeUndefined();
  });

  it("three values set shortName, name, and description", () => {
    const units = parseTextToUnits("A, Alpha Company, Main assault element", opts);
    expect(units[0].shortName).toBe("A");
    expect(units[0].name).toBe("Alpha Company");
    expect(units[0].description).toBe("Main assault element");
  });

  it("extra commas are included in description", () => {
    const units = parseTextToUnits("A, Alpha, First, second, third", opts);
    expect(units[0].shortName).toBe("A");
    expect(units[0].name).toBe("Alpha");
    expect(units[0].description).toBe("First, second, third");
  });

  it("commas are literal when option is off", () => {
    const units = parseTextToUnits("A, Alpha Company");
    expect(units[0].name).toBe("A, Alpha Company");
    expect(units[0].shortName).toBeUndefined();
  });

  it("works with metadata pipe syntax", () => {
    const units = parseTextToUnits("A, Alpha Company | infantry bn", opts);
    expect(units[0].shortName).toBe("A");
    expect(units[0].name).toBe("Alpha Company");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_INFANTRY);
  });

  it("works with metadata bracket syntax", () => {
    const units = parseTextToUnits("A, Alpha Company [armor]", opts);
    expect(units[0].shortName).toBe("A");
    expect(units[0].name).toBe("Alpha Company");
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_ARMOR);
  });

  it("SIDC matching uses full display name across all comma fields", () => {
    const units = parseTextToUnits("1st, Infantry Division", opts);
    expect(units[0].sidc.substring(10, 20)).toBe(ICON_INFANTRY);
  });

  it("empty shortName from leading comma is omitted", () => {
    const units = parseTextToUnits(", Alpha Company", opts);
    expect(units[0].shortName).toBeUndefined();
    expect(units[0].name).toBe("Alpha Company");
  });

  describe("name,shortName,description order", () => {
    const nsdOpts = {
      useCommaSeparator: true,
      commaFieldOrder: "name,shortName,description" as const,
    };

    it("two values set name and shortName", () => {
      const units = parseTextToUnits("Alpha Company, A", nsdOpts);
      expect(units[0].name).toBe("Alpha Company");
      expect(units[0].shortName).toBe("A");
      expect(units[0].description).toBeUndefined();
    });

    it("three values set name, shortName, and description", () => {
      const units = parseTextToUnits("Alpha Company, A, Main assault element", nsdOpts);
      expect(units[0].name).toBe("Alpha Company");
      expect(units[0].shortName).toBe("A");
      expect(units[0].description).toBe("Main assault element");
    });

    it("extra commas are included in description", () => {
      const units = parseTextToUnits("Alpha, A, First, second", nsdOpts);
      expect(units[0].name).toBe("Alpha");
      expect(units[0].shortName).toBe("A");
      expect(units[0].description).toBe("First, second");
    });
  });
});

describe("generateMissingShortNames", () => {
  it("fills only missing short names and preserves existing values", () => {
    const result = generateMissingShortNames([
      {
        id: "1",
        name: "1st Battalion Alpha",
        sidc: "10031000161211000000",
        subUnits: [],
      },
      {
        id: "2",
        name: "1st Battalion Bravo",
        shortName: "EXISTING",
        sidc: "10031000161211000000",
        subUnits: [],
      },
    ]);

    expect(result.generatedCount).toBe(1);
    expect(result.units[0].shortName).toBeTruthy();
    expect(result.units[1].shortName).toBe("EXISTING");
  });

  it("uses sibling context per level and reserves existing sibling short names", () => {
    const result = generateMissingShortNames([
      {
        id: "root",
        name: "5 Inf Bde",
        sidc: "10031000181211000000",
        subUnits: [
          {
            id: "a",
            name: "2nd Bn Scots Guards",
            sidc: "10031000161211000000",
            subUnits: [
              {
                id: "a1",
                name: "Left Flank",
                sidc: "10031000111211000000",
                subUnits: [],
              },
              {
                id: "a2",
                name: "Right Flank",
                sidc: "10031000111211000000",
                subUnits: [],
              },
            ],
          },
          {
            id: "b",
            name: "1st Bn Welsh Guards",
            shortName: "1 BN WEL",
            sidc: "10031000161211000000",
            subUnits: [],
          },
        ],
      },
    ]);

    expect(result.units[0].shortName).toBe("5 INF BDE");
    expect(result.units[0].subUnits?.[0].shortName).toBe("2 BN SCOT");
    expect(result.units[0].subUnits?.[1].shortName).toBe("1 BN WEL");
    expect(result.units[0].subUnits?.[0].subUnits?.[0].shortName).toBe("L FLK");
    expect(result.units[0].subUnits?.[0].subUnits?.[1].shortName).toBe("R FLK");
  });

  it("serializes generated short names back to comma-separated text", () => {
    const result = generateMissingShortNames([
      {
        id: "1",
        name: "63 AD Squadron",
        sidc: "10031000161211000000",
        subUnits: [],
      },
    ]);

    expect(serializeUnitsToIndentedText(result.units)).toBe("63 AD Squadron, 63 AD SQN");
  });

  it("honors explicit short-name generation settings", () => {
    const result = generateMissingShortNamesWithOptions(
      [
        {
          id: "1",
          name: "63 AD Squadron",
          sidc: "10031000161211000000",
          subUnits: [],
        },
      ],
      {
        maxLength: 4,
        uppercase: false,
        allowWhitespace: false,
        forceLength: true,
      },
    );

    expect(result.units[0].shortName).toBe("63AD");
  });

  it("does not assign a short name when it would be identical to the unit name", () => {
    const result = generateMissingShortNames([
      {
        id: "1",
        name: "TGG",
        sidc: "10031000161211000000",
        subUnits: [],
      },
    ]);

    expect(result.generatedCount).toBe(0);
    expect(result.units[0].shortName).toBeUndefined();
  });

  it("applies generated short names without destroying comments or metadata markup", () => {
    const source = [
      "# heading",
      "5 Inf Bde // mech",
      "  2nd Bn Scots Guards [infantry] # comment",
      "  1st Bn Welsh Guards, 1 BN WEL |guards|",
    ].join("\n");
    const originalUnits = parseTextToUnits(source, {
      useCommaSeparator: true,
      commaFieldOrder: "name,shortName,description",
    });
    const generated = generateMissingShortNames(
      serializeParsedUnitsToScenarioUnits(originalUnits),
    );

    const result = applyGeneratedShortNamesToText(source, originalUnits, generated.units);

    expect(result.updatedCount).toBe(2);
    expect(result.text).toContain("5 Inf Bde, 5 INF BDE // mech");
    expect(result.text).toContain("2nd Bn Scots Guards, 2 BN SCOT [infantry] # comment");
    expect(result.text).toContain("1st Bn Welsh Guards, 1 BN WEL |guards|");
    expect(result.text).toContain("# heading");
  });

  it("fills an empty short-name slot when description is already present", () => {
    const source = "3rd RA,,description";
    const originalUnits = parseTextToUnits(source, {
      useCommaSeparator: true,
      commaFieldOrder: "name,shortName,description",
    });
    const generated = generateMissingShortNames(
      serializeParsedUnitsToScenarioUnits(originalUnits),
    );

    const result = applyGeneratedShortNamesToText(source, originalUnits, generated.units);

    expect(result.updatedCount).toBe(1);
    expect(result.text).toBe("3rd RA, 3 RA, description");
  });

  it("clears short names while preserving descriptions", () => {
    const source = "3rd RA, 3 RA, description";
    const originalUnits = parseTextToUnits(source, {
      useCommaSeparator: true,
      commaFieldOrder: "name,shortName,description",
    });
    const clearedUnits = clearAllShortNames(
      serializeParsedUnitsToScenarioUnits(originalUnits),
    );

    const result = applyGeneratedShortNamesToText(source, originalUnits, clearedUnits);

    expect(result.updatedCount).toBe(1);
    expect(result.text).toBe("3rd RA, , description");
  });
});
