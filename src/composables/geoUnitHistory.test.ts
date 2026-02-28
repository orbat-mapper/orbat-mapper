// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useUnitHistory } from "@/composables/geoUnitHistory";

const mocks = vi.hoisted(() => {
  const addUnitPositionSpy = vi.fn();
  const updateUnitStateSpy = vi.fn();
  const getUnitByIdSpy = vi.fn(() => ({ id: "unit-1", state: [{ t: 10 }] }));
  const source = {
    clear: vi.fn(),
    addFeatures: vi.fn(),
    getFeatureById: vi.fn(),
  };
  const createVectorLayer = () => ({
    getSource: () => source,
    set: vi.fn(),
    setOpacity: vi.fn(),
    setVisible: vi.fn(),
  });
  const layers = {
    waypointLayer: createVectorLayer(),
    historyLayer: createVectorLayer(),
    legLayer: createVectorLayer(),
    viaLayer: createVectorLayer(),
    arcLayer: createVectorLayer(),
    labelsLayer: createVectorLayer(),
  };
  const selectedFeatures = {
    clear: vi.fn(),
    push: vi.fn(() => 1),
  };

  class MockModify {
    handlers: Record<string, (evt: any) => void> = {};
    on(types: string[], cb: (evt: any) => void) {
      for (const type of types) this.handlers[type] = cb;
      return { un: vi.fn() };
    }
    emit(type: string, evt: any) {
      this.handlers[type]?.({ ...evt, type });
    }
    setActive = vi.fn();
  }

  class MockSelect {
    handlers: Record<string, (evt: any) => void> = {};
    on(type: string, cb: (evt: any) => void) {
      this.handlers[type] = cb;
      return { un: vi.fn() };
    }
    getFeatures() {
      return selectedFeatures;
    }
    setActive = vi.fn();
  }

  class MockCtrlClick {
    setActive = vi.fn();
  }

  return {
    addUnitPositionSpy,
    updateUnitStateSpy,
    getUnitByIdSpy,
    layers,
    selectedFeatures,
    MockModify,
    MockSelect,
    MockCtrlClick,
  };
});

vi.mock("@/utils", () => ({
  injectStrict: () => ({
    geo: {
      addUnitPosition: mocks.addUnitPositionSpy,
    },
    unitActions: {
      getUnitById: mocks.getUnitByIdSpy,
      updateUnitStateVia: vi.fn(),
      deleteUnitStateEntry: vi.fn(),
      updateUnitState: mocks.updateUnitStateSpy,
    },
    store: {
      onUndoRedo: vi.fn(),
      state: {
        info: {
          timeZone: "UTC",
        },
      },
    },
    helpers: {
      getUnitById: mocks.getUnitByIdSpy,
    },
  }),
}));

vi.mock("@/components/injects", () => ({
  activeScenarioKey: Symbol("activeScenario"),
}));

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    selectedUnitIds: ref(new Set<string>()),
  }),
}));

vi.mock("@/stores/selectedWaypoints", () => ({
  useSelectedWaypoints: () => ({
    selectedWaypointIds: ref(new Set<string>()),
  }),
}));

vi.mock("@/stores/timeFormatStore", () => ({
  useTimeFormatStore: () => ({
    trackFormatter: { format: vi.fn(() => "10:00") },
  }),
}));

vi.mock("@/geo/history", () => ({
  VIA_TIME: -1337,
  labelStyle: { getText: () => ({ setText: vi.fn() }) },
  selectedWaypointStyle: {},
  createUnitHistoryLayers: () => mocks.layers,
  createUnitPathFeatures: () => ({
    legFeatures: [],
    waypointFeatures: [],
    viaPointFeatures: [],
    arcFeatures: [],
  }),
}));

vi.mock("ol/interaction/Modify", () => ({
  default: mocks.MockModify,
  ModifyEvent: class {},
}));

vi.mock("ol/interaction/Select", () => ({
  default: mocks.MockSelect,
  SelectEvent: class {},
}));

vi.mock("ol/events/condition", () => ({
  altKeyOnly: vi.fn(() => false),
  click: vi.fn(() => true),
  singleClick: vi.fn(() => true),
}));

vi.mock("@/composables/openlayersHelpers", () => ({
  useOlEvent: vi.fn(),
}));

vi.mock("@/geo/olInteractions", () => ({
  MapCtrlClick: mocks.MockCtrlClick,
}));

vi.mock("ol/proj", () => ({
  toLonLat: (coords: number[]) => coords,
}));

vi.mock("ol/sphere", () => ({
  getDistance: vi.fn(() => 0),
}));

vi.mock("@/utils/convert", () => ({
  convertSpeedToMetric: vi.fn(() => 1),
}));

describe("useUnitHistory", () => {
  it("recomputes unit state on waypoint modifyend but not on modifystart", () => {
    mocks.addUnitPositionSpy.mockClear();
    mocks.updateUnitStateSpy.mockClear();

    const { historyModify } = useUnitHistory({} as any);

    const pointGeometry = {
      getType: () => "Point",
      getCoordinates: () => [10, 20, 30],
    };
    const feature = {
      getGeometry: () => pointGeometry,
      get: (key: string) => (key === "unitId" ? "unit-1" : undefined),
    };
    const mapBrowserEvent = {
      originalEvent: { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false },
    };
    const event = {
      features: {
        item: () => feature,
      },
      mapBrowserEvent,
    };

    (historyModify as any).emit("modifystart", event);
    expect(mocks.updateUnitStateSpy).not.toHaveBeenCalled();

    (historyModify as any).emit("modifyend", event);
    expect(mocks.addUnitPositionSpy).toHaveBeenCalledTimes(1);
    expect(mocks.updateUnitStateSpy).toHaveBeenCalledTimes(1);
    expect(mocks.updateUnitStateSpy).toHaveBeenCalledWith("unit-1");
  });
});
