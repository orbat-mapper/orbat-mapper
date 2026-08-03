import { describe, expect, it, vi } from "vitest";
import {
  getUnitSnapCandidates,
  type UnitSnapMap,
} from "@/modules/scenarioeditor/unitSnapCandidates";

type RenderedFeature = ReturnType<UnitSnapMap["queryRenderedFeatures"]>[number];

function createMap(features: RenderedFeature[] | (() => never)): UnitSnapMap {
  return {
    queryRenderedFeatures: vi.fn(() =>
      typeof features === "function" ? features() : features,
    ),
  };
}

function unitFeature(id: string, coordinates: [number, number], layerId = "unitLayer") {
  return {
    layer: { id: layerId },
    geometry: { type: "Point" as const, coordinates },
    properties: { id },
  };
}

const request = { pixel: [100, 100] as [number, number] };

describe("getUnitSnapCandidates", () => {
  it("returns a candidate per rendered unit", () => {
    const mlMap = createMap([
      unitFeature("unit-1", [10, 20]),
      unitFeature("unit-2", [11, 21], "unitLayer-group-2"),
    ]);

    expect(getUnitSnapCandidates(mlMap, request)).toEqual([
      { id: "unit:unit-1", coordinate: [10, 20], kind: "unit", priority: 1 },
      { id: "unit:unit-2", coordinate: [11, 21], kind: "unit", priority: 1 },
    ]);
  });

  it("queries a box around the pointer", () => {
    const mlMap = createMap([]);

    getUnitSnapCandidates(mlMap, request);

    expect(mlMap.queryRenderedFeatures).toHaveBeenCalledWith([
      [76, 76],
      [124, 124],
    ]);
  });

  it("ignores features from non-unit layers", () => {
    const mlMap = createMap([unitFeature("feature-1", [10, 20], "scenario-feature-1")]);

    expect(getUnitSnapCandidates(mlMap, request)).toEqual([]);
  });

  it("ignores unit features without a point geometry or an id", () => {
    const mlMap = createMap([
      {
        layer: { id: "unitLayer" },
        geometry: { type: "LineString", coordinates: [[0, 0]] },
        properties: { id: "unit-1" },
      },
      { layer: { id: "unitLayer" }, geometry: { type: "Point", coordinates: [1, 1] } },
    ]);

    expect(getUnitSnapCandidates(mlMap, request)).toEqual([]);
  });

  it("deduplicates a unit rendered into more than one layer", () => {
    const mlMap = createMap([
      unitFeature("unit-1", [10, 20]),
      unitFeature("unit-1", [10, 20], "unitLayer-group-2"),
    ]);

    expect(getUnitSnapCandidates(mlMap, request)).toHaveLength(1);
  });

  it("returns no candidates when the style is not queryable yet", () => {
    const mlMap = createMap(() => {
      throw new Error("style is not done loading");
    });

    expect(getUnitSnapCandidates(mlMap, request)).toEqual([]);
  });
});
