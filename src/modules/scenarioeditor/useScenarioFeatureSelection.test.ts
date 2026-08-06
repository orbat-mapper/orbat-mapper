// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { activeScenarioKey, activeScenarioMapEngineKey } from "@/components/injects";
import { useScenarioFeatureSelection } from "@/modules/scenarioeditor/useScenarioFeatureSelection";
import { useSelectedItems } from "@/stores/selectedStore";

describe("useScenarioFeatureSelection", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    useSelectedItems().clear();
  });

  it("clears feature selection on empty input without clearing selected units", () => {
    let applyScenarioFeatureSelection!: ReturnType<
      typeof useScenarioFeatureSelection
    >["applyScenarioFeatureSelection"];

    const Harness = defineComponent({
      setup() {
        ({ applyScenarioFeatureSelection } = useScenarioFeatureSelection());
        return () => null;
      },
    });

    const selected = useSelectedItems();
    selected.selectedFeatureIds.value.add("feature-1");
    selected.selectedUnitIds.value.add("unit-1");

    mount(Harness, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            geo: {
              getGeometryLayerItemById: vi.fn(),
              getLayerById: vi.fn(),
            },
          },
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: {
              zoomToFeature: vi.fn(),
            },
          } as any),
        },
      },
    });

    applyScenarioFeatureSelection({ featureIds: [], noZoom: true });

    expect(selected.selectedFeatureIds.value.size).toBe(0);
    expect(selected.selectedUnitIds.value.has("unit-1")).toBe(true);
  });

  it("reveals the owning layer and zooms for a control measure", () => {
    let applyScenarioFeatureSelection!: ReturnType<
      typeof useScenarioFeatureSelection
    >["applyScenarioFeatureSelection"];

    const Harness = defineComponent({
      setup() {
        ({ applyScenarioFeatureSelection } = useScenarioFeatureSelection());
        return () => null;
      },
    });

    const layer = { id: "layer-1", _isOpen: false };
    const zoomToFeature = vi.fn();
    // A control measure is invisible to `getGeometryLayerItemById`, so resolving the
    // layer through it left the panel closed and the layerId undefined.
    const getGeometryLayerItemById = vi.fn(() => ({
      layerItem: undefined,
      layer: undefined,
    }));

    mount(Harness, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            geo: {
              getGeometryLayerItemById,
              getLayerItemById: vi.fn(() => ({
                layerItem: { id: "cm-1", kind: "tacticalGraphic" },
                layer,
              })),
              getLayerById: vi.fn(() => layer),
            },
          },
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: { zoomToFeature },
          } as any),
        },
      },
    });

    applyScenarioFeatureSelection({ featureIds: ["cm-1"] });

    expect(layer._isOpen).toBe(true);
    expect(getGeometryLayerItemById).not.toHaveBeenCalled();
    expect(useSelectedItems().selectedFeatureIds.value.has("cm-1")).toBe(true);
  });
});
