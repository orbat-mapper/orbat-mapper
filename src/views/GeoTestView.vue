<script setup lang="ts">
import MapContainer from "../components/MapContainer.vue";
import OLMap from "ol/Map";
import { shallowRef } from "vue";
import MeasurementToolbar from "../components/MeasurementToolbar.vue";
import MapEditToolbar from "../components/MapEditToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

const mapRef = shallowRef<OLMap>();

const vectorLayer = new VectorLayer({
  source: new VectorSource(),
});
const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  olMap.addLayer(vectorLayer);
};
</script>

<template>
  <div class="h-full w-full">
    <MapContainer @ready="onMapReady" class="h-full w-full" />

    <MapEditToolbar
      v-if="mapRef"
      :ol-map="mapRef"
      class="absolute left-3 top-[150px]"
      :layer="vectorLayer"
      add-multiple
    />
    <MeasurementToolbar v-if="mapRef" :ol-map="mapRef" class="absolute left-3 bottom-4" />
  </div>
</template>
