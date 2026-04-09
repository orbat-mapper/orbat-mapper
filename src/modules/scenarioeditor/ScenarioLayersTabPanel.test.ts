// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, shallowRef } from "vue";
import ScenarioLayersTabPanel from "@/modules/scenarioeditor/ScenarioLayersTabPanel.vue";
import {
  activeLayerKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";

vi.mock("@/stores/uiStore", () => ({
  useUiStore: () => ({
    layersPanelActive: false,
    mapLayersPanelOpen: true,
  }),
}));

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    selectedFeatureIds: ref(new Set<string>()),
    selectedMapLayerIds: ref(new Set<string>()),
    activeMapLayerId: ref(null),
    activeFeatureId: ref(null),
  }),
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  monitorForElements: () => () => {},
  draggable: () => () => {},
  dropTargetForElements: () => () => {},
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/combine", () => ({
  combine:
    (...cleanups: Array<() => void>) =>
    () =>
      cleanups.forEach((fn) => fn && fn()),
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge", () => ({
  extractClosestEdge: () => null,
  attachClosestEdge: (data: unknown) => data,
}));

describe("ScenarioLayersTabPanel", () => {
  function mountComponent(canZoomMapLayer: boolean) {
    const zoomToMapLayer = vi.fn();
    const layerController = {
      capabilities: {
        zoomToFeature: true,
        zoomToFeatureSet: true,
        panToFeature: true,
        zoomToScenarioLayer: true,
        zoomToMapLayer: canZoomMapLayer,
        featureTransform: true,
        mapLayerTransform: true,
        mapLayerExtent: canZoomMapLayer,
      },
      zoomToMapLayer,
      zoomToFeature: vi.fn(),
      zoomToFeatures: vi.fn(),
      panToFeature: vi.fn(),
      zoomToScenarioLayer: vi.fn(),
    };

    const dotsMenuStub = {
      name: "DotsMenu",
      props: ["items"],
      template: "<div class='dots-menu-stub' />",
    };

    const wrapper = mount(ScenarioLayersTabPanel, {
      global: {
        provide: {
          [activeLayerKey as symbol]: ref(null),
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {} as any,
            layers: layerController,
          }),
          [activeScenarioKey as symbol]: {
            geo: {
              mapLayers: ref([
                {
                  id: "map-layer-1",
                  type: "ImageLayer",
                  name: "Overlay",
                  isHidden: false,
                },
              ]),
              layerItemsLayers: ref([]),
              deleteMapLayer: vi.fn(),
              moveMapLayer: vi.fn(),
              addLayer: vi.fn(),
              updateMapLayer: vi.fn(),
              deleteLayer: vi.fn(),
              moveLayer: vi.fn(),
              getLayerIndex: vi.fn(() => 0),
              getLayerItemById: vi.fn(),
              getGeometryLayerItemById: vi.fn(),
              duplicateFeature: vi.fn(),
              deleteFeature: vi.fn(),
              moveFeature: vi.fn(),
              addMapLayer: vi.fn(),
            },
            store: {
              groupUpdate: vi.fn((fn: () => void) => fn()),
            },
          },
        },
        stubs: {
          ChevronPanel: {
            template: "<div><slot name='right' /><slot /></div>",
          },
          DotsMenu: dotsMenuStub,
          SplitButton: true,
          ScenarioFeatureLayer: true,
        },
      },
    });

    return { wrapper, zoomToMapLayer };
  }

  it("routes map-layer double click through the layer controller", async () => {
    const { wrapper, zoomToMapLayer } = mountComponent(true);

    await wrapper.find("[data-map-layer-id] button").trigger("dblclick");

    expect(zoomToMapLayer).toHaveBeenCalledWith("map-layer-1");
  });

  it("disables map-layer zoom actions when the engine has no extent support", () => {
    const { wrapper } = mountComponent(false);
    const dotsMenus = wrapper.findAllComponents({ name: "DotsMenu" });
    const mapLayerMenu = dotsMenus[dotsMenus.length - 1];

    expect(mapLayerMenu?.props("items")[0]).toMatchObject({
      label: "Zoom to",
      disabled: true,
    });
  });
});
