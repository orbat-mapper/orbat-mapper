import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import type { MlLayerConfig, MlLayerConfigFile } from "@/geo/maplibreLayerConfigTypes";

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
  const layers = shallowRef<MlLayerConfig[]>(FALLBACK_LAYERS);
  const isInitialized = ref(false);

  async function initialize() {
    if (isInitialized.value) return;
    try {
      const res = await fetch("/config/maplibreConfig.json");
      const config = (await res.json()) as MlLayerConfigFile;
      layers.value = config && config.length > 0 ? config : FALLBACK_LAYERS;
    } catch (e) {
      console.error("Failed to fetch maplibreConfig.json", e);
      layers.value = FALLBACK_LAYERS;
    } finally {
      isInitialized.value = true;
    }
  }

  return {
    layers,
    isInitialized,
    initialize,
  };
});
