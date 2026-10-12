import { describe, expect, it, vi } from "vitest";
import { klona } from "klona";
import { addUnitHierarchy, parseApplicationOrbat } from "@/importexport/convertUtils";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import type { TScenario } from "@/scenariostore";
import type { Scenario, Unit } from "@/types/scenarioModels";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

describe("parseApplicationOrbat", () => {
  it("returns null for an empty string", () => {
    expect(parseApplicationOrbat("")).toBeNull();
  });

  it("returns null for whitespace-only text", () => {
    expect(parseApplicationOrbat("  \n\t  ")).toBeNull();
  });

  it("returns null for invalid json", () => {
    expect(parseApplicationOrbat("not json")).toBeNull();
  });

  it("returns parsed units for a valid unit array", () => {
    const payload = JSON.stringify([
      { id: "u1", name: "Unit 1", sidc: "10031000001211000000" },
    ]);

    expect(parseApplicationOrbat(payload)).toEqual([
      { id: "u1", name: "Unit 1", sidc: "10031000001211000000" },
    ]);
  });
});

const sourceUnit: Unit = {
  id: "unit",
  name: "Unit",
  sidc: "10031000001211000000",
  subUnits: [],
  state: [
    { id: "unit-state", t: Date.parse("2025-01-01T01:00:00Z"), location: [10, 60] },
  ],
};

function unitScenario(): Scenario {
  return {
    id: "scenario",
    type: "ORBAT-mapper",
    version: "3.0.0",
    name: "scenario",
    startTime: Date.parse("2025-01-01T00:00:00Z"),
    timeZone: "UTC",
    events: [],
    layerStack: [],
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
      symbolFillColors: [],
    },
    sides: [
      {
        id: "side",
        name: "Blue",
        standardIdentity: "3",
        groups: [{ id: "group", name: "Group", subUnits: [klona(sourceUnit)] }],
      },
    ],
  } as unknown as Scenario;
}

describe("addUnitHierarchy", () => {
  function setup() {
    const store = useNewScenarioStore(unitScenario());
    const scenario = {
      store,
      unitActions: useUnitManipulations(store),
    } as unknown as TScenario;
    return { store, scenario };
  }

  it("gives a copied unit new state ids when its id is already taken", () => {
    const { store, scenario } = setup();
    const id = addUnitHierarchy(klona(sourceUnit), "group", scenario, {
      newIds: false,
      includeState: true,
    })!;

    expect(id).not.toBe("unit");
    expect(store.state.unitMap[id].state).toHaveLength(1);
    expect(store.state.unitMap[id].state?.[0].id).not.toBe("unit-state");
    expect(store.state.unitMap["unit"].state?.[0].id).toBe("unit-state");
  });

  it("gives copied state new ids when new unit ids are requested", () => {
    const { store, scenario } = setup();
    const id = addUnitHierarchy(klona(sourceUnit), "group", scenario, {
      includeState: true,
    })!;

    expect(store.state.unitMap[id].state?.[0].id).not.toBe("unit-state");
  });
});
