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
});
