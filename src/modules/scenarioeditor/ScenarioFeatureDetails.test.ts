// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { shallowRef } from "vue";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";
import { activeScenarioKey, activeScenarioMapEngineKey } from "@/components/injects";

vi.mock("@/composables/scenarioActions", () => ({
  useScenarioFeatureActions: () => ({
    onFeatureAction: vi.fn(),
  }),
}));

vi.mock("@/composables/formatting", () => ({
  renderMarkdown: (value: string) => value,
}));

describe("ScenarioFeatureDetails", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("updates feature styling without requiring an OpenLayers select interaction", async () => {
    const updateFeature = vi.fn();
    const feature = {
      id: "feature-1",
      kind: "geometry",
      _pid: "layer-1",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [10, 20],
      },
      properties: {},
      meta: {
        type: "Point",
        name: "Alpha",
      },
      style: {},
    };

    const wrapper = mount(ScenarioFeatureDetails, {
      props: {
        selectedIds: new Set(["feature-1"]),
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioKey as symbol]: {
            geo: {
              getGeometryLayerItemById: vi.fn(() => ({ layerItem: feature })),
              updateFeature,
            },
            store: {
              groupUpdate: (callback: () => void) => callback(),
            },
          },
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: {
              capabilities: {
                featureTransform: false,
              },
            },
            suspendFeatureSelection: vi.fn(),
            resumeFeatureSelection: vi.fn(),
          } as any),
        },
        stubs: {
          GlobalEvents: true,
          EditableLabel: true,
          IconButton: true,
          ItemMedia: true,
          ScenarioFeatureDropdownMenu: true,
          ScenarioFeatureState: true,
          EditMetaForm: true,
          EditMediaForm: true,
          FeatureTransformations: true,
          PanelDataGrid: { template: "<div><slot /></div>" },
          ScrollTabs: { template: "<div><slot /></div>" },
          TabsContent: { template: "<div><slot /></div>" },
          Button: { template: "<button><slot /></button>" },
          ScenarioFeatureVisibilitySettings: true,
          ScenarioFeatureStrokeSettings: true,
          ScenarioFeatureArrowSettings: true,
          ScenarioFeatureFillSettings: true,
          ScenarioFeatureTextSettings: true,
          ScenarioFeatureMarkerSettings: {
            name: "ScenarioFeatureMarkerSettings",
            template: "<div />",
          },
        },
      },
    });

    await wrapper
      .findComponent({ name: "ScenarioFeatureMarkerSettings" })
      .vm.$emit("update", {
        style: { "marker-symbol": "square" },
      });

    expect(updateFeature).toHaveBeenCalledWith("feature-1", {
      style: { "marker-symbol": "square" },
    });
  });
});
