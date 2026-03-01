// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import ScenarioMapLogic from "@/components/ScenarioMapLogic.vue";

const mocks = vi.hoisted(() => ({
  drawUnitsSpy: vi.fn(),
  updateUnitPositionsSpy: vi.fn(),
  clearUnitStyleCacheSpy: vi.fn(),
  drawHistorySpy: vi.fn(),
  drawRangeRingsSpy: vi.fn(),
  redrawSelectedUnitsSpy: vi.fn(),
  injectedScenario: null as any,
  hoveredFeatures: { value: [] as any[] },
  hoveredPixel: { value: null as number[] | null },
}));

vi.mock("pinia", () => ({
  storeToRefs: (store: any) => store,
}));

vi.mock("@/utils", () => ({
  injectStrict: () => mocks.injectedScenario,
}));

vi.mock("@/composables/geoUnitLayers", () => ({
  calculateZoomToResolution: vi.fn(),
  useMapDrop: () => ({ isDragging: ref(false), formattedPosition: ref("") }),
  useMoveInteraction: () => ({ moveInteraction: { setActive: vi.fn() } }),
  useRotateInteraction: () => ({ rotateInteraction: { setActive: vi.fn() } }),
  useUnitLayer: () => ({
    unitLayer: {
      getSource: () => ({
        getExtent: () => undefined,
        isEmpty: () => true,
      }),
    },
    drawUnits: mocks.drawUnitsSpy,
    updateUnitPositions: mocks.updateUnitPositionsSpy,
    labelLayer: {},
  }),
  useUnitSelectInteraction: () => ({
    unitSelectInteraction: {},
    boxSelectInteraction: {},
    redraw: mocks.redrawSelectedUnitsSpy,
  }),
}));

vi.mock("@/stores/uiStore", () => ({
  useUiStore: () => ({
    showLeftPanel: ref(false),
    layersPanelActive: ref(false),
  }),
  useWidthStore: () => ({
    orbatPanelWidth: ref(0),
    detailsWidth: ref(0),
  }),
}));

vi.mock("@/stores/geoStore", () => ({
  useGeoStore: () => ({ olMap: undefined, zoomToBbox: vi.fn() }),
  useMeasurementsStore: () => ({ measurementUnit: ref("metric") }),
  useUnitSettingsStore: () => ({
    moveUnitEnabled: ref(false),
    rotateUnitEnabled: ref(false),
    showHistory: ref(false),
    editHistory: ref(false),
    showWaypointTimestamps: ref(false),
  }),
}));

vi.mock("@/stores/settingsStore", () => ({
  useSettingsStore: () => ({ orbatIconSize: ref(20) }),
  useSymbolSettingsStore: () => ({ simpleStatusModifier: ref(false) }),
}));

vi.mock("@/stores/mapSettingsStore", () => ({
  useMapSettingsStore: () => ({
    coordinateFormat: ref("dd"),
    showLocation: ref(false),
    showScaleLine: ref(false),
  }),
}));

vi.mock("@/stores/mapSelectStore", () => ({
  useMapSelectStore: () => ({
    unitSelectEnabled: ref(true),
    featureSelectEnabled: ref(true),
    hoverEnabled: ref(true),
  }),
}));

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    selectedFeatureIds: ref(new Set<string>()),
    selectedUnitIds: ref(new Set<string>()),
    activeScenarioEventId: ref(""),
    activeMapLayerId: ref(""),
    showScenarioInfo: ref(false),
  }),
}));

vi.mock("@vueuse/core", () => ({
  useBreakpoints: () => ({
    smallerOrEqual: () => ref(false),
  }),
  useTimeoutFn: (cb: () => void, delay: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return {
      start: () => {
        timer = setTimeout(cb, delay);
      },
      stop: () => {
        if (timer) clearTimeout(timer);
        timer = null;
      },
    };
  },
  breakpointsTailwind: {},
}));

vi.mock("@/modules/scenarioeditor/scenarioMapLayers", () => ({
  useScenarioMapLayers: () => ({ initializeFromStore: vi.fn() }),
}));

vi.mock("@/modules/scenarioeditor/scenarioFeatureLayers", () => ({
  useScenarioFeatureLayers: () => ({ initializeFeatureLayersFromStore: vi.fn() }),
}));

vi.mock("@/modules/scenarioeditor/featureLayerUtils", () => ({
  useScenarioFeatureSelect: () => ({ selectInteraction: {} }),
}));

vi.mock("@/composables/geoHover", () => ({
  provideMapHover: vi.fn(),
  useMapHover: () => ({
    features: mocks.hoveredFeatures,
    pixel: mocks.hoveredPixel,
    isMatch: ref(false),
    allFeatures: ref([]),
  }),
}));

