// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick, onMounted, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScenarioEditorMaplibre from "@/modules/maplibreview/ScenarioEditorMaplibre.vue";
import { activeLayerKey, activeScenarioKey } from "@/components/injects";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import type { ScenarioMapViewSnapshot } from "@/modules/scenarioeditor/scenarioMapViewSnapshot";

const { mapModeState, routingHandlers, closeDetailsPanelMock } = vi.hoisted(() => ({
  mapModeState: { isMobile: false, hasRouteDetails: false },
  routingHandlers: {
    activeRoutingUnitName: "Unit 1",
    addRouteLeg: vi.fn(),
    clearCurrentLeg: vi.fn(),
    finishRoute: vi.fn(),
    closeRouting: vi.fn(),
    endRouting: vi.fn(),
    handleEscape: vi.fn(),
  },
  closeDetailsPanelMock: vi.fn(),
}));

const bindScenario = vi.fn();
const cleanupScenarioBinding = vi.fn();
const setMapAdapter = vi.fn();
const initializeMaplibreLayers = vi.fn();

vi.mock("@/geo/mapLibreMapAdapter", () => ({
  MapLibreMapAdapter: class MockMapLibreMapAdapter {
    constructor(public map: unknown) {}
    setViewConstraints() {}
    getCenter() {
      return [33, 44];
    }
    getZoom() {
      return 8;
    }
    getRotation() {
      return 0.75;
    }
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
    isMobile: computed(() => mapModeState.isMobile),
    showLeftPanel: computed(() => false),
    detailsWidth: computed(() => 320),
    showDetailsPanel: computed(() => false),
    hasRouteDetails: computed(() => mapModeState.hasRouteDetails),
    openTimeDialog: vi.fn(),
    onIncDay: vi.fn(),
    onDecDay: vi.fn(),
    onShowPlaceSearch: vi.fn(),
    onCloseDetailsPanel: closeDetailsPanelMock,
    goToNextScenarioEvent: vi.fn(),
    goToPrevScenarioEvent: vi.fn(),
  }),
}));

vi.mock("@/modules/scenarioeditor/useScenarioRouting", () => ({
  useScenarioRouting: () => ({
    activeRoutingUnitName: computed(() => routingHandlers.activeRoutingUnitName),
    addRouteLeg: routingHandlers.addRouteLeg,
    clearCurrentLeg: routingHandlers.clearCurrentLeg,
    finishRoute: routingHandlers.finishRoute,
    closeRouting: routingHandlers.closeRouting,
    endRouting: routingHandlers.endRouting,
    handleEscape: routingHandlers.handleEscape,
  }),
}));

