// @vitest-environment jsdom
import { createEventHook } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { toLonLat } from "ol/proj";
import { createMapLibreScenarioLayerController } from "@/geo/engines/maplibre/mapLibreScenarioLayerController";
import { toReferenceFeatureSelection } from "@/geo/kml/maplibre";

const testKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Style id="lineStyle">
      <LineStyle><color>ff0000ff</color><width>3</width></LineStyle>
    </Style>
    <Placemark id="kml-feature-1">
      <name>KML point</name>
      <description>Point description</description>
      <styleUrl>#lineStyle</styleUrl>
      <ExtendedData><Data name="category"><value>reference</value></Data></ExtendedData>
      <Point><coordinates>10,20,0</coordinates></Point>
    </Placemark>
    <Placemark id="kml-feature-2">
      <name>KML line</name>
      <styleUrl>#lineStyle</styleUrl>
      <LineString><coordinates>10,20,0 12,22,0</coordinates></LineString>
    </Placemark>
  </Document>
</kml>`;

const iconKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Style id="iconStyle">
      <IconStyle><Icon><href>icons/marker.png</href></Icon></IconStyle>
    </Style>
    <Placemark id="kml-icon-feature">
      <name>KML icon</name>
      <styleUrl>#iconStyle</styleUrl>
      <Point><coordinates>10,20,0</coordinates></Point>
    </Placemark>
  </Document>
</kml>`;

const mixedGeometryKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark id="mixed-1">
      <name>Mixed placemark</name>
      <MultiGeometry>
        <Point><coordinates>10,20,0</coordinates></Point>
        <Point><coordinates>12,22,0</coordinates></Point>
        <Point><coordinates>13,23,0</coordinates></Point>
        <LineString><coordinates>10,20,0 11,21,0</coordinates></LineString>
      </MultiGeometry>
    </Placemark>
  </Document>
</kml>`;

function flushPromises() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function createPointLabelKml(count: number) {
  const placemarks = Array.from(
    { length: count },
    (_, index) => `
    <Placemark id="point-${index}">
      <name>Point ${index}</name>
      <Point><coordinates>${10 + index / 1000},20,0</coordinates></Point>
    </Placemark>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>${placemarks}</Document>
