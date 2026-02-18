import { describe, expect, it } from "vitest";
import type { EntityId } from "@/types/base";
import type { NOrbatItemData, NUnit } from "@/types/internalModels";
import {
  flattenVisibleTreeIds,
  getVisibleTreeIndexByUnitId,
  shouldVirtualizeTree,
} from "@/components/orbatTreeVirtualization";

const TEST_SIDC = "10031000001211000000";

function makeUnit(id: EntityId, childIds: EntityId[] = []): NUnit {
  return {
    id,
    name: id,
    sidc: TEST_SIDC,
    subUnits: childIds,
    _pid: "side-root",
    _sid: "side-root",
  };
}

function makeNode(id: EntityId, children: NOrbatItemData[] = []): NOrbatItemData {
  return {
    unit: makeUnit(
      id,
      children.map((child) => child.unit.id),
    ),
    children,
  };
}

describe("orbat tree virtualization helpers", () => {
  it("flattens visible items in tree order with mixed expansion", () => {
    const a21 = makeNode("a21");
    const a2 = makeNode("a2", [a21]);
    const a1 = makeNode("a1");
    const a = makeNode("a", [a1, a2]);
    const b = makeNode("b");

    const ids = flattenVisibleTreeIds([a, b], ["a", "a2"]);
    expect(ids).toEqual(["a", "a1", "a2", "a21", "b"]);
  });

  it("returns -1 for non-visible item indexes and index for visible items", () => {
    const a1 = makeNode("a1");
    const a2 = makeNode("a2");
    const a = makeNode("a", [a1, a2]);
    const b = makeNode("b");
    const ids = flattenVisibleTreeIds([a, b], ["a"]);

    expect(ids).toEqual(["a", "a1", "a2", "b"]);
    expect(getVisibleTreeIndexByUnitId(ids, "a2")).toBe(2);
    expect(getVisibleTreeIndexByUnitId(ids, "missing")).toBe(-1);
  });

  it("enables virtualization at and above threshold", () => {
    expect(shouldVirtualizeTree(149, 150)).toBe(false);
    expect(shouldVirtualizeTree(150, 150)).toBe(true);
    expect(shouldVirtualizeTree(151, 150)).toBe(true);
  });
});
