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
});
