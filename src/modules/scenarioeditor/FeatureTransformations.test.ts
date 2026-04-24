// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, reactive, ref, shallowRef } from "vue";
import FeatureTransformations from "@/modules/scenarioeditor/FeatureTransformations.vue";
import {
  activeLayerKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import { useTransformSettingsStore } from "@/stores/transformStore";

describe("FeatureTransformations", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useSelectedItems().clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders preview through the shared map adapter and cleans it up on unmount", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const selected = useSelectedItems();
    selected.selectedUnitIds.value.add("unit-1");

    const addGeoJsonOverlay = vi.fn();
    const removeGeoJsonOverlay = vi.fn();
    const state = reactive({
      currentTime: 1000,
      unitStateCounter: 0,
    });

    const wrapper = mount(FeatureTransformations, {
      props: { unitMode: true },
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            helpers: {
              getUnitById: (id: string) =>
                id === "unit-1" ? { id, name: "Unit 1", location: [10, 20] } : undefined,
            },
            geo: {
              addFeature: vi.fn(),
              updateFeature: vi.fn(),
              addFeatureStateGeometry: vi.fn(),
              getGeometryLayerItemById: vi.fn(),
            },
            time: {
              scenarioTime: ref(1000),
            },
            store: {
              state,
            },
          },
          [activeLayerKey as symbol]: ref("layer-1"),
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {
              addGeoJsonOverlay,
              removeGeoJsonOverlay,
            },
          }),
        },
        stubs: {
          Tabs: { template: "<div><slot /></div>" },
          TabsList: { template: "<div><slot /></div>" },
          TabsTrigger: { template: "<button><slot /></button>" },
          TabsContent: { template: "<div><slot /></div>" },
          TransformForm: { template: "<div />" },
          Button: { template: "<button><slot /></button>" },
          BaseButton: { template: "<button><slot /></button>" },
          InputCheckbox: { template: "<label />" },
          ScenarioFeatureSelect: { template: "<div />" },
          Label: { template: "<label><slot /></label>" },
        },
      },
    });

    state.currentTime += 1;
    await nextTick();
    vi.runAllTimers();
    await nextTick();

    expect(addGeoJsonOverlay).toHaveBeenCalledTimes(1);
    expect(addGeoJsonOverlay).toHaveBeenCalledWith(
      expect.stringContaining("transform-preview-"),
      expect.any(Object),
      expect.objectContaining({
        style: expect.objectContaining({
          strokeColor: "red",
        }),
      }),
    );

    wrapper.unmount();

    expect(removeGeoJsonOverlay).toHaveBeenCalledWith(
      expect.stringContaining("transform-preview-"),
    );
  });

  it("does not deep-traverse map adapter internals when the map contains Set state", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const selected = useSelectedItems();
    selected.selectedFeatureIds.value.add("feature-1");

    const addGeoJsonOverlay = vi.fn();
    const removeGeoJsonOverlay = vi.fn();
    const state = reactive({
      currentTime: 1000,
      unitStateCounter: 0,
    });

    const wrapper = mount(FeatureTransformations, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            helpers: {
              getUnitById: vi.fn(),
            },
            geo: {
              addFeature: vi.fn(),
              updateFeature: vi.fn(),
              addFeatureStateGeometry: vi.fn(),
              getGeometryLayerItemById: vi.fn(() => ({
                layerItem: {
                  id: "feature-1",
                  name: "Feature 1",
                  geometry: {
                    type: "Point",
                    coordinates: [10, 20],
                  },
                },
              })),
            },
            time: {
              scenarioTime: ref(1000),
            },
            store: {
              state,
            },
          },
          [activeLayerKey as symbol]: ref("layer-1"),
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {
              internalSet: new Set(["x"]),
              internalMap: new Map([["a", 1]]),
              addGeoJsonOverlay,
              removeGeoJsonOverlay,
            },
          }),
        },
        stubs: {
          Tabs: { template: "<div><slot /></div>" },
          TabsList: { template: "<div><slot /></div>" },
          TabsTrigger: { template: "<button><slot /></button>" },
          TabsContent: { template: "<div><slot /></div>" },
          TransformForm: { template: "<div />" },
          Button: { template: "<button><slot /></button>" },
          BaseButton: { template: "<button><slot /></button>" },
          InputCheckbox: { template: "<label />" },
          ScenarioFeatureSelect: { template: "<div />" },
          Label: { template: "<label><slot /></label>" },
        },
      },
    });

    state.currentTime += 1;
    await nextTick();
    vi.runAllTimers();
    await nextTick();

    expect(addGeoJsonOverlay).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it.each([
    [
      "Point",
      {
        type: "Point",
        coordinates: [10, 20],
      },
    ],
    [
      "LineString",
      {
        type: "LineString",
        coordinates: [
          [10, 20],
          [11, 21],
        ],
      },
    ],
  ] as const)(
    "updates geometryKind when updating an existing %s feature with transformed geometry",
    async (geometryKind, geometry) => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const selected = useSelectedItems();
      selected.selectedFeatureIds.value.add("source-feature");

      const transformStore = useTransformSettingsStore();
      transformStore.updateActiveFeature = "target-feature";
      transformStore.showPreview = false;

      const updateFeature = vi.fn();

      const wrapper = mount(FeatureTransformations, {
        global: {
          plugins: [pinia],
          provide: {
            [activeScenarioKey as symbol]: {
              helpers: {
                getUnitById: vi.fn(),
              },
              geo: {
                addFeature: vi.fn(),
                updateFeature,
                addFeatureStateGeometry: vi.fn(),
                getGeometryLayerItemById: vi.fn((id: string) =>
                  id === "source-feature"
                    ? {
                        layerItem: {
                          kind: "geometry",
                          id,
                          name: `Source ${geometryKind}`,
                          geometry,
                          geometryMeta: { geometryKind },
                          style: {},
                        },
                      }
                    : { layerItem: undefined },
                ),
              },
              time: {
                scenarioTime: ref(1000),
              },
              store: {
                state: reactive({
                  currentTime: 1000,
                  unitStateCounter: 0,
                }),
              },
            },
            [activeLayerKey as symbol]: ref("layer-1"),
            [activeScenarioMapEngineKey as symbol]: shallowRef({
              map: {
                addGeoJsonOverlay: vi.fn(),
                removeGeoJsonOverlay: vi.fn(),
              },
            }),
          },
          stubs: {
            Tabs: { template: "<div><slot /></div>" },
            TabsList: { template: "<div><slot /></div>" },
            TabsTrigger: { template: "<button><slot /></button>" },
            TabsContent: { template: "<div><slot /></div>" },
            TransformForm: { template: "<div />" },
            Button: { template: "<button><slot /></button>" },
            BaseButton: { template: '<button v-bind="$attrs"><slot /></button>' },
            InputCheckbox: { template: "<label />" },
            ScenarioFeatureSelect: { template: "<div />" },
            Label: { template: "<label><slot /></label>" },
          },
        },
      });

      const buttons = wrapper.findAll("button");
      await buttons[buttons.length - 1].trigger("click");

      expect(updateFeature).toHaveBeenCalledWith("target-feature", {
        geometry: expect.objectContaining({ type: "Polygon" }),
        geometryMeta: { geometryKind: "Polygon" },
      });
    },
  );
});
