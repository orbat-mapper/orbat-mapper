import { describe, expect, it } from "vitest";
import { createInitialState, updateCurrentUnitState, useScenarioTime } from "./time";
import type { NUnit } from "@/types/internalModels";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";

function createUnit(overrides: Partial<NUnit> = {}): NUnit {
  return {
    id: "unit-1",
    name: "Unit",
    sidc: "10031000000000000000",
    subUnits: [],
    _pid: "group-1",
    _sid: "side-1",
    ...overrides,
  } as NUnit;
}

describe("time rotation state", () => {
  it("sets symbolRotation to 0 for initial state", () => {
    const unit = createUnit({ location: [10, 60] });
    const initialState = createInitialState(unit);
    expect(initialState?.symbolRotation).toBe(0);
  });

  it("defaults to 0 rotation when unit has no state entries", () => {
    const unit = createUnit({ location: [10, 60], _state: null, state: [] });
    updateCurrentUnitState(unit, 0);
    expect(unit._state?.symbolRotation).toBe(0);
  });

  it("applies symbolRotation from latest state at timestamp", () => {
    const unit = createUnit({
      location: [10, 60],
      state: [
        { id: "a", t: 1000, symbolRotation: 45 },
        { id: "b", t: 2000, symbolRotation: 270 },
      ] as any,
    });

    updateCurrentUnitState(unit, 1500);
    expect(unit._state?.symbolRotation).toBe(45);

    updateCurrentUnitState(unit, 2500);
    expect(unit._state?.symbolRotation).toBe(270);
  });

  it("seeds initial state with base reinforcedStatus", () => {
    const unit = createUnit({
      reinforcedStatus: "Reinforced",
    });

    const initialState = createInitialState(unit);

    expect(initialState?.reinforcedStatus).toBe("Reinforced");
  });

  it("applies reinforcedStatus from latest state at timestamp", () => {
    const unit = createUnit({
      reinforcedStatus: "Reinforced",
      state: [
        { id: "a", t: 1000, reinforcedStatus: "Reduced" },
        { id: "b", t: 2000, reinforcedStatus: "ReinforcedReduced" },
      ] as any,
    });

    updateCurrentUnitState(unit, 1500);
    expect(unit._state?.reinforcedStatus).toBe("Reduced");

    updateCurrentUnitState(unit, 2500);
    expect(unit._state?.reinforcedStatus).toBe("ReinforcedReduced");
  });

  it('allows a timed "None" state to clear the base reinforcedStatus', () => {
    const unit = createUnit({
      reinforcedStatus: "Reinforced",
      state: [{ id: "a", t: 1000, reinforcedStatus: "None" }] as any,
    });

    updateCurrentUnitState(unit, 500);
    expect(unit._state?.reinforcedStatus).toBe("Reinforced");

    updateCurrentUnitState(unit, 1500);
    expect(unit._state?.reinforcedStatus).toBe("None");
  });
});

describe("time base symbol state", () => {
  it("rebuilds _state for units without state entries only when forced", () => {
    const unit = createUnit({ location: [10, 60], state: [] });
    updateCurrentUnitState(unit, 0);
    const initialState = unit._state;
    expect(initialState?.sidc).toBe("10031000000000000000");

    unit.sidc = "10031000001211000000";
    updateCurrentUnitState(unit, 1000);
    expect(unit._state).toBe(initialState);

    updateCurrentUnitState(unit, 1000, { force: true });
    expect(unit._state?.sidc).toBe("10031000001211000000");
  });
});

