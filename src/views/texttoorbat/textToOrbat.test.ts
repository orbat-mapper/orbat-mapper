import { describe, it, expect } from "vitest";
import {
  parseTextToUnits,
  buildSidc,
  getEchelonCodeFromName,
  getEchelonCode,
  getNextLowerEchelon,
  getEchelonFromSidc,
} from "./textToOrbat.ts";

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

  it("detects Regiment", () => {
    expect(getEchelonCodeFromName("Artillery Regiment")).toBe("17");
    expect(getEchelonCodeFromName("1st Regt")).toBe("17");
  });

  it("detects Battalion", () => {
    expect(getEchelonCodeFromName("1st Battalion")).toBe("16");
    expect(getEchelonCodeFromName("1st Bn")).toBe("16");
    expect(getEchelonCodeFromName("2nd Btn")).toBe("16");
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
    expect(getEchelonCodeFromName("Support Element")).toBe("00");
    expect(getEchelonCodeFromName("Alpha")).toBe("00");
  });

  it("is case insensitive", () => {
    expect(getEchelonCodeFromName("1ST INFANTRY DIVISION")).toBe("21");
    expect(getEchelonCodeFromName("1st infantry division")).toBe("21");
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
  it("returns Army Group for level 0", () => {
    expect(getEchelonCode(0)).toBe("24");
  });

  it("returns Division for level 3", () => {
    expect(getEchelonCode(3)).toBe("21");
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
    expect(getEchelonFromSidc(sidc)).toBe("21"); // level 3 = Division
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
});

describe("getEchelonFromSidc", () => {
  it("extracts echelon code from positions 8-9", () => {
    const sidc = "10031000210000000000";
    expect(getEchelonFromSidc(sidc)).toBe("21");
  });
});
