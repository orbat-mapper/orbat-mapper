<script setup lang="ts">
import { computed, inject, markRaw, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";
import BaseLayer from "ol/layer/Base";
import LayerGroup from "ol/layer/Group";
import VectorLayer from "ol/layer/Vector";
import ImageLayer from "ol/layer/Image";
import { getUid } from "ol/util";
import BaseLayerSwitcher from "./BaseLayerSwitcher.vue";
import OpacityInput from "./OpacityInput.vue";
import { useGeoStore } from "@/stores/geoStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { activeScenarioKey } from "@/components/injects";
import { MAPLIBRE_ROUTE } from "@/router/names";
import { type LayerType } from "@/modules/scenarioeditor/featureLayerUtils";
import {
  getSupportedMaplibreBasemaps,
  resolveMaplibreBasemap,
} from "@/modules/maplibreview/maplibreBasemaps";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { TScenario } from "@/scenariostore";

export interface LayerInfo {
  id: string;
  name: string;
  title: string;
  visible: boolean;
  zIndex: number;
  opacity: number;
  subLayers?: LayerInfo[];
  description?: string;
  layerType?: LayerType | "baselayer" | "map-layer";
  supportsOpacity?: boolean;
  kind?: "openlayers" | "scenario-layer";
  nativeLayer?: unknown;
  layerId?: FeatureId;
}

const route = useRoute();
const geoStore = useGeoStore();
const mapSettings = useMapSettingsStore();
const baseLayersStore = useBaseLayersStore();
const maplibreLayersStore = useMaplibreLayersStore();
const activeScenario = inject<TScenario | null>(activeScenarioKey, null);

const otherLayers = ref<LayerInfo[]>([]);
const isMaplibreMode = computed(() => route.name === MAPLIBRE_ROUTE);

const selectedBaseLayerId = computed(() => {
  if (isMaplibreMode.value) {
    return resolveMaplibreBasemap(
      mapSettings.maplibreBaseLayerName,
      maplibreLayersStore.layers,
    ).id;
  }
  return (
    activeScenario?.store.state.mapSettings.baseMapId ?? baseLayersStore.activeLayerName
  );
});

const baseLayers = computed<LayerInfo[]>(() => {
  if (isMaplibreMode.value) {
    const activeId = selectedBaseLayerId.value;
    return getSupportedMaplibreBasemaps(maplibreLayersStore.layers).map((layer) => {
      const config = maplibreLayersStore.layers.find((entry) => entry.name === layer.id);
      return {
        id: layer.id,
        name: layer.id,
        title: layer.title,
        visible: activeId === layer.id,
        zIndex: 0,
        opacity: config?.opacity ?? 1,
        description: "",
        layerType: "baselayer" as const,
        supportsOpacity: config?.sourceType === "raster",
      };
    });
  }

  const activeId = selectedBaseLayerId.value;
  return baseLayersStore.layers.map((layer) => ({
    id: layer.name,
    name: layer.name,
    title: layer.title,
    visible: activeId === layer.name,
    zIndex: 0,
    opacity: layer.opacity,
    description: "",
    layerType: "baselayer" as const,
    supportsOpacity: true,
  }));
});

const activeBaseLayer = computed({
  get: () => baseLayers.value.find((layer) => layer.id === selectedBaseLayerId.value),
  set: (layerInfo?: LayerInfo) => {
    if (!layerInfo) return;
    setScenarioBaseMapId(
      layerInfo.name,
      isMaplibreMode.value ? "maplibre" : "openlayers",
    );
    if (!isMaplibreMode.value) {
      baseLayersStore.selectLayer(layerInfo.name);
    }
  },
});

const mapView = computed(() => {
  if (!geoStore.mapAdapter) return;
  return {
    center: geoStore.mapAdapter.getCenter() ?? [0, 0],
    zoom: geoStore.mapAdapter.getZoom(),
  };
});

function setScenarioBaseMapId(
  baseMapId: string,
  mode: "openlayers" | "maplibre" = "openlayers",
) {
  if (mode === "maplibre") {
    mapSettings.maplibreBaseLayerName = baseMapId;
  } else {
    mapSettings.baseLayerName = baseMapId;
  }
  if (mode === "maplibre" || !activeScenario) return;

  if (typeof activeScenario.store.update === "function") {
    activeScenario.store.update((state) => {
      state.mapSettings.baseMapId = baseMapId;
    });
    return;
  }

  activeScenario.store.state.mapSettings.baseMapId = baseMapId;
}

function transformLayer(layer: BaseLayer): LayerInfo {
  const layerInfo: LayerInfo = {
    kind: "openlayers",
    id: getUid(layer),
    title: layer.get("title") || layer.get("name"),
    name: layer.get("name"),
    layerType: layer.get("layerType"),
    visible: layer.getVisible(),
    zIndex: layer.getZIndex() || 0,
    opacity: layer.getOpacity(),
    nativeLayer: markRaw(layer),
    subLayers: [],
  };

  if (layer instanceof LayerGroup) {
    layerInfo.subLayers = layer
      .getLayers()
      .getArray()
      .filter((child) => child.get("title"))
      .map((child) => transformLayer(child));
  }

  return layerInfo;
}

function syncLayers() {
  if (isMaplibreMode.value) {
    otherLayers.value =
      activeScenario?.geo.layerItemsLayers.value.map((layer, index) => ({
        kind: "scenario-layer",
        id: String(layer.id),
        layerId: layer.id,
        title: layer.name,
        name: layer.name,
        visible: !(layer.isHidden ?? false),
        zIndex: index,
        opacity: layer.opacity ?? 1,
      })) ?? [];
    return;
  }

  const nativeMap = geoStore.olMap;
  if (!nativeMap) {
    otherLayers.value = [];
    return;
  }

  const mappedLayers = nativeMap
    .getAllLayers()
    .filter((layer) => layer.get("title"))
    .map(transformLayer);

  otherLayers.value = mappedLayers.filter(
    ({ nativeLayer, layerType }) =>
      (nativeLayer instanceof VectorLayer ||
        nativeLayer instanceof LayerGroup ||
        nativeLayer instanceof ImageLayer) &&
      layerType !== "baselayer",
  );
}

watchEffect(() => {
  if (isMaplibreMode.value) {
    activeScenario?.geo.layerItemsLayers.value;
  } else {
    geoStore.olMap;
  }
  syncLayers();
});

function toggleLayer(layerInfo: LayerInfo) {
  layerInfo.visible = !layerInfo.visible;

  if (layerInfo.kind === "openlayers" && layerInfo.nativeLayer instanceof BaseLayer) {
    layerInfo.nativeLayer.setOpacity(layerInfo.opacity);
    layerInfo.nativeLayer.setVisible(layerInfo.visible);
    return;
  }

  if (layerInfo.layerId) {
    activeScenario?.geo.updateLayer(layerInfo.layerId, { isHidden: !layerInfo.visible });
  }
}

function updateOpacity(layerInfo: LayerInfo, opacity: number) {
  if (layerInfo.layerType === "baselayer") {
    if (isMaplibreMode.value) {
      maplibreLayersStore.setLayerOpacity(layerInfo.name, opacity);
    } else {
      baseLayersStore.setLayerOpacity(layerInfo.name, opacity);
    }
    return;
  }

  if (layerInfo.kind === "openlayers" && layerInfo.nativeLayer instanceof BaseLayer) {
    layerInfo.opacity = opacity;
    layerInfo.nativeLayer.setOpacity(opacity);
    return;
  }

  layerInfo.opacity = opacity;
  if (layerInfo.layerId) {
    activeScenario?.geo.updateLayer(layerInfo.layerId, { opacity });
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
        <li v-for="layer in otherLayers" :key="layer.id" class="px-6 py-4">
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
