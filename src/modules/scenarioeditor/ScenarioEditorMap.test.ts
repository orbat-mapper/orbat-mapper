// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { computed, defineComponent, nextTick, onMounted, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScenarioEditorMap from "@/modules/scenarioeditor/ScenarioEditorMap.vue";
import { activeParentKey, activeScenarioKey } from "@/components/injects";
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

vi.mock("@/composables/browserScenarios", () => ({
  useBrowserScenarios: () => ({
    loadScenario: vi.fn(),
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
  beforeEach(() => {
    setActivePinia(createPinia());
    mapModeState.isMobile = false;
  });

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
          [activeScenarioKey as symbol]: {
            store: {
              state: {
                currentTime: 0,
                mapSettings: {},
                sides: ["side-1"],
              },
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
