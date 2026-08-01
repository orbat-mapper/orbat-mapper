// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useUnitHistory } from "@/composables/geoUnitHistory";

const mocks = vi.hoisted(() => {
  const addUnitPositionSpy = vi.fn();
  const updateUnitStateSpy = vi.fn();
  const updateUnitSpy = vi.fn();
  const updateUnitStateViaSpy = vi.fn();
  const deleteUnitStateEntrySpy = vi.fn();
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
    updateUnitSpy,
    updateUnitStateViaSpy,
    deleteUnitStateEntrySpy,
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
      updateUnitStateVia: mocks.updateUnitStateViaSpy,
      deleteUnitStateEntry: mocks.deleteUnitStateEntrySpy,
      updateUnitState: mocks.updateUnitStateSpy,
      updateUnit: mocks.updateUnitSpy,
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

vi.mock("@/stores/routingStore", () => ({
  useRoutingStore: () => ({
    active: false,
  }),
}));

vi.mock("@/geo/history", () => ({
  VIA_TIME: -1337,
  INITIAL_TIME: Number.MIN_SAFE_INTEGER,
}));

vi.mock("@/geo/engines/openlayers/unitHistoryOl", () => ({
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

const INITIAL_TIME = Number.MIN_SAFE_INTEGER;

// A leg feature as drawn by the history layer: an XYM line string where M is the
// time of each waypoint (INITIAL_TIME for the unit's own location).
function createLegFeature(initialCoordinates: number[][]) {
  let coordinates = initialCoordinates;
  const geometry = {
    getType: () => "LineString",
    getCoordinates: () => coordinates,
    setCoordinates: (updated: number[][]) => {
      coordinates = updated;
    },
    clone: () => {
      const snapshot = coordinates.map((c) => [...c]);
      return { getType: () => "LineString", getCoordinates: () => snapshot };
    },
  };
  return {
    feature: {
      getGeometry: () => geometry,
      get: (key: string) => (key === "unitId" ? "unit-1" : undefined),
    },
    setCoordinates: (updated: number[][]) => {
      coordinates = updated;
    },
  };
}

function createModifyEvent(feature: unknown) {
  return {
    features: { item: () => feature },
    mapBrowserEvent: {
      coordinate: [0, 0],
      originalEvent: { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false },
    },
  };
}

describe("useUnitHistory leg editing", () => {
  beforeEach(() => {
    mocks.addUnitPositionSpy.mockClear();
    mocks.updateUnitSpy.mockClear();
    mocks.updateUnitStateViaSpy.mockClear();
    mocks.deleteUnitStateEntrySpy.mockClear();
    mocks.getUnitByIdSpy.mockReturnValue({
      id: "unit-1",
      state: [{ t: 1000 }],
    } as any);
  });

  it("moves the unit's initial location when the first waypoint is dragged", () => {
    const { historyModify } = useUnitHistory({} as any);
    const leg = createLegFeature([
      [10, 60, INITIAL_TIME],
      [11, 61, 1000],
    ]);
    const event = createModifyEvent(leg.feature);

    (historyModify as any).emit("modifystart", event);
    leg.setCoordinates([
      [12, 62, INITIAL_TIME],
      [11, 61, 1000],
    ]);
    (historyModify as any).emit("modifyend", event);

    // Adding a state entry at INITIAL_TIME instead would make every
    // interpolation start there, pinning the unit to the dragged waypoint.
    expect(mocks.addUnitPositionSpy).not.toHaveBeenCalled();
    expect(mocks.updateUnitSpy).toHaveBeenCalledWith("unit-1", { location: [12, 62] });
  });

  it("updates the state entry when a later waypoint is dragged", () => {
    const { historyModify } = useUnitHistory({} as any);
    const leg = createLegFeature([
      [10, 60, INITIAL_TIME],
      [11, 61, 1000],
    ]);
    const event = createModifyEvent(leg.feature);

    (historyModify as any).emit("modifystart", event);
    leg.setCoordinates([
      [10, 60, INITIAL_TIME],
      [13, 63, 1000],
    ]);
    (historyModify as any).emit("modifyend", event);

    expect(mocks.updateUnitSpy).not.toHaveBeenCalled();
    expect(mocks.addUnitPositionSpy).toHaveBeenCalledWith("unit-1", [13, 63], 1000);
  });

  it("adds a via point when a new vertex is dragged out of a leg", () => {
    const { historyModify } = useUnitHistory({} as any);
    const leg = createLegFeature([
      [10, 60, INITIAL_TIME],
      [11, 61, 1000],
    ]);
    const event = createModifyEvent(leg.feature);

    (historyModify as any).emit("modifystart", event);
    // OpenLayers inserts the new vertex with its M ordinate padded to 0, which
    // is how the leg handler recognises it as a via point.
    leg.setCoordinates([
      [10, 60, INITIAL_TIME],
      [10.5, 60.5, 0],
      [11, 61, 1000],
    ]);
    (historyModify as any).emit("modifyend", event);

    expect(mocks.updateUnitStateViaSpy).toHaveBeenCalledWith(
      "unit-1",
      "add",
      0,
      0,
      [10.5, 60.5],
    );
  });

  it("does not delete a state entry when the initial waypoint is removed", () => {
    const { historyModify } = useUnitHistory({} as any);
    const leg = createLegFeature([
      [10, 60, INITIAL_TIME],
      [11, 61, 1000],
      [12, 62, 2000],
    ]);
    const event = createModifyEvent(leg.feature);

    (historyModify as any).emit("modifystart", event);
    leg.setCoordinates([
      [11, 61, 1000],
      [12, 62, 2000],
    ]);
    (historyModify as any).emit("modifyend", event);

    // There is no state entry for the initial location; a lookup would return
    // -1 and splice(-1, 1) would drop the last waypoint instead.
    expect(mocks.deleteUnitStateEntrySpy).not.toHaveBeenCalled();
  });
});

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
