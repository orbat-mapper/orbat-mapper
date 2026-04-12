import { describe, it, expect, vi } from "vitest";
import { createEmptyScenario, useScenarioIO } from "./io";
import type { NewScenarioStore, ScenarioState } from "./newScenarioStore";
import { shallowRef } from "vue";
import { useNewScenarioStore } from "./newScenarioStore";
import { updateCurrentUnitState } from "./time";
import "@/dayjs";

// Mock the stores that might be used
vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525" }),
}));

function createMinimalState(overrides: Partial<ScenarioState> = {}): ScenarioState {
  return {
    id: "test-id",
    meta: { createdDate: "2024-01-01", lastModifiedDate: "2024-01-01" },
    currentTime: 0,
    info: {
      name: "Test Scenario",
      description: "",
      startTime: 0,
      timeZone: "UTC",
      symbologyStandard: "2525",
    },
    sides: [],
    events: [],
    layerStack: [],

    // key maps
    sideMap: {},
    sideGroupMap: {},
    unitMap: {},
    eventMap: {},
    layerItemMap: {},
    layerStackMap: {},
    equipmentMap: {},
    personnelMap: {},
    supplyCategoryMap: {},
    supplyClassMap: {},
    supplyUomMap: {},
    rangeRingGroupMap: {},
    unitStatusMap: {},
    symbolFillColorMap: {},
    customSymbolMap: {},

    mapSettings: {},
    boundingBox: null,

    // counters
    unitStateCounter: 0,
    featureStateCounter: 0,
    settingsStateCounter: 0,
    rangeRingStateCounter: 0,

    ...overrides,
  } as unknown as ScenarioState;
}

function getOverlayLayers(scenario: { layerStack: any[] }) {
  return scenario.layerStack.filter((layer) => layer.kind === "overlay");
}

