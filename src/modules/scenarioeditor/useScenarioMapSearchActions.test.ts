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
});
