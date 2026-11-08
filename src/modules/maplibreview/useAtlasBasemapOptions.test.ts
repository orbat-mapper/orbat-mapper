import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, shallowRef } from "vue";
import { createPinia, setActivePinia } from "pinia";
import type { Map as MlMap } from "maplibre-gl";
import { useAtlasBasemapOptions } from "@/modules/maplibreview/useAtlasBasemapOptions";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

function fakeMap() {
  const listeners = new Set<() => void>();
  const layers: Record<string, { metadata?: unknown }> = {
    "elevation-bands-4": {},
    borders: { metadata: { "atlas:layer-groups": ["borders"] } },
  };
  return {
    on: vi.fn((_: string, handler: () => void) => listeners.add(handler)),
    off: vi.fn((_: string, handler: () => void) => listeners.delete(handler)),
    getLayersOrder: () => Object.keys(layers),
    getLayer: (id: string) => layers[id],
    setPaintProperty: vi.fn(),
    setLayoutProperty: vi.fn(),
    loadStyle: () => listeners.forEach((handler) => handler()),
  };
}

function setup() {
  const map = fakeMap();
  const mapRef = shallowRef<MlMap | undefined>();
  useAtlasBasemapOptions(mapRef);
  mapRef.value = map as unknown as MlMap;
  return { map, mapRef, settings: useMapSettingsStore() };
}

describe("useAtlasBasemapOptions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useMapSettingsStore().$patch({
      atlasElevationBands: "alpine",
      atlasHiddenLayerGroups: [],
    });
  });

  it("applies the options each time a style loads", () => {
    const { map, settings } = setup();
    settings.atlasHiddenLayerGroups = ["borders"];

    map.loadStyle();
    map.loadStyle();

    expect(map.setPaintProperty).toHaveBeenCalledTimes(2);
    expect(map.setLayoutProperty).toHaveBeenCalledTimes(2);
    expect(map.setLayoutProperty).toHaveBeenLastCalledWith(
      "borders",
      "visibility",
      "none",
    );
  });

  it("repaints the live map when the elevation bands change", async () => {
    const { map, settings } = setup();

    settings.atlasElevationBands = "lowland";
    await nextTick();

    expect(map.setPaintProperty).toHaveBeenCalledTimes(1);
    expect(map.setLayoutProperty).not.toHaveBeenCalled();
  });

  it("shows and hides layers on the live map when the groups change", async () => {
    const { map, settings } = setup();

    settings.setAtlasLayerGroupShown("borders", false);
    await nextTick();
    expect(map.setLayoutProperty).toHaveBeenLastCalledWith(
      "borders",
      "visibility",
      "none",
    );

    settings.setAtlasLayerGroupShown("borders", true);
    await nextTick();
    expect(map.setLayoutProperty).toHaveBeenLastCalledWith(
      "borders",
      "visibility",
      "visible",
    );
    expect(map.setPaintProperty).not.toHaveBeenCalled();
  });

  it("lets go of the map when the ref is cleared", async () => {
    const { map, mapRef, settings } = setup();

    mapRef.value = undefined;
    settings.atlasElevationBands = "upland";
    await nextTick();
    map.loadStyle();

    expect(map.off).toHaveBeenCalledWith("style.load", expect.any(Function));
    expect(map.setPaintProperty).not.toHaveBeenCalled();
  });
});
