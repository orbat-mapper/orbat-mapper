import { describe, expect, it } from "vitest";
import { clusterUnits, type ClusterableUnit } from "@/geo/unitClustering";
import type { UnitClusteringSettings } from "@/types/mapSettings";

const defaultSettings: UnitClusteringSettings = {
  unitClusteringMode: "off",
  unitClusterGroupingMode: "strict",
  unitClusteringDistancePx: 20,
  unitClusteringMinSize: 2,
  unitClusteringMaxZoom: 14,
  unitClusteringHierarchyMinDepth: 1,
};

function makeUnit(
  id: string,
  coordinate: [number, number],
  overrides: Partial<ClusterableUnit> = {},
): ClusterableUnit {
  return {
    id,
    coordinate,
    sideId: "side-1",
    domain: "land",
    parentId: "parent-1",
    depth: 1,
    ...overrides,
  };
}

describe("clusterUnits", () => {
  it("returns no clusters when clustering is off", () => {
    const result = clusterUnits(
      [makeUnit("u1", [0, 0]), makeUnit("u2", [5, 0])],
      defaultSettings,
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toEqual([]);
    expect([...result.clusteredUnitIds]).toEqual([]);
  });

  it("clusters nearby units in naive mode even across parents", () => {
    const result = clusterUnits(
      [
        makeUnit("u1", [0, 0], { parentId: "parent-a" }),
        makeUnit("u2", [5, 0], { parentId: "parent-b" }),
      ],
      { ...defaultSettings, unitClusteringMode: "naive" },
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.memberIds).toEqual(["u1", "u2"]);
  });

  it("does not mix sides or domains in naive mode", () => {
    const result = clusterUnits(
      [
        makeUnit("u1", [0, 0], { sideId: "side-1", domain: "land" }),
        makeUnit("u2", [2, 0], { sideId: "side-2", domain: "land" }),
        makeUnit("u3", [4, 0], { sideId: "side-1", domain: "sea" }),
      ],
      { ...defaultSettings, unitClusteringMode: "naive" },
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toEqual([]);
  });

  it("can aggregate mixed side/domain members in summary grouping mode", () => {
    const result = clusterUnits(
      [
        makeUnit("u1", [0, 0], { sideId: "side-1", domain: "land", standardIdentity: "3" }),
        makeUnit("u2", [2, 0], { sideId: "side-2", domain: "sea", standardIdentity: "6" }),
      ],
      {
        ...defaultSettings,
        unitClusteringMode: "naive",
        unitClusterGroupingMode: "summary",
      },
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.composition).toHaveLength(2);
  });

  it("keeps nearby units separate in hierarchy mode when parents differ", () => {
    const result = clusterUnits(
      [
        makeUnit("u1", [0, 0], { parentId: "parent-a" }),
        makeUnit("u2", [5, 0], { parentId: "parent-b" }),
      ],
      { ...defaultSettings, unitClusteringMode: "hierarchy" },
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toEqual([]);
    expect([...result.clusteredUnitIds]).toEqual([]);
  });

  it("does not mix domains in hierarchy mode under the same parent", () => {
    const result = clusterUnits(
      [
        makeUnit("u1", [0, 0], { parentId: "parent-a", domain: "land" }),
        makeUnit("u2", [5, 0], { parentId: "parent-a", domain: "sea" }),
      ],
      { ...defaultSettings, unitClusteringMode: "hierarchy" },
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toEqual([]);
  });

  it("collapses descendants under a shared ancestor in hierarchy mode", () => {
    const result = clusterUnits(
      [
        makeUnit("parent", [100, 100], { parentId: "root", depth: 0 }),
        makeUnit("u1", [0, 0], { parentId: "parent", depth: 1 }),
        makeUnit("u2", [5, 0], { parentId: "parent", depth: 1 }),
      ],
      { ...defaultSettings, unitClusteringMode: "hierarchy" },
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.ancestorId).toBe("parent");
    expect(result.clusters[0]?.memberIds).toEqual(["u1", "u2"]);
    expect(result.clusters[0]?.coordinate).toEqual([100, 100]);
  });

  it("falls back to deeper descendant clusters when a higher ancestor subtree is too wide", () => {
    const result = clusterUnits(
      [
        makeUnit("parent", [100, 100], { parentId: "root", depth: 0 }),
        makeUnit("left", [0, 0], { parentId: "parent", depth: 1 }),
        makeUnit("left-a", [1, 0], { parentId: "left", depth: 2 }),
        makeUnit("left-b", [2, 0], { parentId: "left", depth: 2 }),
        makeUnit("right", [100, 0], { parentId: "parent", depth: 1 }),
      ],
      { ...defaultSettings, unitClusteringMode: "hierarchy" },
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.ancestorId).toBe("left");
    expect(result.clusters[0]?.memberIds).toEqual(["left-a", "left-b"]);
  });

  it("disables clustering above the configured zoom threshold", () => {
    const result = clusterUnits(
      [makeUnit("u1", [0, 0]), makeUnit("u2", [5, 0])],
      { ...defaultSettings, unitClusteringMode: "naive", unitClusteringMaxZoom: 8 },
      { resolution: 1, zoom: 10 },
    );

    expect(result.clusters).toEqual([]);
  });

  it("skips clustering an expanded hierarchy ancestor and falls back to child clusters", () => {
    const result = clusterUnits(
      [
        makeUnit("parent", [100, 100], { parentId: "root", depth: 0 }),
        makeUnit("left", [0, 0], { parentId: "parent", depth: 1 }),
        makeUnit("left-a", [1, 0], { parentId: "left", depth: 2 }),
        makeUnit("left-b", [2, 0], { parentId: "left", depth: 2 }),
      ],
      { ...defaultSettings, unitClusteringMode: "hierarchy" },
      { resolution: 1, zoom: 10, expandedAncestorIds: new Set(["parent"]) },
    );

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.ancestorId).toBe("left");
  });
});
