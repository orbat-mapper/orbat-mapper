import { watch, type ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { useViewshedStore } from "@/stores/viewshedStore";

/**
 * Draws the viewsheds on the map while the Labs viewshed is on. Until then the map carries none of
 * it: the layers module is loaded, and the layers and listeners added, only once it is turned on,
 * and they are all taken off again when it is turned off.
 *
 * Every style load takes the layers away, so they are added again after each. The basemap's own
 * layers, which the images go above, are noted at each style load, before anything is added over
 * them.
 */
export function useMapViewshed(mapRef: ShallowRef<MlMap | undefined>) {
  const viewshed = useViewshedStore();
  watch(
    mapRef,
    (map, _, onCleanup) => {
      if (!map) return;
      // The map arrives after its `load`, with its style in place. Not `isStyleLoaded()`, which
      // also waits for every tile.
      let styleReady = true;
      let basemapIds = new Set(map.getLayersOrder());
      let detach: (() => void) | null = null;
      /** Bumped on every change, so a load that lands after it attaches nothing. */
      let generation = 0;

      function remove() {
        generation++;
        detach?.();
        detach = null;
      }

      async function attach() {
        remove();
        if (!viewshed.active || !styleReady) return;
        const asked = generation;
        const { attachViewshedLayers } = await import("./viewshedLayers");
        if (asked === generation) detach = attachViewshedLayers(map!, basemapIds);
      }

      function onStyleLoading() {
        styleReady = false;
        remove();
      }

      function onStyleLoad() {
        styleReady = true;
        basemapIds = new Set(map!.getLayersOrder());
        void attach();
      }

      map.on("styledataloading", onStyleLoading);
      map.on("style.load", onStyleLoad);
      const stop = watch(
        () => viewshed.active,
        (on) => (on ? void attach() : remove()),
        { immediate: true },
      );
      onCleanup(() => {
        stop();
        map.off("styledataloading", onStyleLoading);
        map.off("style.load", onStyleLoad);
        remove();
        // Ephemeral: they belong to this map, not to the next scenario opened.
        viewshed.closeAll();
      });
    },
    { flush: "sync" },
  );
}
