// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";
import MaplibreMap from "@/modules/maplibreview/MaplibreMap.vue";
import { type MapProjection, useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useMeasurementsStore } from "@/stores/geoStore";
import type { MaplibreBasemapStyle } from "@/modules/maplibreview/maplibreBasemaps";
import { useTerrainStore } from "@/stores/terrainStore";
import type { StyleSpecification } from "maplibre-gl";
import { initializeRtlText } from "@/modules/maplibreview/maplibreRtlText";

vi.mock("@/modules/maplibreview/maplibreRtlText", () => ({
  initializeRtlText: vi.fn().mockResolvedValue(undefined),
}));

const setStyle = vi.fn();
const setProjection = vi.fn();
const addControl = vi.fn();
const removeControl = vi.fn();
const remove = vi.fn();
const listeners = new Map<string, Array<(event?: unknown) => void>>();
const mapConstructor = vi.fn();
const scaleControlSetUnit = vi.fn();
const off = vi.fn();
const getCenter = vi.fn(() => ({ lng: 10, lat: 20 }));
const getZoom = vi.fn(() => 4);
const getBearing = vi.fn(() => 0);
let liveStyle: StyleSpecification;
const queryTerrainElevation = vi.fn(() => 750);

vi.mock("maplibre-gl", () => {
  class MockMap {
    constructor(options: unknown) {
      mapConstructor(options);
    }

    isStyleLoaded = () => false;
    getStyle = () => liveStyle;
    getLayersOrder = () => liveStyle.layers.map((l) => l.id);
    getLayer = (id: string) => liveStyle.layers.find((l) => l.id === id);
    getSource = (id: string) => liveStyle.sources[id];
    isSourceLoaded = () => true;
    getTerrain = () => liveStyle.terrain;
    setTerrain = (terrain: StyleSpecification["terrain"]) => {
      liveStyle.terrain = terrain;
    };
    addSource = (id: string, source: StyleSpecification["sources"][string]) => {
      liveStyle.sources[id] = source;
    };
    removeSource = (id: string) => {
      delete liveStyle.sources[id];
    };
    queryTerrainElevation = queryTerrainElevation;
    addControl = addControl;
    removeControl = removeControl;
    off = off;
    getCenter = getCenter;
    getZoom = getZoom;
    getBearing = getBearing;

    on(event: string, handler: (event?: unknown) => void) {
      const handlers = listeners.get(event) ?? [];
      handlers.push(handler);
      listeners.set(event, handlers);
      if (event === "style.load" || event === "load") {
        handler();
      }
    }

    setProjection = setProjection;

    setStyle(style: unknown, options?: unknown) {
      setStyle(style, options);
      for (const handler of listeners.get("style.load") ?? []) handler();
    }

    remove = remove;
  }

  class MockGlobeControl {}
  class MockNavigationControl {}
  class MockScaleControl {
    constructor(options: unknown) {
      void options;
    }
    setUnit = scaleControlSetUnit;
  }

  return {
    Map: MockMap,
    GlobeControl: MockGlobeControl,
    NavigationControl: MockNavigationControl,
    ScaleControl: MockScaleControl,
    setWorkerUrl: vi.fn(),
  };
});

const defaultProps: {
  basemapId: string;
  styleSpec: MaplibreBasemapStyle;
  projection: MapProjection;
  initialView?: {
    center: [number, number];
    zoom: number;
    rotation: number;
  };
} = {
  basemapId: "osm",
  styleSpec: { version: 8 as const, sources: {}, layers: [] },
  projection: "globe" as const,
  initialView: undefined,
};

function mountMap(props = defaultProps) {
  const pinia = createPinia();
  setActivePinia(pinia);
  return {
    pinia,
    wrapper: mount(MaplibreMap, {
      props,
      global: { plugins: [pinia] },
    }),
  };
}

