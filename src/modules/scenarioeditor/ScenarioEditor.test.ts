// @vitest-environment jsdom
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ScenarioEditor from "@/modules/scenarioeditor/ScenarioEditor.vue";
import { MAPLIBRE_ROUTE, MAP_EDIT_MODE_ROUTE } from "@/router/names";
import { useSelectedItems } from "@/stores/selectedStore";
import type { TScenario } from "@/scenariostore";

const { loadScenarioMock, send } = vi.hoisted(() => ({
  loadScenarioMock: vi.fn(),
  send: vi.fn(),
}));

vi.mock("nprogress", () => ({
  default: {
    start: vi.fn(),
    done: vi.fn(),
  },
}));

vi.mock("@/geo/featureStyles", () => ({
  useFeatureStyles: () => ({
    clearCache: vi.fn(),
    scenarioFeatureStyle: vi.fn(),
    invalidateStyle: vi.fn(),
  }),
}));

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({
    send,
  }),
}));

vi.mock("@/composables/modals", () => ({
  useDateModal: () => ({
    showDateModal: false,
    confirmDateModal: vi.fn(),
    cancelDateModal: vi.fn(),
    initialDateModalValue: 0,
    dateModalTimeZone: "UTC",
    dateModalTitle: "",
    getModalTimestamp: vi.fn(),
  }),
  useSidcModal: () => ({
    getModalSidc: vi.fn(),
    confirmSidcModal: vi.fn(),
    showSidcModal: false,
    cancelSidcModal: vi.fn(),
    initialSidcModalValue: "",
    sidcModalTitle: "",
    hideModifiers: false,
    hideSymbolColor: false,
    hideCustomSymbols: false,
    symbolOptions: {},
    inheritedSymbolOptions: {},
    initialTab: 0,
    initialReinforcedReduced: undefined,
  }),
}));

vi.mock("@/composables/filedragdrop", () => ({
  useFileDropZone: () => ({
    isOverDropZone: false,
  }),
}));

vi.mock("@/composables/scenarioShare", () => ({
  useScenarioShare: vi.fn(),
}));

vi.mock("@/composables/browserScenarios", () => ({
  useBrowserScenarios: () => ({
    loadScenario: loadScenarioMock,
  }),
}));

vi.mock("@/stores/timeFormatStore", () => ({
  useTimeFormatterProvider: vi.fn(),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");
  return {
    ...actual,
    useClipboard: () => ({
      copy: vi.fn(),
      copied: { value: false },
    }),
    useTitle: () => ({ value: "ORBAT Mapper" }),
  };
});

const RouteShell = defineComponent({
  template: "<router-view />",
});

const RouteView = defineComponent({
  template: "<div />",
});

const routes: RouteRecordRaw[] = [
  {
    path: "/scenario/:scenarioId",
    component: RouteShell,
    children: [
      {
        path: "",
        name: MAP_EDIT_MODE_ROUTE,
        component: RouteView,
        meta: { helpUrl: "https://docs.orbat-mapper.app/guide/map-edit-mode" },
      },
      {
        path: "maplibre",
        name: MAPLIBRE_ROUTE,
        component: RouteView,
      },
    ],
  },
];

function createActiveScenario(
  options: { stateOverrides?: Record<string, unknown> } = {},
) {
  const addFeature = vi.fn((feature) => feature.id);
  return {
    store: {
      state: {
        id: "scenario-1",
        info: { name: "Scenario" },
        mapSettings: { baseMapId: "default" },
        layerStack: ["layer-1"],
        layerStackMap: {
          "layer-1": { id: "layer-1", kind: "overlay", name: "Features", items: [] },
        },
        ...(options.stateOverrides ?? {}),
      },
      groupUpdate: (fn: () => void) => fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: false,
      canRedo: false,
    },
    unitActions: {
      addSide: vi.fn(),
    },
    io: {
      saveToIndexedDb: vi.fn(),
      loadFromLocalStorage: vi.fn(),
      downloadAsJson: vi.fn(),
      stringifyScenario: vi.fn(() => "{}"),
      duplicateScenario: vi.fn(),
    },
    helpers: {
      getUnitById: vi.fn(() => ({ sidc: "10031000001211000000" })),
    },
    geo: {
      addFeature,
    },
  } as unknown as TScenario;
}

function createPasteEvent(options: { text?: string; types?: string[] }) {
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", {
    value: {
      types: options.types ?? ["text/plain"],
      getData: (type: string) => (type === "text/plain" ? (options.text ?? "") : ""),
    },
  });
  return event;
}

