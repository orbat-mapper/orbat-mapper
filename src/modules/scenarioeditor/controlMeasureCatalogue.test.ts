import { describe, expect, it } from "vitest";
import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import {
  filterControlMeasureCatalogue,
  pointSymbolEntries,
  readControlMeasureCellSize,
} from "@/modules/scenarioeditor/controlMeasureCatalogue";
import { ms2525e } from "@/symbology/standards/milstd2525e";

const symbols = pointSymbolEntries(ms2525e["25"]!.mainIcon);
const keys = (groups: ReturnType<typeof filterControlMeasureCatalogue>) =>
  groups.flatMap((group) => group.items.map((item) => item.key));

describe("filterControlMeasureCatalogue", () => {
  it("lists every library kind once when unfiltered", () => {
    expect(new Set(keys(filterControlMeasureCatalogue("", "all"))).size).toBe(
      Object.keys(CONTROL_MEASURE_METADATA).length,
    );
  });

  it("narrows to one geometry", () => {
    const items = filterControlMeasureCatalogue("", "area", symbols).flatMap(
      (group) => group.items,
    );
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.geometry === "area")).toBe(true);
  });

  it.each([
    ["tasks", "Mission Tasks"],
    ["generic", "Generic Graphics"],
  ] as const)("narrows %s to the %s entity", (filter, entity) => {
    const groups = filterControlMeasureCatalogue("", filter, symbols);
    expect(groups.map((group) => group.entity)).toEqual([entity]);
    expect(groups[0]!.items.length).toBeGreaterThan(0);
  });

  it("combines search with the geometry filter", () => {
    expect(keys(filterControlMeasureCatalogue("phase line", "line"))).toContain(
      "phase-line",
    );
    expect(filterControlMeasureCatalogue("phase line", "area")).toEqual([]);
  });

  it("offers milsymbol point symbols under Points", () => {
    const points = filterControlMeasureCatalogue("checkpoint", "point", symbols);
    expect(keys(points)).toContain("symbol:130300");
  });
});

describe("pointSymbolEntries", () => {
  it("takes only point icons", () => {
    expect(symbols.length).toBeGreaterThan(200);
    expect(symbols.every((entry) => entry.geometry === "point")).toBe(true);
  });

  it("leaves out the icons the control-measures library draws itself", () => {
    const libraryCodes = new Set(
      Object.values(CONTROL_MEASURE_METADATA).map((metadata) => metadata.value),
    );
    expect(symbols.some((entry) => libraryCodes.has(entry.code))).toBe(false);
  });

  it("builds a Friend symbol set 25 SIDC around the icon code", () => {
    const checkpoint = symbols.find((entry) => entry.code === "130300")!;
    expect(checkpoint.sidc.slice(3, 6)).toBe("325");
    expect(checkpoint.sidc.slice(10, 16)).toBe("130300");
  });
});

describe("readControlMeasureCellSize", () => {
  it("falls back to medium for unknown values", () => {
    expect(readControlMeasureCellSize("large")).toBe("large");
    expect(readControlMeasureCellSize("huge")).toBe("medium");
    expect(readControlMeasureCellSize(null)).toBe("medium");
  });
});
