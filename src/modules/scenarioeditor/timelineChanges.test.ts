import { describe, expect, it } from "vitest";
import type { NScenarioLayerItem, NState, NUnit } from "@/types/internalModels";
import {
  buildChangeIndex,
  countChangeKinds,
  describeUnitState,
  findNextChange,
  findPreviousChange,
  getLayerItemPositions,
  groupChangesByEntity,
  isChangeInView,
  isSameChangeList,
  laneAxisTicks,
  legShiftBounds,
  mergeDepartures,
  queryChangeIndex,
  type CollectOptions,
  type TimelineChangeSource,
} from "./timelineChanges";
import { getHistogramBinRange } from "@/utils/time";

const H = 3600000;
const T0 = Date.UTC(2024, 0, 1, 10);

function unit(id: string, state: Partial<NState>[], location?: number[]): NUnit {
  return {
    id,
    name: id,
    sidc: "10031000001211000000",
    subUnits: [],
    _pid: "parent",
    _sid: "side",
    location,
    state: state.map((s, i) => ({ id: `${id}-s${i}`, t: T0, ...s })) as NState[],
  } as NUnit;
}

function collectTimelineChanges(
  source: TimelineChangeSource,
  range: [number, number],
  options?: CollectOptions,
) {
  return queryChangeIndex(buildChangeIndex(source), range, options);
}

function source(
  units: NUnit[],
  layerItems: NScenarioLayerItem[] = [],
): TimelineChangeSource {
  return {
    unitMap: Object.fromEntries(units.map((u) => [u.id, u])),
    layerItemMap: Object.fromEntries(layerItems.map((i) => [i.id, i])),
  };
}

describe("getHistogramBinRange", () => {
  it("centres the range on the bin", () => {
    expect(getHistogramBinRange(T0)).toEqual([T0 - H / 2, T0 + H / 2]);
  });
});

describe("describeUnitState", () => {
  it("describes a location change with waypoints", () => {
    expect(
      describeUnitState({ id: "s", t: T0, location: [1, 2], via: [[0, 0]] }),
    ).toEqual({
      kinds: ["location"],
      viaCount: 1,
    });
  });

  it("describes a removal from the map", () => {
    expect(describeUnitState({ id: "s", t: T0, location: null }).kinds).toEqual([
      "removed",
    ]);
  });

  it("describes several changes in one state", () => {
    const d = describeUnitState({
      id: "s",
      t: T0,
      sidc: "x",
      status: "destroyed",
      hierarchy: { targetId: "u2", placement: "on", parentId: "u3" },
      diff: { equipment: [{ id: "e", onHand: -1 }], supplies: [{ id: "s", onHand: 2 }] },
      textAmplifiers: { uniqueDesignation: "A" },
    } as NState);
    expect(d.kinds).toEqual(["symbol", "status", "hierarchy", "resources", "amplifiers"]);
    expect(d).toMatchObject({
      status: "destroyed",
      hierarchyParentId: "u3",
      resourceLineCount: 2,
    });
  });

  it("falls back to 'other' when a state changes nothing it knows about", () => {
    expect(describeUnitState({ id: "s", t: T0, title: "Note" }).kinds).toEqual(["other"]);
  });
});

