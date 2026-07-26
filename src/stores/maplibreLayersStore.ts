import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import {
  type BasemapFlavor,
  type MlLayerConfig,
  type MlLayerConfigFile,
} from "@/geo/maplibreLayerConfigTypes";
import {
  openBasemapArchiveFile,
  resolveBasemapArchiveLayer,
  type OpenBasemapArchiveOptions,
} from "@/geo/basemapArchive";
import { unregisterArchive } from "@/geo/pmtilesProtocol";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { canFetchAppAssets } from "@/utils/runtimeEnvironment";

const FALLBACK_LAYERS: MlLayerConfig[] = [
  {
    name: "openFreeMapPositron",
    title: "OpenFreeMap Positron",
    sourceType: "style",
    styleUrl: "https://tiles.openfreemap.org/styles/positron",
  },
  {
    name: "openFreeMapLiberty",
    title: "OpenFreeMap Liberty",
    sourceType: "style",
    styleUrl: "https://tiles.openfreemap.org/styles/liberty",
  },
  {
    name: "openFreeMapBright",
    title: "OpenFreeMap Bright",
    sourceType: "style",
    styleUrl: "https://tiles.openfreemap.org/styles/bright",
  },
  {
    name: "versaTilesEclipse",
    title: "VersaTiles Eclipse (dark)",
    sourceType: "style",
    styleUrl: "https://tiles.versatiles.org/assets/styles/eclipse/style.json",
  },
];

export const useMaplibreLayersStore = defineStore("maplibreLayers", () => {
  const layers = shallowRef<MlLayerConfig[]>(canFetchAppAssets() ? FALLBACK_LAYERS : []);
  const isInitialized = ref(false);

  // Held while initialize() runs, so a second caller in the same tick waits for the archives to
  // resolve instead of reading a layer list where they are still missing.
  let initializing: Promise<void> | undefined;

  function initialize(): Promise<void> {
    if (isInitialized.value) return Promise.resolve();
    initializing ??= runInitialize().finally(() => {
      initializing = undefined;
      isInitialized.value = true;
    });
    return initializing;
  }

  async function runInitialize() {
    if (!canFetchAppAssets()) {
      // Standalone file: there is no server to read the config from, and every fallback is an
      // online basemap that cannot load either. Start with no basemaps at all — the map opens on
      // "No base map" and the Layers panel offers "Open map file…" as the way forward.
      layers.value = [];
      return;
    }
    try {
      const res = await fetch("/config/maplibreConfig.json");
      const config = (await res.json()) as MlLayerConfigFile;
      layers.value = config && config.length > 0 ? config : FALLBACK_LAYERS;
    } catch (e) {
      console.error("Failed to fetch maplibreConfig.json", e);
      layers.value = FALLBACK_LAYERS;
    }
    await resolveArchiveLayers();
  }

  /**
   * Reads the header of every archive declared by URL in the config, so the basemap picker knows
   * whether it is raster or vector. Archives that cannot be read are dropped with a console error
   * rather than left in the picker as broken entries.
   */
  async function resolveArchiveLayers() {
    const declared = layers.value.filter(
      (layer) => layer.sourceType === "pmtiles" || layer.sourceType === "mapbundle",
    );
    if (declared.length === 0) return;
    const resolved = await Promise.all(
      declared.map(async (layer) => {
        try {
          return await resolveBasemapArchiveLayer(layer);
        } catch (e) {
          console.error(`Failed to open basemap archive "${layer.name}"`, e);
          return null;
        }
      }),
    );
    const byName = new Map(
      resolved.filter((layer) => layer !== null).map((layer) => [layer.name, layer]),
    );
    const dropped = new Set(
      declared.filter((layer) => !byName.has(layer.name)).map((layer) => layer.name),
    );
    layers.value = layers.value
      .filter((layer) => !dropped.has(layer.name))
      .map((layer) => byName.get(layer.name) ?? layer);
  }

  function getLayer(name: string): MlLayerConfig | undefined {
    return layers.value.find((layer) => layer.name === name);
  }

  /** Adds a layer, replacing an existing one with the same name. */
  function addLayer(layer: MlLayerConfig) {
    const existing = layers.value.findIndex((entry) => entry.name === layer.name);
    if (existing >= 0) {
      const next = layers.value.slice();
      next[existing] = layer;
      layers.value = next;
      return;
    }
    layers.value = [...layers.value, layer];
  }

  function removeLayer(name: string) {
    const layer = getLayer(name);
    if (layer?.sourceType === "pmtiles") unregisterArchive(name);
    layers.value = layers.value.filter((entry) => entry.name !== name);
  }

  function setLayerOpacity(name: string, opacity: number) {
    layers.value = layers.value.map((layer) =>
      layer.name === name ? { ...layer, opacity } : layer,
    );
  }

  /** Changes the Protomaps flavour of a vector PMTiles archive. No-op for anything else. */
  function setLayerFlavor(name: string, flavor: BasemapFlavor) {
    layers.value = layers.value.map((layer) =>
      layer.name === name && layer.sourceType === "pmtiles"
        ? { ...layer, flavor }
        : layer,
    );
  }

  /** Makes a basemap the active one on the MapLibre map. */
  function setActiveBasemap(name: string) {
    useMapSettingsStore().maplibreBaseLayerName = name;
  }

  /**
   * Opens a basemap archive the user picked and adds it to the basemap list.
   *
   * Session-only — the layer disappears on reload, because a `File` reference cannot be persisted.
   * Returns the added layer so the caller can activate it and report success.
   */
  async function addBasemapArchive(file: File, options?: OpenBasemapArchiveOptions) {
    const layer = await openBasemapArchiveFile(file, options);
    addLayer(layer);
    return layer;
  }

  return {
    layers,
    isInitialized,
    initialize,
    getLayer,
    addLayer,
    removeLayer,
    setLayerOpacity,
    setLayerFlavor,
    setActiveBasemap,
    addBasemapArchive,
  };
});
