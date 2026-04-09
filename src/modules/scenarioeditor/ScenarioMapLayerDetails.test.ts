// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, shallowRef } from "vue";
import ScenarioMapLayerDetails from "@/modules/scenarioeditor/ScenarioMapLayerDetails.vue";
import { activeScenarioKey, activeScenarioMapEngineKey } from "@/components/injects";

vi.mock("@/stores/uiStore", () => ({
  useUiStore: () => ({
    debugMode: false,
  }),
}));

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    clear: vi.fn(),
  }),
}));

describe("ScenarioMapLayerDetails", () => {
  function mountComponent(canZoomMapLayer: boolean | null) {
    const layer = {
      id: "map-layer-1",
      type: "ImageLayer",
      name: "Overlay",
      opacity: 0.7,
      isHidden: false,
      _status: "initialized",
      _isNew: false,
      url: "https://example.com/image.png",
      attributions: "",
    } as any;

    const zoomToMapLayer = vi.fn();
    const engineRef = shallowRef(
      canZoomMapLayer === null
        ? undefined
        : {
            map: {} as any,
            layers: {
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
            },
          },
    );
    const wrapper = mount(ScenarioMapLayerDetails, {
      props: { layerId: layer.id },
      global: {
        provide: {
          [activeScenarioKey as symbol]: {
            geo: {
              getMapLayerById: vi.fn(() => layer),
              updateMapLayer: vi.fn(),
              deleteMapLayer: vi.fn(),
            },
            store: { groupUpdate: vi.fn((fn: () => void) => fn()) },
          },
          [activeScenarioMapEngineKey as symbol]: engineRef,
        },
        stubs: {
          ScrollTabs: {
            template: "<div><slot /></div>",
          },
          TabsContent: {
            template: "<div><slot /></div>",
          },
          EditableLabel: {
            props: ["modelValue"],
            template: "<div>{{ modelValue }}</div>",
          },
          DotsMenu: {
            name: "DotsMenu",
            props: ["items"],
            template: "<div />",
          },
          MapLayerMetaSettings: true,
          ImageMapLayerSettings: true,
          TileJSONMapLayerSettings: true,
        },
      },
    });

    return { wrapper, zoomToMapLayer, engineRef };
  }

  it("hides the zoom button when the engine cannot resolve map-layer extents", () => {
    const { wrapper } = mountComponent(false);

    expect(wrapper.find('[title="Zoom to layer extent"]').exists()).toBe(false);
  });

  it("shows the zoom button when map-layer zoom is supported", () => {
    const { wrapper } = mountComponent(true);

    expect(wrapper.find('[title="Zoom to layer extent"]').exists()).toBe(true);
  });

  it("updates menu items when the engine becomes available after mount", async () => {
    const { wrapper, engineRef } = mountComponent(null);
    const dotsMenu = wrapper.findComponent({ name: "DotsMenu" });

    expect(dotsMenu.props("items")[0]).toMatchObject({
      label: "Zoom to",
      disabled: true,
    });

    engineRef.value = {
      map: {} as any,
      layers: {
        capabilities: {
          zoomToFeature: true,
          zoomToFeatureSet: true,
          panToFeature: true,
          zoomToScenarioLayer: true,
          zoomToMapLayer: true,
          featureTransform: true,
          mapLayerTransform: true,
          mapLayerExtent: true,
        },
        zoomToMapLayer: vi.fn(),
      },
    };
    await nextTick();

    expect(wrapper.find('[title="Zoom to layer extent"]').exists()).toBe(true);
    expect(dotsMenu.props("items")[0]).toMatchObject({
      label: "Zoom to",
      disabled: false,
    });
  });
});
