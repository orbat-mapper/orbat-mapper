<template>
  <div class="relative bg-white dark:bg-gray-900">
    <MapContainer
      @ready="onMapReady"
      @drop="onDrop"
      @dragover.prevent
      @contextmenu="onContextMenu"
      :base-layer-name="mapSettings.baseLayerName"
    />
    <ScenarioMapLogic
      v-if="mapRef"
      :ol-map="mapRef"
      @map-ready="emit('map-ready', $event)"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { useGeoStore } from "@/stores/geoStore";

import { useDrop, useUnitLayer } from "@/composables/geomap";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useMapContextMenu } from "@/composables/mapContextMenu";
import type Select from "ol/interaction/Select";
import ScenarioMapLogic from "@/components/ScenarioMapLogic.vue";

const emit = defineEmits<{
  (
    e: "map-ready",
    value: {
      olMap: OLMap;
      featureSelectInteraction: Select;
      unitSelectInteraction: Select;
    },
  ): void;
}>();

const mapSettings = useMapSettingsStore();

const mapRef = shallowRef<OLMap>();
const geoStore = useGeoStore();

const { unitLayer } = useUnitLayer();
const { onDrop } = useDrop(mapRef, unitLayer);
const { onContextMenu } = useMapContextMenu(mapRef);

const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  geoStore.olMap = olMap;
};
</script>
<style>
.ol-scale-line {
  bottom: 2.2rem;
}
</style>