describe("collectTimelineChanges", () => {
  it("notes the parent a unit leaves on a hierarchy change", () => {
    const u = unit("a", [
      { t: T0, hierarchy: { targetId: "u2", placement: "on" } },
      { t: T0 + H, location: [0, 0] },
      {
        t: T0 + 2 * H,
        hierarchy: { targetId: "u5", placement: "above", parentId: "u3" },
      },
    ]);
    u._basePid = "base";
    const changes = collectTimelineChanges(source([u]), [T0, T0 + 3 * H]);
    expect(
      changes.map(({ hierarchyFromId, hierarchyParentId }) => [
        hierarchyFromId,
        hierarchyParentId,
      ]),
    ).toEqual([
      ["base", "u2"],
      [undefined, undefined],
      ["u2", "u3"],
    ]);
  });

  it("collects unit states in a half-open range, oldest first", () => {
    const changes = collectTimelineChanges(
      source([
        unit("b", [{ t: T0 + 10 * 60000, status: "x" }]),
        unit("a", [
          { t: T0 - H, location: [0, 0] },
          { t: T0, location: [1, 1] },
        ]),
        unit("c", [{ t: T0 + H, location: [1, 1] }]),
      ]),
      [T0, T0 + H],
    );
    expect(changes.map((c) => [c.entityId, c.t])).toEqual([
      ["a", T0],
      ["b", T0 + 10 * 60000],
    ]);
    expect(changes[0]).toMatchObject({
      id: "a:a-s1",
      entityType: "unit",
      stateId: "a-s1",
      kinds: ["location"],
      positions: [[1, 1]],
    });
  });

  it("collects layer item states with the item's shape as positions", () => {
    const item = {
      id: "f1",
      _pid: "layer",
      kind: "geometry",
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
      state: [{ id: "fs1", t: T0 }],
    } as unknown as NScenarioLayerItem;
    const [change] = collectTimelineChanges(source([], [item]), [T0, T0 + 1]);
    expect(change).toMatchObject({
      entityType: "layerItem",
      kinds: ["layerItem"],
      positions: [
        [0, 0],
        [1, 1],
      ],
    });
  });

  it("collects control measure states with the control points as positions", () => {
    const item = {
      id: "cm1",
      _pid: "layer",
      kind: "tacticalGraphic",
      controlPoints: [
        [0, 0],
        [2, 2],
      ],
      state: [{ id: "cs1", t: T0, patch: { controlPoints: [[5, 5]] } }],
    } as unknown as NScenarioLayerItem;
    const [change] = collectTimelineChanges(source([], [item]), [T0, T0 + 1]);
    expect(change.positions).toEqual([
      [0, 0],
      [2, 2],
    ]);
    expect(getLayerItemPositions(item)).toEqual([
      [0, 0],
      [2, 2],
    ]);
    item._state = { controlPoints: [[5, 5]] } as NScenarioLayerItem["_state"];
    expect(getLayerItemPositions(item)).toEqual([[5, 5]]);
  });

  describe("moving units", () => {
    const traveller = unit("u", [
      { t: T0 - 2 * H, location: [0, 0] },
      { t: T0 + 2 * H, location: [2, 0] },
      { t: T0 + 3 * H, location: [3, 0], interpolate: false },
    ]);

    it("leaves out legs unless asked for", () => {
      expect(collectTimelineChanges(source([traveller]), [T0, T0 + H])).toEqual([]);
    });

    it("includes a leg that spans the range", () => {
      const [leg] = collectTimelineChanges(source([traveller]), [T0, T0 + H], {
        includeMoving: true,
      });
      expect(leg).toMatchObject({
        id: "u:u-s1:leg",
        kinds: ["moving"],
        t: T0,
        // Bounded by the states before and after it.
        leg: {
          start: T0 - 2 * H,
          end: T0 + 2 * H,
          earliest: T0 - 2 * H,
          latest: T0 + 3 * H,
        },
        positions: [
          [0, 0],
          [2, 0],
        ],
      });
    });

    it("skips legs that arrive inside the range unless told otherwise", () => {
      const range: [number, number] = [T0 + H, T0 + 2.5 * H];
      const skipped = collectTimelineChanges(source([traveller]), range, {
        includeMoving: true,
      });
      expect(skipped.map((c) => c.kinds)).toEqual([["location"]]);

      const kept = collectTimelineChanges(source([traveller]), range, {
        includeMoving: true,
        skipArrivals: false,
      });
      expect(kept.map((c) => c.kinds)).toEqual([["moving"], ["location"]]);
    });

    it("does not treat a non-interpolated jump as a leg", () => {
      const changes = collectTimelineChanges(
        source([traveller]),
        [T0 + 2.5 * H, T0 + 2.9 * H],
        { includeMoving: true },
      );
      expect(changes).toEqual([]);
    });

    it("starts a leg at viaStartTime when it is later", () => {
      const u = unit("v", [
        { t: T0 - 2 * H, location: [0, 0] },
        { t: T0 + 2 * H, location: [2, 0], viaStartTime: T0 + H },
      ]);
      expect(
        collectTimelineChanges(source([u]), [T0, T0 + H], { includeMoving: true }),
      ).toEqual([]);
      const [leg] = collectTimelineChanges(source([u]), [T0, T0 + 1.5 * H], {
        includeMoving: true,
      });
      expect(leg.leg).toEqual({ start: T0 + H, end: T0 + 2 * H, earliest: T0 - 2 * H });
      // It can move back to the state before it, and forward without limit.
      expect(legShiftBounds(leg.leg!)).toEqual([-3 * H, Infinity]);
    });

    it("starts from the unit's initial location", () => {
      const u = unit("w", [{ t: T0 + H, location: [2, 0] }], [0, 0]);
      expect(
        collectTimelineChanges(source([u]), [T0, T0 + 0.5 * H], { includeMoving: true }),
      ).toEqual([]);
    });
  });
});

