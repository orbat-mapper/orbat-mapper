import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

const runtimeEnvironment = vi.hoisted(() => ({ canReadHostedConfig: true }));

vi.mock("@/utils/runtimeEnvironment", () => ({
  get canReadHostedConfig() {
    return runtimeEnvironment.canReadHostedConfig;
  },
}));

beforeEach(() => {
  setActivePinia(createPinia());
  runtimeEnvironment.canReadHostedConfig = true;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("a config that cannot be read", () => {
  it("does not request a server-only config in the standalone build", async () => {
    runtimeEnvironment.canReadHostedConfig = false;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const store = useMaplibreLayersStore();

    await store.initialize();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(store.layers.map((layer) => layer.sourceType)).toEqual([
      "style",
      "style",
      "style",
      "style",
    ]);
  });

  it("offers the fallback basemaps", async () => {
    // A served build also keeps working when its optional config is missing.
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

describe("basemaps the user added by address", () => {
  it("appends them to the basemaps from the config", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => [
          {
            name: "local",
            title: "Local",
            sourceType: "raster",
            tiles: ["/{z}/{x}/{y}.png"],
          },
        ],
      })),
    );
    useMapSettingsStore().customBasemaps = [
      {
        name: "custom:http://tiles.example.lan/style.json",
        title: "tiles.example.lan",
        url: "http://tiles.example.lan/style.json",
        sourceType: "style",
      },
    ];
    const store = useMaplibreLayersStore();

    await store.initialize();

    expect(store.layers.map((layer) => layer.name)).toEqual([
      "local",
      "custom:http://tiles.example.lan/style.json",
    ]);
    expect(store.getLayer("custom:http://tiles.example.lan/style.json")).toMatchObject({
      sourceType: "style",
      styleUrl: "http://tiles.example.lan/style.json",
      custom: true,
    });
  });

  it("is the only way to add a basemap when the config cannot be read", async () => {
    // The standalone build: no config file, therefore the fallbacks plus whatever the user typed.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    useMapSettingsStore().customBasemaps = [
      {
        name: "custom:http://192.168.1.10:8080/style.json",
        title: "192.168.1.10:8080",
        url: "http://192.168.1.10:8080/style.json",
        sourceType: "style",
      },
    ];
    const store = useMaplibreLayersStore();

    await store.initialize();

    expect(store.layers[store.layers.length - 1].name).toBe(
      "custom:http://192.168.1.10:8080/style.json",
    );
  });
});
