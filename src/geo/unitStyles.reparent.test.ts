import { describe, expect, it, vi } from "vitest";
import { createUnitStyle, clearUnitStyleCache, unitStyleCache } from "@/geo/unitStyles";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";

const { symbolGeneratorMock } = vi.hoisted(() => ({
  symbolGeneratorMock: vi.fn(() => ({
    getAnchor: () => ({ x: 10, y: 10 }),
    asCanvas: () => document.createElement("canvas"),
  })),
}));

vi.mock("@/symbology/milsymbwrapper", () => ({
  symbolGenerator: symbolGeneratorMock,
}));

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbolOptions: {} }),
}));

vi.mock("@/stores/mapSettingsStore.ts", () => ({
  useMapSettingsStore: () => ({
    mapIconSize: 40,
    mapCustomIconScale: 1.7,
    mapUnitLabelBelow: false,
  }),
}));

function createScenario() {
  return {
    id: "scenario-reparent-style",
    type: "ORBAT-mapper",
    version: "2.3.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [
      {
        id: "side-1",
        name: "Blue",
        standardIdentity: "3",
        symbolOptions: { fillColor: "#0055FF" },
        subUnits: [],
        groups: [
          {
            id: "group-1",
            name: "Blue Units",
            symbolOptions: {},
            subUnits: [
              {
                id: "unit-1",
                name: "1st Unit",
                sidc: "10031000000000000000",
                location: [10, 60],
                subUnits: [],
              },
            ],
          },
        ],
      },
      {
        id: "side-2",
        name: "Red",
        standardIdentity: "6",
        symbolOptions: { fillColor: "#CC2222" },
        subUnits: [],
        groups: [
          {
            id: "group-2",
            name: "Red Units",
            symbolOptions: {},
            subUnits: [],
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

describe("unit style cache invalidation on reparent", () => {
  it("reparenting invalidates stale _ikey cache and recomputes inherited fill color", () => {
    clearUnitStyleCache();
    const store = useNewScenarioStore(createScenario());
    const actions = useUnitManipulations(store);
    const scenario = { store, unitActions: actions } as any;
    const unit = store.state.unitMap["unit-1"];

    const beforeOptions = actions.getCombinedSymbolOptions(unit);
    const before = createUnitStyle(unit, beforeOptions, scenario);
    unit._ikey = before.cacheKey;
    unitStyleCache.set(before.cacheKey, before.style);
    expect(beforeOptions.fillColor).toBe("#0055FF");
    expect(unitStyleCache.has(before.cacheKey)).toBe(true);

    actions.changeUnitParent("unit-1", "group-2", "on");

    expect(unit._ikey).toBeUndefined();
    expect(unitStyleCache.has(before.cacheKey)).toBe(false);

    const afterOptions = actions.getCombinedSymbolOptions(unit);
    const after = createUnitStyle(unit, afterOptions, scenario);
    expect(afterOptions.fillColor).toBe("#CC2222");
    expect(after.cacheKey).not.toBe(before.cacheKey);
  });
});
