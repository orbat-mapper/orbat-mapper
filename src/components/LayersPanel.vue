<script setup lang="ts">
import { computed, markRaw, ref, shallowRef, watch } from "vue";
import { useGeoStore } from "@/stores/geoStore";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import LayerGroup from "ol/layer/Group";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";
import BaseLayerSwitcher from "./BaseLayerSwitcher.vue";
import type { AnyTileLayer, AnyVectorLayer } from "@/geo/types";
import TileSource from "ol/source/Tile";
import { toLonLat } from "ol/proj";
import OpacityInput from "./OpacityInput.vue";
import { getUid } from "ol";
import { type LayerType } from "@/modules/scenarioeditor/featureLayerUtils";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import ImageLayer from "ol/layer/Image";
import { useBaseLayersStore } from "@/stores/baseLayersStore";

export interface LayerInfo<T extends BaseLayer = BaseLayer> {
  id: string;
  name: string;
  title: string;
  visible: boolean;
  zIndex: number;
  opacity: number;
  layer: T;
  subLayers?: LayerInfo<T>[];
  description?: string;
  layerType?: LayerType | "baselayer";
}

const geoStore = useGeoStore();
const mapSettings = useMapSettingsStore();
const baseLayersStore = useBaseLayersStore();

const vectorLayers = ref<LayerInfo<AnyVectorLayer>[]>([]);

// Adapt store layers to the format expected by BaseLayerSwitcher
// BaseLayerSwitcher expects LayerInfo<any>[] but mostly cares about id, title, description
const baseLayers = computed(() => {
  return baseLayersStore.layers.map((l) => ({
    id: l.name,
    name: l.name,
    title: l.title,
    visible: baseLayersStore.activeLayerName === l.name,
    zIndex: 0,
    opacity: l.opacity,
    layer: null as any, // We don't need the OL layer instance here for the switcher anymore
    description: "",
    layerType: "baselayer" as const,
  }));
});

// We need a writable computed or something to handle v-model from BaseLayerSwitcher
const activeBaseLayer = computed({
  get: () => baseLayers.value.find((l) => l.name === baseLayersStore.activeLayerName),
  set: (layerInfo) => {
    if (layerInfo) {
      baseLayersStore.selectLayer(layerInfo.name);
      mapSettings.baseLayerName = layerInfo.name;
    }
  },
});

const mapView = computed(() => {
  if (!geoStore.olMap) return;
  const view = geoStore.olMap.getView();
  return {
    center: toLonLat(view.getCenter() || [0, 0], view.getProjection()),
    zoom: view.getZoom(),
  };
});

watch(
  () => geoStore.olMap,
  (v) => v && updateLayers(),
  { immediate: true },
);

function updateLayers() {
  if (!geoStore.olMap) return;

  const transformLayer = (layer: BaseLayer): LayerInfo => {
    const l: LayerInfo = {
      id: getUid(layer),
      title: layer.get("title") || layer.get("name"),
      name: layer.get("name"),
      layerType: layer.get("layerType"),
      visible: layer.getVisible(),
      zIndex: layer.getZIndex() || 0,
      opacity: layer.getOpacity(),
      layer: markRaw(layer),
      subLayers: [],
    };
    if (layer instanceof LayerGroup) {
      l.subLayers = layer
        .getLayers()
        .getArray()
        .filter((l) => l.get("title"))
        .map(transformLayer);
    }
    return l;
  };

  const mappedLayers = geoStore.olMap
    .getAllLayers()
    .filter((l) => l.get("title"))
    .map(transformLayer);

  // We filter out baserlayers from here, as they are now managed by baseLayersStore
  // Now we only want vector/other layers here.

  vectorLayers.value = mappedLayers.filter(
    ({ layer, layerType }) =>
      (layer instanceof VectorLayer ||
        layer instanceof LayerGroup ||
        layer instanceof ImageLayer) &&
      layerType !== "baselayer",
  ) as LayerInfo<AnyVectorLayer>[];
}

const toggleLayer = (l: LayerInfo<any>) => {
  l.visible = !l.visible;
  l.layer.setOpacity(l.opacity);
  l.layer.setVisible(l.visible);
};

function updateOpacity(l: LayerInfo<any>, opacity: number) {
  if (l.layerType === "baselayer") {
    baseLayersStore.setLayerOpacity(l.name, opacity);
  } else {
    l.opacity = opacity;
    l.layer.setOpacity(opacity);
  }
}
</script>

<template>
  <div>
    <p class="text-xs font-medium tracking-wider uppercase">Base layers</p>

    <BaseLayerSwitcher
      class="mt-4"
      :settings="baseLayers"
      v-model="activeBaseLayer"
      @update:layer-opacity="updateOpacity"
    />

    <p class="mt-4 text-xs font-medium tracking-wider uppercase">Other layers</p>

    <div class="bg-card mt-4 overflow-hidden rounded-md shadow-sm">
      <ul class="divide-y">
        <li v-for="layer in vectorLayers" :key="layer.id" class="px-6 py-4">
          <div class="flex items-center justify-between">
            <p class="flex-auto truncate text-sm">{{ layer.title }}</p>
            <div class="ml-2 flex shrink-0 items-center">
              <OpacityInput
                :model-value="layer.opacity"
                @update:model-value="updateOpacity(layer, $event)"
              />
              <button
                class="text-muted-foreground ml-4 h-5 w-5"
                @click="toggleLayer(layer)"
              >
                <EyeIcon v-if="layer.visible" />
                <EyeSlashIcon v-else />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="mt-4">
      <p>For debugging:</p>
      <pre class="text-sm">{{ mapView }}</pre>
    </div>
  </div>
</template>
