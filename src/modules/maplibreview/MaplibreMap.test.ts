// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";
import MaplibreMap from "@/modules/maplibreview/MaplibreMap.vue";
import { type MapProjection, useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useMeasurementsStore } from "@/stores/geoStore";
import type { MaplibreBasemapStyle } from "@/modules/maplibreview/maplibreBasemaps";

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

vi.mock("maplibre-gl", () => {
  class MockMap {
    constructor(options: unknown) {
      mapConstructor(options);
    }

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
});
