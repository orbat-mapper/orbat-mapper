// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { effectScope, shallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { FakeImageData, fakeMap, settle } from "@/testdata/viewshed";
import { useTerrainStore } from "@/stores/terrainStore";
import { useViewshedStore } from "@/stores/viewshedStore";
import { useMapViewshed } from "./useMapViewshed";

const attached = vi.hoisted(() => ({ count: 0 }));
vi.mock("./viewshedLayers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./viewshedLayers")>();
  return {
    ...actual,
    attachViewshedLayers: (...args: Parameters<typeof actual.attachViewshedLayers>) => {
      attached.count++;
      return actual.attachViewshedLayers(...args);
    },
  };
});
vi.mock("@/geo/pointDrag", () => ({ attachPointDrag: () => () => {} }));
vi.mock("@/geo/viewshedClient", () => ({
  viewshedClient: async () => ({ compute: () => new Promise(() => {}) }),
  stopViewshedWorker: () => {},
}));

function setup() {
  const fake = fakeMap();
  const mapRef = shallowRef<MlMap>();
  const scope = effectScope();
  scope.run(() => useMapViewshed(mapRef));
  mapRef.value = fake.map;
  return { ...fake, scope };
}

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  vi.stubGlobal("ImageData", FakeImageData);
  useTerrainStore().setConfigElevation({
    status: "ready",
    elevation: { source: { type: "raster-dem", url: "https://dem.example/tiles.json" } },
  });
  attached.count = 0;
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMapViewshed", () => {
  it("leaves the map alone until the viewshed is turned on", async () => {
    const { layers, fire } = setup();
    fire("styledataloading");
    fire("style.load");
    await settle();
    expect(attached.count).toBe(0);
    expect([...layers]).toEqual([]);
  });

  it("draws while on, and takes it all off again when turned off", async () => {
    const { layers, container } = setup();
    const viewshed = useViewshedStore();
    viewshed.start();
    await vi.waitFor(() => expect(attached.count).toBe(1));
    expect(layers.size).toBeGreaterThan(0);
    expect(container.classList.contains("map-picking")).toBe(true);
    viewshed.closeAll();
    await settle();
    expect([...layers]).toEqual([]);
    expect(container.classList.contains("map-picking")).toBe(false);
  });

  it("draws again after a style swap, but not while the new style loads", async () => {
    const { layers, fire } = setup();
    useViewshedStore().start();
    await vi.waitFor(() => expect(attached.count).toBe(1));
    fire("styledataloading");
    expect([...layers]).toEqual([]);
    fire("style.load");
    await vi.waitFor(() => expect(attached.count).toBe(2));
    expect(layers.size).toBeGreaterThan(0);
  });

  it("closes every viewshed when the map goes", async () => {
    const { scope } = setup();
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    scope.stop();
    expect(viewshed.active).toBe(false);
  });
});
