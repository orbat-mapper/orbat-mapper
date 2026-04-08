// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import MaplibreMap from "@/modules/globeview/MaplibreMap.vue";

const setStyle = vi.fn();
const setProjection = vi.fn();
const addControl = vi.fn();
const remove = vi.fn();
const listeners = new Map<string, Array<(event?: any) => void>>();

vi.mock("maplibre-gl", () => {
  class MockMap {
    constructor(_options: unknown) {}

    addControl = addControl;

    on(event: string, handler: (event?: any) => void) {
      const handlers = listeners.get(event) ?? [];
      handlers.push(handler);
      listeners.set(event, handlers);
      if (event === "style.load" || event === "load") {
        handler();
      }
    }

    setProjection = setProjection;

    setStyle(style: unknown) {
      setStyle(style);
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

describe("MaplibreMap", () => {
  beforeEach(() => {
    setStyle.mockClear();
    setProjection.mockClear();
    addControl.mockClear();
    remove.mockClear();
    listeners.clear();
  });

  it("updates the map style when the basemap changes and reapplies globe projection", async () => {
    const wrapper = mount(MaplibreMap, {
      props: {
        basemapId: "osm",
        styleSpec: {
          version: 8,
          sources: {},
          layers: [],
        },
      },
    });

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
    expect(setProjection).toHaveBeenCalled();
  });

  it("updates the map style when the style changes without a basemap id change", async () => {
    const wrapper = mount(MaplibreMap, {
      props: {
        basemapId: "osm",
        styleSpec: {
          version: 8,
          sources: {},
          layers: [],
        },
      },
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
  });

  it("emits MapLibre contextmenu events using the original mouse event", async () => {
    const wrapper = mount(MaplibreMap, {
      props: {
        basemapId: "osm",
        styleSpec: {
          version: 8,
          sources: {},
          layers: [],
        },
      },
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
