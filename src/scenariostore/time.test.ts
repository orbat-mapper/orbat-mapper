import { describe, expect, it } from "vitest";
import { createInitialState, updateCurrentUnitState } from "./time";
import type { NUnit } from "@/types/internalModels";

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
