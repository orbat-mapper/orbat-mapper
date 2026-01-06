import { defineStore } from "pinia";
import { ref } from "vue";
import type { LayerConfig, LayerConfigFile } from "@/geo/layerConfigTypes";

export type StoredLayerConfig = LayerConfig & { opacity: number };

export const useBaseLayersStore = defineStore("baseLayers", () => {
  const layers = ref<StoredLayerConfig[]>([]);
  const activeLayerName = ref<string>("osm");
  const isInitialized = ref(false);

  async function initialize() {
    if (isInitialized.value) return;
    try {
      const res = await fetch("/config/mapConfig.json");
      const config = (await res.json()) as LayerConfigFile;
      if (config && config.length > 0) {
        layers.value = config.map((l) => ({ ...l, opacity: 1 }));
      } else {
        createFallbackLayers();
      }
    } catch (e) {
      console.error("Failed to fetch mapConfig.json", e);
      createFallbackLayers();
    } finally {
      isInitialized.value = true;
    }
  }

  function createFallbackLayers() {
    layers.value = [
      {
        title: "OSM",
        name: "osm",
        layerSourceType: "osm",
        sourceOptions: { crossOrigin: "anonymous" },
        layerType: "baselayer",
        opacity: 1,
      },
    ];
  }

  function selectLayer(name: string) {
    activeLayerName.value = name;
  }

  function setLayerOpacity(name: string, opacity: number) {
    const layer = layers.value.find((l) => l.name === name);
    if (layer) {
      layer.opacity = opacity;
    }
  }

  return {
    layers,
    activeLayerName,
    initialize,
    selectLayer,
    setLayerOpacity,
  };
});
