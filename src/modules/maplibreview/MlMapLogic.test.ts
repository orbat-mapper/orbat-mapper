// @vitest-environment jsdom
import { createEventHook } from "@vueuse/core";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { computed, nextTick, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MlMapLogic from "@/modules/maplibreview/MlMapLogic.vue";
import { activeScenarioMapEngineKey, searchActionsKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import {
  DAY_NIGHT_TERMINATOR_OVERLAY_ID,
  DAY_NIGHT_TERMINATOR_OVERLAY_OPTIONS,
  getDayNightTerminatorGeoJson,
} from "@/geo/dayNightTerminator";
import { symbolGenerator } from "@/symbology/milsymbwrapper";

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
    getAnchor: () => ({ x: 0.5, y: 0.5 }),
    asCanvas: () => ({
      getContext: () => ({
        drawImage: vi.fn(),
        getImageData: () => ({ width: 2, height: 2, data: new Uint8ClampedArray(16) }),
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

vi.mock("@/geo/dayNightTerminatorClient", async () => {
  const { getDayNightTerminatorGeoJson } = await import("@/geo/dayNightTerminator");
  return {
    requestDayNightTerminator: (time: number | string | Date) => {
      const epoch =
        time instanceof Date ? time.getTime() : new Date(time as any).getTime();
      return Promise.resolve(getDayNightTerminatorGeoJson(epoch));
    },
  };
});

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
  const canvas = document.createElement("canvas");
  canvas.style.cursor = "";
  vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
    toJSON: () => ({}),
  });
  const canvasContainer = document.createElement("div");
  let dragPanEnabled = true;
  let touchZoomRotateEnabled = true;

  const dragPan = {
    enable: vi.fn(() => {
      dragPanEnabled = true;
    }),
    disable: vi.fn(() => {
      dragPanEnabled = false;
    }),
    isEnabled: vi.fn(() => dragPanEnabled),
  };

  const touchZoomRotate = {
    enable: vi.fn(() => {
      touchZoomRotateEnabled = true;
    }),
    disable: vi.fn(() => {
      touchZoomRotateEnabled = false;
    }),
    isEnabled: vi.fn(() => touchZoomRotateEnabled),
  };

  const map = {
    on: vi.fn(
      (
        event: string,
        layerOrHandler: string | ((event?: unknown) => void),
        maybeHandler?: (event?: unknown) => void,
      ) => {
        const handler =
          typeof layerOrHandler === "function" ? layerOrHandler : maybeHandler;
        if (!handler) return;
        const handlers = listeners.get(event) ?? new Set();
        handlers.add(handler);
        listeners.set(event, handlers);
      },
    ),
    off: vi.fn(
      (
        event: string,
        layerOrHandler: string | ((event?: unknown) => void),
        maybeHandler?: (event?: unknown) => void,
      ) => {
        const handler =
          typeof layerOrHandler === "function" ? layerOrHandler : maybeHandler;
        if (!handler) return;
        listeners.get(event)?.delete(handler);
      },
    ),
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
    getCanvasContainer: vi.fn(() => canvasContainer),
    dragPan,
    touchZoomRotate,
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
    canvasContainer,
    dragPan,
    touchZoomRotate,
    getSource(id: string) {
      return sources.get(id);
    },
    emit(event: string, payload?: unknown) {
      listeners.get(event)?.forEach((handler) => handler(payload));
    },
  };
}

function getAddedLayerSpec(mockMap: ReturnType<typeof createMockMap>, id: string) {
  return mockMap.map.addLayer.mock.calls
    .map(([layer]: [{ id: string }]) => layer)
    .find((layer: { id: string }) => layer.id === id);
}

function getAddedUnitLayers(mockMap: ReturnType<typeof createMockMap>) {
  return mockMap.map.addLayer.mock.calls
    .map(([layer]: [{ id: string; source?: string }]) => layer)
    .filter(
      (layer: { id: string; source?: string }) =>
        layer.source === "unitSource" && layer.id.startsWith("unitLayer"),
    );
}

function createHoverScenario(
  getGeometryLayerItemById: (id: string) => { layerItem?: { name?: string } },
) {
  return {
    store: {
      state: {
        id: "scenario-hover",
        currentTime: 0,
        featureStateCounter: 0,
      },
    },
    unitActions: {
      getCombinedSymbolOptions: vi.fn(() => ({})),
    },
    geo: {
      everyVisibleUnit: computed(() => []),
      getGeometryLayerItemById: vi.fn(getGeometryLayerItemById),
    },
    time: {
      setCurrentTime: vi.fn(),
    },
    helpers: {
      getUnitById: vi.fn(),
    },
  } as any;
}

function mountMlMapLogic({
  mockMap,
  activeScenario,
  pinia = createPinia(),
  refreshScenarioFeatureLayers = vi.fn(),
}: {
  mockMap: ReturnType<typeof createMockMap>;
  activeScenario: any;
  pinia?: ReturnType<typeof createPinia>;
  refreshScenarioFeatureLayers?: ReturnType<typeof vi.fn>;
}) {
  setActivePinia(pinia);
  return mount(MlMapLogic, {
    props: {
      mlMap: mockMap.map,
      activeScenario,
    },
    global: {
      plugins: [pinia],
      provide: {
        [activeScenarioMapEngineKey as symbol]: shallowRef({
          map: {},
          layers: { refreshScenarioFeatureLayers },
        } as any),
        [searchActionsKey as symbol]: createSearchActions(),
      },
    },
  });
}

describe("MlMapLogic", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    saveMapLibreMapAsPng.mockReset();
    vi.mocked(symbolGenerator).mockClear();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
      getImageData: () => ({ width: 2, height: 2, data: new Uint8ClampedArray(16) }),
    } as any);
    useMapSettingsStore().mapLibreUnitRotationMode = "screen";
    useMapSettingsStore().showFeatureTooltip = true;
    useMapSelectStore().hoverEnabled = true;
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
    expect(getAddedLayerSpec(mockMap, "unitLayer")?.layout).toMatchObject({
      "icon-rotation-alignment": "viewport",
      "text-rotation-alignment": "viewport",
    });
    expect(mockMap.getSource("unitSource")?.setData).toHaveBeenCalled();
    expect(mockMap.map.setCenter).toHaveBeenCalledWith([10, 20]);
    expect(refreshScenarioFeatureLayers).toHaveBeenCalled();
  });

  it("uses the map symbol size when generating MapLibre unit images", () => {
    const mockMap = createMockMap();
    const pinia = createPinia();
    setActivePinia(pinia);
    useMapSettingsStore(pinia).mapIconSize = 44;
    const activeScenario = {
      store: {
        state: {
          id: "scenario-maplibre-symbol-size",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({ size: 12, fillColor: "#112233" })),
      },
      geo: {
        everyVisibleUnit: computed(() => [
          {
            id: "unit-sized",
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

    mountMlMapLogic({ mockMap, activeScenario, pinia });

    const setDataCalls = mockMap.getSource("unitSource")?.setData.mock.calls ?? [];
    const unitData = setDataCalls[setDataCalls.length - 1]?.[0];
    const symbolKey = unitData.features[0].properties.symbolKey;
    mockMap.emit("styleimagemissing", { id: symbolKey });

    expect(symbolGenerator).toHaveBeenCalledWith(
      "SFGPUCI----K",
      expect.objectContaining({
        size: 44,
        fillColor: "#112233",
      }),
    );
  });

  it("uses per-unit map symbol size overrides for MapLibre unit images", () => {
    const mockMap = createMockMap();
    const pinia = createPinia();
    setActivePinia(pinia);
    useMapSettingsStore(pinia).mapIconSize = 44;
    const activeScenario = {
      store: {
        state: {
          id: "scenario-maplibre-symbol-size-override",
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
            id: "unit-sized-override",
            sidc: "SFGPUCI----K",
            shortName: "A1",
            name: "Alpha 1",
            style: {
              mapSymbolSize: 32,
            },
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

    mountMlMapLogic({ mockMap, activeScenario, pinia });

    const setDataCalls = mockMap.getSource("unitSource")?.setData.mock.calls ?? [];
    const unitData = setDataCalls[setDataCalls.length - 1]?.[0];
    const symbolKey = unitData.features[0].properties.symbolKey;
    mockMap.emit("styleimagemissing", { id: symbolKey });

    expect(symbolGenerator).toHaveBeenCalledWith(
      "SFGPUCI----K",
      expect.objectContaining({ size: 32 }),
    );
  });

  it("refreshes MapLibre units when unitStateCounter changes after a size override", async () => {
    const mockMap = createMockMap();
    const unitStateCounter = ref(0);
    const visibleUnits = ref<any[]>([
      {
        id: "unit-live-size-override",
        sidc: "SFGPUCI----K",
        shortName: "A1",
        name: "Alpha 1",
        _state: {
          location: [10, 20],
        },
      },
    ]);
    const activeScenario = {
      store: {
        state: {
          id: "scenario-live-maplibre-symbol-size-override",
          currentTime: 0,
          featureStateCounter: 0,
          get unitStateCounter() {
            return unitStateCounter.value;
          },
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => visibleUnits.value),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    mountMlMapLogic({ mockMap, activeScenario });

    const source = mockMap.getSource("unitSource");
    const initialCallCount = source?.setData.mock.calls.length ?? 0;

    visibleUnits.value[0].style = { mapSymbolSize: 52 };
    unitStateCounter.value++;
    await nextTick();

    expect(source?.setData.mock.calls.length).toBeGreaterThan(initialCallCount);
    const setDataCalls = source?.setData.mock.calls ?? [];
    const unitData = setDataCalls[setDataCalls.length - 1]?.[0];
    const symbolKey = unitData.features[0].properties.symbolKey;
    mockMap.emit("styleimagemissing", { id: symbolKey });

    expect(symbolGenerator).toHaveBeenCalledWith(
      "SFGPUCI----K",
      expect.objectContaining({ size: 52 }),
    );
  });

  it("updates unit rotation alignment live when the map setting changes", async () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const pinia = createPinia();
    setActivePinia(pinia);
    const mapSettings = useMapSettingsStore(pinia);
    const activeScenario = {
      store: {
        state: {
          id: "scenario-unit-rotation-mode",
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
      helpers: {
        getUnitById: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.setLayoutProperty.mockClear();
    mapSettings.mapLibreUnitRotationMode = "mixed";
    await nextTick();

    expect(mockMap.map.setLayoutProperty).toHaveBeenCalledWith(
      "unitLayer",
      "icon-rotation-alignment",
      "map",
    );
    expect(mockMap.map.setLayoutProperty).toHaveBeenCalledWith(
      "unitLayer",
      "text-rotation-alignment",
      "viewport",
    );
  });

  it("updates rotation alignment for all unit visibility layers", async () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const pinia = createPinia();
    setActivePinia(pinia);
    const mapSettings = useMapSettingsStore(pinia);
    const activeScenario = {
      store: {
        state: {
          id: "scenario-unit-rotation-mode-groups",
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
            style: {
              limitVisibility: true,
              minZoom: 6,
              maxZoom: 10,
            },
            _state: {
              location: [10, 20],
            },
          },
        ]),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
      helpers: {
        getUnitById: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    const extraUnitLayer = getAddedUnitLayers(mockMap).find(
      (layer: { id: string }) => layer.id !== "unitLayer",
    );
    expect(extraUnitLayer).toBeDefined();

    mockMap.map.setLayoutProperty.mockClear();
    mapSettings.mapLibreUnitRotationMode = "mixed";
    await nextTick();

    expect(mockMap.map.setLayoutProperty).toHaveBeenCalledWith(
      "unitLayer",
      "icon-rotation-alignment",
      "map",
    );
    expect(mockMap.map.setLayoutProperty).toHaveBeenCalledWith(
      extraUnitLayer!.id,
      "icon-rotation-alignment",
      "map",
    );
    expect(mockMap.map.setLayoutProperty).toHaveBeenCalledWith(
      extraUnitLayer!.id,
      "text-rotation-alignment",
      "viewport",
    );
  });

  it("re-applies the current rotation preset when the MapLibre style reloads", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const pinia = createPinia();
    setActivePinia(pinia);
    const mapSettings = useMapSettingsStore(pinia);
    mapSettings.mapLibreUnitRotationMode = "map";
    const activeScenario = {
      store: {
        state: {
          id: "scenario-style-reload-rotation-mode",
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
      helpers: {
        getUnitById: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {},
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    mockMap.map.removeLayer("unitLayer");
    mockMap.map.removeSource("unitSource");
    mockMap.map.addLayer.mockClear();

    mockMap.emit("style.load");

    expect(getAddedLayerSpec(mockMap, "unitLayer")?.layout).toMatchObject({
      "icon-rotation-alignment": "map",
      "text-rotation-alignment": "map",
    });
  });

  it("syncs the day/night terminator overlay with MapLibre map settings and time", async () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const addGeoJsonOverlay = vi.fn();
    const removeGeoJsonOverlay = vi.fn();
    const pinia = createPinia();
    setActivePinia(pinia);
    const mapSettings = useMapSettingsStore(pinia);
    mapSettings.showDayNightTerminator = true;
    const currentTime = ref(Date.parse("2025-01-01T00:00:00Z"));
    const activeScenario = {
      store: {
        state: {
          id: "scenario-day-night-overlay",
          get currentTime() {
            return currentTime.value;
          },
          set currentTime(value: number) {
            currentTime.value = value;
          },
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
      helpers: {
        getUnitById: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {
              addGeoJsonOverlay,
              removeGeoJsonOverlay,
            },
            layers: { refreshScenarioFeatureLayers },
          } as any),
          [searchActionsKey as symbol]: searchActions,
        },
      },
    });

    await flushPromises();

    expect(addGeoJsonOverlay).toHaveBeenCalledWith(
      DAY_NIGHT_TERMINATOR_OVERLAY_ID,
      getDayNightTerminatorGeoJson(currentTime.value),
      DAY_NIGHT_TERMINATOR_OVERLAY_OPTIONS,
    );

    currentTime.value = Date.parse("2025-06-01T12:00:00Z");
    await flushPromises();

    expect(addGeoJsonOverlay).toHaveBeenLastCalledWith(
      DAY_NIGHT_TERMINATOR_OVERLAY_ID,
      getDayNightTerminatorGeoJson(currentTime.value),
      DAY_NIGHT_TERMINATOR_OVERLAY_OPTIONS,
    );

    const updateCount = addGeoJsonOverlay.mock.calls.length;
    currentTime.value = Date.parse("2025-06-01T12:00:30Z");
    await flushPromises();

    expect(addGeoJsonOverlay).toHaveBeenCalledTimes(updateCount);

    currentTime.value = Date.parse("2025-06-01T12:01:00Z");
    await flushPromises();

    expect(addGeoJsonOverlay).toHaveBeenCalledTimes(updateCount + 1);
    expect(addGeoJsonOverlay).toHaveBeenLastCalledWith(
      DAY_NIGHT_TERMINATOR_OVERLAY_ID,
      getDayNightTerminatorGeoJson(currentTime.value),
      DAY_NIGHT_TERMINATOR_OVERLAY_OPTIONS,
    );

    mapSettings.showDayNightTerminator = false;
    await flushPromises();

    expect(removeGeoJsonOverlay).toHaveBeenCalledWith(DAY_NIGHT_TERMINATOR_OVERLAY_ID);

    mapSettings.showDayNightTerminator = true;
    await flushPromises();

    expect(addGeoJsonOverlay).toHaveBeenCalledTimes(updateCount + 2);
  });

  it("renders units that become visible right after mount without needing further interaction", async () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const visibleUnits = ref<any[]>([]);
    const activeScenario = {
      store: {
        state: {
          id: "scenario-late-visible-units",
          currentTime: 0,
          featureStateCounter: 0,
          unitStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => visibleUnits.value),
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

    const source = mockMap.getSource("unitSource");
    expect(source?.setData).toHaveBeenCalled();
    const initialCallCount = source?.setData.mock.calls.length ?? 0;

    visibleUnits.value = [
      {
        id: "unit-late",
        sidc: "SFGPUCI----K",
        shortName: "B1",
        name: "Bravo 1",
        _state: {
          location: [12, 34],
        },
      },
    ];

    await nextTick();

    const updatedSource = mockMap.getSource("unitSource");
    expect(updatedSource?.setData).toBeDefined();
    expect(updatedSource!.setData.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it("creates zoom-bounded MapLibre unit layers for units with visibility limits", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-unit-visibility-groups",
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
            id: "unit-default",
            sidc: "SFGPUCI----K",
            shortName: "A1",
            name: "Alpha 1",
            _state: {
              location: [10, 20],
            },
          },
          {
            id: "unit-limited",
            sidc: "SFGPUCI----K",
            shortName: "B1",
            name: "Bravo 1",
            style: {
              limitVisibility: true,
              minZoom: 6,
              maxZoom: 10,
            },
            _state: {
              location: [11, 21],
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

    const unitLayers = getAddedUnitLayers(mockMap);
    expect(unitLayers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "unitLayer", source: "unitSource" }),
        expect.objectContaining({
          source: "unitSource",
          minzoom: 6,
          maxzoom: 10,
        }),
      ]),
    );

    const extraUnitLayer = unitLayers.find(
      (layer: { id: string }) => layer.id !== "unitLayer",
    );
    expect(extraUnitLayer?.filter).toEqual([
      "==",
      ["get", "visibilityGroup"],
      expect.any(String),
    ]);

    expect(mockMap.getSource("unitSource")?.setData).toHaveBeenCalledWith(
      expect.objectContaining({
        features: expect.arrayContaining([
          expect.objectContaining({
            properties: expect.objectContaining({
              id: "unit-default",
              visibilityGroup: "always",
            }),
          }),
          expect.objectContaining({
            properties: expect.objectContaining({
              id: "unit-limited",
              visibilityGroup: expect.any(String),
            }),
          }),
        ]),
      }),
    );
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

  it("shows hover tooltip for a named rendered scenario feature", async () => {
    vi.useFakeTimers();
    const mockMap = createMockMap();
    const wrapper = mountMlMapLogic({
      mockMap,
      activeScenario: createHoverScenario((id) => ({
        layerItem: id === "feature-1" ? { name: "Bridge Alpha" } : undefined,
      })),
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

    mockMap.emit("mousemove", {
      point: { x: 100, y: 200 },
      lngLat: { lng: 10, lat: 20 },
    });
    await nextTick();
    vi.advanceTimersByTime(200);
    await nextTick();

    const tooltip = wrapper.find("[data-test='hover-feature-tooltip']");
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toBe("Bridge Alpha");
    expect(tooltip.attributes("style")).toContain("left: 112px");
    expect(tooltip.attributes("style")).toContain("top: 212px");
    vi.useRealTimers();
  });

  it("hides hover tooltip for unnamed rendered scenario features", async () => {
    vi.useFakeTimers();
    const mockMap = createMockMap();
    const wrapper = mountMlMapLogic({
      mockMap,
      activeScenario: createHoverScenario(() => ({ layerItem: { name: "" } })),
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "scenario-feature-layer-1-line" },
        properties: {
          featureId: "feature-empty",
          layerId: "layer-1",
        },
      },
    ]);

    mockMap.emit("mousemove", {
      point: { x: 100, y: 200 },
      lngLat: { lng: 10, lat: 20 },
    });
    await nextTick();
    vi.advanceTimersByTime(200);
    await nextTick();

    expect(wrapper.find("[data-test='hover-feature-tooltip']").exists()).toBe(false);
    vi.useRealTimers();
  });

  it("uses the first named rendered scenario feature and ignores unit hits", async () => {
    vi.useFakeTimers();
    const mockMap = createMockMap();
    const wrapper = mountMlMapLogic({
      mockMap,
      activeScenario: createHoverScenario((id) => {
        if (id === "feature-empty") return { layerItem: { name: "" } };
        if (id === "feature-1") return { layerItem: { name: "Bridge Alpha" } };
        return { layerItem: undefined };
      }),
    });

    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "unitLayer" },
        properties: { id: "unit-1" },
      },
      {
        layer: { id: "scenario-feature-layer-1-line" },
        properties: {
          featureId: "feature-empty",
          layerId: "layer-1",
        },
      },
      {
        layer: { id: "scenario-feature-layer-1-line" },
        properties: {
          featureId: "feature-1",
          layerId: "layer-1",
        },
      },
    ]);

    mockMap.emit("mousemove", {
      point: { x: 100, y: 200 },
      lngLat: { lng: 10, lat: 20 },
    });
    await nextTick();
    vi.advanceTimersByTime(200);
    await nextTick();

    const tooltip = wrapper.find("[data-test='hover-feature-tooltip']");
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toBe("Bridge Alpha");
    vi.useRealTimers();
  });

  it("does not show hover tooltip when feature tooltips or hover mode are disabled", async () => {
    vi.useFakeTimers();
    const mockMap = createMockMap();
    const pinia = createPinia();
    setActivePinia(pinia);
    useMapSettingsStore(pinia).showFeatureTooltip = false;
    const wrapper = mountMlMapLogic({
      mockMap,
      pinia,
      activeScenario: createHoverScenario(() => ({
        layerItem: { name: "Bridge Alpha" },
      })),
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

    mockMap.emit("mousemove", {
      point: { x: 100, y: 200 },
      lngLat: { lng: 10, lat: 20 },
    });
    await nextTick();
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find("[data-test='hover-feature-tooltip']").exists()).toBe(false);

    useMapSettingsStore(pinia).showFeatureTooltip = true;
    useMapSelectStore(pinia).hoverEnabled = false;
    mockMap.emit("mousemove", {
      point: { x: 100, y: 200 },
      lngLat: { lng: 10, lat: 20 },
    });
    await nextTick();
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find("[data-test='hover-feature-tooltip']").exists()).toBe(false);
    vi.useRealTimers();
  });

  it("clears hover tooltip during unit drag and when the pointer leaves the map", async () => {
    vi.useFakeTimers();
    const mockMap = createMockMap();
    const pinia = createPinia();
    setActivePinia(pinia);
    const unitSettings = useUnitSettingsStore(pinia);
    const unit = {
      id: "unit-1",
      sidc: "SFGPUCI----K",
      shortName: "A1",
      name: "Alpha 1",
      _state: {
        location: [10, 20],
      },
    };
    const wrapper = mountMlMapLogic({
      mockMap,
      pinia,
      activeScenario: {
        ...createHoverScenario((id) => ({
          layerItem: id === "feature-1" ? { name: "Bridge Alpha" } : undefined,
        })),
        store: {
          state: {
            id: "scenario-hover-clear",
            currentTime: 0,
            featureStateCounter: 0,
          },
          groupUpdate: (fn: () => void) => fn(),
        },
        unitActions: {
          getCombinedSymbolOptions: vi.fn(() => ({})),
          isUnitLocked: vi.fn(() => false),
        },
        geo: {
          everyVisibleUnit: computed(() => [unit]),
          addUnitPosition: vi.fn(),
          getGeometryLayerItemById: vi.fn((id: string) => ({
            layerItem: id === "feature-1" ? { name: "Bridge Alpha" } : undefined,
          })),
        },
        helpers: {
          getUnitById: vi.fn((id: string) => (id === unit.id ? unit : undefined)),
        },
        time: {
          setCurrentTime: vi.fn(),
        },
      } as any,
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
    mockMap.emit("mousemove", {
      point: { x: 100, y: 200 },
      lngLat: { lng: 10, lat: 20 },
    });
    await nextTick();
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find("[data-test='hover-feature-tooltip']").exists()).toBe(true);

    unitSettings.moveUnitEnabled = true;
    await nextTick();
    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "unitLayer" },
        properties: { id: "unit-1" },
      },
    ]);
    mockMap.emit("mousedown", {
      point: { x: 1, y: 2 },
      lngLat: { lng: 10, lat: 20 },
      preventDefault: vi.fn(),
      originalEvent: {
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      },
    });
    mockMap.emit("mousemove", {
      point: { x: 2, y: 3 },
      lngLat: { lng: 11, lat: 21 },
    });
    await nextTick();
    expect(wrapper.find("[data-test='hover-feature-tooltip']").exists()).toBe(false);

    mockMap.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "scenario-feature-layer-1-line" },
        properties: {
          featureId: "feature-1",
          layerId: "layer-1",
        },
      },
    ]);
    mockMap.emit("mouseup", {
      lngLat: { lng: 11, lat: 21 },
    });
    unitSettings.moveUnitEnabled = false;
    await nextTick();
    mockMap.emit("mousemove", {
      point: { x: 100, y: 200 },
      lngLat: { lng: 10, lat: 20 },
    });
    await nextTick();
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find("[data-test='hover-feature-tooltip']").exists()).toBe(true);

    mockMap.emit("mouseleave");
    await nextTick();
    expect(wrapper.find("[data-test='hover-feature-tooltip']").exists()).toBe(false);
    vi.useRealTimers();
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

  it("treats zoom-bounded unit layers as interactive unit hits", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const unitSelectSpy = vi.spyOn(searchActions.onUnitSelectHook, "trigger");
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-unit-layer-prefix-hit",
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
        layer: { id: "unitLayer-visibility-group" },
        properties: { id: "unit-1" },
      },
    ]);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: false },
    });

    expect(unitSelectSpy).toHaveBeenCalledWith({
      unitId: "unit-1",
      options: { noZoom: true },
    });
  });

  it("keeps the crosshair cursor while map placement mode is active", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const pinia = createPinia();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-placement-cursor",
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

    setActivePinia(pinia);
    const mapSelectStore = useMapSelectStore(pinia);
    mapSelectStore.hoverEnabled = false;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [pinia],
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

    mockMap.emit("mousemove", { point: { x: 1, y: 2 } });

    expect(mockMap.canvas.style.cursor).toBe("crosshair");
  });

  it("moves a unit when maplibre move mode is enabled", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const addUnitPosition = vi.fn();
    const unit = {
      id: "unit-1",
      sidc: "SFGPUCI----K",
      shortName: "A1",
      name: "Alpha 1",
      _state: {
        location: [10, 20],
      },
    };
    const pinia = createPinia();
    setActivePinia(pinia);
    useUnitSettingsStore(pinia).moveUnitEnabled = true;

    const activeScenario = {
      store: {
        state: {
          id: "scenario-move-unit",
          currentTime: 0,
          featureStateCounter: 0,
        },
        groupUpdate: (fn: () => void) => fn(),
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
        isUnitLocked: vi.fn(() => false),
      },
      geo: {
        everyVisibleUnit: computed(() => [unit]),
        addUnitPosition,
      },
      helpers: {
        getUnitById: vi.fn((id: string) => (id === unit.id ? unit : undefined)),
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
        plugins: [pinia],
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

    mockMap.emit("mousedown", {
      point: { x: 1, y: 2 },
      lngLat: { lng: 10, lat: 20 },
      preventDefault: vi.fn(),
      originalEvent: {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      },
    });
    mockMap.emit("mousemove", {
      point: { x: 2, y: 3 },
      lngLat: { lng: 12, lat: 23 },
    });
    mockMap.emit("mouseup", {
      lngLat: { lng: 12, lat: 23 },
    });

    expect(addUnitPosition).toHaveBeenCalledWith("unit-1", [12, 23]);
    expect(mockMap.canvas.style.cursor).toBe("");
  });

  it("moves a unit on touch drag and restores map gestures afterwards", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const addUnitPosition = vi.fn();
    const unit = {
      id: "unit-1",
      sidc: "SFGPUCI----K",
      shortName: "A1",
      name: "Alpha 1",
      _state: {
        location: [10, 20],
      },
    };
    const pinia = createPinia();
    setActivePinia(pinia);
    useUnitSettingsStore(pinia).moveUnitEnabled = true;

    const activeScenario = {
      store: {
        state: {
          id: "scenario-move-touch-unit",
          currentTime: 0,
          featureStateCounter: 0,
        },
        groupUpdate: (fn: () => void) => fn(),
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
        isUnitLocked: vi.fn(() => false),
      },
      geo: {
        everyVisibleUnit: computed(() => [unit]),
        addUnitPosition,
      },
      helpers: {
        getUnitById: vi.fn((id: string) => (id === unit.id ? unit : undefined)),
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
        plugins: [pinia],
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

    mockMap.emit("touchstart", {
      point: { x: 1, y: 2 },
      lngLat: { lng: 10, lat: 20 },
      preventDefault: vi.fn(),
      originalEvent: {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      },
    });
    expect(mockMap.dragPan.disable).toHaveBeenCalledTimes(1);
    expect(mockMap.touchZoomRotate.disable).toHaveBeenCalledTimes(1);

    mockMap.emit("touchmove", {
      point: { x: 2, y: 3 },
      lngLat: { lng: 12, lat: 23 },
    });
    mockMap.emit("touchend", {
      lngLat: { lng: 12, lat: 23 },
    });

    expect(addUnitPosition).toHaveBeenCalledWith("unit-1", [12, 23]);
    expect(mockMap.dragPan.enable).toHaveBeenCalledTimes(1);
    expect(mockMap.touchZoomRotate.enable).toHaveBeenCalledTimes(1);
  });

  it("shows a move cursor over movable units while maplibre move mode is enabled", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const unit = {
      id: "unit-1",
      sidc: "SFGPUCI----K",
      shortName: "A1",
      name: "Alpha 1",
      _state: {
        location: [10, 20],
      },
    };
    const pinia = createPinia();
    setActivePinia(pinia);
    useUnitSettingsStore(pinia).moveUnitEnabled = true;

    const activeScenario = {
      store: {
        state: {
          id: "scenario-move-hover",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
        isUnitLocked: vi.fn(() => false),
      },
      geo: {
        everyVisibleUnit: computed(() => [unit]),
        addUnitPosition: vi.fn(),
      },
      helpers: {
        getUnitById: vi.fn((id: string) => (id === unit.id ? unit : undefined)),
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
        plugins: [pinia],
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

    mockMap.emit("mousemove", {
      point: { x: 1, y: 2 },
      lngLat: { lng: 10, lat: 20 },
    });

    expect(mockMap.canvas.style.cursor).toBe("move");

    activeScenario.unitActions.isUnitLocked.mockReturnValue(true);

    mockMap.emit("mousemove", {
      point: { x: 1, y: 2 },
      lngLat: { lng: 10, lat: 20 },
    });

    expect(mockMap.canvas.style.cursor).toBe("");
  });

  it("selects a unit on click while maplibre move mode is enabled", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const unitSelectSpy = vi.spyOn(searchActions.onUnitSelectHook, "trigger");
    const refreshScenarioFeatureLayers = vi.fn();
    const unit = {
      id: "unit-1",
      sidc: "SFGPUCI----K",
      shortName: "A1",
      name: "Alpha 1",
      _state: {
        location: [10, 20],
      },
    };
    const pinia = createPinia();
    setActivePinia(pinia);
    useUnitSettingsStore(pinia).moveUnitEnabled = true;

    const activeScenario = {
      store: {
        state: {
          id: "scenario-move-select",
          currentTime: 0,
          featureStateCounter: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
        isUnitLocked: vi.fn(() => false),
      },
      geo: {
        everyVisibleUnit: computed(() => [unit]),
        addUnitPosition: vi.fn(),
      },
      helpers: {
        getUnitById: vi.fn((id: string) => (id === unit.id ? unit : undefined)),
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
        plugins: [pinia],
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

    mockMap.emit("mousedown", {
      point: { x: 1, y: 2 },
      lngLat: { lng: 10, lat: 20 },
      preventDefault: vi.fn(),
      originalEvent: {
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      },
    });
    mockMap.emit("mouseup", {
      lngLat: { lng: 10, lat: 20 },
    });

    expect(unitSelectSpy).toHaveBeenCalledWith({
      unitId: "unit-1",
      options: { noZoom: true },
    });
  });

  it("toggles unit selection on shift+click instead of replacing it", async () => {
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

    const firstMouseDown = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      shiftKey: true,
      button: 0,
      clientX: 1,
      clientY: 2,
    });
    const firstClick = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      shiftKey: true,
      clientX: 1,
      clientY: 2,
    });
    mockMap.canvasContainer.dispatchEvent(firstMouseDown);
    mockMap.canvasContainer.dispatchEvent(firstClick);

    expect(firstMouseDown.defaultPrevented).toBe(true);
    expect(firstClick.defaultPrevented).toBe(true);
    expect(unitSelectSpy).not.toHaveBeenCalled();
    expect(selectedUnitIds.value.has("unit-existing")).toBe(true);
    expect(selectedUnitIds.value.has("unit-1")).toBe(true);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: true },
    });

    expect(selectedUnitIds.value.has("unit-1")).toBe(true);
    expect(selectedUnitIds.value.has("unit-existing")).toBe(true);

    const secondMouseDown = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      shiftKey: true,
      button: 0,
      clientX: 1,
      clientY: 2,
    });
    const secondClick = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      shiftKey: true,
      clientX: 1,
      clientY: 2,
    });
    mockMap.canvasContainer.dispatchEvent(secondMouseDown);
    mockMap.canvasContainer.dispatchEvent(secondClick);

    expect(secondMouseDown.defaultPrevented).toBe(true);
    expect(secondClick.defaultPrevented).toBe(true);
    expect(selectedUnitIds.value.has("unit-1")).toBe(false);
    expect(selectedUnitIds.value.has("unit-existing")).toBe(true);

    mockMap.emit("click", {
      point: { x: 1, y: 2 },
      originalEvent: { shiftKey: true },
    });

    expect(unitSelectSpy).not.toHaveBeenCalled();
    expect(selectedUnitIds.value.has("unit-existing")).toBe(true);
    expect(selectedUnitIds.value.has("unit-1")).toBe(false);

    mockMap.canvasContainer.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        shiftKey: true,
        button: 0,
        clientX: 1,
        clientY: 2,
      }),
    );
    window.dispatchEvent(
      new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        shiftKey: true,
        button: 0,
        clientX: 1,
        clientY: 2,
      }),
    );
    await new Promise((resolve) => window.setTimeout(resolve, 0));

    const unrelatedClick = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: 1,
      clientY: 2,
    });
    mockMap.canvasContainer.dispatchEvent(unrelatedClick);

    expect(unrelatedClick.defaultPrevented).toBe(false);
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

  it("does not throw when history waypoint layers are temporarily missing during style reload", () => {
    const mockMap = createMockMap();
    const searchActions = createSearchActions();
    const refreshScenarioFeatureLayers = vi.fn();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-missing-history-layer",
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
      helpers: {
        getUnitById: vi.fn(),
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

    mockMap.map.queryRenderedFeatures.mockImplementation(
      (_point: unknown, options?: any) => {
        if (
          options?.layers?.includes("unitHistoryWaypointLayer") &&
          !mockMap.map.getLayer("unitHistoryWaypointLayer")
        ) {
          throw new Error(
            "The layer 'unitHistoryWaypointLayer' does not exist in the map's style and cannot be queried for features.",
          );
        }
        return [];
      },
    );

    mockMap.map.removeLayer("unitHistoryWaypointLayer");

    expect(() => {
      mockMap.emit("click", {
        point: { x: 10, y: 12 },
        lngLat: { lng: 1, lat: 2 },
        originalEvent: {
          shiftKey: false,
          ctrlKey: false,
          metaKey: false,
          altKey: false,
        },
      });
    }).not.toThrow();
  });
});
