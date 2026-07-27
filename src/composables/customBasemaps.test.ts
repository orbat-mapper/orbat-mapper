// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCustomBasemaps } from "@/composables/customBasemaps";
import { useNotifications } from "@/composables/notifications";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

const STYLE_URL = "http://tiles.example.lan/style.json";
const STYLE_NAME = `custom:${STYLE_URL}`;

function lastNotification() {
  const list = useNotifications().notifications.value;
  return list[list.length - 1];
}

beforeEach(() => {
  setActivePinia(createPinia());
  useNotifications().notifications.value = [];
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