describe("time unchanged state spans", () => {
  it("keeps _state while the timestamp stays within an unchanged span", () => {
    const unit = createUnit({
      state: [
        { id: "a", t: 1000, location: [10, 60] },
        { id: "b", t: 2000, sidc: "10031000001211000000" },
      ] as any,
    });

    expect(updateCurrentUnitState(unit, 1200, { epoch: "e1" })).toBe(true);
    const state = unit._state;
    expect(updateCurrentUnitState(unit, 1999, { epoch: "e1" })).toBe(false);
    expect(unit._state).toBe(state);

    expect(updateCurrentUnitState(unit, 2000, { epoch: "e1" })).toBe(true);
    expect(unit._state?.sidc).toBe("10031000001211000000");
    expect(updateCurrentUnitState(unit, 999, { epoch: "e1" })).toBe(true);
    expect(unit._state?.location).toBeUndefined();
  });

  it("rebuilds _state when the epoch changes, when forced, or without an epoch", () => {
    const unit = createUnit({
      state: [{ id: "a", t: 1000, location: [10, 60] }] as any,
    });
    updateCurrentUnitState(unit, 1500, { epoch: "e1" });

    expect(updateCurrentUnitState(unit, 1600, { epoch: "e2" })).toBe(true);
    expect(updateCurrentUnitState(unit, 1700, { epoch: "e2", force: true })).toBe(true);
    expect(updateCurrentUnitState(unit, 1800)).toBe(true);
    expect(updateCurrentUnitState(unit, 1900, { epoch: "e2" })).toBe(true);
  });

  it("rebuilds _state when the state entries are replaced", () => {
    const unit = createUnit({
      state: [{ id: "a", t: 1000, location: [10, 60] }] as any,
    });
    updateCurrentUnitState(unit, 1500, { epoch: "e1" });

    unit.state = [{ id: "a", t: 1000, location: [11, 61] }] as any;
    expect(updateCurrentUnitState(unit, 1600, { epoch: "e1" })).toBe(true);
    expect(unit._state?.location).toEqual([11, 61]);
  });

  it("rebuilds interpolated _state on every timestamp", () => {
    const unit = createUnit({
      state: [
        { id: "a", t: 1000, location: [10, 60] },
        { id: "b", t: 2000, location: [12, 60] },
      ] as any,
    });

    expect(updateCurrentUnitState(unit, 1200, { epoch: "e1" })).toBe(true);
    const location = unit._state?.location;
    expect(updateCurrentUnitState(unit, 1400, { epoch: "e1" })).toBe(true);
    expect(unit._state?.type).toBe("interpolated");
    expect(unit._state?.location).not.toEqual(location);
  });

  it("starts interpolating at viaStartTime", () => {
    const unit = createUnit({
      state: [
        { id: "a", t: 1000, location: [10, 60] },
        { id: "b", t: 2000, location: [12, 60], via: [[11, 61]], viaStartTime: 1500 },
      ] as any,
    });

    updateCurrentUnitState(unit, 1200, { epoch: "e1" });
    expect(updateCurrentUnitState(unit, 1499, { epoch: "e1" })).toBe(false);
    expect(updateCurrentUnitState(unit, 1600, { epoch: "e1" })).toBe(true);
    expect(unit._state?.type).toBe("interpolated");
  });
});

