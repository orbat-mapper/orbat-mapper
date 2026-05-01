// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { shallowRef } from "vue";
import TileMapLayerSettings from "@/modules/scenarioeditor/TileMapLayerSettings.vue";
import { activeScenarioMapEngineKey } from "@/components/injects";

describe("TileMapLayerSettings", () => {
  function mountComponent(layerOverrides: Record<string, unknown> = {}) {
    return mount(TileMapLayerSettings, {
      props: {
        layer: {
          id: "tile-layer-1",
          type: "TileJSONLayer",
          name: "Tiles",
          url: "https://example.test/tilejson.json",
          _status: "initialized",
          ...layerOverrides,
        },
      },
      global: {
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: {
              capabilities: {
                zoomToMapLayer: true,
                mapLayerExtent: true,
              },
              zoomToMapLayer: vi.fn(),
            },
          }),
        },
        stubs: {
          DescriptionItem: {
            props: ["label"],
            template: "<div><span>{{ label }}</span><slot /></div>",
          },
        },
      },
    });
  }

  it("notes that tile map layers only support raster tiles", () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain(
      "Only raster tiles are supported for TileJSON and XYZ map layers.",
    );
  });

  it("does not show the load failure before a new layer is initialized", () => {
    const wrapper = mountComponent({
      _isNew: true,
      _status: "error",
    });

    expect(wrapper.text()).toContain("This layer has not been initialized yet.");
    expect(wrapper.text()).not.toContain("Failed to load layer.");
  });

  it("shows the load failure for an existing layer that errors", () => {
    const wrapper = mountComponent({
      _isNew: false,
      _status: "error",
    });

    expect(wrapper.text()).toContain("Failed to load layer.");
  });
});
