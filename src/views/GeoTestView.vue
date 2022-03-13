<script setup lang="ts">
import MapContainer from "../components/MapContainer.vue";
import OLMap from "ol/Map";
import { shallowRef } from "vue";
import MeasurementToolbar from "../components/MeasurementToolbar.vue";

const mapRef = shallowRef<OLMap>();

const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
};
</script>

<template>
  <div class="h-screen w-screen">
    <MapContainer @ready="onMapReady" />
    <MeasurementToolbar v-if="mapRef" :ol-map="mapRef" class="absolute left-3 bottom-4" />
  </div>
</template>
