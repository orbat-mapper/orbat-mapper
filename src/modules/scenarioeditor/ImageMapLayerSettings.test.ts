// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { shallowRef } from "vue";
import ImageMapLayerSettings from "@/modules/scenarioeditor/ImageMapLayerSettings.vue";
import { activeScenarioMapEngineKey } from "@/components/injects";

describe("ImageMapLayerSettings", () => {
  function mountComponent(layerOverrides: Record<string, unknown> = {}) {
    return mount(ImageMapLayerSettings, {
      props: {
        layer: {
          id: "image-layer-1",
          type: "ImageLayer",
          name: "Image",
          url: "https://example.test/image.png",
          _status: "initialized",
          ...layerOverrides,
        },
      },
      global: {
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: {
              capabilities: {
                mapLayerTransform: false,
                zoomToMapLayer: true,
                mapLayerExtent: true,
              },
              endMapLayerTransform: vi.fn(),
              startMapLayerTransform: vi.fn(),
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