</kml>`;
}

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
    loadImage: vi.fn(),
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

  it("renders scenario XYZLayers as MapLibre raster tile layers", () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "xyz-1",
        type: "XYZLayer",
        name: "Tiles",
        url: "https://example.test/{z}/{x}/{y}.png",
        attributions: "Example tiles",
        opacity: 0.5,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);

    expect(mockMap.map.addSource).toHaveBeenCalledWith("scenario-raster-source-xyz-1", {
      type: "raster",
      tiles: ["https://example.test/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "Example tiles",
    });
    expect(mockMap.map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "scenario-raster-layer-xyz-1",
        type: "raster",
        source: "scenario-raster-source-xyz-1",
        paint: { "raster-opacity": 0.5 },
      }),
    );
    expect(scenario.geo.updateMapLayer).toHaveBeenCalledWith(
      "xyz-1",
      { _status: "initialized" },
      { noEmit: true, undoable: false },
    );
  });

  it("renders scenario TileJSONLayers as MapLibre raster tilejson sources", () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "tilejson-1",
        type: "TileJSONLayer",
        name: "TileJSON",
        url: "https://example.test/tilejson.json",
        isHidden: true,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);

    expect(mockMap.map.addSource).toHaveBeenCalledWith(
      "scenario-raster-source-tilejson-1",
      {
        type: "raster",
        url: "https://example.test/tilejson.json",
      },
    );
    expect(mockMap.map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "scenario-raster-layer-tilejson-1",
        layout: { visibility: "none" },
      }),
    );
  });

  it("updates XYZLayer visibility and opacity without rebuilding the source", async () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers, mapLayerHook } = createScenario();
    mapLayers.value = [
      {
        id: "xyz-1",
        type: "XYZLayer",
        name: "Tiles",
        url: "https://example.test/{z}/{x}/{y}.png",
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
      id: "xyz-1",
      data: { isHidden: true, opacity: 0.25 },
    });

    expect(mockMap.map.addSource).not.toHaveBeenCalled();
    expect(mockMap.map.setLayoutProperty).toHaveBeenCalledWith(
      "scenario-raster-layer-xyz-1",
      "visibility",
      "none",
    );
    expect(mockMap.map.setPaintProperty).toHaveBeenCalledWith(
      "scenario-raster-layer-xyz-1",
      "raster-opacity",
      0.25,
    );
  });

  it("rebuilds raster tile layers after a MapLibre style reload", () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "xyz-1",
        type: "XYZLayer",
        name: "Tiles",
        url: "https://example.test/{z}/{x}/{y}.png",
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);
    controller.bindScenario(scenario);
    mockMap.clearStyle();
    mockMap.map.addSource.mockClear();

    mockMap.emit("style.load");

    expect(mockMap.map.addSource).toHaveBeenCalledWith(
      "scenario-raster-source-xyz-1",
      expect.objectContaining({ type: "raster" }),
    );
  });

  it("renders scenario KMLLayers as MapLibre GeoJSON reference layers", async () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "kml-1",
        type: "KMLLayer",
        name: "Reference KML",
        url: testKml,
        extractStyles: true,
        showPointNames: true,
        opacity: 0.5,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);
    await flushPromises();

    expect(mockMap.map.addSource).toHaveBeenCalledWith(
      "scenario-kml-source-kml-1",
      expect.objectContaining({
        type: "geojson",
        data: expect.objectContaining({
          type: "FeatureCollection",
          features: expect.arrayContaining([
            expect.objectContaining({
              id: "kml-feature-1",
              properties: expect.objectContaining({
                __kmlLayerId: "kml-1",
                __kmlLabel: "KML point",
                __kmlStrokeColor: "#ff0000",
                category: "reference",
              }),
            }),
          ]),
        }),
      }),
    );
    expect(mockMap.map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "scenario-kml-layer-kml-1-line",
        type: "line",
      }),
    );
    expect(mockMap.map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "scenario-kml-layer-kml-1-label",
        type: "symbol",
        source: "scenario-kml-label-source-kml-1",
        minzoom: 0,
      }),
    );
    expect(scenario.geo.updateMapLayer).toHaveBeenCalledWith(
      "kml-1",
      { _status: "initialized" },
      { noEmit: true, undoable: false },
    );
    expect(scenario.geo.updateMapLayer).toHaveBeenCalledWith(
      "kml-1",
      { extent: [10, 20, 12, 22], _isNew: false },
      { noEmit: true, undoable: false },
    );
  });

  it("renders labels from a point-only label source for mixed KML geometries", async () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "kml-1",
        type: "KMLLayer",
        name: "Mixed KML",
        url: mixedGeometryKml,
        showPointNames: true,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);
    await flushPromises();

    expect(mockMap.map.addSource).toHaveBeenCalledWith(
      "scenario-kml-label-source-kml-1",
      expect.objectContaining({
        type: "geojson",
        data: expect.objectContaining({
          features: [
            expect.objectContaining({
              id: "mixed-1-label-0",
              geometry: {
                type: "Point",
                coordinates: [10, 20, 0],
              },
              properties: expect.objectContaining({
                __kmlLabel: "Mixed placemark",
              }),
            }),
            expect.objectContaining({
              id: "mixed-1-label-1",
              geometry: {
                type: "Point",
                coordinates: [12, 22, 0],
              },
              properties: expect.objectContaining({
                __kmlLabel: "Mixed placemark",
              }),
            }),
            expect.objectContaining({
              id: "mixed-1-label-2",
              geometry: {
                type: "Point",
                coordinates: [13, 23, 0],
              },
              properties: expect.objectContaining({
                __kmlLabel: "Mixed placemark",
              }),
            }),
          ],
        }),
      }),
    );
  });

  it("defers labels on dense KML layers to avoid MapLibre glyph tile limits", async () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "kml-1",
        type: "KMLLayer",
        name: "Dense KML",
        url: createPointLabelKml(750),
        showPointNames: true,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);
    await flushPromises();

    expect(mockMap.map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "scenario-kml-layer-kml-1-label",
        type: "symbol",
        minzoom: 8,
      }),
    );
  });

  it("unwraps MapLibre loadImage responses before registering KML icons", async () => {
    const mockMap = createMockMap();
    const imageData = {
      width: 2,
      height: 2,
      data: new Uint8ClampedArray(16),
    };
    mockMap.map.loadImage.mockResolvedValue({ data: imageData });
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "kml-1",
        type: "KMLLayer",
        name: "Reference KML",
        url: iconKml,
        extractStyles: true,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);
    await flushPromises();

    expect(mockMap.map.loadImage).toHaveBeenCalledWith("icons/marker.png");
    expect(mockMap.map.addImage).toHaveBeenCalledWith(
      expect.stringMatching(/^kml-icon-kml-1-/),
      imageData,
      undefined,
    );
  });

  it("registers large KML icons with a pixel ratio so they render at normal size", async () => {
    const mockMap = createMockMap();
    const imageData = {
      width: 256,
      height: 128,
      data: new Uint8ClampedArray(256 * 128 * 4),
    };
    mockMap.map.loadImage.mockResolvedValue({ data: imageData });
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "kml-1",
        type: "KMLLayer",
        name: "Reference KML",
        url: iconKml,
        extractStyles: true,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);

    controller.bindScenario(scenario);
    await flushPromises();

    expect(mockMap.map.addImage).toHaveBeenCalledWith(
      expect.stringMatching(/^kml-icon-kml-1-/),
      imageData,
      { pixelRatio: 8 },
    );
  });

  it("updates KMLLayer visibility and opacity without rebuilding the source", async () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers, mapLayerHook } = createScenario();
    mapLayers.value = [
      {
        id: "kml-1",
        type: "KMLLayer",
        name: "Reference KML",
        url: testKml,
        opacity: 0.7,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);
    controller.bindScenario(scenario);
    await flushPromises();
    mockMap.map.addSource.mockClear();
    mapLayers.value[0].opacity = 0.25;

    await mapLayerHook.trigger({
      type: "update",
      id: "kml-1",
      data: { isHidden: true, opacity: 0.25 },
    });

    expect(mockMap.map.addSource).not.toHaveBeenCalled();
    expect(mockMap.map.setLayoutProperty).toHaveBeenCalledWith(
      "scenario-kml-layer-kml-1-line",
      "visibility",
      "none",
    );
    expect(mockMap.map.setPaintProperty).toHaveBeenCalledWith(
      "scenario-kml-layer-kml-1-line",
      "line-opacity",
      ["*", 0.25, ["coalesce", ["get", "__kmlStrokeOpacity"], 1]],
    );
  });

  it("rebuilds KMLLayers after a MapLibre style reload", async () => {
    const mockMap = createMockMap();
    const { scenario, mapLayers } = createScenario();
    mapLayers.value = [
      {
        id: "kml-1",
        type: "KMLLayer",
        name: "Reference KML",
        url: testKml,
      },
    ];
    const controller = createMapLibreScenarioLayerController({
      getNativeMap: () => mockMap.map,
      fitGeometry: vi.fn(),
      fitExtent: vi.fn(),
      animateView: vi.fn(),
    } as any);
    controller.bindScenario(scenario);
    await flushPromises();
    mockMap.clearStyle();
    mockMap.map.addSource.mockClear();

    mockMap.emit("style.load");
    await flushPromises();

    expect(mockMap.map.addSource).toHaveBeenCalledWith(
      "scenario-kml-source-kml-1",
      expect.objectContaining({ type: "geojson" }),
    );
  });

  it("converts rendered KML features to reference feature selections", () => {
    const selection = toReferenceFeatureSelection({
      id: "rendered-1",
      layer: { id: "scenario-kml-layer-kml-1-point-circle" },
      properties: {
        __kmlLayerId: "kml-1",
        __kmlLayerName: "Reference KML",
        __kmlFeatureId: "feature-1",
        __kmlName: "KML point",
        __kmlStrokeColor: "#ff0000",
        description: "<p>Description</p>",
        category: "reference",
      },
    } as any);

    expect(selection).toEqual({
      layerId: "kml-1",
      layerName: "Reference KML",
      featureId: "feature-1",
      name: "KML point",
      properties: {
        description: "<p>Description</p>",
        category: "reference",
      },
    });
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
