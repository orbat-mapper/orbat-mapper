// @vitest-environment jsdom
import { createEventHook } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { toLonLat } from "ol/proj";
import { createMapLibreScenarioLayerController } from "@/geo/engines/maplibre/mapLibreScenarioLayerController";

function createMockMap() {
  const listeners = new Map<string, Set<(event?: unknown) => void>>();
  const sources = new Map<
    string,
    { setData: ReturnType<typeof vi.fn>; updateImage: ReturnType<typeof vi.fn> }
  >();
  const layers = new Map<string, unknown>();
  const container = document.createElement("div");
  const canvas = document.createElement("canvas");
  Object.defineProperty(canvas, "clientWidth", { value: 800 });
  Object.defineProperty(canvas, "clientHeight", { value: 600 });
  canvas.getBoundingClientRect = vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }));

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
      sources.set(id, { setData: vi.fn(), updateImage: vi.fn() });
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
    setLayoutProperty: vi.fn(),
    setPaintProperty: vi.fn(),
    getContainer: vi.fn(() => container),
    getCanvas: vi.fn(() => canvas),
    project: vi.fn((coordinate: [number, number]) => ({
      x: coordinate[0],
      y: coordinate[1],
    })),
    unproject: vi.fn(([x, y]: [number, number]) => ({
      lng: x,
      lat: y,
    })),
    dragPan: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
  };

  return {
    map: map as any,
    sources,
    layers,
    container,
    canvas,
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
  const mapLayers = {
    value: [] as any[],
  };
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
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [15, 25],
              ],
            },
            geometryMeta: {
              geometryKind: "LineString",
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
        getMapLayerById: vi.fn((layerId: string) =>
          mapLayers.value.find((layer: any) => layer.id === layerId),
        ),
        mapLayers,
        updateMapLayer: vi.fn(),
      },
      store: {
        onUndoRedo: undoRedoHook.on,
      },
    } as any,
    layerItemsLayers,
    mapLayers,
    mapLayerHook,
    featureLayerHook,
    undoRedoHook,
  };
}

