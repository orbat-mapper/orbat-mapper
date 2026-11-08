import { watch, type ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { applyAtlasLayerGroups, applyElevationBands } from "@/geo/atlasStyle";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

/**
 * Keeps the map's Atlas layers in step with the Atlas options, leaving other basemaps untouched.
 *
 * The options are applied to the live map rather than built into the style, because replacing the
 * style would rebuild every scenario layer with it. Until a new style has loaded it lists no layers,
 * so a change in that window does nothing and `style.load` picks it up.
 */
export function useAtlasBasemapOptions(mapRef: ShallowRef<MlMap | undefined>) {
  const settings = useMapSettingsStore();
  watch(
    mapRef,
    (map, _, onCleanup) => {
      if (!map) return;
      const applyBands = () => applyElevationBands(map, settings.atlasElevationBands);
      const applyGroups = () => applyAtlasLayerGroups(map, settings.atlasLayerGroups);
      const onStyleLoad = () => {
        applyBands();
        applyGroups();
      };
      map.on("style.load", onStyleLoad);
      const stopBands = watch(() => settings.atlasElevationBands, applyBands);
      const stopGroups = watch(() => settings.atlasLayerGroups, applyGroups);
      onCleanup(() => {
        stopBands();
        stopGroups();
        map.off("style.load", onStyleLoad);
      });
    },
    // Sync, so the listener is on the map before its first style loads.
    { flush: "sync" },
  );
}
