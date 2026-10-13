import { watch, type ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { useViewshedStore } from "@/stores/viewshedStore";

/**
 * Draws the viewsheds on the map. The map owns the attachment, so opening or closing Labs, or the
 * deck, never takes the viewsheds off it. Attached again after every style load, which takes the
 * layers away; the basemap's own layers are the ones a new style comes with.
 */
export function useMapViewshed(mapRef: ShallowRef<MlMap | undefined>) {
  const viewshed = useViewshedStore();
  watch(
    mapRef,
    (map, _, onCleanup) => {
      if (!map) return;
      function onStyleLoad() {
        viewshed.attachMap(map!, map!.getLayersOrder());
      }
      map.on("style.load", onStyleLoad);
      if (map.isStyleLoaded()) onStyleLoad();
      onCleanup(() => {
        map.off("style.load", onStyleLoad);
        viewshed.detach();
        // Ephemeral: they belong to this map, not to the next scenario opened.
        viewshed.closeAll();
      });
    },
    { flush: "sync" },
  );
}
