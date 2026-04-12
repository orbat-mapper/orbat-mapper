// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { computed, defineComponent, h } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScenarioEditorGlobe from "@/modules/globeview/ScenarioEditorGlobe.vue";
import { activeScenarioKey } from "@/components/injects";

const bindScenario = vi.fn();
const cleanupScenarioBinding = vi.fn();
const setMapAdapter = vi.fn();
const initializeBaseLayers = vi.fn();

vi.mock("@/geo/mapLibreMapAdapter", () => ({
  MapLibreMapAdapter: class MockMapLibreMapAdapter {
    constructor(public map: unknown) {}
    setViewConstraints() {}
  },
}));

vi.mock("@/geo/engines/maplibre/mapLibreScenarioLayerController", () => ({
  createMapLibreScenarioLayerController: vi.fn(() => ({
    capabilities: {
      zoomToFeature: true,
      zoomToFeatureSet: true,
      panToFeature: true,
      zoomToScenarioLayer: true,
      zoomToMapLayer: true,
      featureTransform: false,
      mapLayerTransform: false,
      mapLayerExtent: true,
    },
    bindScenario,
    refreshScenarioFeatureLayers: vi.fn(),
    zoomToFeature: vi.fn(),
    zoomToFeatures: vi.fn(),
    panToFeature: vi.fn(),
    zoomToScenarioLayer: vi.fn(),
    zoomToMapLayer: vi.fn(),
    startMapLayerTransform: vi.fn(),
    endMapLayerTransform: vi.fn(),
    onLayerEvent: vi.fn(() => vi.fn()),
  })),
}));

vi.mock("@/stores/baseLayersStore", () => ({
  useBaseLayersStore: () => ({
    layers: [],
    initialize: initializeBaseLayers,
  }),
}));

vi.mock("@/stores/geoStore", () => ({
  useGeoStore: () => ({
    setMapAdapter,
  }),
}));

vi.mock("@/modules/scenarioeditor/useScenarioMapModeController", () => ({
  useScenarioMapModeController: () => ({
    ui: {
      detailsPanelMode: "sidebar",
      showLeftPanel: false,
    },
    isMobile: computed(() => false),
    showLeftPanel: computed(() => false),
    detailsWidth: computed(() => 320),
    showDetailsPanel: computed(() => false),
    openTimeDialog: vi.fn(),
    onIncDay: vi.fn(),
    onDecDay: vi.fn(),
    onShowPlaceSearch: vi.fn(),
    onCloseDetailsPanel: vi.fn(),
    goToNextScenarioEvent: vi.fn(),
    goToPrevScenarioEvent: vi.fn(),
  }),
}));

vi.mock("@/modules/globeview/globeBasemaps", () => ({
  GLOBE_VECTOR_BASEMAP_ID: "vector",
  resolveGlobeBasemap: () => ({
    id: "vector",
    style: { version: 8, sources: {}, layers: [] },
  }),
}));

vi.mock("@/modules/globeview/h3grid", () => ({
  useH3HexGrid: () => ({
    showHexGrid: { value: false },
    hexResolution: { value: 3 },
    autoResolution: { value: true },
    lineColor: { value: "#000000" },
    lineOpacity: { value: 0.5 },
    lineWidth: { value: 1 },
  }),
}));

vi.mock("@/modules/globeview/mgrsgrid", () => ({
  useMgrsGrid: () => ({
    showMgrsGrid: { value: false },
    showLabels: { value: false },
    lineColor: { value: "#000000" },
    lineOpacity: { value: 0.5 },
    lineWidth: { value: 1 },
    currentAccuracy: { value: 0 },
  }),
}));

const MaplibreMapStub = defineComponent({
  name: "MaplibreMap",
  emits: ["ready"],
  setup(_, { emit }) {
    emit("ready", { resize: vi.fn() });
    return () => h("div");
  },
});

describe("ScenarioEditorGlobe", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    bindScenario.mockReset();
    bindScenario.mockReturnValue(cleanupScenarioBinding);
    cleanupScenarioBinding.mockReset();
    setMapAdapter.mockReset();
    initializeBaseLayers.mockReset();
  });

  it("cleans up the scenario binding when the globe view unmounts", () => {
    const wrapper = mount(ScenarioEditorGlobe, {
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioKey as symbol]: {
            store: { state: { id: "scenario-1", mapSettings: {} } },
          },
        },
        stubs: {
          ScenarioMapModeShell: { template: "<div><slot name='map' /></div>" },
          GlobeContextMenu: { template: "<div><slot /></div>" },
          GlobeSearchScenarioActions: true,
          MlMapLogic: true,
          MaplibreMap: MaplibreMapStub,
          ToggleField: true,
          Button: true,
          Label: true,
          Popover: true,
          PopoverContent: true,
          PopoverTrigger: true,
          Slider: true,
        },
      },
    });

    expect(bindScenario).toHaveBeenCalledTimes(1);

    wrapper.unmount();

    expect(cleanupScenarioBinding).toHaveBeenCalledTimes(1);
    expect(setMapAdapter).toHaveBeenLastCalledWith(null);
  });
});