describe("MaplibreMap", () => {
  afterEach(() => vi.useRealTimers());
  beforeEach(() => {
    vi.restoreAllMocks();
    setStyle.mockClear();
    setProjection.mockClear();
    addControl.mockClear();
    removeControl.mockClear();
    remove.mockClear();
    mapConstructor.mockClear();
    scaleControlSetUnit.mockClear();
    off.mockClear();
    getCenter.mockClear();
    getZoom.mockClear();
    getBearing.mockClear();
    listeners.clear();
    liveStyle = { version: 8, sources: {}, layers: [] };
    queryTerrainElevation.mockClear();
    queryTerrainElevation.mockReturnValue(750);
  });

  it("initializes RTL support when the map is set up", () => {
    vi.mocked(initializeRtlText).mockClear();
    mountMap();
    expect(initializeRtlText).toHaveBeenCalledOnce();
  });

  it("applies the projection prop on style.load", async () => {
    mountMap();

    expect(setProjection).toHaveBeenCalledWith({ type: "globe" });
  });

  it("applies mercator when projection prop is mercator", async () => {
    mountMap({ ...defaultProps, projection: "mercator" });

    expect(setProjection).toHaveBeenCalledWith({ type: "mercator" });
  });

  it("updates the map style when the basemap changes and reapplies projection", async () => {
    const { wrapper } = mountMap();

    setProjection.mockClear();

    await wrapper.setProps({
      basemapId: "imagery",
      styleSpec: {
        version: 8,
        sources: {
          imagery: {
            type: "raster",
            tiles: ["https://tiles.example.com/{z}/{x}/{y}.png"],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "imagery-raster",
            type: "raster",
            source: "imagery",
          },
        ],
      },
    });
    await nextTick();

    expect(setStyle).toHaveBeenCalledTimes(1);
    expect(setStyle).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ diff: false }),
    );
    expect(setProjection).toHaveBeenCalledWith({ type: "globe" });
    expect(mapConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasContextAttributes: expect.objectContaining({ preserveDrawingBuffer: true }),
      }),
    );
  });

  it("initializes the constructor from an initial center, zoom, and converted bearing", () => {
    mountMap({
      ...defaultProps,
      initialView: {
        center: [13, 57],
        zoom: 6.5,
        rotation: Math.PI / 4,
      },
    });

    expect(mapConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [13, 57],
        zoom: 6.5,
        bearing: 45,
      }),
    );
  });

  it("applies projection when the projection prop changes", async () => {
    const { wrapper } = mountMap();

    setProjection.mockClear();

    await wrapper.setProps({ projection: "mercator" });
    await nextTick();

    expect(setProjection).toHaveBeenCalledWith({ type: "mercator" });
  });

  it("emits update:projection on projectiontransition events", async () => {
    const { wrapper } = mountMap();

    for (const handler of listeners.get("projectiontransition") ?? []) {
      handler({ newProjection: "mercator" });
    }
    await nextTick();

    expect(wrapper.emitted("update:projection")).toEqual([["mercator"]]);
  });

  it("updates the map style when the style changes without a basemap id change", async () => {
    const { wrapper } = mountMap();

    await wrapper.setProps({
      styleSpec: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tiles.example.com/{z}/{x}/{y}.png"],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "osm-raster",
            type: "raster",
            source: "osm",
          },
        ],
      },
    });
    await nextTick();

    expect(setStyle).toHaveBeenCalledTimes(1);
    expect(setStyle).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ diff: false }),
    );
  });

  it("emits MapLibre contextmenu events using the original mouse event", async () => {
    const { wrapper } = mountMap();

    const dispatchSpy = vi.spyOn(wrapper.element, "dispatchEvent");
    const mouseEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: 12,
      clientY: 34,
    });

    for (const handler of listeners.get("contextmenu") ?? []) {
      handler({ originalEvent: mouseEvent });
    }
    await nextTick();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(mouseEvent.defaultPrevented).toBe(true);
  });

  it("adds a scale control and updates its unit from shared map settings", async () => {
    mountMap();

    expect(addControl).toHaveBeenCalledWith(expect.anything(), "bottom-left");

    const measurementsStore = useMeasurementsStore();
    measurementsStore.measurementUnit = "imperial";
    await nextTick();

    expect(scaleControlSetUnit).toHaveBeenCalledWith("imperial");

    const mapSettingsStore = useMapSettingsStore();
    mapSettingsStore.showScaleLine = false;
    await nextTick();

    expect(removeControl).toHaveBeenCalledWith(expect.anything());
  });

  it("defers scale unit updates while the scale control is detached", async () => {
    mountMap();
    const mapSettingsStore = useMapSettingsStore();
    const measurementsStore = useMeasurementsStore();

    mapSettingsStore.showScaleLine = false;
    await nextTick();
    scaleControlSetUnit.mockClear();

    measurementsStore.measurementUnit = "imperial";
    await nextTick();

    expect(scaleControlSetUnit).not.toHaveBeenCalled();

    mapSettingsStore.showScaleLine = true;
    await nextTick();

    expect(addControl).toHaveBeenLastCalledWith(expect.anything(), "bottom-left");
    expect(scaleControlSetUnit).toHaveBeenCalledWith("imperial");
  });

  it("shows the formatted pointer location when enabled", async () => {
    const { wrapper } = mountMap();
    const mapSettingsStore = useMapSettingsStore();
    mapSettingsStore.showLocation = true;
    await nextTick();

    for (const handler of listeners.get("mousemove") ?? []) {
      handler({ lngLat: { lng: 10.1234, lat: 59.9876 } });
    }
    await nextTick();

    expect(wrapper.text()).toContain("59.988° N 10.123° E");
  });

  it("restores the last pointer location immediately when location display is re-enabled", async () => {
    const { wrapper } = mountMap();
    const mapSettingsStore = useMapSettingsStore();
    mapSettingsStore.showLocation = true;
    await nextTick();

    for (const handler of listeners.get("mousemove") ?? []) {
      handler({ lngLat: { lng: 10.1234, lat: 59.9876 } });
    }
    await nextTick();

    mapSettingsStore.showLocation = false;
    await nextTick();
    expect(wrapper.text()).not.toContain("59.988° N 10.123° E");

    mapSettingsStore.showLocation = true;
    await nextTick();
    expect(wrapper.text()).toContain("59.988° N 10.123° E");
  });

  it("keeps terrain across basemap changes and shows natural pointer elevation with unit changes", async () => {
    const { wrapper } = mountMap();
    useMapSettingsStore().showLocation = true;
    const terrain = useTerrainStore();
    terrain.setExaggeration(3);
    terrain.terrainEnabled = true;
    await nextTick();
    expect(liveStyle.terrain?.exaggeration).toBe(3);
    for (const handler of listeners.get("mousemove") ?? [])
      handler({ lngLat: { lng: 10, lat: 60 } });
    await nextTick();
    expect(wrapper.text()).toContain("250 m");
    useMeasurementsStore().measurementUnit = "imperial";
    await nextTick();
    expect(wrapper.text()).toContain("820 ft");
    liveStyle = { version: 8, sources: {}, layers: [] };
    await wrapper.setProps({ basemapId: "new-basemap" });
    expect(liveStyle.terrain?.exaggeration).toBe(3);
    for (const handler of listeners.get("error") ?? [])
      handler({ sourceId: "orbat-terrain" });
    await nextTick();
    expect(wrapper.text()).not.toContain("820 ft");
    for (const handler of listeners.get("sourcedata") ?? [])
      handler({ sourceId: "orbat-terrain", isSourceLoaded: true });
    await nextTick();
    // Loaded includes errored tiles: only an explicit retry clears the warning.
    expect(terrain.terrainError).toBe(true);
    expect(wrapper.text()).not.toContain("820 ft");
    terrain.terrainEnabled = false;
    await nextTick();
    terrain.terrainEnabled = true;
    await nextTick();
    expect(terrain.terrainError).toBe(false);
    expect(wrapper.text()).toContain("820 ft");
    terrain.terrainEnabled = false;
    await nextTick();
    expect(wrapper.text()).not.toContain("820 ft");
    wrapper.unmount();
    expect(off).toHaveBeenCalledWith("styledata", expect.any(Function));
    expect(off).toHaveBeenCalledWith("error", expect.any(Function));
  });
  it("coalesces pointer and tile events into 100ms elevation samples using the latest position", async () => {
    vi.useFakeTimers();
    const { wrapper } = mountMap();
    useMapSettingsStore().showLocation = true;
    useTerrainStore().terrainEnabled = true;
    await nextTick();
    const move = (lng: number) => {
      for (const handler of listeners.get("mousemove") ?? [])
        handler({ lngLat: { lng, lat: 60 } });
    };
    move(10);
    await nextTick();
    expect(queryTerrainElevation).toHaveBeenCalledTimes(1);
    for (let i = 1; i <= 4; i++) {
      await vi.advanceTimersByTimeAsync(20);
      move(10 + i);
      for (const handler of listeners.get("sourcedata") ?? [])
        handler({ sourceId: "orbat-terrain" });
    }
    await nextTick();
    expect(wrapper.text()).toContain("14.000° E");
    expect(queryTerrainElevation).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(20);
    expect(queryTerrainElevation).toHaveBeenCalledTimes(2);
    expect(queryTerrainElevation).toHaveBeenLastCalledWith([14, 60]);
    await vi.advanceTimersByTimeAsync(500);
    expect(queryTerrainElevation).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  it("cancels pending elevation samples when hidden, on pointer leave, and on unmount", async () => {
    vi.useFakeTimers();
    const { wrapper } = mountMap();
    const settings = useMapSettingsStore();
    settings.showLocation = true;
    useTerrainStore().terrainEnabled = true;
    await nextTick();
    const move = () => {
      for (const handler of listeners.get("mousemove") ?? [])
        handler({ lngLat: { lng: 10, lat: 60 } });
    };
    const tile = () => {
      for (const handler of listeners.get("sourcedata") ?? [])
        handler({ sourceId: "orbat-terrain" });
    };
    move();
    tile();
    settings.showLocation = false;
    await nextTick();
    queryTerrainElevation.mockClear();
    tile();
    await vi.advanceTimersByTimeAsync(200);
    expect(queryTerrainElevation).not.toHaveBeenCalled();
    settings.showLocation = true;
    await nextTick();
    expect(queryTerrainElevation).toHaveBeenCalledTimes(1);
    tile();
    await wrapper.trigger("mouseleave");
    queryTerrainElevation.mockClear();
    await vi.advanceTimersByTimeAsync(200);
    expect(queryTerrainElevation).not.toHaveBeenCalled();
    expect(wrapper.text()).not.toContain("750 m");
    move();
    tile();
    wrapper.unmount();
    queryTerrainElevation.mockClear();
    await vi.advanceTimersByTimeAsync(200);
    expect(queryTerrainElevation).not.toHaveBeenCalled();
  });
});
