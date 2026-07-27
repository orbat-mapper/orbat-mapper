/**
 * Adding and removing a basemap by address.
 *
 * The counterpart of `useBasemapArchives()`, which does the same for a file on disk. The two are
 * separate because almost nothing is shared: an address needs no picker, no permission and no file
 * handle, and it survives a reload by itself.
 */
import { computed } from "vue";
import {
  customBasemapFromUrl,
  customBasemapToLayerConfig,
  type CustomBasemap,
} from "@/geo/customBasemap";
import {
  getSupportedMaplibreBasemaps,
  NO_BASEMAP_ID,
} from "@/modules/maplibreview/maplibreBasemaps";
import { useNotifications } from "@/composables/notifications";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

export function useCustomBasemaps() {
  const layersStore = useMaplibreLayersStore();
  const mapSettings = useMapSettingsStore();
  const { send } = useNotifications();

  const customBasemaps = computed<CustomBasemap[]>(() => mapSettings.customBasemaps);

  function isCustomBasemap(name: string): boolean {
    return mapSettings.customBasemaps.some((basemap) => basemap.name === name);
  }

  /**
   * Adds a basemap from an address and makes it active.
   *
   * The address is not tested here. Whether a server answers is not knowable until MapLibre asks
   * it, and a server that is down now can be up later, therefore an address that cannot load stays
   * in the list and the map shows the failure.
   */
  async function addCustomBasemap(url: string, title?: string): Promise<boolean> {
    const result = customBasemapFromUrl(url, title);
    if (!result.ok) {
      send({ message: result.message, type: "error" });
      return false;
    }
    const { basemap } = result;

    try {
      const layer = customBasemapToLayerConfig(basemap);
      layersStore.addLayer(layer);
      // Assigned as a new array, so localStorage is written. An address that is already in the
      // list updates its entry instead of making a second row for the same server.
      mapSettings.customBasemaps = [
        ...mapSettings.customBasemaps.filter((entry) => entry.name !== basemap.name),
        basemap,
      ];
      layersStore.setActiveBasemap(basemap.name);
      send({ message: `Added ${basemap.title} as basemap`, type: "success" });
      return true;
    } catch (e) {
      send({
        message: e instanceof Error ? e.message : `Could not add ${basemap.title}`,
        type: "error",
      });
      return false;
    }
  }

  /** Removes a basemap the user added by address. Nothing on disk and no server is touched. */
  function removeCustomBasemap(name: string): void {
    const basemap = mapSettings.customBasemaps.find((entry) => entry.name === name);
    const label = basemap?.title ?? layersStore.getLayer(name)?.title ?? name;
    const wasActive = mapSettings.maplibreBaseLayerName === name;

    layersStore.removeLayer(name);
    mapSettings.customBasemaps = mapSettings.customBasemaps.filter(
      (entry) => entry.name !== name,
    );

    // Do not leave the map on a basemap that no longer exists.
    if (wasActive) {
      const options = getSupportedMaplibreBasemaps(layersStore.layers);
      const next =
        options.find((option) => option.id !== name && option.id !== NO_BASEMAP_ID) ??
        options[0];
      layersStore.setActiveBasemap(next.id);
    }

    send({ message: `Removed ${label}`, type: "success" });
  }

  return { customBasemaps, isCustomBasemap, addCustomBasemap, removeCustomBasemap };
}
