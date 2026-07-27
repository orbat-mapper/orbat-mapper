// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCustomBasemaps } from "@/composables/customBasemaps";
import { useNotifications } from "@/composables/notifications";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import type { MlLayerConfig } from "@/geo/maplibreLayerConfigTypes";

/**
 * Reading a PMTiles header is a range request. The seam stands in for it, so a test can choose
 * between an archive that answers and one that does not.
 */
const archive = vi.hoisted(() => ({
  resolve: vi.fn(async (layer: unknown) => layer),
}));

vi.mock("@/geo/basemapArchive", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/geo/basemapArchive")>()),
  resolveBasemapArchiveLayer: (layer: MlLayerConfig) => archive.resolve(layer),
}));

const STYLE_URL = "http://tiles.example.lan/style.json";
const STYLE_NAME = `custom:${STYLE_URL}`;
const PMTILES_URL = "http://tiles.example.lan/denmark.pmtiles";
const PMTILES_NAME = `custom:${PMTILES_URL}`;

function lastNotification() {
  const list = useNotifications().notifications.value;
  return list[list.length - 1];
}

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  useNotifications().notifications.value = [];
  archive.resolve.mockReset().mockImplementation(async (layer: unknown) => layer);
});

describe("addCustomBasemap", () => {
  it("adds the layer, remembers the address and makes it active", async () => {
    const { addCustomBasemap } = useCustomBasemaps();

    expect(await addCustomBasemap(STYLE_URL)).toBe(true);

    const layersStore = useMaplibreLayersStore();
    expect(layersStore.getLayer(STYLE_NAME)).toMatchObject({
      sourceType: "style",
      styleUrl: STYLE_URL,
      custom: true,
    });
    expect(useMapSettingsStore().customBasemaps).toEqual([
      {
        name: STYLE_NAME,
        title: "tiles.example.lan/style.json",
        url: STYLE_URL,
        sourceType: "style",
      },
    ]);
    expect(useMapSettingsStore().maplibreBaseLayerName).toBe(STYLE_NAME);
    expect(lastNotification()).toMatchObject({ type: "success" });
  });

  it("reports a bad address and adds nothing", async () => {
    const { addCustomBasemap } = useCustomBasemaps();

    const before = useMaplibreLayersStore().layers.length;

    expect(await addCustomBasemap("tiles.example.lan")).toBe(false);

    expect(useMaplibreLayersStore().layers).toHaveLength(before);
    expect(useMapSettingsStore().customBasemaps).toEqual([]);
    expect(lastNotification()).toMatchObject({ type: "error" });
  });

  it("reads the header of a .pmtiles address before it adds the layer", async () => {
    archive.resolve.mockImplementation(async (layer: unknown) => ({
      ...(layer as MlLayerConfig),
      archive: { kind: "vector", minZoom: 0, maxZoom: 14, bounds: [-180, -85, 180, 85] },
    }));
    const { addCustomBasemap } = useCustomBasemaps();

    expect(await addCustomBasemap(PMTILES_URL)).toBe(true);

    // Without the archive info the basemap picker drops the layer, so the map would fall back to
    // another basemap while the dialog reported success.
    expect(useMaplibreLayersStore().getLayer(PMTILES_NAME)).toMatchObject({
      sourceType: "pmtiles",
      archive: { kind: "vector" },
    });
  });

  it("fails an archive it cannot read, and remembers nothing", async () => {
    archive.resolve.mockRejectedValue(new Error("Could not read the archive header"));
    const { addCustomBasemap } = useCustomBasemaps();
    const before = useMaplibreLayersStore().layers.length;
    const active = useMapSettingsStore().maplibreBaseLayerName;

    expect(await addCustomBasemap(PMTILES_URL)).toBe(false);

    expect(useMaplibreLayersStore().layers).toHaveLength(before);
    expect(useMapSettingsStore().customBasemaps).toEqual([]);
    expect(useMapSettingsStore().maplibreBaseLayerName).toBe(active);
    expect(lastNotification()).toMatchObject({
      message: "Could not read the archive header",
      type: "error",
    });
  });

  it("updates the entry when the same address is added again", async () => {
    const { addCustomBasemap } = useCustomBasemaps();
    const before = useMaplibreLayersStore().layers.length;

    await addCustomBasemap(STYLE_URL);
    await addCustomBasemap(STYLE_URL, "Ops room");

    const { customBasemaps } = useMapSettingsStore();
    expect(customBasemaps).toHaveLength(1);
    expect(customBasemaps[0].title).toBe("Ops room");
    expect(useMaplibreLayersStore().layers).toHaveLength(before + 1);
  });
});

describe("removeCustomBasemap", () => {
  it("drops the layer and forgets the address", async () => {
    const { addCustomBasemap, removeCustomBasemap, isCustomBasemap } =
      useCustomBasemaps();
    await addCustomBasemap(STYLE_URL);

    expect(isCustomBasemap(STYLE_NAME)).toBe(true);

    removeCustomBasemap(STYLE_NAME);

    expect(useMaplibreLayersStore().getLayer(STYLE_NAME)).toBeUndefined();
    expect(useMapSettingsStore().customBasemaps).toEqual([]);
    expect(isCustomBasemap(STYLE_NAME)).toBe(false);
    expect(lastNotification()).toMatchObject({ type: "success" });
  });

  it("moves the map off the removed basemap", async () => {
    const layersStore = useMaplibreLayersStore();
    const { addCustomBasemap, removeCustomBasemap } = useCustomBasemaps();
    await addCustomBasemap(STYLE_URL);
    expect(useMapSettingsStore().maplibreBaseLayerName).toBe(STYLE_NAME);

    removeCustomBasemap(STYLE_NAME);

    // Whichever basemap is next, it must be one that still exists.
    const active = useMapSettingsStore().maplibreBaseLayerName;
    expect(active).not.toBe(STYLE_NAME);
    expect(layersStore.getLayer(active)).toBeDefined();
  });
});
