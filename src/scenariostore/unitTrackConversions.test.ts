import { describe, expect, it } from "vitest";
import type { Position } from "geojson";
import type { NState } from "@/types/internalModels";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import { useScenarioTime } from "@/scenariostore/time";
import { computeViaPointTime } from "@/scenariostore/unitTrackConversions";

const T0 = Date.parse("2025-01-01T00:00:00Z");
const T1 = Date.parse("2025-01-01T01:00:00Z");
const T2 = Date.parse("2025-01-01T02:00:00Z");

function createScenario(state: any[] = []) {
  return {
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "2.3.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [
      {
        id: "side-1",
        name: "Blue",
        standardIdentity: "3",
        symbolOptions: {},
        subUnits: [],
        groups: [
          {
            id: "group-1",
            name: "Units",
            symbolOptions: {},
            subUnits: [
              {
                id: "unit-1",
                name: "1st Unit",
                sidc: "10031000000000000000",
                location: [0, 0],
                state,
                subUnits: [],
              },
            ],
          },
        ],
      },
    ],
    events: [],
    layers: [{ id: "layer-1", name: "Features", features: [] }],
    mapLayers: [],
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
    },
  } as any;
}

/** A unit at [0, 0] that travels east, with a via point halfway along. */
function createTrackScenario() {
  return createScenario([
    { id: "state-1", t: "2025-01-01T00:00:00Z", location: [0, 0] },
    {
      id: "state-2",
      t: "2025-01-01T02:00:00Z",
      location: [2, 0],
      via: [[1, 0]],
    },
  ]);
}

function setup(scenario: any) {
  const store = useNewScenarioStore(scenario);
  return { store, actions: useUnitManipulations(store), time: useScenarioTime(store) };
}

describe("computeViaPointTime", () => {
  function destination(via: Position[], viaStartTime?: number): NState {
    return { id: "state-1", t: T2, location: [2, 0], via, viaStartTime };
  }

  it("splits the leg's time span by the distance travelled", () => {
    const t = computeViaPointTime(
      { location: [0, 0], t: T0 },
      destination([[1, 0]]),
      0,
      10,
    );
    expect(t).toBe(T1);
  });

  it("measures from viaStartTime when the leg has one", () => {
    const t = computeViaPointTime(
      { location: [0, 0], t: T0 },
      destination([[1, 0]], T1),
      0,
      10,
    );
    expect(t).toBe(T1 + (T2 - T1) / 2);
  });

  it("works backwards from the unit's speed when the leg starts untimed", () => {
    // 1 degree of longitude at the equator is ~111.2 km, covered in ~11120 s
    // at 10 m/s.
    const t = computeViaPointTime({ location: [0, 0] }, destination([[1, 0]]), 0, 10);
    expect((T2 - t) / 1000).toBeCloseTo(11119.5, 0);
  });

  it("keeps the new time inside the leg", () => {
    const t = computeViaPointTime(
      { location: [0, 0], t: T0 },
      destination([[2, 0]]),
      0,
      10,
    );
    expect(t).toBe(T2 - 1);
  });
});

describe("convertViaPointToWaypoint", () => {
  it("adds a waypoint timed from the leg's average speed", () => {
    const { store, actions } = setup(createTrackScenario());

    actions.convertViaPointToWaypoint("unit-1", 1, 0);

    const state = store.state.unitMap["unit-1"].state!;
    expect(state).toHaveLength(3);
    expect(state[1].location).toEqual([1, 0]);
    expect(state[1].t).toBe(T1);
    expect(state[1].via).toBeUndefined();
    expect(state[2].location).toEqual([2, 0]);
    expect(state[2].via).toBeUndefined();
  });

  it("leaves the unit where it was at any given time", () => {
    const { store, actions, time } = setup(createTrackScenario());
    const at = Date.parse("2025-01-01T00:30:00Z");

    time.setCurrentTime(at);
    const before = store.state.unitMap["unit-1"]._state?.location;

    actions.convertViaPointToWaypoint("unit-1", 1, 0);

    const after = store.state.unitMap["unit-1"]._state?.location;
    expect(after![0]).toBeCloseTo(before![0], 6);
    expect(after![1]).toBeCloseTo(before![1], 6);
  });

  it("splits the surrounding via points between the two legs", () => {
    const { store, actions } = setup(
      createScenario([
        { id: "state-1", t: "2025-01-01T00:00:00Z", location: [0, 0] },
        {
          id: "state-2",
          t: "2025-01-01T02:00:00Z",
          location: [4, 0],
          via: [
            [1, 0],
            [2, 0],
            [3, 0],
          ],
        },
      ]),
    );

    actions.convertViaPointToWaypoint("unit-1", 1, 1);

    const state = store.state.unitMap["unit-1"].state!;
    expect(state[1].location).toEqual([2, 0]);
    expect(state[1].via).toEqual([[1, 0]]);
    expect(state[2].via).toEqual([[3, 0]]);
  });

  it("hands viaStartTime to the first half of the split leg", () => {
    const { store, actions } = setup(
      createScenario([
        { id: "state-1", t: "2025-01-01T00:00:00Z", location: [0, 0] },
        {
          id: "state-2",
          t: "2025-01-01T02:00:00Z",
          location: [2, 0],
          via: [[1, 0]],
          viaStartTime: "2025-01-01T01:00:00Z",
        },
      ]),
    );

    actions.convertViaPointToWaypoint("unit-1", 1, 0);

    const state = store.state.unitMap["unit-1"].state!;
    expect(state[1].viaStartTime).toBe(T1);
    expect(state[2].viaStartTime).toBeUndefined();
  });
});

