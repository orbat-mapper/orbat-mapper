import { describe, expect, it } from "vitest";
import { changesBetween, changesInBox, type LaneLayout } from "./laneSelection";
import type { ChangeGroup, TimelineChange } from "./timelineChanges";

const H = 3600000;

function change(entityId: string, t: number, leg = false): TimelineChange {
  return {
    id: `${entityId}:${t}`,
    t,
    entityType: "unit",
    entityId,
    stateId: String(t),
    kinds: leg ? ["moving"] : ["location"],
    positions: [],
    ...(leg ? { leg: { start: t, end: t + H, earliest: t } } : {}),
  };
}

function lane(entityId: string, times: number[]): ChangeGroup {
  return {
    entityType: "unit",
    entityId,
    changes: times.map((t) => change(entityId, t)),
  };
}

// Lanes 20 px high. The track starts at 100 px and is 1000 px wide over 10 hours, so an
// hour is 100 px.
const layout: LaneLayout = {
  laneHeight: 20,
  trackLeft: 100,
  trackWidth: 1000,
  axis: [0, 10 * H],
};

describe("changesInBox", () => {
  const lanes = [lane("a", [H, 5 * H]), lane("b", [2 * H, 3 * H]), lane("c", [2 * H])];

  it("selects the marks whose centre is in the box, across lanes", () => {
    // From 1:30 to 3:30, over the centres of the first two lanes.
    const box = { left: 250, right: 450, top: 5, bottom: 35 };
    expect(changesInBox(lanes, box, layout).map((c) => c.id)).toEqual([
      `b:${2 * H}`,
      `b:${3 * H}`,
    ]);
  });

  it("needs the box to cover a lane's centre", () => {
    const box = { left: 0, right: 2000, top: 0, bottom: 9 };
    expect(changesInBox(lanes, box, layout)).toEqual([]);
  });

  it("leaves out legs", () => {
    const withLeg = [{ ...lanes[0], changes: [change("a", 2 * H, true)] }];
    const box = { left: 0, right: 2000, top: 0, bottom: 20 };
    expect(changesInBox(withLeg, box, layout)).toEqual([]);
  });
});

describe("changesBetween", () => {
  it("selects the marks between two changes, in either order", () => {
    const l = lane("a", [H, 2 * H, 3 * H, 4 * H]);
    const ids = (cs: TimelineChange[]) => cs.map((c) => c.t / H);
    expect(ids(changesBetween(l, l.changes[3], l.changes[1]))).toEqual([2, 3, 4]);
    expect(ids(changesBetween(l, l.changes[0], l.changes[0]))).toEqual([1]);
  });
});
