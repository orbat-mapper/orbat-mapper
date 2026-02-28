// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import ScenarioMapLogic from "@/components/ScenarioMapLogic.vue";

const mocks = vi.hoisted(() => ({
  drawUnitsSpy: vi.fn(),
  clearUnitStyleCacheSpy: vi.fn(),
  drawHistorySpy: vi.fn(),
  drawRangeRingsSpy: vi.fn(),
  redrawSelectedUnitsSpy: vi.fn(),
  injectedScenario: null as any,
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
  useMapHover: vi.fn(),
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
    mocks.drawUnitsSpy.mockClear();
    mocks.clearUnitStyleCacheSpy.mockClear();
    mocks.drawHistorySpy.mockClear();
    mocks.drawRangeRingsSpy.mockClear();
    mocks.redrawSelectedUnitsSpy.mockClear();

    const settingsCounter = ref(0);
    const featureCounter = ref(0);
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
});
