// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { computed, defineComponent, nextTick, onMounted, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ScenarioEditorMap from "@/modules/scenarioeditor/ScenarioEditorMap.vue";
import { activeLayerKey, activeParentKey, activeScenarioKey } from "@/components/injects";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useNotifications } from "@/composables/notifications";
import { useSelectedItems } from "@/stores/selectedStore";

const { loadScenarioMock, mapModeState } = vi.hoisted(() => ({
  loadScenarioMock: vi.fn(),
  mapModeState: { isMobile: false },
}));

vi.mock("@/geo/engines/openlayers/olMapAdapter", () => ({
  OlMapAdapter: class MockOlMapAdapter {
    constructor(public map: unknown) {}
    setViewConstraints() {}
    updateSize() {}
  },
}));

vi.mock("@/composables/browserScenarios", () => ({
  useBrowserScenarios: () => ({
    loadScenario: loadScenarioMock,
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
    openTimeDialog: vi.fn(),
    onIncDay: vi.fn(),
    onDecDay: vi.fn(),
    onShowPlaceSearch: vi.fn(),
    onCloseDetailsPanel: vi.fn(),
    goToNextScenarioEvent: vi.fn(),
    goToPrevScenarioEvent: vi.fn(),
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
      <div data-test="modals-slot"><slot name="modals" /></div>
    </div>
  `,
});

const NewScenarioMapStub = defineComponent({
  name: "NewScenarioMap",
  emits: ["mapReady"],
  setup(_, { emit }) {
    onMounted(() => {
      emit("mapReady", {
        olMap: {},
        featureSelectInteraction: {
          setMap: vi.fn(),
        },
        scenarioLayerController: {},
      });
    });
    return () => null;
  },
});

describe("ScenarioEditorMap", () => {
  let mountedWrappers: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    setActivePinia(createPinia());
    mapModeState.isMobile = false;
    loadScenarioMock.mockReset();
    const { clear } = useSelectedItems();
    clear();
    useNotifications().clear();
  });

  afterEach(() => {
    mountedWrappers.forEach((wrapper) => wrapper.unmount());
    mountedWrappers = [];
    document.body.innerHTML = "";
  });

  function createActiveScenario(overrides: Partial<Record<string, unknown>> = {}) {
    const addFeature = vi.fn((feature) => feature.id);
    return {
      addFeature,
      scenario: {
        store: {
          state: {
            currentTime: 0,
            mapSettings: {},
            sides: ["side-1"],
            layerStack: ["layer-1"],
            layerStackMap: {
              "layer-1": { id: "layer-1", kind: "overlay", name: "Features", items: [] },
            },
            ...(overrides.state as object | undefined),
          },
          groupUpdate: (fn: () => void) => fn(),
        },
        time: {
          setCurrentTime: vi.fn(),
        },
        geo: {
          addFeature,
        },
        unitActions: {
          getUnitOrSideGroup: vi.fn(() => null),
          getUnitHierarchy: vi.fn(() => ({ parents: [] })),
        },
        helpers: {
          getUnitById: vi.fn(() => null),
          getSideById: vi.fn(() => ({ groups: ["group-1"] })),
          getSideGroupById: vi.fn(() => ({ subUnits: [] })),
        },
      },
    };
  }

  function mountScenarioEditorMap(options: {
    activeLayerId?: string | null;
    stateOverrides?: Record<string, unknown>;
  } = {}) {
    const { scenario, addFeature } = createActiveScenario({
      state: options.stateOverrides,
    });

    const wrapper = mount(ScenarioEditorMap, {
      global: {
        plugins: [createPinia()],
        provide: {
          [activeParentKey as symbol]: ref(null),
          [activeLayerKey as symbol]: ref(options.activeLayerId ?? "layer-1"),
          [activeScenarioKey as symbol]: scenario,
        },
        stubs: {
          ScenarioMapModeShell: ScenarioMapModeShellStub,
          NewScenarioMap: NewScenarioMapStub,
          SearchScenarioActions: true,
          DecryptScenarioModal: true,
          MapEditorMainToolbar: defineComponent({
            name: "MapEditorMainToolbar",
            template: "<div data-test='map-toolbar' />",
          }),
          MapEditorMeasurementToolbar: defineComponent({
            name: "MapEditorMeasurementToolbar",
            template: "<div data-test='measurement-toolbar' />",
          }),
          MapEditorDrawToolbar: defineComponent({
            name: "MapEditorDrawToolbar",
            template: "<div data-test='draw-toolbar' />",
          }),
          MapEditorUnitTrackToolbar: defineComponent({
            name: "MapEditorUnitTrackToolbar",
            template: "<div data-test='track-toolbar' />",
          }),
        },
      },
    });

    mountedWrappers.push(wrapper);
    return { wrapper, addFeature };
  }

  function dispatchPaste(target: EventTarget, options: {
    text?: string;
    types?: string[];
  }) {
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: {
        types: options.types ?? ["text/plain"],
        getData: (type: string) => (type === "text/plain" ? options.text ?? "" : ""),
      },
    });
    target.dispatchEvent(event);
    return event;
  }

  it("docks the main toolbar and draw toolbar outside the map overlay on mobile", async () => {
    mapModeState.isMobile = true;
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore(pinia);
    toolbarStore.currentToolbar = "draw";

    const wrapper = mount(ScenarioEditorMap, {
      global: {
        plugins: [pinia],
        provide: {
          [activeParentKey as symbol]: ref(null),
          [activeLayerKey as symbol]: ref("layer-1"),
          [activeScenarioKey as symbol]: createActiveScenario().scenario,
        },
        stubs: {
          ScenarioMapModeShell: ScenarioMapModeShellStub,
          NewScenarioMap: NewScenarioMapStub,
          SearchScenarioActions: true,
          DecryptScenarioModal: true,
          MapEditorMainToolbar: defineComponent({
            name: "MapEditorMainToolbar",
            template: "<div data-test='map-toolbar' />",
          }),
          MapEditorMeasurementToolbar: defineComponent({
            name: "MapEditorMeasurementToolbar",
            template: "<div data-test='measurement-toolbar' />",
          }),
          MapEditorDrawToolbar: defineComponent({
            name: "MapEditorDrawToolbar",
            template: "<div data-test='draw-toolbar' />",
          }),
          MapEditorUnitTrackToolbar: defineComponent({
            name: "MapEditorUnitTrackToolbar",
            template: "<div data-test='track-toolbar' />",
          }),
        },
      },
    });
    mountedWrappers.push(wrapper);

    await nextTick();

    expect(
      wrapper
        .get("[data-test='mobile-toolbar-slot']")
        .find("[data-test='map-toolbar']")
        .exists(),
    ).toBe(true);
    expect(
      wrapper
        .get("[data-test='mobile-toolbar-slot']")
        .find("[data-test='draw-toolbar']")
        .exists(),
    ).toBe(true);
    expect(
      wrapper
        .get("[data-test='footer-overlays-slot']")
        .find("[data-test='map-toolbar']")
        .exists(),
    ).toBe(false);
    expect(
      wrapper
        .get("[data-test='footer-overlays-slot']")
        .find("[data-test='draw-toolbar']")
        .exists(),
    ).toBe(false);
  });

  it("imports a pasted geojson feature collection into the active layer and selects it", async () => {
    const { addFeature } = mountScenarioEditorMap();
    const pasteEvent = dispatchPaste(document, {
      text: JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Alpha", category: "one" },
            geometry: { type: "Point", coordinates: [10, 20] },
          },
          {
            type: "Feature",
            properties: { name: "Bravo", category: "two" },
            geometry: { type: "LineString", coordinates: [[10, 20], [30, 40]] },
          },
        ],
      }),
    });

    expect(addFeature).toHaveBeenCalledTimes(2);
    expect(addFeature).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _pid: "layer-1",
        name: "Alpha",
        geometryMeta: { geometryKind: "Point" },
        userData: { category: "one" },
      }),
      "layer-1",
    );
    expect(addFeature).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        _pid: "layer-1",
        name: "Bravo",
        geometryMeta: { geometryKind: "LineString" },
        userData: { category: "two" },
      }),
      "layer-1",
    );
    expect([...useSelectedItems().selectedFeatureIds.value]).toHaveLength(2);
    expect(useSelectedItems().activeFeatureId.value).toBeDefined();
    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(useNotifications().notifications.value.at(-1)?.message).toBe(
      "Pasted 2 GeoJSON features",
    );
  });

  it("imports a pasted single geojson feature", async () => {
    const { addFeature } = mountScenarioEditorMap();
    const pasteEvent = dispatchPaste(document, {
      text: JSON.stringify({
        type: "Feature",
        properties: { title: "Bridge" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
    });

    expect(addFeature).toHaveBeenCalledTimes(1);
    expect(addFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        _pid: "layer-1",
        name: "Bridge",
        geometryMeta: { geometryKind: "Point" },
      }),
      "layer-1",
    );
    expect([...useSelectedItems().selectedFeatureIds.value]).toHaveLength(1);
    expect(pasteEvent.defaultPrevented).toBe(true);
  });

  it("keeps scenario json paste taking precedence over geojson handling", async () => {
    const { addFeature } = mountScenarioEditorMap();
    const pasteEvent = dispatchPaste(document, {
      text: JSON.stringify({
        type: "ORBAT-mapper",
        id: "scenario-1",
        sides: [],
        events: [],
        layerStack: [],
        mapLayers: [],
      }),
    });

    expect(loadScenarioMock).toHaveBeenCalledTimes(1);
    expect(addFeature).not.toHaveBeenCalled();
    expect(pasteEvent.defaultPrevented).toBe(true);
  });

  it("ignores application/orbat clipboard data", async () => {
    const { addFeature } = mountScenarioEditorMap();
    const pasteEvent = dispatchPaste(document, {
      text: JSON.stringify({
        type: "Feature",
        properties: { name: "Alpha" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
      types: ["application/orbat", "text/plain"],
    });

    expect(addFeature).not.toHaveBeenCalled();
    expect(pasteEvent.defaultPrevented).toBe(false);
  });

  it("ignores paste events from inputs and textareas", async () => {
    const { addFeature } = mountScenarioEditorMap();
    const input = document.createElement("input");
    document.body.appendChild(input);

    const pasteEvent = dispatchPaste(input, {
      text: JSON.stringify({
        type: "Feature",
        properties: { name: "Alpha" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
    });

    expect(addFeature).not.toHaveBeenCalled();
    expect(pasteEvent.defaultPrevented).toBe(false);
    input.remove();
  });

  it("ignores invalid plain text", async () => {
    const { addFeature } = mountScenarioEditorMap();
    const pasteEvent = dispatchPaste(document, { text: "not json" });

    expect(addFeature).not.toHaveBeenCalled();
    expect(useNotifications().notifications.value).toHaveLength(0);
    expect(pasteEvent.defaultPrevented).toBe(false);
  });

  it("shows an error when geojson is pasted without an overlay layer", async () => {
    const { addFeature } = mountScenarioEditorMap({
      activeLayerId: null,
      stateOverrides: {
        layerStack: [],
        layerStackMap: {},
      },
    });
    const pasteEvent = dispatchPaste(document, {
      text: JSON.stringify({
        type: "Feature",
        properties: { name: "Alpha" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
    });

    expect(addFeature).not.toHaveBeenCalled();
    expect(useNotifications().notifications.value.at(-1)?.message).toBe(
      "No scenario feature layer available for pasted GeoJSON",
    );
    expect(pasteEvent.defaultPrevented).toBe(false);
  });
});
