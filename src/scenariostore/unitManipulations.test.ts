import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import { clearUnitStyleCache, unitStyleCache } from "@/geo/unitStyles";

function createScenario() {
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
                location: [10, 60],
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

function createScenarioWithTwoSides() {
  return {
    id: "scenario-2",
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
          {
            id: "group-2",
            name: "Blue Reserve",
            symbolOptions: {},
            subUnits: [],
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
            id: "group-3",
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

describe("unitManipulations settings redraw signaling", () => {
  it("updateSideGroup increments settingsStateCounter and updates fields", () => {
    const store = useNewScenarioStore(createScenario());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.updateSideGroup("group-1", {
      name: "Forward Units",
      symbolOptions: { fillColor: "#33AA44" },
    });

    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.sideGroupMap["group-1"].name).toBe("Forward Units");
    expect(store.state.sideGroupMap["group-1"].symbolOptions?.fillColor).toBe("#33AA44");
  });

  it("updateSide increments settingsStateCounter and updates fields", () => {
    const store = useNewScenarioStore(createScenario());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.updateSide("side-1", {
      name: "Blue Force",
      symbolOptions: { fillColor: "#0055FF" },
    });

    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.sideMap["side-1"].name).toBe("Blue Force");
    expect(store.state.sideMap["side-1"].symbolOptions?.fillColor).toBe("#0055FF");
  });

  it("updateSide noUndo path increments settingsStateCounter", () => {
    const store = useNewScenarioStore(createScenario());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.updateSide(
      "side-1",
      {
        symbolOptions: { fillColor: "#AA22AA" },
      },
      { noUndo: true },
    );

    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.sideMap["side-1"].symbolOptions?.fillColor).toBe("#AA22AA");
  });

  it("changeUnitParent clears style cache keys and increments settingsStateCounter", () => {
    clearUnitStyleCache();
    const store = useNewScenarioStore(createScenarioWithTwoSides());
    const actions = useUnitManipulations(store);
    const unit = store.state.unitMap["unit-1"];
    unit._ikey = "cached-style-key";
    unitStyleCache.set("cached-style-key", {} as any);
    unitStyleCache.set("unit-1", {} as any);
    const before = store.state.settingsStateCounter;

    actions.changeUnitParent("unit-1", "group-3", "on");

    expect(unitStyleCache.has("cached-style-key")).toBe(false);
    expect(unitStyleCache.has("unit-1")).toBe(false);
    expect(store.state.unitMap["unit-1"]._ikey).toBeUndefined();
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");
    expect(store.state.unitMap["unit-1"]._gid).toBe("group-3");
  });

  it("changeUnitParent settings redraw signal is undo/redo aware", () => {
    const store = useNewScenarioStore(createScenarioWithTwoSides());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.changeUnitParent("unit-1", "group-3", "on");
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");

    store.undo();
    expect(store.state.settingsStateCounter).toBe(before);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-1");

    store.redo();
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");
  });

  it("changeSideGroupParent clears affected unit cache keys and increments settingsStateCounter", () => {
    clearUnitStyleCache();
    const store = useNewScenarioStore(createScenarioWithTwoSides());
    const actions = useUnitManipulations(store);
    const unit = store.state.unitMap["unit-1"];
    unit._ikey = "cached-style-key";
    unitStyleCache.set("cached-style-key", {} as any);
    unitStyleCache.set("unit-1", {} as any);
    const before = store.state.settingsStateCounter;

    actions.changeSideGroupParent("group-1", "side-2", "on");

    expect(unitStyleCache.has("cached-style-key")).toBe(false);
    expect(unitStyleCache.has("unit-1")).toBe(false);
    expect(store.state.unitMap["unit-1"]._ikey).toBeUndefined();
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");
  });

  it("changeSideGroupParent settings redraw signal is undo/redo aware", () => {
    const store = useNewScenarioStore(createScenarioWithTwoSides());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.changeSideGroupParent("group-1", "side-2", "on");
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");

    store.undo();
    expect(store.state.settingsStateCounter).toBe(before);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-1");

    store.redo();
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");
  });
});