vi.mock("@/modules/maplibreview/MaplibreMap.vue", () => ({
  default: defineComponent({
    name: "MaplibreMap",
    props: {
      initialView: {
        type: Object,
        required: false,
      },
    },
    emits: ["ready", "map-view-change"],
    setup(_, { emit }) {
      onMounted(() => {
        emit("ready", { resize: vi.fn() });
      });
      return () => h("div");
    },
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

const ScenarioMapModeShellStub = defineComponent({
  name: "ScenarioMapModeShell",
  template: `
    <div>
      <div data-test="map-slot"><slot name="map" /></div>
      <div data-test="footer-overlays-slot"><slot name="footer-overlays" /></div>
      <div data-test="mobile-toolbar-slot"><slot name="mobile-toolbar" /></div>
      <div data-test="after-keyboard-slot"><slot name="after-keyboard" /></div>
    </div>
  `,
});

describe("ScenarioEditorMaplibre", () => {
  function createActiveScenario() {
    return {
      store: {
        state: {
          id: "scenario-1",
          mapSettings: {},
          layerStack: ["layer-1"],
          layerStackMap: {
            "layer-1": { id: "layer-1", kind: "overlay", name: "Features", items: [] },
          },
        },
        groupUpdate: (fn: () => void) => fn(),
      },
      geo: {
        addFeature: vi.fn((feature) => feature.id),
      },
    };
  }

  beforeEach(() => {
    setActivePinia(createPinia());
    mapModeState.isMobile = false;
    mapModeState.hasRouteDetails = false;
    bindScenario.mockReset();
    bindScenario.mockReturnValue(cleanupScenarioBinding);
    cleanupScenarioBinding.mockReset();
    setMapAdapter.mockReset();
    initializeMaplibreLayers.mockReset();
    routingHandlers.addRouteLeg.mockReset();
    routingHandlers.clearCurrentLeg.mockReset();
    routingHandlers.finishRoute.mockReset();
    routingHandlers.closeRouting.mockReset();
    closeDetailsPanelMock.mockReset();
  });

  it("forwards the initial map view snapshot and emits one on unmount", async () => {
    const initialMapView: ScenarioMapViewSnapshot = {
      center: [1, 2],
      zoom: 3,
      rotation: 0.25,
    };
    const wrapper = mount(ScenarioEditorMaplibre, {
      props: {
        initialMapView,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeLayerKey as symbol]: ref("layer-1"),
          [activeScenarioKey as symbol]: createActiveScenario(),
        },
        stubs: {
          ScenarioMapModeShell: ScenarioMapModeShellStub,
          MaplibreContextMenu: { template: "<div><slot /></div>" },
          MaplibreSearchScenarioActions: true,
          MlMapLogic: true,
          MapEditorMainToolbar: true,
          MapEditorUnitTrackToolbar: true,
          MapEditorDrawToolbar: true,
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

    expect(wrapper.getComponent({ name: "MaplibreMap" }).props("initialView")).toEqual(
      initialMapView,
    );
    expect(wrapper.emitted("map-view-change")).toBeUndefined();

    wrapper.unmount();

    expect(wrapper.emitted("map-view-change")).toEqual([
      [{ center: [33, 44], zoom: 8, rotation: 0.75 }],
    ]);
  });

  it("cleans up the scenario binding when the maplibre view unmounts", () => {
    const wrapper = mount(ScenarioEditorMaplibre, {
      global: {
        plugins: [createPinia()],
        provide: {
          [activeLayerKey as symbol]: ref("layer-1"),
          [activeScenarioKey as symbol]: createActiveScenario(),
        },
        stubs: {
          ScenarioMapModeShell: ScenarioMapModeShellStub,
          MaplibreContextMenu: { template: "<div><slot /></div>" },
          MaplibreSearchScenarioActions: true,
          MlMapLogic: true,
          MapEditorMainToolbar: true,
          MapEditorUnitTrackToolbar: true,
          MapEditorDrawToolbar: true,
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

  it("shows the shared map toolbar in maplibre mode with measurements enabled", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore();
    toolbarStore.currentToolbar = "measurements";

    const wrapper = mount(ScenarioEditorMaplibre, {
      global: {
        plugins: [pinia],
        provide: {
          [activeLayerKey as symbol]: ref("layer-1"),
          [activeScenarioKey as symbol]: createActiveScenario(),
        },
        stubs: {
          ScenarioMapModeShell: ScenarioMapModeShellStub,
          MaplibreContextMenu: { template: "<div><slot /></div>" },
          MaplibreSearchScenarioActions: true,
          MlMapLogic: true,
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
          MapEditorDrawToolbar: true,
          MapEditorMeasurementToolbar: defineComponent({
            name: "MapEditorMeasurementToolbar",
            template: "<div data-test='measurement-toolbar' />",
          }),
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
    expect(toolbar.props("canRotateUnits")).toBe(true);
    expect(toolbar.props("canMeasure")).toBe(true);
    expect(toolbar.props("canDraw")).toBe(true);
    expect(toolbar.props("canTrack")).toBe(true);
    expect(toolbar.props("canAddUnits")).toBe(true);
    expect(toolbar.props("locationPickerEventSource")).toBe("dom");
    expect(toolbarStore.currentToolbar).toBe("measurements");
    expect(
      wrapper
        .get("[data-test='footer-overlays-slot']")
        .find("[data-test='measurement-toolbar']")
        .exists(),
    ).toBe(true);
  });

  it("docks the toolbar outside the map overlay on mobile", async () => {
    mapModeState.isMobile = true;
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore();
    toolbarStore.currentToolbar = "measurements";

    const wrapper = mount(ScenarioEditorMaplibre, {
      global: {
        plugins: [pinia],
        provide: {
          [activeLayerKey as symbol]: ref("layer-1"),
          [activeScenarioKey as symbol]: createActiveScenario(),
        },
        stubs: {
          ScenarioMapModeShell: ScenarioMapModeShellStub,
          MaplibreContextMenu: { template: "<div><slot /></div>" },
          MaplibreSearchScenarioActions: true,
          MlMapLogic: true,
          MapEditorMainToolbar: defineComponent({
            name: "MapEditorMainToolbar",
            template: "<div data-test='map-toolbar'>map-toolbar</div>",
          }),
          MapEditorUnitTrackToolbar: true,
          MapEditorDrawToolbar: true,
          MapEditorMeasurementToolbar: defineComponent({
            name: "MapEditorMeasurementToolbar",
            template: "<div data-test='measurement-toolbar'>measurement-toolbar</div>",
          }),
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

    expect(
      wrapper
        .get("[data-test='mobile-toolbar-slot']")
        .find("[data-test='map-toolbar']")
        .exists(),
    ).toBe(true);
    expect(wrapper.get("[data-test='mobile-toolbar-slot']").text()).toMatch(
      /^measurement-toolbar\s*map-toolbar$/,
    );
    expect(
      wrapper
        .get("[data-test='footer-overlays-slot']")
        .find("[data-test='map-toolbar']")
        .exists(),
    ).toBe(false);
  });

  it("renders the draw toolbar in maplibre mode", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore();
    toolbarStore.currentToolbar = "draw";

    const wrapper = mount(ScenarioEditorMaplibre, {
      global: {
        plugins: [pinia],
        provide: {
          [activeLayerKey as symbol]: ref("layer-1"),
          [activeScenarioKey as symbol]: createActiveScenario(),
        },
        stubs: {
          ScenarioMapModeShell: ScenarioMapModeShellStub,
          MaplibreContextMenu: { template: "<div><slot /></div>" },
          MaplibreSearchScenarioActions: true,
          MlMapLogic: true,
          MapEditorMainToolbar: true,
          MapEditorUnitTrackToolbar: true,
          MapEditorDrawToolbar: defineComponent({
            name: "MapEditorDrawToolbar",
            template: "<div data-test='draw-toolbar' />",
          }),
          MapEditorMeasurementToolbar: true,
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

    expect(
      wrapper
        .get("[data-test='footer-overlays-slot']")
        .find("[data-test='draw-toolbar']")
        .exists(),
    ).toBe(true);
    expect(toolbarStore.currentToolbar).toBe("draw");
  });
});
