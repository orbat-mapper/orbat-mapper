// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, reactive, ref } from "vue";
import LayersPanel from "@/components/LayersPanel.vue";
import { activeScenarioKey } from "@/components/injects";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";

const routeState = vi.hoisted(() => ({
  currentRouteName: "MapBetaModeRoute",
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    name: routeState.currentRouteName,
  }),
}));

const BaseLayerSwitcherStub = defineComponent({
  name: "BaseLayerSwitcher",
  props: ["settings", "modelValue"],
  emits: ["update:modelValue", "update:layerOpacity"],
  template: "<div />",
});

const OpacityInputStub = defineComponent({
  name: "OpacityInput",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    "<button type='button' data-test='opacity-trigger' @click=\"$emit('update:modelValue', 0.25)\" />",
});

describe("LayersPanel", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    routeState.currentRouteName = "MapBetaModeRoute";
  });

  it("updates maplibre basemaps and scenario overlay layers", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const mapSettings = useMapSettingsStore();
    const maplibreLayersStore = useMaplibreLayersStore();
    maplibreLayersStore.layers = [
      {
        name: "osmRaster",
        title: "OSM Raster",
        sourceType: "raster",
        tiles: ["https://example.com/{z}/{x}/{y}.png"],
        opacity: 0.6,
      },
      {
        name: "bright",
        title: "Bright",
        sourceType: "style",
        styleUrl: "https://example.com/style.json",
      },
    ];

    const state = reactive({
      mapSettings: {
        baseMapId: "osmRaster",
      },
    });
    const update = vi.fn((fn: (draft: typeof state) => void) => fn(state));
    const updateLayer = vi.fn();
    const layerItemsLayers = ref([
      {
        id: "overlay-1",
        name: "Overlay 1",
        opacity: 0.4,
        isHidden: false,
        items: [],
      },
    ]);

    const wrapper = mount(LayersPanel, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            store: {
              state,
              update,
            },
            geo: {
              layerItemsLayers,
              updateLayer,
            },
          },
        },
        stubs: {
          BaseLayerSwitcher: BaseLayerSwitcherStub,
          OpacityInput: OpacityInputStub,
        },
      },
    });

    expect(wrapper.text()).toContain("Overlay 1");

    const baseLayerSwitcher = wrapper.getComponent(BaseLayerSwitcherStub);
    const baseLayerSettings = baseLayerSwitcher.props("settings") as Array<{
      id: string;
      supportsOpacity?: boolean;
    }>;
    expect(
      baseLayerSettings.find((setting) => setting.id === "bright")?.supportsOpacity,
    ).toBe(false);

    const brightLayer = baseLayerSettings.find((setting) => setting.id === "bright");
    baseLayerSwitcher.vm.$emit("update:modelValue", brightLayer);
    await wrapper.vm.$nextTick();

    expect(update).not.toHaveBeenCalled();
    expect(state.mapSettings.baseMapId).toBe("osmRaster");
    expect(mapSettings.maplibreBaseLayerName).toBe("bright");
    expect(mapSettings.baseLayerName).toBe("osm");

    const rasterLayer = baseLayerSettings.find((setting) => setting.id === "osmRaster");
    baseLayerSwitcher.vm.$emit("update:layerOpacity", rasterLayer, 0.3);
    await wrapper.vm.$nextTick();

    expect(
      maplibreLayersStore.layers.find((layer) => layer.name === "osmRaster")?.opacity,
    ).toBe(0.3);

    const overlayButtons = wrapper.findAll("li button");
    await overlayButtons[0]!.trigger("click");
    expect(updateLayer).toHaveBeenCalledWith("overlay-1", { opacity: 0.25 });

    await overlayButtons[1]!.trigger("click");
    expect(updateLayer).toHaveBeenCalledWith("overlay-1", { isHidden: true });
  });
});
