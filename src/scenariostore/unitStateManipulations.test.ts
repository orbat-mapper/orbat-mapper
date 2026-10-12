import { describe, expect, it } from "vitest";
import {
  removeUnusedUnitStateEntries,
  useUnitStateManipulations,
} from "./unitStateManipulations";
import type { NState, NUnit } from "@/types/internalModels";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { updateCurrentUnitState } from "@/scenariostore/time";

function createUnit(state: NState[]): NUnit {
  return {
    id: "unit-1",
    name: "Unit",
    sidc: "10031000000000000000",
    subUnits: [],
    _pid: "group-1",
    _sid: "side-1",
    equipment: [{ id: "eq-1", count: 4 }],
    state,
  } as NUnit;
}

const removedEquipment = { equipment: [{ id: "eq-gone", onHand: 1 }] };

describe("removeUnusedUnitStateEntries", () => {
  it("drops an entry whose only content was a removed resource", () => {
    const unit = createUnit([{ id: "a", t: 1000, update: removedEquipment }]);
    expect(removeUnusedUnitStateEntries(unit)).toEqual([]);
  });

  it("keeps an entry that still updates a resource in use", () => {
    const unit = createUnit([
      { id: "a", t: 1000, diff: { equipment: [{ id: "eq-1", onHand: -1 }] } },
    ]);
    expect(removeUnusedUnitStateEntries(unit)?.map((s) => s.id)).toEqual(["a"]);
  });

  it.each<[string, Partial<NState>]>([
    ["Remove from map", { location: null }],
    ["a status cleared to None", { status: null }],
    ["a title", { title: "Destroyed by air strike" }],
    ["a description", { description: "BDA: 2 of 4 launchers lost" }],
    ["a rotation of 0", { symbolRotation: 0 }],
  ])("keeps an entry with %s", (_, content) => {
    const unit = createUnit([
      { id: "a", t: 1000, location: [10, 60] },
      { id: "b", t: 2000, ...content },
      { id: "c", t: 3000, ...content, update: removedEquipment },
    ]);
    const kept = removeUnusedUnitStateEntries(unit);
    expect(kept?.map((s) => s.id)).toEqual(["a", "b", "c"]);
    expect(kept?.[2].update).toBeUndefined();
  });

  it("drops an entry left with no content after its hierarchy move is removed", () => {
    const unit = createUnit([
      { id: "a", t: 1000, title: "Attached" },
      { id: "b", t: 2000 },
    ]);
    expect(removeUnusedUnitStateEntries(unit)?.map((s) => s.id)).toEqual(["a"]);
  });
});

function createStore(state: object[]) {
  return useNewScenarioStore({
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "2.3.0",
    name: "Scenario",
    startTime: "1970-01-01T00:00:00Z",
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
                subUnits: [],
                state,
              },
            ],
          },
        ],
      },
    ],
    events: [],
    layers: [],
    mapLayers: [],
    settings: { rangeRingGroups: [], statuses: [], supplyClasses: [], supplyUoMs: [] },
  } as any);
}

// The store keeps fields that are set to undefined; JSON drops them and keeps nulls.
const withoutUndefined = (value: unknown) => JSON.parse(JSON.stringify(value));

describe("removeUnitFromMap", () => {
  const plannedMoves = [
    { id: "a", t: 0, location: [0, 0] },
    { id: "b", t: 100, location: [1, 0] },
    { id: "c", t: 200, location: [2, 0], via: [[1.5, 1]], title: "Leg 2" },
    { id: "d", t: 300, location: [3, 0] },
  ];

  it("removes the unit and drops its later planned moves in one undo step", () => {
    const store = createStore(plannedMoves);
    const actions = useUnitStateManipulations(store);
    const unit = () => store.state.unitMap["unit-1"];

    actions.removeUnitFromMap("unit-1", 150);

    expect(withoutUndefined(unit().state)).toEqual([
      { id: "a", t: 0, location: [0, 0] },
      { id: "b", t: 100, location: [1, 0] },
      { id: expect.any(String), t: 150, location: null },
      { id: "c", t: 200, title: "Leg 2" },
    ]);
    for (const t of [150, 250, 400]) {
      updateCurrentUnitState(unit(), t, { force: true });
      expect(unit()._state?.location).toBeNull();
    }

    store.undo();
    expect(unit().state?.map((s) => s.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("clears the location of an entry already at that time", () => {
    const store = createStore(plannedMoves);
    const actions = useUnitStateManipulations(store);

    actions.removeUnitFromMap("unit-1", 200);

    expect(withoutUndefined(store.state.unitMap["unit-1"].state?.slice(2))).toEqual([
      { id: "c", t: 200, location: null, title: "Leg 2" },
    ]);
  });
});