describe("Scenario IO", () => {
  it("creates empty scenarios with items[] layers", () => {
    const scenario = createEmptyScenario();

    expect(scenario.version).toBe("3.1.0");
    expect(getOverlayLayers(scenario)[0]).toHaveProperty("items");
    expect(getOverlayLayers(scenario)[0]).not.toHaveProperty("features");
    expect((getOverlayLayers(scenario)[0] as any).items).toEqual([]);
  });

  it("loads geometry items[] into the same normalized store state as legacy features[]", () => {
    const feature = {
      type: "Feature",
      id: "feature-1",
      geometry: { type: "Point", coordinates: [10, 60] },
      properties: { title: "Feature properties" },
      meta: { type: "Point", name: "HQ", description: "Feature description" },
      style: { showLabel: true, title: "HQ" },
      state: [
        {
          id: "state-1",
          t: "2025-01-01T01:00:00Z",
          geometry: { type: "Point", coordinates: [11, 61] },
        },
      ],
    };
    const baseScenario = {
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "3.0.0",
      name: "Scenario",
      startTime: "2025-01-01T00:00:00Z",
      timeZone: "UTC",
      sides: [],
      events: [],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    };

    const legacyStore = useNewScenarioStore({
      ...baseScenario,
      layers: [{ id: "layer-1", name: "Features", features: [feature] }],
    } as any);
    const itemsStore = useNewScenarioStore({
      ...baseScenario,
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            {
              ...feature,
              kind: "geometry",
              state: [
                {
                  id: "state-1",
                  t: "2025-01-01T01:00:00Z",
                  patch: {
                    geometry: { type: "Point", coordinates: [11, 61] },
                  },
                },
              ],
            },
          ],
        },
      ],
    } as any);

    expect(
      "items" in itemsStore.state.layerStackMap["layer-1"]
        ? itemsStore.state.layerStackMap["layer-1"].items
        : undefined,
    ).toEqual(
      "items" in legacyStore.state.layerStackMap["layer-1"]
        ? legacyStore.state.layerStackMap["layer-1"].items
        : undefined,
    );
    expect(itemsStore.state.layerItemMap["feature-1"]).toEqual(
      legacyStore.state.layerItemMap["feature-1"],
    );
  });

  it("serializes geometry features as geometry items[] with the current scenario version", () => {
    const feature = {
      type: "Feature",
      id: "feature-1",
      geometry: { type: "Point", coordinates: [10, 60] },
      properties: { title: "Feature properties" },
      meta: { type: "Point", name: "HQ", description: "Feature description" },
      style: { showLabel: true, title: "HQ" },
      state: [
        {
          id: "state-1",
          t: "2025-01-01T01:00:00Z",
          geometry: { type: "Point", coordinates: [11, 61] },
        },
      ],
    };
    const store = useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "3.0.0",
      name: "Scenario",
      startTime: "2025-01-01T00:00:00Z",
      timeZone: "UTC",
      sides: [],
      events: [],
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            {
              ...feature,
              kind: "geometry",
              state: [
                {
                  id: "state-1",
                  t: "2025-01-01T01:00:00Z",
                  patch: {
                    geometry: { type: "Point", coordinates: [11, 61] },
                  },
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

    const storeRef = shallowRef(store);
    const { serializeToObject } = useScenarioIO(storeRef);
    const serialized = serializeToObject();

    expect(serialized.version).toBe("3.1.0");
    expect(getOverlayLayers(serialized)[0]).not.toHaveProperty("features");
    expect(getOverlayLayers(serialized)[0].items).toEqual([
      {
        ...feature,
        kind: "geometry",
        state: [
          {
            id: "state-1",
            t: "2025-01-01T01:00:00Z",
            patch: {
              geometry: { type: "Point", coordinates: [11, 61] },
            },
          },
        ],
      },
    ]);
  });

  it("does not serialize empty geometry item state arrays", () => {
    const store = useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "3.0.0",
      name: "Scenario",
      startTime: "2025-01-01T00:00:00Z",
      timeZone: "UTC",
      sides: [],
      events: [],
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            {
              kind: "geometry",
              type: "Feature",
              id: "feature-1",
              geometry: { type: "Point", coordinates: [10, 60] },
              properties: {},
              meta: { type: "Point", name: "HQ" },
              style: {},
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

    const storeRef = shallowRef(store);
    const { serializeToObject } = useScenarioIO(storeRef);
    const serialized = serializeToObject();
    const firstItem = getOverlayLayers(serialized)[0]?.items?.[0];

    expect(firstItem).toBeDefined();
    expect(firstItem).not.toHaveProperty("state");
  });

  it("serializes bounding box correctly", () => {
    const state = createMinimalState({
      boundingBox: [10, 20, 30, 40],
    });

    const store = { state } as NewScenarioStore;
    const storeRef = shallowRef(store);
    const { toObject } = useScenarioIO(storeRef);
    const serialized = toObject();

    expect(serialized.settings?.boundingBox).toEqual([10, 20, 30, 40]);
  });

  it("handles null bounding box by converting to undefined", () => {
    const state = createMinimalState({
      boundingBox: null,
    });

    const store = { state } as NewScenarioStore;
    const storeRef = shallowRef(store);
    const { toObject } = useScenarioIO(storeRef);
    const serialized = toObject();

    expect(serialized.settings?.boundingBox).toBeUndefined();
  });

  it("serializes symbolRotation in unit state", () => {
    const sideId = "side-1";
    const groupId = "group-1";
    const unitId = "unit-1";
    const state = createMinimalState({
      sides: [sideId],
      sideMap: {
        [sideId]: {
          id: sideId,
          name: "Side",
          standardIdentity: "3",
          groups: [groupId],
          subUnits: [],
        },
      },
      sideGroupMap: {
        [groupId]: { id: groupId, name: "Group", subUnits: [unitId], _pid: sideId },
      },
      unitMap: {
        [unitId]: {
          id: unitId,
          name: "Unit",
          sidc: "10031000000000000000",
          subUnits: [],
          _pid: groupId,
          _gid: groupId,
          _sid: sideId,
          state: [{ id: "state-1", t: 0, symbolRotation: 135 }],
          _state: { t: 0, sidc: "10031000000000000000", symbolRotation: 135 },
        },
      },
    });

    const store = { state } as NewScenarioStore;
    const storeRef = shallowRef(store);
    const { toObject } = useScenarioIO(storeRef);
    const serialized = toObject();
    const savedRotation =
      serialized.sides[0].groups[0].subUnits[0].state?.[0]?.symbolRotation;

    expect(savedRotation).toBe(135);
  });

  it("serializes reinforcedStatus in unit state", () => {
    const sideId = "side-1";
    const groupId = "group-1";
    const unitId = "unit-1";
    const state = createMinimalState({
      sides: [sideId],
      sideMap: {
        [sideId]: {
          id: sideId,
          name: "Side",
          standardIdentity: "3",
          groups: [groupId],
          subUnits: [],
        },
      },
      sideGroupMap: {
        [groupId]: { id: groupId, name: "Group", subUnits: [unitId], _pid: sideId },
      },
      unitMap: {
        [unitId]: {
          id: unitId,
          name: "Unit",
          sidc: "10031000000000000000",
          subUnits: [],
          _pid: groupId,
          _gid: groupId,
          _sid: sideId,
          state: [{ id: "state-1", t: 0, reinforcedStatus: "Reduced" }],
          _state: { t: 0, sidc: "10031000000000000000", reinforcedStatus: "Reduced" },
        },
      },
    });

    const store = { state } as NewScenarioStore;
    const storeRef = shallowRef(store);
    const { toObject } = useScenarioIO(storeRef);
    const serialized = toObject();
    const savedReinforcedStatus =
      serialized.sides[0].groups[0].subUnits[0].state?.[0]?.reinforcedStatus;

    expect(savedReinforcedStatus).toBe("Reduced");
  });

  it("loads symbolRotation and applies it for matching timestamps", () => {
    const scenario = {
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "2.3.0",
      name: "Scenario",
      startTime: "2025-01-01T00:00:00Z",
      sides: [
        {
          id: "side-1",
          name: "Side",
          standardIdentity: "3",
          groups: [
            {
              id: "group-1",
              name: "Group",
              subUnits: [
                {
                  id: "unit-1",
                  name: "Unit",
                  sidc: "10031000000000000000",
                  location: [10, 60],
                  state: [
                    { id: "s1", t: "2025-01-01T01:00:00Z", symbolRotation: 45 },
                    { id: "s2", t: "2025-01-01T02:00:00Z", symbolRotation: 180 },
                  ],
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

    const store = useNewScenarioStore(scenario);
    const unit = store.state.unitMap["unit-1"];

    updateCurrentUnitState(unit, +new Date("2025-01-01T01:30:00Z"));
    expect(unit._state?.symbolRotation).toBe(45);

    updateCurrentUnitState(unit, +new Date("2025-01-01T02:30:00Z"));
    expect(unit._state?.symbolRotation).toBe(180);
  });

  it("loads reinforcedStatus and applies it for matching timestamps", () => {
    const scenario = {
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "2.3.0",
      name: "Scenario",
      startTime: "2025-01-01T00:00:00Z",
      sides: [
        {
          id: "side-1",
          name: "Side",
          standardIdentity: "3",
          groups: [
            {
              id: "group-1",
              name: "Group",
              subUnits: [
                {
                  id: "unit-1",
                  name: "Unit",
                  sidc: "10031000000000000000",
                  location: [10, 60],
                  reinforcedStatus: "Reinforced",
                  state: [
                    { id: "s1", t: "2025-01-01T01:00:00Z", reinforcedStatus: "Reduced" },
                    {
                      id: "s2",
                      t: "2025-01-01T02:00:00Z",
                      reinforcedStatus: "None",
                    },
                  ],
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

    const store = useNewScenarioStore(scenario);
    const unit = store.state.unitMap["unit-1"];

    updateCurrentUnitState(unit, +new Date("2025-01-01T01:30:00Z"));
    expect(unit._state?.reinforcedStatus).toBe("Reduced");

    updateCurrentUnitState(unit, +new Date("2025-01-01T02:30:00Z"));
    expect(unit._state?.reinforcedStatus).toBe("None");
  });

  it("round-trips timed hierarchy state", () => {
    const scenario = {
      id: "scenario-hierarchy",
      type: "ORBAT-mapper",
      version: "2.5.0",
      name: "Scenario",
      startTime: "2025-01-01T00:00:00Z",
      sides: [
        {
          id: "side-1",
          name: "Side",
          standardIdentity: "3",
          groups: [
            {
              id: "group-1",
              name: "Group",
              subUnits: [
                {
                  id: "unit-1",
                  name: "Unit",
                  sidc: "10031000000000000000",
                  state: [
                    {
                      id: "s1",
                      t: "2025-01-01T01:00:00Z",
                      hierarchy: { targetId: "group-1", placement: "on" },
                    },
                  ],
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
        symbolFillColors: [],
      },
    } as any;

    const store = useNewScenarioStore(scenario);
    const storeRef = shallowRef(store);
    const { toObject } = useScenarioIO(storeRef);
    const serialized = toObject();

    expect(serialized.sides[0].groups[0].subUnits[0].state?.[0]?.hierarchy).toEqual({
      targetId: "group-1",
      placement: "on",
    });
  });
});
