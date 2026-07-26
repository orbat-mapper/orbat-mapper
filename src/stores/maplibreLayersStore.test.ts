import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";

function stubProtocol(protocol: string) {
  vi.stubGlobal("location", { ...globalThis.location, protocol });
}

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("maplibre layers store under file://", () => {
  it("does not fetch the config and offers no online basemaps", async () => {
    stubProtocol("file:");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const store = useMaplibreLayersStore();

    expect(store.layers).toEqual([]);

    await store.initialize();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(store.layers).toEqual([]);
    expect(store.isInitialized).toBe(true);
  });

  it("fetches the config when the app is served", async () => {
    stubProtocol("https:");
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
    stubProtocol("https:");
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
