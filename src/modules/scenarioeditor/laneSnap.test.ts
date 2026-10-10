import { describe, expect, it } from "vitest";
import { nearestSnap, snapTargets } from "./laneSnap";
import type { ChangeGroup, TimelineChange } from "./timelineChanges";

const H = 3600000;

function change(id: string, t: number, leg?: [number, number]): TimelineChange {
  return {
    id,
    t,
    entityType: "unit",
    entityId: "a",
    stateId: id,
    kinds: leg ? ["moving"] : ["location"],
    positions: [],
    ...(leg ? { leg: { start: leg[0], end: leg[1], earliest: leg[0] } } : {}),
  };
}

describe("snapTargets", () => {
  it("takes the marks' times and the legs' starts and ends, leaving out moving marks", () => {
    const lanes: ChangeGroup[] = [
      {
        entityType: "unit",
        entityId: "a",
        changes: [
          change("s1", H),
          change("leg", 2 * H, [2 * H, 3 * H]),
          change("s2", 3 * H),
        ],
      },
      { entityType: "unit", entityId: "b", changes: [change("s3", 5 * H)] },
    ];
    expect(snapTargets(lanes, new Set(["s1"])).sort((x, y) => x - y)).toEqual([
      2 * H,
      3 * H,
      3 * H,
      5 * H,
    ]);
  });
});

describe("nearestSnap", () => {
  it("snaps the nearest moved edge to the nearest target within the threshold", () => {
    // Edges at 100 and 200, moved by 3 to 103 and 203.
    expect(nearestSnap([100, 200], 3, [95, 207, 500], 10)).toEqual({
      delta: 7,
      target: 207,
    });
    expect(nearestSnap([100, 200], 3, [98], 10)).toEqual({ delta: -2, target: 98 });
  });

  it("passes over targets the item can't be moved to", () => {
    // 98 is nearer, but moving back by 2 is out of bounds.
    expect(nearestSnap([100], 0, [98, 104], 10, [0, 10])).toEqual({
      delta: 4,
      target: 104,
    });
  });

  it("does not snap to targets further away than the threshold", () => {
    expect(nearestSnap([100], 0, [111, 89], 10)).toBeNull();
  });
});
