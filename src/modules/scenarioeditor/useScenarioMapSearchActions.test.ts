// @vitest-environment jsdom
import { createEventHook } from "@vueuse/core";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, nextTick, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  activeLayerKey,
  activeParentKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
  searchActionsKey,
} from "@/components/injects";
import { useScenarioMapSearchActions } from "@/modules/scenarioeditor/useScenarioMapSearchActions";
import { useSelectedItems } from "@/stores/selectedStore";
import { useUiStore } from "@/stores/uiStore";
import { TAB_LAYERS, TAB_ORBAT } from "@/types/constants";

vi.mock("@/composables/scenarioActions", () => ({
  useToeActions: () => ({
    goToAddEquipment: vi.fn(),
    goToAddPersonnel: vi.fn(),
  }),
}));

function createSearchActions() {
  return {
    onUnitSelectHook: createEventHook<any>(),
    onLayerSelectHook: createEventHook<any>(),
    onImageLayerSelectHook: createEventHook<any>(),
    onFeatureSelectHook: createEventHook<any>(),
    onEventSelectHook: createEventHook<any>(),
    onPlaceSelectHook: createEventHook<any>(),
    onScenarioActionHook: createEventHook<any>(),
  };
}

const Harness = defineComponent({
  setup() {
    useScenarioMapSearchActions();
    return () => null;
  },
});

describe("useScenarioMapSearchActions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useSelectedItems().clear();
  });

  it("skips zooming when a feature selection requests noZoom", async () => {
    const searchActions = createSearchActions();
    const zoomToFeature = vi.fn();
    const selectedLayer = { _isOpen: false };

    mount(Harness, {
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioKey as symbol]: {
            geo: {
              getGeometryLayerItemById: vi.fn(() => ({
                layerItem: { id: "feature-1" },
                layer: selectedLayer,
              })),
              getLayerById: vi.fn(() => selectedLayer),
            },
            unitActions: {
              getUnitById: vi.fn(),
              getUnitHierarchy: vi.fn(() => ({ parents: [] })),
            },
            time: {
              goToScenarioEvent: vi.fn(),
            },
          },
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: {
              zoomToFeature,
            },
          } as any),
          [activeLayerKey as symbol]: ref(),
          [activeParentKey as symbol]: ref(),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    await searchActions.onFeatureSelectHook.trigger({
      featureId: "feature-1",
      layerId: "layer-1",
      options: { noZoom: true },
    });
    await nextTick();
    await nextTick();

    expect(selectedLayer._isOpen).toBe(true);
    expect(useSelectedItems().selectedFeatureIds.value.has("feature-1")).toBe(true);
    expect(zoomToFeature).not.toHaveBeenCalled();
  });

  function mountUnitSelectHarness(pinia: ReturnType<typeof createPinia>) {
    const searchActions = createSearchActions();
    const side = { _isOpen: false };
    const sideGroup = { _isOpen: false };
    const parent = { _isOpen: false };

    mount(Harness, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            geo: {
              getGeometryLayerItemById: vi.fn(),
              getLayerById: vi.fn(),
            },
            unitActions: {
              getUnitById: vi.fn(() => ({ id: "unit-1" })),
              getUnitHierarchy: vi.fn(() => ({ side, sideGroup, parents: [parent] })),
            },
            time: { goToScenarioEvent: vi.fn() },
          },
          [activeScenarioMapEngineKey as symbol]: shallowRef({ layers: {} } as any),
          [activeLayerKey as symbol]: ref(),
          [activeParentKey as symbol]: ref(),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    return { searchActions, side, sideGroup, parent };
  }

  it("reveals the unit in the ORBAT panel by default", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const uiStore = useUiStore(pinia);
    uiStore.showLeftPanel = false;
    const { searchActions, side, sideGroup, parent } = mountUnitSelectHarness(pinia);

    await searchActions.onUnitSelectHook.trigger({
      unitId: "unit-1",
      options: { noZoom: true },
    });
    await nextTick();

    expect(uiStore.showLeftPanel).toBe(true);
    expect(uiStore.activeTabIndex).toBe(TAB_ORBAT);
    expect(side._isOpen).toBe(true);
    expect(sideGroup._isOpen).toBe(true);
    expect(parent._isOpen).toBe(true);
    expect(useSelectedItems().orbatRevealUnitId.value).toBe("unit-1");
    expect(useSelectedItems().selectedUnitIds.value.has("unit-1")).toBe(true);
  });

  it("keeps a closed ORBAT panel closed when the reveal is not requested", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const uiStore = useUiStore(pinia);
    uiStore.showLeftPanel = false;
    uiStore.activeTabIndex = TAB_LAYERS;
    const { searchActions, side, parent } = mountUnitSelectHarness(pinia);

    await searchActions.onUnitSelectHook.trigger({
      unitId: "unit-1",
      options: { noZoom: true, revealInOrbat: false },
    });
    await nextTick();

    expect(uiStore.showLeftPanel).toBe(false);
    expect(uiStore.activeTabIndex).toBe(TAB_LAYERS);
    expect(side._isOpen).toBe(false);
    expect(parent._isOpen).toBe(false);
    expect(useSelectedItems().orbatRevealUnitId.value).toBeNull();
    // The selection itself still applies.
    expect(useSelectedItems().selectedUnitIds.value.has("unit-1")).toBe(true);
  });
});