describe("ScenarioEditor", () => {
  let mountedWrappers: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    setActivePinia(createPinia());
    send.mockReset();
    loadScenarioMock.mockReset();
    useSelectedItems().clear();
    sessionStorage.clear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        readText: vi.fn(),
      },
    });
  });

  afterEach(() => {
    mountedWrappers.forEach((wrapper) => wrapper.unmount());
    mountedWrappers = [];
    document.body.innerHTML = "";
  });

  async function mountScenarioEditor(
    options: {
      routeName?: typeof MAP_EDIT_MODE_ROUTE | typeof MAPLIBRE_ROUTE;
      activeScenario?: TScenario;
      mainMenuStub?: unknown;
    } = {},
  ) {
    const pinia = createPinia();
    setActivePinia(pinia);
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    await router.push({
      name: options.routeName ?? MAP_EDIT_MODE_ROUTE,
      params: { scenarioId: "scenario-1" },
    });
    await router.isReady();

    const wrapper = mount(ScenarioEditor, {
      props: {
        activeScenario: options.activeScenario ?? createActiveScenario(),
      },
      global: {
        plugins: [pinia, router],
        stubs: {
          MainMenu: options.mainMenuStub ?? true,
          RecordingState: true,
          PlaybackMenu: true,
          GlobalEvents: true,
          ShortcutsModal: true,
          MainViewSlideOver: true,
          CommandPalette: true,
          DebugInfo: true,
          Button: true,
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectItem: true,
          UseDark: true,
          DecryptScenarioModal: true,
          RouterLink: defineComponent({
            name: "RouterLink",
            template: "<a><slot /></a>",
          }),
        },
      },
    });
    mountedWrappers.push(wrapper);
    await flushPromises();

    return { pinia, router, wrapper };
  }

  it("imports pasted geojson from the shared editor shell in openlayers mode", async () => {
    const activeScenario = createActiveScenario();
    const event = createPasteEvent({
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
            properties: { title: "Bravo", category: "two" },
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [30, 40],
              ],
            },
          },
        ],
      }),
    });

    await mountScenarioEditor({ activeScenario });

    document.dispatchEvent(event);

    expect(activeScenario.geo.addFeature).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _pid: "layer-1",
        name: "Alpha",
        geometryMeta: { geometryKind: "Point" },
        userData: { category: "one" },
      }),
      "layer-1",
    );
    expect(activeScenario.geo.addFeature).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        _pid: "layer-1",
        name: "New feature",
        geometryMeta: { geometryKind: "LineString" },
        userData: { category: "two", title: "Bravo" },
      }),
      "layer-1",
    );
    expect([...useSelectedItems().selectedFeatureIds.value]).toHaveLength(2);
    expect(useSelectedItems().activeFeatureId.value).toBeDefined();
    expect(send).toHaveBeenCalledWith({
      message: "Pasted 2 GeoJSON features",
      type: "success",
    });
    expect(event.defaultPrevented).toBe(true);
  });

  it("imports pasted geojson from the shared editor shell in maplibre mode", async () => {
    const activeScenario = createActiveScenario();
    const event = createPasteEvent({
      text: JSON.stringify({
        type: "Feature",
        properties: { title: "Bridge" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
    });

    await mountScenarioEditor({ routeName: MAPLIBRE_ROUTE, activeScenario });
    send.mockClear();

    document.dispatchEvent(event);

    expect(activeScenario.geo.addFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        _pid: "layer-1",
        name: "Bridge",
        geometryMeta: { geometryKind: "Point" },
      }),
      "layer-1",
    );
    expect(send).toHaveBeenCalledWith({
      message: "Pasted 1 GeoJSON feature",
      type: "success",
    });
    expect(event.defaultPrevented).toBe(true);
  });

  it("keeps scenario json paste taking precedence over geojson handling", async () => {
    const activeScenario = createActiveScenario();
    const event = createPasteEvent({
      text: JSON.stringify({
        type: "ORBAT-mapper",
        id: "scenario-1",
        sides: [],
        events: [],
        layerStack: [],
        mapLayers: [],
      }),
    });

    await mountScenarioEditor({ activeScenario });

    document.dispatchEvent(event);

    expect(loadScenarioMock).toHaveBeenCalledTimes(1);
    expect(activeScenario.geo.addFeature).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("ignores application/orbat clipboard data", async () => {
    const activeScenario = createActiveScenario();
    const event = createPasteEvent({
      text: JSON.stringify({
        type: "Feature",
        properties: { name: "Alpha" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
      types: ["application/orbat", "text/plain"],
    });

    await mountScenarioEditor({ activeScenario });

    document.dispatchEvent(event);

    expect(activeScenario.geo.addFeature).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores paste events from inputs and textareas", async () => {
    const activeScenario = createActiveScenario();
    const input = document.createElement("input");
    document.body.appendChild(input);
    const event = createPasteEvent({
      text: JSON.stringify({
        type: "Feature",
        properties: { name: "Alpha" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
    });

    await mountScenarioEditor({ activeScenario });

    input.dispatchEvent(event);

    expect(activeScenario.geo.addFeature).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
    input.remove();
  });

  it("ignores invalid plain text", async () => {
    const activeScenario = createActiveScenario();
    const event = createPasteEvent({ text: "not json" });

    await mountScenarioEditor({ activeScenario });

    document.dispatchEvent(event);

    expect(activeScenario.geo.addFeature).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("shows an error when geojson is pasted without an overlay layer", async () => {
    const activeScenario = createActiveScenario({
      stateOverrides: {
        layerStack: [],
        layerStackMap: {},
      },
    });
    const event = createPasteEvent({
      text: JSON.stringify({
        type: "Feature",
        properties: { name: "Alpha" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
    });

    await mountScenarioEditor({ activeScenario });

    document.dispatchEvent(event);

    expect(activeScenario.geo.addFeature).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({
      message: "No scenario feature layer available for pasted GeoJSON",
      type: "error",
    });
    expect(event.defaultPrevented).toBe(false);
  });

  it("reads the clipboard when the main menu emits pasteFromClipboard", async () => {
    const readText = vi.fn().mockResolvedValue(
      JSON.stringify({
        type: "Feature",
        properties: { title: "Bridge" },
        geometry: { type: "Point", coordinates: [10, 20] },
      }),
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { readText },
    });

    const activeScenario = createActiveScenario();
    const { wrapper } = await mountScenarioEditor({
      activeScenario,
      mainMenuStub: defineComponent({
        emits: ["action", "uiAction"],
        template:
          "<button data-testid=\"paste-menu\" @click=\"$emit('action', 'pasteFromClipboard')\">paste</button>",
      }),
    });

    await wrapper.get('[data-testid="paste-menu"]').trigger("click");
    await flushPromises();

    expect(readText).toHaveBeenCalledTimes(1);
    expect(activeScenario.geo.addFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        _pid: "layer-1",
        name: "Bridge",
        geometryMeta: { geometryKind: "Point" },
      }),
      "layer-1",
    );
    expect(send).toHaveBeenCalledWith({
      message: "Pasted 1 GeoJSON feature",
      type: "success",
    });
  });
});
