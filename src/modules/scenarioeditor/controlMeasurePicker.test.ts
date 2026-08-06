import { describe, expect, it } from "vitest";
import { CONTROL_MEASURE_IDS } from "@orbat-mapper/control-measures";
import {
  getControlMeasureKindOption,
  groupControlMeasureKinds,
  listControlMeasureKindOptions,
  searchControlMeasureKinds,
} from "@/modules/scenarioeditor/controlMeasurePicker";

describe("the picker's registry view", () => {
  it("lists every kind the library knows, in registry order", () => {
    expect(listControlMeasureKindOptions().map((o) => o.id)).toEqual([
      ...CONTROL_MEASURE_IDS,
    ]);
  });

  it("carries the doctrinal name and qualifier", () => {
    const option = getControlMeasureKindOption("strong-point");
    expect(option?.name).toBe("Strong Point");
    expect(option?.entity).toBe("Maneuver Areas");
    expect(option?.qualifier).toBe("Battle Position — Strong Point");
  });
});

describe("searching", () => {
  it("returns everything for an empty query", () => {
    expect(searchControlMeasureKinds("   ")).toHaveLength(CONTROL_MEASURE_IDS.length);
  });

  it("requires every term to match, in any order", () => {
    const hits = searchControlMeasureKinds("arrow block").map((o) => o.id);
    expect(hits).toContain("block-arrow");
    expect(hits).not.toContain("phase-line");
  });

  it("matches the kind id as well as the name", () => {
    expect(searchControlMeasureKinds("phase-line").map((o) => o.id)).toContain(
      "phase-line",
    );
  });

  it("returns nothing for a query that matches no kind", () => {
    expect(searchControlMeasureKinds("nosuchmeasure")).toHaveLength(0);
  });
});

describe("grouping", () => {
  it("groups by entity and keeps registry order", () => {
    const groups = groupControlMeasureKinds(
      searchControlMeasureKinds("direction of attack"),
    );
    expect([...groups.keys()]).toEqual(["Maneuver Lines"]);
    expect(groups.get("Maneuver Lines")?.map((o) => o.id)).toEqual([
      "direction-of-attack-aviation",
      "direction-of-main-attack",
      "direction-of-supporting-attack",
    ]);
  });
});
