<script setup lang="ts">
import { ref, shallowRef } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { useGeoStore } from "@/stores/geoStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import type Select from "ol/interaction/Select";
import ScenarioMapLogic from "@/components/ScenarioMapLogic.vue";
import MapContextMenu from "@/components/MapContextMenu.vue";
import { useMapViewStore } from "@/stores/mapViewStore";
import View from "ol/View";

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
const mapViewStore = useMapViewStore();
const mapRef = shallowRef<OLMap>();
const geoStore = useGeoStore();

const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  geoStore.olMap = olMap;
};

function onMoveEnd({ view }: { view: View }) {
  mapViewStore.zoomLevel = view.getZoom() ?? 0;
}
</script>
<template>
  <div class="bg-background relative">
    <MapContextMenu :map-ref="mapRef" v-slot="{ onContextMenu }">
      <MapContainer
        @ready="onMapReady"
        @dragover.prevent
        :base-layer-name="mapSettings.baseLayerName"
        @contextmenu="onContextMenu"
        @moveend="onMoveEnd"
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
