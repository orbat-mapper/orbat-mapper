import { describe, it, expect, vi } from "vitest";
import { useScenarioIO } from "./io";
import type { NewScenarioStore, ScenarioState } from "./newScenarioStore";
import { shallowRef } from "vue";
import { useNewScenarioStore } from "./newScenarioStore";
import { updateCurrentUnitState } from "./time";

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
    layers: [],
    mapLayers: [],

    // key maps
    sideMap: {},
    sideGroupMap: {},
    unitMap: {},
    eventMap: {},
    featureMap: {},
    layerMap: {},
    mapLayerMap: {},
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

    ...overrides,
  } as unknown as ScenarioState;
}

describe("Scenario IO", () => {
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
});
