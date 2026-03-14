// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import MaplibreMap from "@/modules/globeview/MaplibreMap.vue";

const setStyle = vi.fn();
const setProjection = vi.fn();
const addControl = vi.fn();
const remove = vi.fn();
const listeners = new Map<string, Array<() => void>>();

vi.mock("maplibre-gl", () => {
  class MockMap {
    constructor(_options: unknown) {}

    addControl = addControl;

    on(event: string, handler: () => void) {
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
});
