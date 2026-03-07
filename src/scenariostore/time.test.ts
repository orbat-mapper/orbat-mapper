import { describe, expect, it } from "vitest";
import {
  createInitialState,
  rebuildEffectiveHierarchy,
  updateCurrentUnitState,
} from "./time";
import type { NUnit } from "@/types/internalModels";
import type { ScenarioState } from "@/scenariostore/newScenarioStore";

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
});

describe("time-varying parent", () => {
  it("initial state includes parent.id from unit._pid", () => {
    const unit = createUnit({ _pid: "group-1", location: [10, 60] });
    const state = createInitialState(unit);
    expect(state?.parent?.id).toBe("group-1");
  });

  it("computes effective parent from state entries", () => {
    const unit = createUnit({
      _pid: "group-1",
      location: [10, 60],
      state: [{ id: "s1", t: 1000, parent: { id: "unit-parent-2" } }] as any,
    });

    updateCurrentUnitState(unit, 500);
    expect(unit._state?.parent?.id).toBe("group-1");

    updateCurrentUnitState(unit, 1500);
    expect(unit._state?.parent?.id).toBe("unit-parent-2");
  });

  it("reverts parent when time moves before the state entry", () => {
    const unit = createUnit({
      _pid: "group-1",
      location: [10, 60],
      state: [{ id: "s1", t: 1000, parent: { id: "unit-parent-2" } }] as any,
    });

    updateCurrentUnitState(unit, 1500);
    expect(unit._state?.parent?.id).toBe("unit-parent-2");

    updateCurrentUnitState(unit, 500);
    expect(unit._state?.parent?.id).toBe("group-1");
  });
});

describe("rebuildEffectiveHierarchy", () => {
  function createMinimalState(overrides: Partial<ScenarioState> = {}): ScenarioState {
    return {
      unitMap: {},
      sideGroupMap: {},
      effectiveSubUnits: {},
      effectiveSideGroupSubUnits: {},
      effectiveParentMap: {},
      ...overrides,
    } as ScenarioState;
  }

  it("initializes effective hierarchy from base hierarchy when no reparenting", () => {
    const s = createMinimalState({
      unitMap: {
        u1: createUnit({ id: "u1", _pid: "g1", subUnits: ["u2"] }),
        u2: createUnit({ id: "u2", _pid: "u1", subUnits: [] }),
      },
      sideGroupMap: {
        g1: { id: "g1", name: "G1", subUnits: ["u1"], _pid: "s1" } as any,
      },
    });

    rebuildEffectiveHierarchy(s);

    expect(s.effectiveSubUnits["u1"]).toEqual(["u2"]);
    expect(s.effectiveSubUnits["u2"]).toEqual([]);
    expect(s.effectiveSideGroupSubUnits["g1"]).toEqual(["u1"]);
    expect(s.effectiveParentMap["u1"]).toBe("g1");
    expect(s.effectiveParentMap["u2"]).toBe("u1");
  });

  it("moves unit to new parent when _state.parent differs from _pid", () => {
    const u2 = createUnit({ id: "u2", _pid: "u1", subUnits: [] });
    u2._state = { t: 0, parent: { id: "u3" } };

    const s = createMinimalState({
      unitMap: {
        u1: createUnit({ id: "u1", _pid: "g1", subUnits: ["u2"] }),
        u2: u2,
        u3: createUnit({ id: "u3", _pid: "g1", subUnits: [] }),
      },
      sideGroupMap: {
        g1: { id: "g1", name: "G1", subUnits: ["u1", "u3"], _pid: "s1" } as any,
      },
    });

    rebuildEffectiveHierarchy(s);

    expect(s.effectiveSubUnits["u1"]).toEqual([]);
    expect(s.effectiveSubUnits["u3"]).toEqual(["u2"]);
    expect(s.effectiveParentMap["u2"]).toBe("u3");
  });

  it("inserts at specified index when parent.index is provided", () => {
    const u3 = createUnit({ id: "u3", _pid: "g1", subUnits: [] });
    u3._state = { t: 0, parent: { id: "u1", index: 0 } };

    const s = createMinimalState({
      unitMap: {
        u1: createUnit({ id: "u1", _pid: "g1", subUnits: ["u2"] }),
        u2: createUnit({ id: "u2", _pid: "u1", subUnits: [] }),
        u3: u3,
      },
      sideGroupMap: {
        g1: { id: "g1", name: "G1", subUnits: ["u1", "u3"], _pid: "s1" } as any,
      },
    });

    rebuildEffectiveHierarchy(s);

    expect(s.effectiveSubUnits["u1"]).toEqual(["u3", "u2"]);
    expect(s.effectiveSideGroupSubUnits["g1"]).toEqual(["u1"]);
  });

  it("moves unit from sideGroup to unit parent", () => {
    const u2 = createUnit({ id: "u2", _pid: "g1", subUnits: [] });
    u2._state = { t: 0, parent: { id: "u1" } };

    const s = createMinimalState({
      unitMap: {
        u1: createUnit({ id: "u1", _pid: "g1", subUnits: [] }),
        u2: u2,
      },
      sideGroupMap: {
        g1: { id: "g1", name: "G1", subUnits: ["u1", "u2"], _pid: "s1" } as any,
      },
    });

    rebuildEffectiveHierarchy(s);

    expect(s.effectiveSideGroupSubUnits["g1"]).toEqual(["u1"]);
    expect(s.effectiveSubUnits["u1"]).toEqual(["u2"]);
    expect(s.effectiveParentMap["u2"]).toBe("u1");
  });
});
