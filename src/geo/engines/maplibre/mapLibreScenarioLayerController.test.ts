// @vitest-environment jsdom
import { createEventHook } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMapLibreScenarioLayerController } from "@/geo/engines/maplibre/mapLibreScenarioLayerController";

function createMockMap() {
  const listeners = new Map<string, Set<(event?: unknown) => void>>();
  const sources = new Map<string, { setData: ReturnType<typeof vi.fn> }>();
  const layers = new Map<string, unknown>();

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
    removeSource: vi.fn((id: string) => {
      sources.delete(id);
    }),
    getLayer: vi.fn((id: string) => layers.get(id)),
    addLayer: vi.fn((layer: { id: string }) => {
      layers.set(layer.id, layer);
    }),
    removeLayer: vi.fn((id: string) => {
      layers.delete(id);
    }),
    hasImage: vi.fn(() => false),
    addImage: vi.fn(),
  };

  return {
    map: map as any,
    sources,
    layers,
    emit(event: string, payload?: unknown) {
      listeners.get(event)?.forEach((handler) => handler(payload));
    },
    clearStyle() {
      sources.clear();
      layers.clear();
    },
  };
}

function createScenario() {
  const mapLayerHook = createEventHook<any>();
  const featureLayerHook = createEventHook<any>();
  const undoRedoHook = createEventHook<any>();
  const layerItemsLayers = {
    value: [
      {
        id: "layer-1",
        kind: "overlay",
        name: "Layer 1",
        _hidden: false,
        items: [
          {
            id: "feature-1",
            kind: "geometry",
            _pid: "layer-1",
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [15, 25],
              ],
            },
            properties: {},
            meta: {
              type: "LineString",
            },
            style: {
              "arrow-end": "arrow",
            },
          },
        ],
      },
    ],
  };

  return {
    scenario: {
      geo: {
        layerItemsLayers,
        onMapLayerEvent: mapLayerHook.on,
        onFeatureLayerEvent: featureLayerHook.on,
        getGeometryLayerItemById: vi.fn((featureId: string) => ({
          layerItem: layerItemsLayers.value[0].items.find(
            (item: any) => item.id === featureId,
          ),
        })),
        getFullLayerItemsLayer: vi.fn((layerId: string) =>
          layerItemsLayers.value.find((layer: any) => layer.id === layerId),
        ),
        getLayerById: vi.fn((layerId: string) =>
          layerItemsLayers.value.find((layer: any) => layer.id === layerId),
        ),
        getMapLayerById: vi.fn(() => undefined),
      },
      store: {
        onUndoRedo: undoRedoHook.on,
      },
    } as any,
    layerItemsLayers,
    mapLayerHook,
    featureLayerHook,
    undoRedoHook,
  };
}

describe("createMapLibreScenarioLayerController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  it("renders feature sources and layers when a scenario is bound", () => {
    const mockMap = createMockMap();
    const { scenario } = createScenario();
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);

    expect(mockMap.map.addSource).toHaveBeenCalled();
    expect(mockMap.map.addLayer).toHaveBeenCalled();
  });

  it("refreshes existing GeoJSON sources instead of staying a no-op", () => {
    const mockMap = createMockMap();
    const { scenario, layerItemsLayers } = createScenario();
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);

    layerItemsLayers.value = [
      {
        ...layerItemsLayers.value[0],
        items: [
          {
            ...layerItemsLayers.value[0].items[0],
            id: "feature-1",
            kind: "geometry",
            _pid: "layer-1",
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [30, 40],
              ],
            },
            properties: {},
            meta: {
              type: "LineString",
            },
            style: {
              "arrow-end": "arrow",
            },
          },
        ],
      },
    ];

    controller.refreshScenarioFeatureLayers({ filterVisible: true });

    const source = Array.from(mockMap.sources.values())[0];
    expect(source?.setData).toHaveBeenCalled();
  });

  it("rebuilds custom feature layers after a MapLibre style reload", () => {
    const mockMap = createMockMap();
    const { scenario } = createScenario();
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);
    mockMap.clearStyle();

    mockMap.emit("style.load");

    expect(mockMap.map.addSource).toHaveBeenCalledTimes(6);
    expect(mockMap.map.addLayer).toHaveBeenCalled();
  });

  it("tolerates cleanup after the native MapLibre style is already gone", () => {
    const mockMap = createMockMap();
    const { scenario } = createScenario();
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    const cleanup = controller.bindScenario(scenario);
    mockMap.map.getLayer.mockImplementation(() => {
      throw new Error("style removed");
    });
    mockMap.map.getSource.mockImplementation(() => {
      throw new Error("style removed");
    });

    expect(() => cleanup()).not.toThrow();
  });

  it("keeps using the latest filterVisible mode for event-driven refreshes", async () => {
    const mockMap = createMockMap();
    const { scenario, layerItemsLayers, featureLayerHook } = createScenario();
    layerItemsLayers.value[0]._hidden = true;
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);
    expect(mockMap.map.addSource).not.toHaveBeenCalled();

    controller.refreshScenarioFeatureLayers({ filterVisible: false });
    mockMap.map.addSource.mockClear();
    const source = Array.from(mockMap.sources.values())[0];
    source?.setData.mockClear();

    await featureLayerHook.trigger({ type: "updateFeature", id: "feature-1" });

    expect(mockMap.map.addSource).not.toHaveBeenCalled();
    expect(source?.setData).toHaveBeenCalled();
  });

  it("detaches MapLibre listeners when the scenario binding is cleaned up", () => {
    const mockMap = createMockMap();
    const { scenario } = createScenario();
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    const cleanup = controller.bindScenario(scenario);
    cleanup();

    expect(mockMap.map.off).toHaveBeenCalledWith("style.load", expect.any(Function));
    expect(mockMap.map.off).toHaveBeenCalledWith(
      "styleimagemissing",
      expect.any(Function),
    );
  });
});
