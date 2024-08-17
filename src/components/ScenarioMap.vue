<script setup lang="ts">
import { ref, shallowRef } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { useGeoStore } from "@/stores/geoStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import type Select from "ol/interaction/Select";
import ScenarioMapLogic from "@/components/ScenarioMapLogic.vue";
import MapContextMenu from "@/components/MapContextMenu.vue";

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

const mapLogicComponent = ref<InstanceType<typeof ScenarioMapLogic> | null>(null);
const mapSettings = useMapSettingsStore();
const mapRef = shallowRef<OLMap>();
const geoStore = useGeoStore();

const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  geoStore.olMap = olMap;
};
</script>
<template>
  <div class="relative bg-white dark:bg-gray-900">
    <MapContextMenu :map-ref="mapRef" v-slot="{ onContextMenu }">
      <MapContainer
        @ready="onMapReady"
        @dragover.prevent
        :base-layer-name="mapSettings.baseLayerName"
        @contextmenu="onContextMenu"
      />
    </MapContextMenu>

    <ScenarioMapLogic
      ref="mapLogicComponent"
      v-if="mapRef"
      :ol-map="mapRef"
      @map-ready="emit('map-ready', $event)"
    />
    <slot />
  </div>
</template>

<style>
.ol-scale-line {
  bottom: 2.2rem;
}
</style>
