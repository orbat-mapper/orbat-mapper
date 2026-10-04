<script setup lang="ts">
import { computed, inject, ref, watchEffect } from "vue";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";
import BaseLayerSwitcher from "./BaseLayerSwitcher.vue";
import OpacityInput from "./OpacityInput.vue";
import { useGeoStore } from "@/stores/geoStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { activeScenarioKey } from "@/components/injects";
import { type LayerType } from "@/modules/scenarioeditor/featureLayerUtils";
import {
  basemapFlavor,
  basemapIsRemovable,
  basemapSupportsFlavor,
  basemapSupportsOpacity,
  getSupportedMaplibreBasemaps,
  resolveMaplibreBasemap,
} from "@/modules/maplibreview/maplibreBasemaps";
import type { BasemapFlavor } from "@/geo/maplibreLayerConfigTypes";
import { useBasemapArchives } from "@/composables/basemapArchives";
import { useCustomBasemaps } from "@/composables/customBasemaps";
import { Button } from "@/components/ui/button";
import AddMapServerDialog from "@/components/AddMapServerDialog.vue";
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
  /** Set only for the active base layer when it is a vector PMTiles archive. */
  flavor?: BasemapFlavor;
  /**
   * "pending-archive" is the remembered basemap archive that is not loaded. Such a row has no
   * radio: it cannot be activated, its action button loads the archive first.
   */
  rowKind?: "basemap" | "pending-archive";
  /** Button label on a pending-archive row. */
  actionLabel?: string;
  /** True for a basemap archive the user opened from disk. Only these can be removed. */
  removable?: boolean;
  layerId?: FeatureId;
}

const geoStore = useGeoStore();
const mapSettings = useMapSettingsStore();
const maplibreLayersStore = useMaplibreLayersStore();
const activeScenario = inject<TScenario | null>(activeScenarioKey, null);
const {
  openBasemapArchivePicker,
  pendingBasemapArchives,
  activatePendingBasemapArchive,
  removeBasemapArchive,
} = useBasemapArchives();
const { isCustomBasemap, removeCustomBasemap } = useCustomBasemaps();

const otherLayers = ref<LayerInfo[]>([]);

const selectedBaseLayerId = computed(
  () =>
    resolveMaplibreBasemap(mapSettings.maplibreBaseLayerName, maplibreLayersStore.layers)
      .id,
);

const baseLayers = computed<LayerInfo[]>(() => {
  const activeId = selectedBaseLayerId.value;
  const rows: LayerInfo[] = getSupportedMaplibreBasemaps(maplibreLayersStore.layers).map(
    (layer) => {
      const config = maplibreLayersStore.layers.find((entry) => entry.name === layer.id);
      const isActive = activeId === layer.id;
      return {
        id: layer.id,
        name: layer.id,
        title: layer.title,
        visible: isActive,
        zIndex: 0,
        opacity: config?.opacity ?? 1,
        description: "",
        layerType: "baselayer" as const,
        supportsOpacity: basemapSupportsOpacity(config),
        // Only a vector PMTiles archive has flavours, and only the active base layer is styled,
        // so that is the only row that gets the select.
        flavor:
          isActive && basemapSupportsFlavor(config) ? basemapFlavor(config) : undefined,
        rowKind: "basemap" as const,
        removable: basemapIsRemovable(config),
      };
    },
  );

  // Built here and not inside getSupportedMaplibreBasemaps(): that function is shared with the
  // context menu, and resolveMaplibreBasemap() falls back to options[0], so a non-basemap entry
  // in it could become the resolved active basemap.
  for (const pending of pendingBasemapArchives.value) {
    rows.push({
      // Prefixed so this id can never equal a layer name, a radio value or a stored basemap id.
      id: `pending:${pending.key}`,
      name: pending.key,
      title: pending.fileName,
      visible: false,
      zIndex: 0,
      opacity: 1,
      description:
        pending.action === "restore"
          ? "Opened earlier. Your browser must ask you before it reads the file again."
          : "Opened earlier. Select the file again to use this basemap.",
      layerType: "baselayer" as const,
      supportsOpacity: false,
      rowKind: "pending-archive" as const,
      actionLabel:
        pending.action === "restore"
          ? "Restore PMTiles archive"
          : "Select PMTiles archive…",
      removable: true,
    });
  }
  return rows;
});

const activeBaseLayer = computed({
  get: () => baseLayers.value.find((layer) => layer.id === selectedBaseLayerId.value),
  set: (layerInfo?: LayerInfo) => {
    // Belt and braces: a pending row has no radio, so it cannot become the active base layer.
    if (!layerInfo || layerInfo.rowKind === "pending-archive") return;
    mapSettings.maplibreBaseLayerName = layerInfo.name;
  },
});

const mapView = computed(() => {
  if (!geoStore.mapAdapter) return;
  return {
    center: geoStore.mapAdapter.getCenter() ?? [0, 0],
    zoom: geoStore.mapAdapter.getZoom(),
  };
});

watchEffect(() => {
  otherLayers.value =
    activeScenario?.geo.layerItemsLayers.value.map((layer, index) => ({
      id: String(layer.id),
      layerId: layer.id,
      title: layer.name,
      name: layer.name,
      visible: !(layer.isHidden ?? false),
      zIndex: index,
      opacity: layer.opacity ?? 1,
    })) ?? [];
});

function toggleLayer(layerInfo: LayerInfo) {
  layerInfo.visible = !layerInfo.visible;

  if (layerInfo.layerId) {
    activeScenario?.geo.updateLayer(layerInfo.layerId, { isHidden: !layerInfo.visible });
  }
}

function activateLayer(layerInfo: LayerInfo) {
  if (layerInfo.rowKind !== "pending-archive") return;
  void activatePendingBasemapArchive(layerInfo.name);
}

function removeBaseLayer(layerInfo: LayerInfo) {
  // A basemap added by address has no file, no handle and nothing to forget but the address.
  if (isCustomBasemap(layerInfo.name)) {
    removeCustomBasemap(layerInfo.name);
    return;
  }
  // `name` is the archive key on both a loaded row and a pending row.
  void removeBasemapArchive(layerInfo.name);
}

const showAddMapServer = ref(false);

function updateFlavor(layerInfo: LayerInfo, flavor: BasemapFlavor) {
  maplibreLayersStore.setLayerFlavor(layerInfo.name, flavor);
}

function updateOpacity(layerInfo: LayerInfo, opacity: number) {
  if (layerInfo.layerType === "baselayer") {
    maplibreLayersStore.setLayerOpacity(layerInfo.name, opacity);
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
      @update:layer-flavor="updateFlavor"
      @activate-layer="activateLayer"
      @remove-layer="removeBaseLayer"
    />

    <Button
      type="button"
      variant="outline"
      size="sm"
      class="mt-2 w-full"
      data-test="open-map-file"
      @click="openBasemapArchivePicker()"
    >
      Open PMTiles archive…
    </Button>

    <Button
      type="button"
      variant="outline"
      size="sm"
      class="mt-2 w-full"
      data-test="add-map-server"
      @click="showAddMapServer = true"
    >
      Add map server…
    </Button>

    <AddMapServerDialog v-model="showAddMapServer" />

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
