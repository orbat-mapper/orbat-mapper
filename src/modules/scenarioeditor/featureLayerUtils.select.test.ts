// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { defineComponent, nextTick, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  activeFeatureStylesKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import { useScenarioFeatureSelect } from "@/modules/scenarioeditor/featureLayerUtils";
import { useSelectedItems } from "@/stores/selectedStore";

describe("useScenarioFeatureSelect", () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    useSelectedItems().clear();
  });

  it("re-renders the map when feature selection is applied from store state", async () => {
    const renderSync = vi.fn();
    const olMap = {
      addLayer: vi.fn(),
      addInteraction: vi.fn(),
      removeInteraction: vi.fn(),
      renderSync,
      render: vi.fn(),
      forEachFeatureAtPixel: vi.fn(),
    } as any;

    const Harness = defineComponent({
      setup() {
        useScenarioFeatureSelect(olMap);
        return () => null;
      },
    });

    mount(Harness, {
      global: {
        plugins: [pinia],
        provide: {
          [activeFeatureStylesKey as symbol]: {
            scenarioFeatureStyle: vi.fn(() => undefined),
          },
          [activeScenarioKey as symbol]: {
            geo: {
              getGeometryLayerItemById: vi.fn(() => ({
                layer: { id: "layer-1" },
              })),
              getLayerById: vi.fn(() => ({ _isOpen: false })),
            },
          },
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: {
              zoomToFeature: vi.fn(),
            },
          }),
        },
      },
    });

    const [layerGroup] = olMap.addLayer.mock.calls.map(([layer]: [any]) => layer);
    const layer = new VectorLayer({
      source: new VectorSource(),
      properties: { layerType: "SCENARIO_FEATURE" },
    });
    const feature = new Feature({
      geometry: new Point([0, 0]),
    });
    feature.setId("feature-1");
    layer.getSource()?.addFeature(feature);
    layerGroup.getLayers().push(layer);

    useSelectedItems().selectedFeatureIds.value.add("feature-1");
    await nextTick();

    expect(renderSync).toHaveBeenCalled();
    const selectInteraction = olMap.addInteraction.mock.calls.find(
      ([interaction]: [any]) => typeof interaction.getFeatures === "function",
    )?.[0];
    expect(selectInteraction?.getFeatures().getLength()).toBe(1);
  });
});