describe("setCurrentTime", () => {
  function createStore() {
    return useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "2.5.0",
      name: "Scenario",
      startTime: 0,
      sides: [
        {
          id: "side-1",
          name: "Blue",
          standardIdentity: "3",
          groups: [
            {
              id: "group-1",
              name: "Blue Group",
              subUnits: [
                {
                  id: "parked",
                  name: "Parked",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  state: [{ id: "p1", t: 100, location: [10, 60] }],
                },
                {
                  id: "unplaced",
                  name: "Unplaced",
                  sidc: "10031000000000000000",
                  subUnits: [],
                },
                {
                  id: "moving",
                  name: "Moving",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  state: [
                    { id: "m1", t: 100, location: [10, 60] },
                    { id: "m2", t: 1000, location: [12, 60] },
                  ],
                },
              ],
            },
          ],
        },
      ],
      events: [],
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            {
              type: "Feature",
              kind: "geometry",
              id: "timed-feature",
              geometry: { type: "Point", coordinates: [10, 60] },
              properties: {},
              meta: { type: "Point", name: "Timed" },
              style: {},
              state: [
                {
                  id: "f1",
                  t: 500,
                  patch: { geometry: { type: "Point", coordinates: [11, 61] } },
                },
              ],
            },
          ],
        },
      ],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    } as any);
  }

  it("keeps a timed layer item's _state while the time stays within one state step", () => {
    const store = createStore();
    const time = useScenarioTime(store);
    time.setCurrentTime(200);
    const before = store.state.layerItemMap["timed-feature"]._state;
    const counter = store.state.featureStateCounter;

    time.setCurrentTime(300);
    time.setCurrentTime(400);

    expect(store.state.layerItemMap["timed-feature"]._state).toBe(before);
    expect(store.state.featureStateCounter).toBe(counter);

    time.setCurrentTime(600);

    const after = store.state.layerItemMap["timed-feature"]._state as any;
    expect(after).not.toBe(before);
    expect(after.geometry.coordinates).toEqual([11, 61]);
    expect(store.state.featureStateCounter).toBeGreaterThan(counter);
  });

  it("only rebuilds _state of units whose state changes with the time", () => {
    const store = createStore();
    const time = useScenarioTime(store);
    time.setCurrentTime(200);
    const parkedState = store.state.unitMap["parked"]._state;
    const movingState = store.state.unitMap["moving"]._state;

    time.setCurrentTime(300);

    expect(store.state.unitMap["parked"]._state).toBe(parkedState);
    expect(store.state.unitMap["moving"]._state).not.toBe(movingState);
  });

  it("rebuilds _state after edits and their undo", () => {
    const store = createStore();
    const time = useScenarioTime(store);
    time.setCurrentTime(200);

    store.update((s) => {
      s.unitMap["parked"].state![0].location = [20, 50];
    });
    time.setCurrentTime(300);
    expect(store.state.unitMap["parked"]._state?.location).toEqual([20, 50]);

    store.undo();
    time.setCurrentTime(400);
    expect(store.state.unitMap["parked"]._state?.location).toEqual([10, 60]);
  });

  it("gives a unit without a location its first location after an edit", () => {
    const store = createStore();
    const time = useScenarioTime(store);
    time.setCurrentTime(200);
    time.setCurrentTime(300);
    expect(store.state.unitMap["unplaced"]._state).toBeNull();

    store.update((s) => {
      s.unitMap["unplaced"].location = [5, 55];
    });
    time.setCurrentTime(400);

    expect(store.state.unitMap["unplaced"]._state?.location).toEqual([5, 55]);
  });

  it("syncs the side identity of units that keep their _state", () => {
    const store = createStore();
    const time = useScenarioTime(store);
    time.setCurrentTime(200);

    store.update((s) => {
      s.sideMap["side-1"].standardIdentity = "6";
    });
    time.setCurrentTime(300);

    expect(store.state.unitMap["parked"]._state?.sidc).toBe("10061000000000000000");
    expect(store.state.unitMap["moving"]._state?.sidc).toBe("10061000000000000000");
  });
});

describe("setCurrentTime with a dynamic ORBAT", () => {
  function createStore() {
    return useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "2.5.0",
      name: "Scenario",
      startTime: 0,
      sides: [
        {
          id: "side-1",
          name: "Blue",
          standardIdentity: "3",
          groups: [
            {
              id: "group-1",
              name: "Blue Group",
              subUnits: [
                {
                  id: "unit-a",
                  name: "A",
                  sidc: "10031000000000000000",
                  subUnits: [
                    {
                      id: "unit-a1",
                      name: "A1",
                      sidc: "10031000000000000000",
                      subUnits: [],
                      state: [{ id: "a1-loc", t: 10, location: [10, 60] }],
                    },
                  ],
                  state: [
                    {
                      id: "move-1",
                      t: 100,
                      hierarchy: { targetId: "group-2", placement: "on" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "side-2",
          name: "Red",
          standardIdentity: "6",
          groups: [{ id: "group-2", name: "Red Group", subUnits: [] }],
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
        symbolFillColors: [],
      },
    } as any);
  }

  it("projects the side of a subordinate that keeps its _state across a move", () => {
    const store = createStore();
    const time = useScenarioTime(store);
    const a1 = () => store.state.unitMap["unit-a1"];
    // The symbol the map draws.
    const sidc = () => a1()._state?.sidc ?? a1().sidc;

    time.setCurrentTime(50);
    time.setCurrentTime(60);
    expect(a1()._sid).toBe("side-1");
    expect(sidc()).toBe("10031000000000000000");

    time.setCurrentTime(150);
    expect(a1()._sid).toBe("side-2");
    expect(a1()._gid).toBe("group-2");
    expect(sidc()).toBe("10061000000000000000");
    expect(a1()._state?.location).toEqual([10, 60]);

    time.setCurrentTime(160);
    expect(sidc()).toBe("10061000000000000000");

    time.setCurrentTime(60);
    expect(a1()._sid).toBe("side-1");
    expect(sidc()).toBe("10031000000000000000");
  });
});