vi.mock("@/composables/openlayersHelpers", () => ({
  saveMapAsPng: vi.fn(),
  useOlEvent: vi.fn(),
}));

vi.mock("@/composables/geoShowLocation", () => ({
  useShowLocationControl: vi.fn(),
}));

vi.mock("@/composables/geoScaleLine", () => ({
  useShowScaleLine: vi.fn(),
}));

vi.mock("@/composables/geoRangeRings", () => ({
  useRangeRingsLayer: () => ({
    rangeLayer: {},
    drawRangeRings: mocks.drawRangeRingsSpy,
  }),
}));

vi.mock("@/composables/geoUnitHistory", () => ({
  useUnitHistory: () => ({
    historyLayer: {},
    drawHistory: mocks.drawHistorySpy,
    historyModify: {},
    waypointSelect: {},
    ctrlClickInteraction: {},
  }),
}));

vi.mock("@/composables/geoDayNight", () => ({
  useDayNightLayer: () => ({}),
}));

vi.mock("@/modules/scenarioeditor/scenarioEvents", () => ({
  useScenarioEvents: () => ({}),
}));

vi.mock("@/composables/searchActions", () => ({
  useSearchActions: () => ({ onScenarioAction: vi.fn() }),
}));

vi.mock("@/geo/unitStyles", () => ({
  clearUnitStyleCache: mocks.clearUnitStyleCacheSpy,
}));

vi.mock("ol/layer/Group", () => ({
  default: class LayerGroup {
    set() {}
    on() {
      return {};
    }
  },
}));

