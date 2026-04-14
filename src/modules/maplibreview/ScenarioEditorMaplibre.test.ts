// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick, onMounted } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScenarioEditorMaplibre from "@/modules/maplibreview/ScenarioEditorMaplibre.vue";
import { activeScenarioKey } from "@/components/injects";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

const bindScenario = vi.fn();
const cleanupScenarioBinding = vi.fn();
const setMapAdapter = vi.fn();
const initializeMaplibreLayers = vi.fn();

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

vi.mock("@/stores/maplibreLayersStore", () => ({
  useMaplibreLayersStore: () => ({
    layers: [],
    initialize: initializeMaplibreLayers,
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
      showToolbar: true,
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

vi.mock("@/modules/maplibreview/maplibreBasemaps", () => ({
  MAPLIBRE_VECTOR_BASEMAP_ID: "vector",
  resolveMaplibreBasemap: () => ({
    id: "vector",
    style: { version: 8, sources: {}, layers: [] },
  }),
}));

vi.mock("@/modules/maplibreview/h3grid", () => ({
  useH3HexGrid: () => ({
    showHexGrid: { value: false },
    hexResolution: { value: 3 },
    autoResolution: { value: true },
    lineColor: { value: "#000000" },
    lineOpacity: { value: 0.5 },
    lineWidth: { value: 1 },
  }),
}));

vi.mock("@/modules/maplibreview/mgrsgrid", () => ({
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
    onMounted(() => {
      emit("ready", { resize: vi.fn() });
    });
    return () => h("div");
  },
});

describe("ScenarioEditorMaplibre", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    bindScenario.mockReset();
    bindScenario.mockReturnValue(cleanupScenarioBinding);
    cleanupScenarioBinding.mockReset();
    setMapAdapter.mockReset();
    initializeMaplibreLayers.mockReset();
  });

  it("cleans up the scenario binding when the maplibre view unmounts", () => {
    const wrapper = mount(ScenarioEditorMaplibre, {
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioKey as symbol]: {
            store: { state: { id: "scenario-1", mapSettings: {} } },
          },
        },
        stubs: {
          ScenarioMapModeShell: {
            template:
              "<div><slot name='map' /><slot name='footer-overlays' /><slot name='after-keyboard' /></div>",
          },
          MaplibreContextMenu: { template: "<div><slot /></div>" },
          MaplibreSearchScenarioActions: true,
          MlMapLogic: true,
          MaplibreMap: MaplibreMapStub,
          MapEditorMainToolbar: true,
          MapEditorUnitTrackToolbar: true,
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

  it("shows the shared map toolbar in maplibre mode with unsupported tools disabled", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore();
    toolbarStore.currentToolbar = "measurements";

    const wrapper = mount(ScenarioEditorMaplibre, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            store: { state: { id: "scenario-1", mapSettings: {} } },
          },
        },
        stubs: {
          ScenarioMapModeShell: {
            template:
              "<div><slot name='map' /><slot name='footer-overlays' /><slot name='after-keyboard' /></div>",
          },
          MaplibreContextMenu: { template: "<div><slot /></div>" },
          MaplibreSearchScenarioActions: true,
          MlMapLogic: true,
          MaplibreMap: MaplibreMapStub,
          MapEditorMainToolbar: defineComponent({
            name: "MapEditorMainToolbar",
            props: [
              "canMoveUnits",
              "canRotateUnits",
              "canMeasure",
              "canDraw",
              "canTrack",
              "canAddUnits",
              "locationPickerEventSource",
            ],
            template: "<div data-test='map-toolbar' />",
          }),
          MapEditorUnitTrackToolbar: true,
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

    await nextTick();

    const toolbar = wrapper.getComponent({ name: "MapEditorMainToolbar" });

    expect(toolbar.props("canMoveUnits")).toBe(true);
    expect(toolbar.props("canRotateUnits")).toBe(false);
    expect(toolbar.props("canMeasure")).toBe(false);
    expect(toolbar.props("canDraw")).toBe(false);
    expect(toolbar.props("canTrack")).toBe(true);
    expect(toolbar.props("canAddUnits")).toBe(true);
    expect(toolbar.props("locationPickerEventSource")).toBe("dom");
    expect(toolbarStore.currentToolbar).toBeNull();
  });
});
