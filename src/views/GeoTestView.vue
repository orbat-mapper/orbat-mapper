<script setup lang="ts">
import MapContainer from "../components/MapContainer.vue";
import OLMap from "ol/Map";
import { ref, shallowRef, unref } from "vue";
import MeasurementToolbar from "../components/MeasurementToolbar.vue";
import MapEditToolbar from "../components/MapEditToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import BaseButton from "@/components/BaseButton.vue";
import { MapBrowserEvent } from "ol";
import { toLonLat } from "ol/proj";
import { onClickOutside, onKeyStroke } from "@vueuse/core";
import { unByKey } from "ol/Observable";
import { formatPosition } from "@/geo/utils";
import { useGetMapLocation } from "@/composables/geoMapLocation";

const mapRef = shallowRef<OLMap>();
const loc = ref("");
const nn = ref<ReturnType<typeof useGetMapLocation>>();
const vectorLayer = new VectorLayer({
  source: new VectorSource(),
  properties: {
    title: "Test layer",
  },
});
const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  olMap.addLayer(vectorLayer);
  nn.value = useGetMapLocation(olMap);
  nn.value.onGetLocation((location) => {
    loc.value = formatPosition(location);
  });
};

function onModify(features: Feature[]) {
  console.log("Modified feature(s)", features);
}

function onAdd(feature: Feature, layer: VectorLayer<any>) {
  console.log("Added feature", feature.getProperties(), layer.getProperties());
}

function doGetLocation() {
  const olMap = unref(mapRef)!;
  const stop = onClickOutside(olMap.getTargetElement(), (e) => {
    console.log("click outside", e);
    e.stopPropagation();
  });
  const prevCursor = olMap.getTargetElement().style.cursor;
  olMap.getTargetElement().style.cursor = "crosshair";
  const stopEsc = onKeyStroke("Escape", () => cleanUp());

  function cleanUp() {
    console.log("Cleanup");
    olMap.getTargetElement().style.cursor = prevCursor;
    stop && stop();
    unByKey(a);
    stopEsc && stopEsc();
  }
  const a = olMap.once("click", (event: MapBrowserEvent<any>) => {
    loc.value = formatPosition(toLonLat(event.coordinate));
    event.stopPropagation();
    cleanUp();
  });
}
</script>

<template>
  <div class="h-full w-full">
    <MapContainer @ready="onMapReady" class="h-full w-full" />

    <MapEditToolbar
      v-if="mapRef"
      :ol-map="mapRef"
      class="absolute top-[150px] left-3"
      :layer="vectorLayer"
      add-multiple
      @modify="onModify"
      @add="onAdd"
    />
    <MeasurementToolbar v-if="mapRef" :ol-map="mapRef" class="absolute bottom-4 left-3" />
    <template v-if="nn">
      <BaseButton
        class="fixed top-20 left-2"
        :class="{ 'bg-red-100': nn.isActive }"
        @click="nn?.start()"
        >Get location</BaseButton
      >
      <p class="bg-opacity-70 fixed bottom-5 left-20 rounded border bg-white p-1 px-2">
        {{ loc }}
      </p></template
    >
  </div>
</template>