describe("convertWaypointToViaPoint", () => {
  it("merges the legs on either side of the waypoint", () => {
    const { store, actions } = setup(
      createScenario([
        { id: "state-1", t: "2025-01-01T00:00:00Z", location: [0, 0] },
        { id: "state-2", t: "2025-01-01T01:00:00Z", location: [1, 0] },
        { id: "state-3", t: "2025-01-01T02:00:00Z", location: [2, 0] },
      ]),
    );

    actions.convertWaypointToViaPoint("unit-1", 1);

    const state = store.state.unitMap["unit-1"].state!;
    expect(state).toHaveLength(2);
    expect(state[1].location).toEqual([2, 0]);
    expect(state[1].via).toEqual([[1, 0]]);
  });

  it("keeps the via points of both legs in order", () => {
    const { store, actions } = setup(
      createScenario([
        { id: "state-1", t: "2025-01-01T00:00:00Z", location: [0, 0] },
        { id: "state-2", t: "2025-01-01T01:00:00Z", location: [2, 0], via: [[1, 0]] },
        { id: "state-3", t: "2025-01-01T02:00:00Z", location: [4, 0], via: [[3, 0]] },
      ]),
    );

    actions.convertWaypointToViaPoint("unit-1", 1);

    const state = store.state.unitMap["unit-1"].state!;
    expect(state[1].via).toEqual([
      [1, 0],
      [2, 0],
      [3, 0],
    ]);
  });

  it("keeps a state entry that carries more than a position", () => {
    const { store, actions } = setup(
      createScenario([
        { id: "state-1", t: "2025-01-01T00:00:00Z", location: [0, 0] },
        {
          id: "state-2",
          t: "2025-01-01T01:00:00Z",
          location: [1, 0],
          sidc: "10031000001100000000",
        },
        { id: "state-3", t: "2025-01-01T02:00:00Z", location: [2, 0] },
      ]),
    );

    actions.convertWaypointToViaPoint("unit-1", 1);

    const state = store.state.unitMap["unit-1"].state!;
    expect(state).toHaveLength(3);
    expect(state[1].location).toBeUndefined();
    expect(state[1].sidc).toBe("10031000001100000000");
    expect(state[2].via).toEqual([[1, 0]]);
  });

  it("does nothing for the last waypoint of a path", () => {
    const { store, actions } = setup(
      createScenario([
        { id: "state-1", t: "2025-01-01T00:00:00Z", location: [0, 0] },
        { id: "state-2", t: "2025-01-01T01:00:00Z", location: [1, 0] },
      ]),
    );

    actions.convertWaypointToViaPoint("unit-1", 1);

    expect(store.state.unitMap["unit-1"].state).toHaveLength(2);
  });

  it("round-trips back to the original waypoint time", () => {
    const { store, actions } = setup(
      createScenario([
        { id: "state-1", t: "2025-01-01T00:00:00Z", location: [0, 0] },
        { id: "state-2", t: "2025-01-01T01:00:00Z", location: [1, 0] },
        { id: "state-3", t: "2025-01-01T02:00:00Z", location: [2, 0] },
      ]),
    );

    actions.convertWaypointToViaPoint("unit-1", 1);
    actions.convertViaPointToWaypoint("unit-1", 1, 0);

    const state = store.state.unitMap["unit-1"].state!;
    expect(state).toHaveLength(3);
    expect(state[1].location).toEqual([1, 0]);
    expect(state[1].t).toBe(T1);
  });
});
