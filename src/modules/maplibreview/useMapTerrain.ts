import { watch, type ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { useTerrainStore } from "@/stores/terrainStore";
import {
  HILLSHADE_LAYER_ID,
  HILLSHADE_SOURCE_ID,
  TERRAIN_SOURCE_ID,
  syncHillshadeOrder,
  syncMapTerrain,
} from "./mapTerrain";
import { installTerrainQueryCache } from "./terrainQueryCache";
import { installTerrainRttFilter } from "./terrainRttFilter";

/** The map owns listeners and sources; opening/closing Labs only edits preferences. */
export function useMapTerrain(mapRef: ShallowRef<MlMap | undefined>) {
  const settings = useTerrainStore();
  watch(
    mapRef,
    (map, _, onCleanup) => {
      if (!map) return;
      let ready = false;
      let frame: number | undefined;
      let basemapIds = new Set<string>();
      const uninstallRttFilter = installTerrainRttFilter(map);
      const uninstallQueryCache = installTerrainQueryCache(map);

      // getStyle() serializes the whole style; this runs on every settings change,
      // including each tick of a slider drag, so ask only for the layer order.
      function beforeId() {
        return map!
          .getLayersOrder()
          .find(
            (id) =>
              !basemapIds.has(id) &&
              id !== HILLSHADE_LAYER_ID &&
              map!.getLayer(id)?.type !== "raster",
          );
      }
      function sync() {
        // MapLibre considers errored tiles loaded. Retain failures until a source
        // is replaced (style load) or explicitly retried by toggling it off/on.
        if (!settings.terrainEnabled) settings.terrainError = false;
        if (!settings.hillshadeEnabled) settings.hillshadeError = false;
        if (ready) syncMapTerrain(map!, settings.display, beforeId());
      }
      function onStyleLoad() {
        basemapIds = new Set(map!.getLayersOrder());
        ready = true;
        settings.terrainError = false;
        settings.hillshadeError = false;
        sync();
      }
      function onStyleData() {
        if (!ready || frame !== undefined || !map!.getLayer(HILLSHADE_LAYER_ID)) return;
        frame = requestAnimationFrame(() => {
          frame = undefined;
          if (ready) syncHillshadeOrder(map!, beforeId());
        });
      }
      function onStyleLoading() {
        ready = false;
      }
      function onError(event: unknown) {
        if (!event || typeof event !== "object" || !("sourceId" in event)) return;
        if (event.sourceId === TERRAIN_SOURCE_ID) settings.terrainError = true;
        if (event.sourceId === HILLSHADE_SOURCE_ID) settings.hillshadeError = true;
      }
      map.on("styledataloading", onStyleLoading);
      map.on("style.load", onStyleLoad);
      map.on("styledata", onStyleData);
      map.on("error", onError);
      if (map.isStyleLoaded()) onStyleLoad();
      const stop = watch(() => settings.display, sync, { deep: true });
      onCleanup(() => {
        stop();
        uninstallRttFilter();
        uninstallQueryCache();
        if (frame !== undefined) cancelAnimationFrame(frame);
        map.off("styledataloading", onStyleLoading);
        map.off("style.load", onStyleLoad);
        map.off("styledata", onStyleData);
        map.off("error", onError);
      });
    },
    { flush: "sync" },
  );
}