describe("queryChangeIndex", () => {
  const index = buildChangeIndex(
    source([
      unit("long", [
        { t: T0 - 10 * H, location: [0, 0] },
        { t: T0 + 10 * H, location: [1, 0] },
      ]),
      unit("short", [
        { t: T0 + H, location: [0, 0] },
        { t: T0 + 2 * H, location: [1, 0] },
      ]),
    ]),
  );
  const ids = (range: [number, number]) =>
    queryChangeIndex(index, range, { includeMoving: true, skipArrivals: false }).map(
      (c) => c.id,
    );

  it("answers several ranges from one index", () => {
    expect(ids([T0 + 1.5 * H, T0 + 3 * H])).toEqual([
      "long:long-s1:leg",
      "short:short-s1:leg",
      "short:short-s1",
    ]);
    expect(ids([T0 + 3 * H, T0 + 4 * H])).toEqual(["long:long-s1:leg"]);
  });

  it("clamps a leg's time to the range start without changing the index", () => {
    const [leg] = queryChangeIndex(index, [T0, T0 + 0.5 * H], { includeMoving: true });
    expect(leg.t).toBe(T0);
    expect(index.legs[0].t).toBe(T0 - 10 * H);
  });
});

describe("isSameChangeList", () => {
  const index = buildChangeIndex(
    source([
      unit("long", [
        { t: T0 - 10 * H, location: [0, 0] },
        { t: T0 + 10 * H, location: [1, 0] },
      ]),
      unit("short", [
        { t: T0 + H, location: [0, 0] },
        { t: T0 + 2 * H, location: [1, 0] },
      ]),
    ]),
  );
  const query = (from: number) =>
    queryChangeIndex(index, [from, from + 3 * H], {
      includeMoving: true,
      skipArrivals: false,
    });

  it("matches as the range moves while a leg stays under way", () => {
    expect(isSameChangeList(query(T0 - 3 * H), query(T0 - 3 * H + 60_000))).toBe(true);
  });

  it("does not match when a leg goes from setting off in the range to under way", () => {
    // The leg sets off at T0 + H, between its states, so only its clamping changes.
    const delayed = buildChangeIndex(
      source([
        unit("d", [
          { t: T0 - 10 * H, location: [0, 0] },
          { t: T0 + 10 * H, location: [1, 0], viaStartTime: T0 + H },
        ]),
      ]),
    );
    const at = (from: number) =>
      queryChangeIndex(delayed, [from, from + 3 * H], { includeMoving: true });
    expect(at(T0 + H)[0].t).toBe(T0 + H);
    expect(isSameChangeList(at(T0 + H), at(T0 + H + 60_000))).toBe(false);
    expect(isSameChangeList(at(T0 + 2 * H), at(T0 + 2 * H + 60_000))).toBe(true);
  });

  it("does not match when the changes differ", () => {
    expect(isSameChangeList(query(T0 - 3 * H), query(T0 - H))).toBe(false);
  });
});

describe("findNextChange", () => {
  const index = buildChangeIndex(
    source([
      unit("a", [
        { t: T0, location: [0, 0] },
        { t: T0 + 2 * H, location: [1, 0] },
      ]),
      unit("b", [{ t: T0 + 3 * H, status: "x" }]),
    ]),
  );

  it("finds the first state at or after a time, leaving out legs", () => {
    expect(findNextChange(index, T0 + H)?.id).toBe("a:a-s1");
    expect(findNextChange(index, T0 + 2 * H)?.id).toBe("a:a-s1");
  });

  it("skips changes that are not accepted", () => {
    const next = findNextChange(index, T0 + H, (c) => c.entityId === "b");
    expect(next?.id).toBe("b:b-s0");
  });

  it("finds nothing after the last change", () => {
    expect(findNextChange(index, T0 + 4 * H)).toBeUndefined();
  });
});

describe("findPreviousChange", () => {
  const index = buildChangeIndex(
    source([
      unit("a", [
        { t: T0, location: [0, 0] },
        { t: T0 + 2 * H, location: [1, 0] },
      ]),
      unit("b", [{ t: T0 + 3 * H, status: "x" }]),
    ]),
  );

  it("finds the last state before a time, leaving out legs", () => {
    expect(findPreviousChange(index, T0 + 3 * H)?.id).toBe("a:a-s1");
    expect(findPreviousChange(index, T0 + 2 * H)?.id).toBe("a:a-s0");
  });

  it("skips changes that are not accepted", () => {
    const previous = findPreviousChange(index, T0 + 4 * H, (c) => c.entityId === "a");
    expect(previous?.id).toBe("a:a-s1");
  });

  it("finds nothing before the first change", () => {
    expect(findPreviousChange(index, T0)).toBeUndefined();
  });
});

