// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, nextTick, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScenarioDraw } from "@/modules/scenarioeditor/useScenarioDraw";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  activeFeatureSelectInteractionKey,
  activeLayerKey,
  activeNativeMapKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";

const mocks = vi.hoisted(() => ({
  useMapLibreDrawInteraction: vi.fn(),
  useEditingInteraction: vi.fn(),
  mapLibreStartDrawing: vi.fn(),
  mapLibreStartModify: vi.fn(),
  mapLibreCancel: vi.fn(),
}));

vi.mock("@/composables/maplibreDrawInteraction", () => ({
  useMapLibreDrawInteraction: mocks.useMapLibreDrawInteraction,
}));

vi.mock("@/composables/geoEditing", () => ({
  useEditingInteraction: mocks.useEditingInteraction,
}));

function createInteraction() {
  return {
    startDrawing: mocks.mapLibreStartDrawing,
    currentDrawType: ref(null),
    startModify: mocks.mapLibreStartModify,
    isModifying: ref(false),
    cancel: mocks.mapLibreCancel,
    isDrawing: ref(false),
  };
}

function createScenario() {
  return {
    store: {
      groupUpdate: vi.fn((fn: () => void) => fn()),
    },
    geo: {
      layerItemsLayers: { value: [] },
      getGeometryLayerItemById: vi.fn(() => ({})),
      deleteFeature: vi.fn(),
    },
  };
}

function mountHarness({
  engineRef = shallowRef(),
  scenario = createScenario(),
  pinia = createPinia(),
}: {
  engineRef?: ReturnType<typeof shallowRef>;
  scenario?: ReturnType<typeof createScenario>;
  pinia?: ReturnType<typeof createPinia>;
} = {}) {
  setActivePinia(pinia);
  const activeLayer = ref("layer-1");
  const nativeMap = shallowRef(null);
  const featureSelect = shallowRef(null);
  const exposedDraw = {} as ReturnType<typeof useScenarioDraw>;
  const wrapper = mount(
    defineComponent({
      setup() {
        Object.assign(exposedDraw, useScenarioDraw());
        return {};
      },
      template: "<div />",
    }),
    {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: scenario,
          [activeScenarioMapEngineKey as symbol]: engineRef,
          [activeLayerKey as symbol]: activeLayer,
          [activeNativeMapKey as symbol]: nativeMap,
          [activeFeatureSelectInteractionKey as symbol]: featureSelect,
        },
      },
    },
  );
  return { wrapper, draw: exposedDraw, engineRef, scenario };
}

describe("useScenarioDraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useMapLibreDrawInteraction.mockReturnValue(createInteraction());
  });

  it("initializes MapLibre drawing when the map engine becomes ready after setup", async () => {
    const { draw, engineRef } = mountHarness();

    draw.startDrawing("LineString");
    await nextTick();
    expect(mocks.mapLibreStartDrawing).not.toHaveBeenCalled();

    engineRef.value = {
      map: {
        getNativeMap: () => ({ queryRenderedFeatures: vi.fn() }),
      },
      layers: {},
      suspendFeatureSelection: vi.fn(),
      resumeFeatureSelection: vi.fn(),
    };
    await nextTick();

    expect(mocks.useMapLibreDrawInteraction).toHaveBeenCalledTimes(1);
    draw.startDrawing("LineString");
    expect(mocks.mapLibreStartDrawing).toHaveBeenCalledWith("LineString");
  });

  it("deletes selected features through the scenario store", () => {
    const scenario = createScenario();
    const { draw } = mountHarness({ scenario });
    const { selectedFeatureIds } = useSelectedItems();
    selectedFeatureIds.value.add("feature-1");
    selectedFeatureIds.value.add("feature-2");

    draw.deleteSelected();

    expect(scenario.store.groupUpdate).toHaveBeenCalled();
    expect(scenario.geo.deleteFeature).toHaveBeenCalledWith("feature-1");
    expect(scenario.geo.deleteFeature).toHaveBeenCalledWith("feature-2");
  });
});
