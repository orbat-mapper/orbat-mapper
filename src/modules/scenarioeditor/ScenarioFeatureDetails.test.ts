// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { shallowRef } from "vue";
import { defineComponent } from "vue";
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

  function makeScenarioProvide(overrides: Record<string, unknown> = {}) {
    return {
      geo: {
        getGeometryLayerItemById: vi.fn(),
        updateFeature: vi.fn(),
      },
      store: {
        state: {
          currentTime: Date.parse("2026-04-28T10:00:00Z"),
          unitMap: {},
          sideMap: {},
          sideGroupMap: {},
        },
        groupUpdate: (callback: () => void) => callback(),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
      unitActions: {
        addUnitStateEntry: vi.fn(),
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      ...overrides,
    };
  }

  const baseStubs = {
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
    UnitTreeSelect: true,
    ToggleField: defineComponent({
      name: "ToggleField",
      props: { modelValue: Boolean },
      emits: ["update:modelValue"],
      template:
        "<button data-test='toggle-field' @click=\"$emit('update:modelValue', !modelValue)\"><slot /></button>",
    }),
  };

  it("updates feature styling without requiring an OpenLayers select interaction", async () => {
    const updateFeature = vi.fn();
    const feature = {
      id: "feature-1",
      kind: "geometry",
      _pid: "layer-1",
      geometry: {
        type: "Point",
        coordinates: [10, 20],
      },
      geometryMeta: {
        geometryKind: "Point",
      },
      name: "Alpha",
      style: {},
    };
    const scenario = makeScenarioProvide({
      geo: {
        getGeometryLayerItemById: vi.fn(() => ({ layerItem: feature })),
        updateFeature,
      },
    });

    const wrapper = mount(ScenarioFeatureDetails, {
      props: {
        selectedIds: new Set(["feature-1"]),
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioKey as symbol]: {
            ...scenario,
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
          ...baseStubs,
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

  it("shows the transform tab when the active map engine supports feature transforms", () => {
    const feature = {
      id: "feature-1",
      kind: "geometry",
      _pid: "layer-1",
      geometry: {
        type: "Point",
        coordinates: [10, 20],
      },
      geometryMeta: {
        geometryKind: "Point",
      },
      name: "Alpha",
      style: {},
    };
    const scenario = makeScenarioProvide({
      geo: {
        getGeometryLayerItemById: vi.fn(() => ({ layerItem: feature })),
        updateFeature: vi.fn(),
      },
    });

    const wrapper = mount(ScenarioFeatureDetails, {
      props: {
        selectedIds: new Set(["feature-1"]),
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioKey as symbol]: {
            ...scenario,
          },
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: {
              capabilities: {
                featureTransform: true,
              },
            },
            suspendFeatureSelection: vi.fn(),
            resumeFeatureSelection: vi.fn(),
          } as any),
        },
        stubs: {
          ...baseStubs,
          ScrollTabs: {
            props: ["items"],
            template: "<div><slot /></div>",
          },
          ScenarioFeatureMarkerSettings: true,
        },
      },
    });

    expect(wrapper.find("feature-transformations-stub").exists()).toBe(true);
  });

  it("assigns a line feature to a unit as timestamped unit state", async () => {
    const addUnitStateEntry = vi.fn();
    const setCurrentTime = vi.fn();
    const feature = {
      id: "feature-1",
      kind: "geometry",
      _pid: "layer-1",
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
        ],
      },
      geometryMeta: {
        geometryKind: "LineString",
      },
      userData: {
        coordinateProperties: {
          times: ["2026-04-28T10:00:00Z", "2026-04-28T10:05:00Z"],
        },
      },
      name: "Timed route",
      style: {},
    };
    const scenario = makeScenarioProvide({
      geo: {
        getGeometryLayerItemById: vi.fn(() => ({ layerItem: feature })),
        updateFeature: vi.fn(),
      },
      store: {
        state: {
          currentTime: Date.parse("2026-04-28T10:00:00Z"),
          unitMap: {
            "unit-1": {
              id: "unit-1",
              name: "Alpha",
              sidc: "10031000000000000000",
              subUnits: ["unit-child"],
            },
            "unit-child": {
              id: "unit-child",
              name: "Alpha Child",
              sidc: "10031000000000000000",
              subUnits: [],
            },
          },
          sideMap: {
            "side-1": {
              id: "side-1",
              name: "Blue",
              subUnits: ["unit-1"],
            },
          },
          sideGroupMap: {},
        },
        groupUpdate: (callback: () => void) => callback(),
      },
      time: {
        setCurrentTime,
      },
      unitActions: {
        addUnitStateEntry,
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
    });

    const wrapper = mount(ScenarioFeatureDetails, {
      props: {
        selectedIds: new Set(["feature-1"]),
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioKey as symbol]: scenario,
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
        stubs: baseStubs,
      },
    });

    const assignButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Assign to unit");
    expect(assignButton).toBeTruthy();
    await assignButton!.trigger("click");

    expect(addUnitStateEntry).toHaveBeenCalledTimes(2);
    expect(addUnitStateEntry).toHaveBeenNthCalledWith(
      1,
      "unit-1",
      { t: Date.parse("2026-04-28T10:00:00Z"), location: [10, 60] },
      true,
    );
    expect(addUnitStateEntry).toHaveBeenNthCalledWith(
      2,
      "unit-1",
      { t: Date.parse("2026-04-28T10:05:00Z"), location: [11, 61] },
      true,
    );
    expect(setCurrentTime).toHaveBeenCalledWith(Date.parse("2026-04-28T10:00:00Z"));
  });
});
