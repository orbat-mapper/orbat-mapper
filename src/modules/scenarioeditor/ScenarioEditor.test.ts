// @vitest-environment jsdom
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScenarioEditor from "@/modules/scenarioeditor/ScenarioEditor.vue";
import { MAPLIBRE_ROUTE, MAP_EDIT_MODE_ROUTE } from "@/router/names";

const { send } = vi.hoisted(() => ({
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

function createActiveScenario() {
  return {
    store: {
      state: {
        id: "scenario-1",
        info: { name: "Scenario" },
        mapSettings: { baseMapId: "default" },
        layerStack: [],
        layerStackMap: {},
      },
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
    geo: {},
  } as any;
}

describe("ScenarioEditor", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    send.mockReset();
    sessionStorage.clear();
  });

  it("shows a temporary warning when entering maplibre mode", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    await router.push({
      name: MAP_EDIT_MODE_ROUTE,
      params: { scenarioId: "scenario-1" },
    });
    await router.isReady();

    mount(ScenarioEditor, {
      props: {
        activeScenario: createActiveScenario(),
      },
      global: {
        plugins: [pinia, router],
        stubs: {
          MainMenu: true,
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
          RouterLink: defineComponent({
            name: "RouterLink",
            template: "<a><slot /></a>",
          }),
        },
      },
    });

    expect(send).not.toHaveBeenCalled();

    await router.push({ name: MAPLIBRE_ROUTE, params: { scenarioId: "scenario-1" } });
    await flushPromises();

    expect(send).toHaveBeenCalledWith({
      message: "MapLibre mode is a work in progress with missing functionality.",
      duration: 5000,
    });
  });

  it("only shows the maplibre warning once per session", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    await router.push({
      name: MAP_EDIT_MODE_ROUTE,
      params: { scenarioId: "scenario-1" },
    });
    await router.isReady();

    mount(ScenarioEditor, {
      props: {
        activeScenario: createActiveScenario(),
      },
      global: {
        plugins: [pinia, router],
        stubs: {
          MainMenu: true,
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
          RouterLink: defineComponent({
            name: "RouterLink",
            template: "<a><slot /></a>",
          }),
        },
      },
    });

    await router.push({ name: MAPLIBRE_ROUTE, params: { scenarioId: "scenario-1" } });
    await flushPromises();
    await router.push({
      name: MAP_EDIT_MODE_ROUTE,
      params: { scenarioId: "scenario-1" },
    });
    await flushPromises();
    await router.push({ name: MAPLIBRE_ROUTE, params: { scenarioId: "scenario-1" } });
    await flushPromises();

    expect(send).toHaveBeenCalledTimes(1);
  });
});