describe("isChangeInView", () => {
  const [change] = collectTimelineChanges(
    source([unit("a", [{ t: T0, location: [10, 60] }])]),
    [T0, T0 + 1],
  );

  it("matches on where the change happens", () => {
    expect(isChangeInView(change, [9, 59, 11, 61])).toBe(true);
    expect(isChangeInView(change, [0, 0, 1, 1])).toBe(false);
  });

  it("matches on the unit's current position", () => {
    expect(isChangeInView(change, [0, 0, 1, 1], [[0.5, 0.5]])).toBe(true);
  });

  it("handles a view that crosses the antimeridian", () => {
    const [east] = collectTimelineChanges(
      source([unit("e", [{ t: T0, location: [-179, 0] }])]),
      [T0, T0 + 1],
    );
    expect(isChangeInView(east, [170, -5, 185, 5])).toBe(true);
  });
});

describe("grouping and counting", () => {
  const changes = collectTimelineChanges(
    source([
      unit("a", [
        { t: T0, location: [0, 0] },
        { t: T0 + 1, status: "x" },
      ]),
      unit("b", [{ t: T0, location: [0, 0] }]),
    ]),
    [T0, T0 + H],
  );

  it("groups changes by entity", () => {
    expect(
      groupChangesByEntity(changes).map((g) => [g.entityId, g.changes.length]),
    ).toEqual([
      ["a", 2],
      ["b", 1],
    ]);
  });

  it("counts change kinds", () => {
    expect(Object.fromEntries(countChangeKinds(changes))).toEqual({
      location: 2,
      status: 1,
    });
  });
});

describe("laneAxisTicks", () => {
  const H = 3_600_000;
  // 11 Mar 1982 10:00 at UTC-4 (Atlantic/Stanley).
  const now = Date.UTC(1982, 2, 11, 14);
  const offset = -4 * H;
  const labels = (axis: [number, number]) =>
    laneAxisTicks(axis, offset).map(({ label }) => label);

  it("lays ticks out in the scenario's time zone and dates its midnights", () => {
    expect(labels([now - 24 * H, now + 24 * H])).toEqual([
      "12:00",
      "18:00",
      "11 Mar",
      "06:00",
      "12:00",
      "18:00",
      "12 Mar",
      "06:00",
    ]);
    const midnights = laneAxisTicks([now - 24 * H, now + 24 * H], offset)
      .filter(({ day }) => day)
      .map(({ t }) => t);
    expect(midnights).toEqual([Date.UTC(1982, 2, 11, 4), Date.UTC(1982, 2, 12, 4)]);
  });

  it("dates the first tick when the range has no midnight", () => {
    expect(labels([now - 3 * H, now + 3 * H])).toEqual([
      "11 Mar 08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
    ]);
  });

  it("labels day steps with the date only", () => {
    expect(labels([now - 3 * 24 * H, now + 3 * 24 * H])).toEqual([
      "09 Mar",
      "10 Mar",
      "11 Mar",
      "12 Mar",
      "13 Mar",
      "14 Mar",
    ]);
  });
});

describe("mergeDepartures", () => {
  const traveller = unit("u", [
    { t: T0, location: [0, 0] },
    { t: T0 + 10 * H, location: [1, 0] },
  ]);
  const other = unit("v", [{ t: T0, status: "s" }]);
  const query = (range: [number, number]) =>
    mergeDepartures(
      collectTimelineChanges(source([traveller, other]), range, { includeMoving: true }),
    );

  it("puts a trip on the change its unit sets off from", () => {
    const changes = query([T0 - H, T0 + H]);
    expect(changes.map((c) => [c.entityId, c.kinds])).toEqual([
      ["u", ["location", "moving"]],
      ["v", ["status"]],
    ]);
    const [departing] = changes;
    expect(departing.id).toBe("u:u-s0");
    expect(departing.leg).toBeUndefined();
    expect(departing.departure).toMatchObject({ start: T0, end: T0 + 10 * H });
    expect(departing.positions).toEqual([
      [0, 0],
      [0, 0],
      [1, 0],
    ]);
  });

  it("keeps a trip already under way on its own row", () => {
    const changes = query([T0 + H, T0 + 2 * H]);
    expect(changes.map((c) => c.kinds)).toEqual([["moving"]]);
    expect(changes[0].leg).toBeDefined();
  });
});
