import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("a config that cannot be read", () => {
  it("offers the fallback basemaps", async () => {
    // The standalone build always lands here: a file:// page has no server to read the config
    // from. It keeps the fallbacks, because whether they load is a property of the network.
    const fetchSpy = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    vi.stubGlobal("fetch", fetchSpy);
    const store = useMaplibreLayersStore();

    await store.initialize();

    expect(store.layers.map((layer) => layer.sourceType)).toEqual([
      "style",
      "style",
      "style",
      "style",
    ]);
    expect(store.isInitialized).toBe(true);
  });

  it("fetches the config when the app is served", async () => {
    const fetchSpy = vi.fn(async () => ({
      json: async () => [
        {
          name: "local",
          title: "Local",
          sourceType: "raster",
          tiles: ["/{z}/{x}/{y}.png"],
        },
      ],
    }));
    vi.stubGlobal("fetch", fetchSpy);
    const store = useMaplibreLayersStore();

    await store.initialize();

    expect(fetchSpy).toHaveBeenCalledWith("/config/maplibreConfig.json");
    expect(store.layers.map((layer) => layer.name)).toEqual(["local"]);
  });
});

describe("concurrent initialize", () => {
  it("makes a second caller wait for the first to finish", async () => {
    const fetchSpy = vi.fn(async () => ({
      json: async () => [
        {
          name: "local",
          title: "Local",
          sourceType: "raster",
          tiles: ["/{z}/{x}/{y}.png"],
        },
      ],
    }));
    vi.stubGlobal("fetch", fetchSpy);
    const store = useMaplibreLayersStore();

    await Promise.all([store.initialize(), store.initialize()]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(store.layers.map((layer) => layer.name)).toEqual(["local"]);
    expect(store.isInitialized).toBe(true);
  });
});
