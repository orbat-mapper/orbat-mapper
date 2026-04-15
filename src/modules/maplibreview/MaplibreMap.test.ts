// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import MaplibreMap from "@/modules/maplibreview/MaplibreMap.vue";

const setStyle = vi.fn();
const setProjection = vi.fn();
const addControl = vi.fn();
const remove = vi.fn();
const boxZoomDisable = vi.fn();
const listeners = new Map<string, Array<(event?: any) => void>>();
const mapConstructor = vi.fn();

vi.mock("maplibre-gl", () => {
  class MockMap {
    constructor(options: unknown) {
      mapConstructor(options);
    }

    addControl = addControl;
    boxZoom = { disable: boxZoomDisable };

    on(event: string, handler: (event?: any) => void) {
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

  return {
    Map: MockMap,
    GlobeControl: MockGlobeControl,
    NavigationControl: MockNavigationControl,
  };
});

const defaultProps = {
  basemapId: "osm",
  styleSpec: { version: 8 as const, sources: {}, layers: [] },
  projection: "globe" as const,
};

describe("MaplibreMap", () => {
  beforeEach(() => {
    setStyle.mockClear();
    setProjection.mockClear();
    addControl.mockClear();
    remove.mockClear();
    boxZoomDisable.mockClear();
    mapConstructor.mockClear();
    listeners.clear();
  });

  it("applies the projection prop on style.load", async () => {
    mount(MaplibreMap, { props: defaultProps });

    expect(setProjection).toHaveBeenCalledWith({ type: "globe" });
  });

  it("applies mercator when projection prop is mercator", async () => {
    mount(MaplibreMap, { props: { ...defaultProps, projection: "mercator" } });

    expect(setProjection).toHaveBeenCalledWith({ type: "mercator" });
  });

  it("updates the map style when the basemap changes and reapplies projection", async () => {
    const wrapper = mount(MaplibreMap, { props: defaultProps });

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
    expect(boxZoomDisable).toHaveBeenCalled();
    expect(mapConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasContextAttributes: expect.objectContaining({ preserveDrawingBuffer: true }),
      }),
    );
  });

  it("applies projection when the projection prop changes", async () => {
    const wrapper = mount(MaplibreMap, { props: defaultProps });

    setProjection.mockClear();

    await wrapper.setProps({ projection: "mercator" });
    await nextTick();

    expect(setProjection).toHaveBeenCalledWith({ type: "mercator" });
  });

  it("emits update:projection on projectiontransition events", async () => {
    const wrapper = mount(MaplibreMap, { props: defaultProps });

    for (const handler of listeners.get("projectiontransition") ?? []) {
      handler({ newProjection: "mercator" });
    }
    await nextTick();

    expect(wrapper.emitted("update:projection")).toEqual([["mercator"]]);
  });

  it("updates the map style when the style changes without a basemap id change", async () => {
    const wrapper = mount(MaplibreMap, {
      props: defaultProps,
    });

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
    const wrapper = mount(MaplibreMap, {
      props: defaultProps,
    });

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
});
