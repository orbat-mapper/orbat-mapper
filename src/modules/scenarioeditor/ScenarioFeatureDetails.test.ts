// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { shallowRef } from "vue";
import { defineComponent } from "vue";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";
import { activeScenarioKey, activeScenarioMapEngineKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";

const onFeatureAction = vi.fn();
vi.mock("@/composables/scenarioActions", () => ({
  useScenarioFeatureActions: () => ({
    onFeatureAction,
  }),
}));

vi.mock("@/composables/formatting", () => ({
  renderMarkdown: (value: string) => value,
}));

describe("ScenarioFeatureDetails", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    onFeatureAction.mockReset();
    useSelectedItems().clear();
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
    FeatureStateGeometryForm: true,
    EditableLabel: true,
    IconButton: {
      props: ["title"],
      template: "<button :title='title' @click='$emit(\"click\")'><slot /></button>",
    },
    ItemMedia: true,
    ScenarioFeatureDropdownMenu: true,
    ScenarioLayerItemState: true,
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

  it("duplicates the selected feature from the details toolbar", async () => {
    onFeatureAction.mockReturnValue(["feature-copy"]);
    const feature = {
      id: "feature-1",
      kind: "geometry",
      _pid: "layer-1",
      geometry: { type: "Point", coordinates: [10, 20] },
      geometryMeta: { geometryKind: "Point" },
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
      props: { selectedIds: new Set(["feature-1"]) },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioKey as symbol]: scenario,
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            layers: { capabilities: { featureTransform: false } },
          }),
        },
        stubs: baseStubs,
      },
    });

    await wrapper.find('button[title="Duplicate feature"]').trigger("click");

    expect(onFeatureAction).toHaveBeenCalledWith(["feature-1"], "duplicate");
    expect([...useSelectedItems().selectedFeatureIds.value]).toEqual(["feature-copy"]);
  });

  it("updates feature styling through the scenario layer controller", async () => {
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

  describe("bulk style editing", () => {
    function makeFeature(
      id: string,
      geometryKind: string,
      style: Record<string, unknown> = {},
    ) {
      return {
        id,
        kind: "geometry",
        _pid: "layer-1",
        geometry: {
          type: geometryKind === "Polygon" ? "Polygon" : "LineString",
          coordinates: [],
        },
        geometryMeta: { geometryKind },
        name: id,
        style,
      };
    }

    function mountWithFeatures(features: ReturnType<typeof makeFeature>[]) {
      const updateFeature = vi.fn();
      const groupUpdate = vi.fn((callback: () => void) => callback());
      const byId = new Map(features.map((f) => [f.id, f]));
      const scenario = makeScenarioProvide({
        geo: {
          getGeometryLayerItemById: vi.fn((id: string) => ({ layerItem: byId.get(id) })),
          updateFeature,
        },
      });
      scenario.store.groupUpdate = groupUpdate;
      const settingsStub = (name: string) => ({
        name,
        props: ["feature"],
        template: `<div data-test="${name}" />`,
      });
      const wrapper = mount(ScenarioFeatureDetails, {
        props: { selectedIds: new Set(features.map((f) => f.id)) },
        global: {
          plugins: [createPinia()],
          provide: {
            [activeScenarioKey as symbol]: scenario,
            [activeScenarioMapEngineKey as symbol]: shallowRef({
              layers: { capabilities: { featureTransform: false } },
              suspendFeatureSelection: vi.fn(),
              resumeFeatureSelection: vi.fn(),
            }),
          },
          stubs: {
            ...baseStubs,
            ScenarioFeaturesGeometryStats: true,
            ScenarioFeatureVisibilitySettings: settingsStub(
              "ScenarioFeatureVisibilitySettings",
            ),
            ScenarioFeatureMarkerSettings: settingsStub("ScenarioFeatureMarkerSettings"),
            ScenarioFeatureStrokeSettings: settingsStub("ScenarioFeatureStrokeSettings"),
            ScenarioFeatureArrowSettings: settingsStub("ScenarioFeatureArrowSettings"),
            ScenarioFeatureFillSettings: settingsStub("ScenarioFeatureFillSettings"),
            ScenarioFeatureTextSettings: settingsStub("ScenarioFeatureTextSettings"),
          },
        },
      });
      return { wrapper, updateFeature, groupUpdate };
    }

    const shown = (wrapper: ReturnType<typeof mount>, name: string) =>
      wrapper.find(`[data-test="${name}"]`).exists();

    const groupTitles = (wrapper: ReturnType<typeof mount>) =>
      wrapper.findAll('[data-test="style-group-title"]').map((w) => w.text());

    it("shows line style sections when all selected features are lines", () => {
      const { wrapper } = mountWithFeatures([
        makeFeature("a", "LineString"),
        makeFeature("b", "LineString"),
      ]);
      expect(groupTitles(wrapper)).toEqual(["Lines"]);
      expect(shown(wrapper, "ScenarioFeatureStrokeSettings")).toBe(true);
      expect(shown(wrapper, "ScenarioFeatureArrowSettings")).toBe(true);
      expect(shown(wrapper, "ScenarioFeatureTextSettings")).toBe(true);
      expect(shown(wrapper, "ScenarioFeatureVisibilitySettings")).toBe(true);
      expect(shown(wrapper, "ScenarioFeatureFillSettings")).toBe(false);
      expect(shown(wrapper, "ScenarioFeatureMarkerSettings")).toBe(false);
    });

    it("groups style controls by geometry kind", () => {
      const { wrapper } = mountWithFeatures([
        makeFeature("p1", "Polygon"),
        makeFeature("l1", "LineString"),
        makeFeature("l2", "LineString"),
      ]);
      expect(groupTitles(wrapper)).toEqual(["Lines", "Polygons"]);
      expect(
        wrapper.findAll('[data-test="style-group-count"]').map((w) => w.text()),
      ).toEqual(["2", "1"]);
      expect(wrapper.findAll('[data-test="ScenarioFeatureStrokeSettings"]')).toHaveLength(
        2,
      );
      expect(shown(wrapper, "ScenarioFeatureArrowSettings")).toBe(true);
      expect(shown(wrapper, "ScenarioFeatureFillSettings")).toBe(true);
    });

    it("applies a style change to all features in the group in one undo step", async () => {
      const { wrapper, updateFeature, groupUpdate } = mountWithFeatures([
        makeFeature("a", "LineString"),
        makeFeature("b", "LineString"),
        makeFeature("c", "Polygon"),
      ]);
      await wrapper
        .findAllComponents({ name: "ScenarioFeatureStrokeSettings" })[0]
        .vm.$emit("update", { style: { stroke: "#ff0000" } });

      expect(groupUpdate).toHaveBeenCalledTimes(1);
      expect(updateFeature).toHaveBeenCalledTimes(2);
      expect(updateFeature).toHaveBeenCalledWith("a", { style: { stroke: "#ff0000" } });
      expect(updateFeature).toHaveBeenCalledWith("b", { style: { stroke: "#ff0000" } });
    });

    it("does not show a group title for a single feature", () => {
      const { wrapper } = mountWithFeatures([makeFeature("a", "LineString")]);
      expect(groupTitles(wrapper)).toEqual([]);
      expect(shown(wrapper, "ScenarioFeatureStrokeSettings")).toBe(true);
    });

    it("uses the first feature's style and flags mixed values", () => {
      const { wrapper } = mountWithFeatures([
        makeFeature("a", "LineString", { stroke: "#ff0000" }),
        makeFeature("b", "LineString", { stroke: "#00ff00" }),
      ]);
      const stroke = wrapper.findComponent({ name: "ScenarioFeatureStrokeSettings" });
      expect(stroke.props("feature").id).toBe("a");
      expect(wrapper.find('[data-test="mixed-styles-note"]').exists()).toBe(true);
    });

    it("does not flag mixed values when styles match", () => {
      const { wrapper } = mountWithFeatures([
        makeFeature("a", "LineString", { stroke: "#ff0000" }),
        makeFeature("b", "LineString", { stroke: "#ff0000" }),
      ]);
      expect(wrapper.find('[data-test="mixed-styles-note"]').exists()).toBe(false);
    });
  });
});
