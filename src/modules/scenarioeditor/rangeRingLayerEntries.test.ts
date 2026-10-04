import { describe, expect, it } from "vitest";
import type { ScenarioState } from "@/scenariostore/newScenarioStore";
import type { NUnit } from "@/types/internalModels";
import type { RangeRing } from "@/types/scenarioGeoModels";
import { getRangeRingLayerEntries } from "./rangeRingLayerEntries";

const ring = (name: string, group?: string): RangeRing => ({
  name,
  range: 10,
  uom: "km",
  group,
});

const unit = (id: string, name: string, rangeRings: RangeRing[]) =>
  ({ id, name, rangeRings }) as NUnit;

describe("getRangeRingLayerEntries", () => {
  const state = {
    unitMap: {
      b: unit("b", "Bravo", [ring("SAM", "ad"), ring("Mortar")]),
      a: unit("a", "Alpha", [ring("SAM", "ad"), ring("Gun", "ad")]),
      c: unit("c", "Charlie", []),
    },
    rangeRingGroupMap: {
      ad: { id: "ad", name: "Air defence" },
      unused: { id: "unused", name: "Unused" },
    },
  } as unknown as ScenarioState;

  it("lists every group's rings by unit name and counts each unit once", () => {
    const { groups } = getRangeRingLayerEntries(state);
    expect(groups.map((g) => [g.group.id, g.unitCount])).toEqual([
      ["ad", 2],
      ["unused", 0],
    ]);
    expect(groups[0].rings.map((r) => r.key)).toEqual(["a-0", "a-1", "b-0"]);
  });

  it("collects the rings without a group and counts all rings", () => {
    const { ungrouped, ringCount } = getRangeRingLayerEntries(state);
    expect(ungrouped.map((r) => [r.unitName, r.index, r.ring.name])).toEqual([
      ["Bravo", 1, "Mortar"],
    ]);
    expect(ringCount).toBe(4);
  });
});
