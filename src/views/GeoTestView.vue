<script setup lang="ts">
import MapContainer from "../components/MapContainer.vue";
import OLMap from "ol/Map";
import { shallowRef } from "vue";
import MeasurementToolbar from "../components/MeasurementToolbar.vue";
import MapEditToolbar from "../components/MapEditToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";

const mapRef = shallowRef<OLMap>();

const vectorLayer = new VectorLayer({
  source: new VectorSource(),
  properties: {
    title: "Test layer",
  },
});
const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  olMap.addLayer(vectorLayer);
};

function onModify(features: Feature[]) {
  console.log("Modified feature(s)", features);
}

function onAdd(feature: Feature, layer: VectorLayer<any>) {
  console.log("Added feature", feature.getProperties(), layer.getProperties());
}
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
      @modify="onModify"
      @add="onAdd"
    />
    <MeasurementToolbar v-if="mapRef" :ol-map="mapRef" class="absolute left-3 bottom-4" />
  </div>
</template>