describe("ScenarioMapLogic", () => {
  it("redraws units when settingsStateCounter changes", async () => {
    mocks.hoveredFeatures.value = [];
    mocks.hoveredPixel.value = null;
    mocks.drawUnitsSpy.mockClear();
    mocks.updateUnitPositionsSpy.mockClear();
    mocks.clearUnitStyleCacheSpy.mockClear();
    mocks.drawHistorySpy.mockClear();
    mocks.drawRangeRingsSpy.mockClear();
    mocks.redrawSelectedUnitsSpy.mockClear();

    const settingsCounter = ref(0);
    const featureCounter = ref(0);
    const unitStateCounter = ref(0);
    const currentTime = ref(0);
    mocks.injectedScenario = {
      geo: { everyVisibleUnit: ref([]) },
      store: {
        state: {
          get settingsStateCounter() {
            return settingsCounter.value;
          },
          get featureStateCounter() {
            return featureCounter.value;
          },
          get unitStateCounter() {
            return unitStateCounter.value;
          },
          get currentTime() {
            return currentTime.value;
          },
          boundingBox: null,
        },
      },
    };

    const olMap = {
      addLayer: vi.fn(),
      addInteraction: vi.fn(),
      getView: () => ({ fit: vi.fn() }),
    } as any;

    mount(ScenarioMapLogic, {
      props: { olMap },
    });

    const drawUnitsBefore = mocks.drawUnitsSpy.mock.calls.length;
    const clearBefore = mocks.clearUnitStyleCacheSpy.mock.calls.length;

    settingsCounter.value++;
    await nextTick();

    expect(mocks.drawUnitsSpy.mock.calls.length).toBe(drawUnitsBefore + 1);
    expect(mocks.clearUnitStyleCacheSpy.mock.calls.length).toBe(clearBefore + 1);
  });

  it("incrementally updates unit positions when unitStateCounter changes", async () => {
    mocks.hoveredFeatures.value = [];
    mocks.hoveredPixel.value = null;
    mocks.drawUnitsSpy.mockClear();
    mocks.updateUnitPositionsSpy.mockClear();
    mocks.clearUnitStyleCacheSpy.mockClear();
    mocks.drawHistorySpy.mockClear();
    mocks.drawRangeRingsSpy.mockClear();
    mocks.redrawSelectedUnitsSpy.mockClear();

    const settingsCounter = ref(0);
    const featureCounter = ref(0);
    const unitStateCounter = ref(0);
    const currentTime = ref(0);
    mocks.injectedScenario = {
      geo: { everyVisibleUnit: ref([]) },
      store: {
        state: {
          get settingsStateCounter() {
            return settingsCounter.value;
          },
          get featureStateCounter() {
            return featureCounter.value;
          },
          get unitStateCounter() {
            return unitStateCounter.value;
          },
          get currentTime() {
            return currentTime.value;
          },
          boundingBox: null,
        },
      },
    };

    const olMap = {
      addLayer: vi.fn(),
      addInteraction: vi.fn(),
      getView: () => ({ fit: vi.fn() }),
    } as any;

    mount(ScenarioMapLogic, {
      props: { olMap },
    });

    const updateBefore = mocks.updateUnitPositionsSpy.mock.calls.length;
    const historyBefore = mocks.drawHistorySpy.mock.calls.length;
    const rangeBefore = mocks.drawRangeRingsSpy.mock.calls.length;
    const selectedBefore = mocks.redrawSelectedUnitsSpy.mock.calls.length;

    unitStateCounter.value++;
    await nextTick();

    expect(mocks.updateUnitPositionsSpy.mock.calls.length).toBe(updateBefore + 1);
    expect(mocks.drawHistorySpy.mock.calls.length).toBe(historyBefore + 1);
    expect(mocks.drawRangeRingsSpy.mock.calls.length).toBe(rangeBefore + 1);
    expect(mocks.redrawSelectedUnitsSpy.mock.calls.length).toBe(selectedBefore + 1);
  });

  it("shows hover tooltip for top-most named scenario feature", async () => {
    vi.useFakeTimers();
    mocks.hoveredFeatures.value = [{ getId: () => "feature-1" }];
    mocks.hoveredPixel.value = [100, 200];
    mocks.injectedScenario = {
      geo: {
        everyVisibleUnit: ref([]),
        getFeatureById: vi.fn(() => ({ feature: { meta: { name: "Bridge Alpha" } } })),
      },
      store: {
        state: {
          settingsStateCounter: 0,
          featureStateCounter: 0,
          unitStateCounter: 0,
          currentTime: 0,
          boundingBox: null,
        },
      },
    };

    const olMap = {
      addLayer: vi.fn(),
      addInteraction: vi.fn(),
      getView: () => ({ fit: vi.fn() }),
    } as any;
    const wrapper = mount(ScenarioMapLogic, {
      props: { olMap },
    });

    vi.advanceTimersByTime(200);
    await nextTick();
    const tooltip = wrapper.find("[data-test='hover-feature-tooltip']");
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toBe("Bridge Alpha");
    vi.useRealTimers();
  });

  it("hides tooltip when hovered feature name is empty", () => {
    vi.useFakeTimers();
    mocks.hoveredFeatures.value = [{ getId: () => "feature-empty" }];
    mocks.hoveredPixel.value = [100, 200];
    mocks.injectedScenario = {
      geo: {
        everyVisibleUnit: ref([]),
        getFeatureById: vi.fn(() => ({ feature: { meta: { name: "" } } })),
      },
      store: {
        state: {
          settingsStateCounter: 0,
          featureStateCounter: 0,
          unitStateCounter: 0,
          currentTime: 0,
          boundingBox: null,
        },
      },
    };

    const olMap = {
      addLayer: vi.fn(),
      addInteraction: vi.fn(),
      getView: () => ({ fit: vi.fn() }),
    } as any;
    const wrapper = mount(ScenarioMapLogic, {
      props: { olMap },
    });

    vi.advanceTimersByTime(200);
    expect(wrapper.find("[data-test='hover-feature-tooltip']").exists()).toBe(false);
    vi.useRealTimers();
  });

  it("uses first named scenario feature when non-scenario and unnamed hits overlap", async () => {
    vi.useFakeTimers();
    mocks.hoveredFeatures.value = [
      { getId: () => "unit-1" },
      { getId: () => "feature-empty" },
      { getId: () => "feature-1" },
    ];
    mocks.hoveredPixel.value = [100, 200];
    mocks.injectedScenario = {
      geo: {
        everyVisibleUnit: ref([]),
        getFeatureById: vi.fn((id: string) => {
          if (id === "feature-empty") return { feature: { meta: { name: "" } } };
          if (id === "feature-1") return { feature: { meta: { name: "Bridge Alpha" } } };
          return { feature: undefined };
        }),
      },
      store: {
        state: {
          settingsStateCounter: 0,
          featureStateCounter: 0,
          unitStateCounter: 0,
          currentTime: 0,
          boundingBox: null,
        },
      },
    };

    const olMap = {
      addLayer: vi.fn(),
      addInteraction: vi.fn(),
      getView: () => ({ fit: vi.fn() }),
    } as any;
    const wrapper = mount(ScenarioMapLogic, {
      props: { olMap },
    });

    vi.advanceTimersByTime(200);
    await nextTick();
    const tooltip = wrapper.find("[data-test='hover-feature-tooltip']");
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toBe("Bridge Alpha");
    vi.useRealTimers();
  });
});
