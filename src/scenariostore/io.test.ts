import { describe, it, expect, vi } from "vitest";
import { useScenarioIO } from "./io";
import type { NewScenarioStore, ScenarioState } from "./newScenarioStore";
import { shallowRef } from "vue";

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
});
