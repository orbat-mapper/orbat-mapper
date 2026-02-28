import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";

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
});
