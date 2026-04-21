// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { computed, defineComponent, nextTick, onMounted, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ScenarioEditorMap from "@/modules/scenarioeditor/ScenarioEditorMap.vue";
import { activeLayerKey, activeParentKey, activeScenarioKey } from "@/components/injects";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

const { mapModeState } = vi.hoisted(() => ({
  mapModeState: { isMobile: false },
}));

vi.mock("@/geo/engines/openlayers/olMapAdapter", () => ({
  OlMapAdapter: class MockOlMapAdapter {
    constructor(public map: unknown) {}
    setViewConstraints() {}
    updateSize() {}
  },
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
  });

  afterEach(() => {
    mountedWrappers.forEach((wrapper) => wrapper.unmount());
    mountedWrappers = [];
    document.body.innerHTML = "";
  });

  function createActiveScenario(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      scenario: {
        store: {
          state: {
            currentTime: 0,
            mapSettings: {},
            ...(overrides.state as object | undefined),
          },
          groupUpdate: (fn: () => void) => fn(),
        },
        time: {
          setCurrentTime: vi.fn(),
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
});
