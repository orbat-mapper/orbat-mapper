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

const ICON_ARMOR = iconCode("Armor");
const ICON_ARTILLERY = iconCode("Artillery");
const ICON_INFANTRY = iconCode("Infantry");
const ICON_MECHANIZED_INFANTRY = iconCode("Mechanized Infantry");

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
