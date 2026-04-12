// @vitest-environment jsdom
import { createEventHook } from "@vueuse/core";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MlMapLogic from "@/modules/maplibreview/MlMapLogic.vue";
import { activeScenarioMapEngineKey, searchActionsKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";

const { saveMapLibreMapAsPng } = vi.hoisted(() => ({
  saveMapLibreMapAsPng: vi.fn(),
}));

vi.mock("@/modules/maplibreview/useMaplibreMapDrop.ts", () => ({
  useMaplibreMapDrop: () => ({
    isDragging: ref(false),
    formattedPosition: ref(""),
  }),
}));

vi.mock("@/symbology/milsymbwrapper.ts", () => ({
  symbolGenerator: vi.fn(() => ({
    getSize: () => ({ width: 1, height: 1 }),
    asCanvas: () => ({
      getContext: () => ({
        getImageData: () => new ImageData(2, 2),
      }),
    }),
  })),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");
  return {
    ...actual,
    useRafFn: () => ({
      pause: vi.fn(),
      resume: vi.fn(),
      isActive: ref(false),
    }),
  };
});

vi.mock("@/modules/maplibreview/mapLibreExport", () => ({
  saveMapLibreMapAsPng,
}));

function createSearchActions() {
  return {
    onUnitSelectHook: createEventHook<any>(),
    onLayerSelectHook: createEventHook<any>(),
    onImageLayerSelectHook: createEventHook<any>(),
    onFeatureSelectHook: createEventHook<any>(),
    onEventSelectHook: createEventHook<any>(),
    onPlaceSelectHook: createEventHook<any>(),
    onScenarioActionHook: createEventHook<any>(),
  };
}

function createMockMap() {
  const listeners = new Map<string, Set<(event?: unknown) => void>>();
  const sources = new Map<string, { setData: ReturnType<typeof vi.fn> }>();
  const layers = new Map<string, unknown>();
  const canvas = { style: { cursor: "" } };

  const map = {
    on: vi.fn((event: string, handler: (event?: unknown) => void) => {
      const handlers = listeners.get(event) ?? new Set();
      handlers.add(handler);
      listeners.set(event, handlers);
    }),
    off: vi.fn((event: string, handler: (event?: unknown) => void) => {
      listeners.get(event)?.delete(handler);
    }),
    getSource: vi.fn((id: string) => sources.get(id)),
    addSource: vi.fn((id: string) => {
      sources.set(id, { setData: vi.fn() });
    }),
    getLayer: vi.fn((id: string) => layers.get(id)),
    addLayer: vi.fn((layer: { id: string }) => {
      layers.set(layer.id, layer);
    }),
    setLayoutProperty: vi.fn(),
    setPaintProperty: vi.fn(),
    setFeatureState: vi.fn(),
    removeFeatureState: vi.fn(),
    hasImage: vi.fn(() => false),
    addImage: vi.fn(),
    queryRenderedFeatures: vi.fn(() => []),
    getCanvas: vi.fn(() => canvas),
    setCenter: vi.fn(),
    removeLayer: vi.fn((id: string) => {
      layers.delete(id);
    }),
    removeSource: vi.fn((id: string) => {
      sources.delete(id);
    }),
  };

  return {
    map: map as any,
    canvas,
    getSource(id: string) {
      return sources.get(id);
    },
    emit(event: string, payload?: unknown) {
      listeners.get(event)?.forEach((handler) => handler(payload));
    },
  };
}

describe("MlMapLogic", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    saveMapLibreMapAsPng.mockReset();
  });

  it("creates the unit layer immediately when mounted after the initial map load", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-1",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => [
          {
            id: "unit-1",
            sidc: "SFGPUCI----K",
            shortName: "A1",
            name: "Alpha 1",
            _state: {
              location: [10, 20],
            },
          },
        ]),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    expect(mockMap.map.addSource).toHaveBeenCalledWith(
      "unitSource",
      expect.objectContaining({ type: "geojson" }),
    );
    expect(mockMap.map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "unitLayer", source: "unitSource" }),
    );
    expect(mockMap.getSource("unitSource")?.setData).toHaveBeenCalledTimes(1);
    expect(mockMap.map.setCenter).toHaveBeenCalledWith([10, 20]);
    expect(refreshScenarioFeatureLayers).toHaveBeenCalled();
  });

  it("selects a rendered maplibre feature on click", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const featureSelectSpy = vi.spyOn(searchActions.onFeatureSelectHook, "trigger");
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-2",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => []),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "scenario-feature-layer-1-line" },
        properties: {
          featureId: "feature-1",
          layerId: "layer-1",
        },
      },
    ]);

    mockMap.emit("click", {
      point: { x: 12, y: 20 },
      originalEvent: { shiftKey: false },
    });

    expect(featureSelectSpy).toHaveBeenCalledWith({
      featureId: "feature-1",
      layerId: "layer-1",
      options: { noZoom: true },
    });
  });

  it("keeps unit clicks above feature clicks and updates the pointer cursor for hits", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const unitSelectSpy = vi.spyOn(searchActions.onUnitSelectHook, "trigger");
    const featureSelectSpy = vi.spyOn(searchActions.onFeatureSelectHook, "trigger");
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-3",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => []),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "unitLayer" },
        properties: { id: "unit-1" },
      },
      {
        layer: { id: "scenario-feature-layer-1-line" },
        properties: {
          featureId: "feature-1",
          layerId: "layer-1",
        },
      },
    ]);

    mockMap.emit("mousemove", { point: { x: 1, y: 2 } });
    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: false },
    });

    expect(mockMap.canvas.style.cursor).toBe("pointer");
    expect(unitSelectSpy).toHaveBeenCalledWith({
      unitId: "unit-1",
      options: { noZoom: true },
    });
    expect(featureSelectSpy).not.toHaveBeenCalled();
  });

  it("toggles unit selection on shift+click instead of replacing it", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const unitSelectSpy = vi.spyOn(searchActions.onUnitSelectHook, "trigger");
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-shift",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => []),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    const { selectedUnitIds } = useSelectedItems();
    selectedUnitIds.value.clear();
    selectedUnitIds.value.add("unit-existing");

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "unitLayer" },
        properties: { id: "unit-1" },
      },
    ]);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: true },
    });

    expect(unitSelectSpy).not.toHaveBeenCalled();
    expect(selectedUnitIds.value.has("unit-existing")).toBe(true);
    expect(selectedUnitIds.value.has("unit-1")).toBe(true);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: true },
    });

    expect(selectedUnitIds.value.has("unit-1")).toBe(false);
    expect(selectedUnitIds.value.has("unit-existing")).toBe(true);
  });

  it("clears the selection when clicking empty map area", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-empty-click",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => []),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    const { selectedUnitIds, selectedFeatureIds } = useSelectedItems();
    selectedUnitIds.value.clear();
    selectedFeatureIds.value.clear();
    selectedUnitIds.value.add("unit-existing");
    selectedFeatureIds.value.add("feature-existing");

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([]);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: false },
    });

    expect(selectedUnitIds.value.size).toBe(0);
    expect(selectedFeatureIds.value.size).toBe(0);
  });

  it("preserves the selection when shift+clicking empty map area", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-empty-shift-click",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => []),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    const { selectedUnitIds, selectedFeatureIds } = useSelectedItems();
    selectedUnitIds.value.clear();
    selectedFeatureIds.value.clear();
    selectedUnitIds.value.add("unit-existing");

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([]);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: true },
    });

    expect(selectedUnitIds.value.has("unit-existing")).toBe(true);
  });

  it("does not add a unit to the selection on shift+click when features are selected", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const unitSelectSpy = vi.spyOn(searchActions.onUnitSelectHook, "trigger");
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-cross-type",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => []),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    const { selectedUnitIds, selectedFeatureIds } = useSelectedItems();
    selectedUnitIds.value.clear();
    selectedFeatureIds.value.clear();
    selectedFeatureIds.value.add("feature-existing");

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "unitLayer" },
        properties: { id: "unit-1" },
      },
    ]);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: true },
    });

    expect(unitSelectSpy).not.toHaveBeenCalled();
    expect(selectedUnitIds.value.has("unit-1")).toBe(false);
    expect(selectedFeatureIds.value.has("feature-existing")).toBe(true);
  });

  it("toggles feature selection on shift+click instead of replacing it", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const featureSelectSpy = vi.spyOn(searchActions.onFeatureSelectHook, "trigger");
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-shift-feature",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => []),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    const { selectedFeatureIds } = useSelectedItems();
    selectedFeatureIds.value.clear();
    selectedFeatureIds.value.add("feature-existing");

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "scenario-feature-layer-1-line" },
        properties: {
          featureId: "feature-1",
          layerId: "layer-1",
        },
      },
    ]);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: true },
    });

    expect(featureSelectSpy).not.toHaveBeenCalled();
    expect(selectedFeatureIds.value.has("feature-existing")).toBe(true);
    expect(selectedFeatureIds.value.has("feature-1")).toBe(true);
  });

  it("exports the maplibre map when the shared scenario action is triggered", async () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-export",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => []),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    await searchActions.onScenarioActionHook.trigger({ action: "exportToImage" });

    expect(saveMapLibreMapAsPng).toHaveBeenCalledWith(mockMap.map);
  });
});