describe("createMapLibreScenarioLayerController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setActivePinia(createPinia());
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
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [30, 40],
              ],
            },
            geometryMeta: {
              geometryKind: "LineString",
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

  it("renders scenario ImageLayers as MapLibre image raster layers", () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "image-1",
        type: "ImageLayer",
        name: "Overlay",
        url: "/overlay.png",
        opacity: 0.4,
        extent: [10, 20, 12, 22],
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);

    expect(mockMap.map.addSource).toHaveBeenCalledWith("scenario-image-source-image-1", {
      type: "image",
      url: "/overlay.png",
      coordinates: [
        [10, 22],
        [12, 22],
        [12, 20],
        [10, 20],
      ],
    });
    expect(mockMap.map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "scenario-image-layer-image-1",
        type: "raster",
        source: "scenario-image-source-image-1",
        paint: { "raster-opacity": 0.4 },
      }),
    );
    expect(scenario.geo.updateMapLayer).toHaveBeenCalledWith(
      "image-1",
      { _status: "initialized" },
      { noEmit: true, undoable: false },
    );
  });

  it("updates ImageLayer visibility and opacity without rebuilding the source", async () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers, mapLayerHook } = createScenario();
    mapLayers.value = [
      {
        id: "image-1",
        type: "ImageLayer",
        name: "Overlay",
        url: "/overlay.png",
        extent: [10, 20, 12, 22],
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);
    controller.bindScenario(scenario);
    mockMap.map.addSource.mockClear();

    await mapLayerHook.trigger({
      type: "update",
      id: "image-1",
      data: { isHidden: true, opacity: 0.2 },
    });

    expect(mockMap.map.addSource).not.toHaveBeenCalled();
    expect(mockMap.map.setLayoutProperty).toHaveBeenCalledWith(
      "scenario-image-layer-image-1",
      "visibility",
      "none",
    );
    expect(mockMap.map.setPaintProperty).toHaveBeenCalledWith(
      "scenario-image-layer-image-1",
      "raster-opacity",
      0.2,
    );
  });

  it("updates ImageLayers immediately when map layer changes are undone", async () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers, undoRedoHook } = createScenario();
    mapLayers.value = [
      {
        id: "image-1",
        type: "ImageLayer",
        name: "Overlay",
        url: "/overlay.png",
        opacity: 0.4,
        extent: [10, 20, 12, 22],
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);
    controller.bindScenario(scenario);
    const source = mockMap.sources.get("scenario-image-source-image-1");
    source?.updateImage.mockClear();

    mapLayers.value[0] = {
      ...mapLayers.value[0],
      opacity: 0.8,
      extent: [30, 40, 32, 42],
    };
    await undoRedoHook.trigger({
      action: "undo",
      meta: { label: "updateMapLayer", value: "image-1" },
    });

    expect(source?.updateImage).toHaveBeenCalledWith({
      url: "/overlay.png",
      coordinates: [
        [30, 42],
        [32, 42],
        [32, 40],
        [30, 40],
      ],
    });
    expect(mockMap.map.setPaintProperty).toHaveBeenCalledWith(
      "scenario-image-layer-image-1",
      "raster-opacity",
      0.8,
    );
  });

  it("uses ImageLayer center, scale, and rotation for MapLibre image coordinates", async () => {
    const OriginalImage = globalThis.Image;
    class MockImage {
      naturalWidth = 10;
      naturalHeight = 20;
      width = 10;
      height = 20;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    globalThis.Image = MockImage as any;
    try {
      const mockMap = createMockMap();
      const { scenario, mapLayers } = createScenario();
      mapLayers.value = [
        {
          id: "image-1",
          type: "ImageLayer",
          name: "Overlay",
          url: "/overlay.png",
          imageCenter: [0, 0],
          imageScale: [2, 3],
          imageRotate: Math.PI / 2,
          extent: [10, 20, 12, 22],
        },
      ];
      const controller = createMapLibreScenarioLayerController({
        getNativeMap: () => mockMap.map,
        fitGeometry: vi.fn(),
        fitExtent: vi.fn(),
        animateView: vi.fn(),
      } as any);

      controller.bindScenario(scenario);
      await new Promise<void>((resolve) => queueMicrotask(resolve));

      const expectedCoordinates = [
        toLonLat([30, 10]),
        toLonLat([30, -10]),
        toLonLat([-30, -10]),
        toLonLat([-30, 10]),
      ];
      expect(mockMap.map.addSource).toHaveBeenCalledWith(
        "scenario-image-source-image-1",
        expect.objectContaining({
          type: "image",
          url: "/overlay.png",
          coordinates: expectedCoordinates.map((coordinate) => [
            expect.closeTo(coordinate[0], 8),
            expect.closeTo(coordinate[1], 8),
          ]),
        }),
      );
    } finally {
      globalThis.Image = OriginalImage;
    }
  });

  it("starts and cleans up MapLibre ImageLayer transform controls", async () => {
    const OriginalImage = globalThis.Image;
    class MockImage {
      naturalWidth = 10;
      naturalHeight = 20;
      width = 10;
      height = 20;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    globalThis.Image = MockImage as any;
    try {
      const mockMap = createMockMap();
      const { scenario, mapLayers } = createScenario();
      mapLayers.value = [
        {
          id: "image-1",
          type: "ImageLayer",
          name: "Overlay",
          url: "/overlay.png",
          imageCenter: [0, 0],
          imageScale: [2, 3],
          imageRotate: 0,
        },
      ];
      const controller = createMapLibreScenarioLayerController({
        getNativeMap: () => mockMap.map,
        fitGeometry: vi.fn(),
        fitExtent: vi.fn(),
        animateView: vi.fn(),
        getCenter: vi.fn(() => [0, 0]),
      } as any);

      expect(controller.capabilities.mapLayerTransform).toBe(true);
      controller.bindScenario(scenario);
      controller.startMapLayerTransform("image-1");
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(mockMap.container.querySelector("svg")).toBeTruthy();
      expect(mockMap.container.querySelector(".move")).toBeTruthy();
      expect(mockMap.container.querySelector(".rotate")).toBeTruthy();
      expect(mockMap.container.querySelectorAll(".scale")).toHaveLength(4);
      expect((mockMap.container.firstElementChild as HTMLElement).style.touchAction).toBe(
        "none",
      );
      expect(
        (mockMap.container.querySelector("svg") as SVGSVGElement).style.touchAction,
      ).toBe("none");

      controller.endMapLayerTransform();

      expect(mockMap.container.querySelector("svg")).toBeFalsy();
      expect(mockMap.map.off).toHaveBeenCalledWith("move", expect.any(Function));
    } finally {
      globalThis.Image = OriginalImage;
    }
  });

  it("captures touch pointer drags on MapLibre ImageLayer transform handles", async () => {
    const OriginalImage = globalThis.Image;
    class MockImage {
      naturalWidth = 10;
      naturalHeight = 20;
      width = 10;
      height = 20;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    globalThis.Image = MockImage as any;
    try {
      const mockMap = createMockMap();
      const { scenario, mapLayers } = createScenario();
      mapLayers.value = [
        {
          id: "image-1",
          type: "ImageLayer",
          name: "Overlay",
          url: "/overlay.png",
          imageCenter: [0, 0],
          imageScale: [2, 3],
          imageRotate: 0,
        },
      ];
      const controller = createMapLibreScenarioLayerController({
        getNativeMap: () => mockMap.map,
        fitGeometry: vi.fn(),
        fitExtent: vi.fn(),
        animateView: vi.fn(),
        getCenter: vi.fn(() => [0, 0]),
      } as any);
      controller.bindScenario(scenario);
      controller.startMapLayerTransform("image-1");
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const svg = mockMap.container.querySelector("svg") as SVGSVGElement;
      const moveHandle = mockMap.container.querySelector(".move") as SVGElement;
      const setPointerCapture = vi.fn();
      const releasePointerCapture = vi.fn();
      Object.assign(svg, { setPointerCapture, releasePointerCapture });

      moveHandle.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          pointerId: 7,
          pointerType: "touch",
          clientX: 10,
          clientY: 10,
        }),
      );
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerId: 7,
          pointerType: "touch",
          clientX: 10,
          clientY: 10,
        }),
      );

      expect(setPointerCapture).toHaveBeenCalledWith(7);
      expect(releasePointerCapture).toHaveBeenCalledWith(7);
      expect(mockMap.map.dragPan.disable).toHaveBeenCalled();
      expect(mockMap.map.dragPan.enable).toHaveBeenCalled();
    } finally {
      globalThis.Image = OriginalImage;
    }
  });

  it("fully cleans up an active transform drag when transform mode ends mid-drag", async () => {
    const OriginalImage = globalThis.Image;
    class MockImage {
      naturalWidth = 10;
      naturalHeight = 20;
      width = 10;
      height = 20;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    globalThis.Image = MockImage as any;
    const removeListenerSpy = vi.spyOn(window, "removeEventListener");
    try {
      const mockMap = createMockMap();
      const { scenario, mapLayers } = createScenario();
      mapLayers.value = [
        {
          id: "image-1",
          type: "ImageLayer",
          name: "Overlay",
          url: "/overlay.png",
          imageCenter: [0, 0],
          imageScale: [2, 3],
          imageRotate: 0,
        },
      ];
      const controller = createMapLibreScenarioLayerController({
        getNativeMap: () => mockMap.map,
        fitGeometry: vi.fn(),
        fitExtent: vi.fn(),
        animateView: vi.fn(),
        getCenter: vi.fn(() => [0, 0]),
      } as any);
      controller.bindScenario(scenario);
      controller.startMapLayerTransform("image-1");
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const svg = mockMap.container.querySelector("svg") as SVGSVGElement;
      const moveHandle = mockMap.container.querySelector(".move") as SVGElement;
      const releasePointerCapture = vi.fn();
      Object.assign(svg, {
        setPointerCapture: vi.fn(),
        releasePointerCapture,
      });

      moveHandle.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          pointerId: 9,
          pointerType: "touch",
          clientX: 10,
          clientY: 10,
        }),
      );
      controller.endMapLayerTransform();

      expect(releasePointerCapture).toHaveBeenCalledWith(9);
      expect(mockMap.map.dragPan.enable).toHaveBeenCalled();
      expect(removeListenerSpy).toHaveBeenCalledWith("pointermove", expect.any(Function));
      expect(removeListenerSpy).toHaveBeenCalledWith("pointerup", expect.any(Function));
      expect(removeListenerSpy).toHaveBeenCalledWith(
        "pointercancel",
        expect.any(Function),
      );
      expect(mockMap.container.querySelector("svg")).toBeFalsy();
    } finally {
      removeListenerSpy.mockRestore();
      globalThis.Image = OriginalImage;
    }
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
