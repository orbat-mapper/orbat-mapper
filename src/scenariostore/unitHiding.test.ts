import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import { serializeUnit } from "@/scenariostore/io";
import { useUnitActions } from "@/composables/scenarioActions";
import { UnitActions } from "@/types/constants";
import type { TScenario } from "@/scenariostore";

function createScenario({ hidden = false } = {}) {
  return {
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "2.7.0",
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
                id: "parent",
                name: "Parent",
                sidc: "10031000000000000000",
                location: [10, 60],
                ...(hidden ? { isHidden: true } : {}),
                subUnits: [
                  {
                    id: "child",
                    name: "Child",
                    sidc: "10031000000000000000",
                    location: [11, 61],
                    subUnits: [],
                  },
                ],
              },
              {
                id: "other",
                name: "Other",
                sidc: "10031000000000000000",
                location: [12, 62],
                subUnits: [],
              },
            ],
          },
        ],
      },
    ],
    events: [],
    layers: [],
    mapLayers: [],
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
      symbolFillColors: [],
    },
  } as any;
}

function visibleIds(geo: ReturnType<typeof useGeo>) {
  return geo.everyVisibleUnit.value.map((u) => u.id).sort();
}

describe("per-unit hiding", () => {
  it("hides only the unit itself, not its subordinates", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);
    const actions = useUnitManipulations(store);

    actions.setUnitsHidden(["parent"], true);

    expect(visibleIds(geo)).toEqual(["child", "other"]);
    expect(actions.isUnitHidden("parent")).toBe(true);
    expect(actions.isUnitHidden("child")).toBe(false);
  });

  it("hides several units in a single undo step and bumps the redraw counter", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);
    const actions = useUnitManipulations(store);
    const before = store.state.unitStateCounter;

    actions.setUnitsHidden(["parent", "other"], true);
    expect(visibleIds(geo)).toEqual(["child"]);
    expect(store.state.unitStateCounter).toBe(before + 1);

    store.undo();
    expect(visibleIds(geo)).toEqual(["child", "other", "parent"]);
    expect(store.state.unitMap["parent"].isHidden).toBeUndefined();
    expect(store.state.unitMap["other"].isHidden).toBeUndefined();

    store.redo();
    expect(visibleIds(geo)).toEqual(["child"]);
  });

  it("removes the flag when showing and skips no-op updates", () => {
    const store = useNewScenarioStore(createScenario({ hidden: true }));
    const actions = useUnitManipulations(store);

    actions.setUnitsHidden(["parent"], false);
    expect(store.state.unitMap["parent"]).not.toHaveProperty("isHidden");
    expect(store.canUndo.value).toBe(true);

    store.undo();
    expect(store.canUndo.value).toBe(false);
    actions.setUnitsHidden(["parent"], true);
    expect(store.canUndo.value).toBe(false);
  });

  it("loads and saves the flag with the scenario", () => {
    const store = useNewScenarioStore(createScenario({ hidden: true }));
    const geo = useGeo(store);

    expect(visibleIds(geo)).toEqual(["child", "other"]);
    const serialized = serializeUnit("parent", store.state);
    expect(serialized.isHidden).toBe(true);
    expect(serialized.subUnits?.[0].isHidden).toBeUndefined();
  });
});

describe("hide/show unit actions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setup() {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);
    const activeScenario = {
      store,
      geo,
      unitActions: useUnitManipulations(store),
    } as unknown as TScenario;
    const { onUnitAction } = useUnitActions({ activeScenario });
    return { store, geo, onUnitAction };
  }

  it("hides a unit together with its subordinates in one undo step", () => {
    const { store, geo, onUnitAction } = setup();

    onUnitAction(store.state.unitMap["parent"], UnitActions.HideWithSubordinates);
    expect(visibleIds(geo)).toEqual(["other"]);
    expect(store.state.unitMap["child"].isHidden).toBe(true);

    store.undo();
    expect(visibleIds(geo)).toEqual(["child", "other", "parent"]);
  });

  it("shows a unit together with its subordinates", () => {
    const { store, geo, onUnitAction } = setup();
    onUnitAction(store.state.unitMap["parent"], UnitActions.HideWithSubordinates);

    onUnitAction(store.state.unitMap["parent"], UnitActions.ShowWithSubordinates);
    expect(visibleIds(geo)).toEqual(["child", "other", "parent"]);
  });

  it("hides only the given unit with the plain hide action", () => {
    const { store, geo, onUnitAction } = setup();

    onUnitAction([store.state.unitMap["parent"]], UnitActions.Hide);
    expect(visibleIds(geo)).toEqual(["child", "other"]);
  });
});

describe("everyVisibleUnit", () => {
  it("keeps the same array while the same units stay visible", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);
    const actions = useUnitManipulations(store);
    const visible = geo.everyVisibleUnit.value;

    store.state.unitMap["other"]._state = {
      ...store.state.unitMap["other"]._state!,
      location: [13, 63],
    };
    expect(geo.everyVisibleUnit.value).toBe(visible);

    actions.setUnitsHidden(["other"], true);
    expect(visibleIds(geo)).toEqual(["child", "parent"]);
  });

  it("includes a unit once it gets its first position", () => {
    const scenario = createScenario();
    delete scenario.sides[0].groups[0].subUnits[1].location;
    const store = useNewScenarioStore(scenario);
    const geo = useGeo(store);
    expect(visibleIds(geo)).toEqual(["child", "parent"]);

    geo.addUnitPosition("other", [12, 62]);

    expect(visibleIds(geo)).toEqual(["child", "other", "parent"]);
  });
});
