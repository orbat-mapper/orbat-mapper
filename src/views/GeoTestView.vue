<script setup lang="ts">
import MapContainer from "../components/MapContainer.vue";
import OLMap from "ol/Map";
import { useMeasurementInteraction } from "../composables/geoMeasurement";
import { ref } from "vue";
import ToggleField from "../components/ToggleField.vue";
import BaseButton from "../components/BaseButton.vue";

const showSegments = ref(true);
const enableMeasurements = ref(true);
const clearPrevious = ref(true);
const measurementType = ref<"LineString" | "Polygon">("LineString");
let mInt: any;
const onMapReady = (olMap: OLMap) => {
  console.log("Map ready");
  mInt = useMeasurementInteraction(olMap, measurementType, {
    showSegments,
    clearPrevious,
    enable: enableMeasurements,
  });
};

function clear() {
  mInt?.clear();
}
</script>

<template>
  <div class="flex h-screen w-screen">
    <aside class="h-full w-56 flex-none bg-gray-50 p-4">
      <div class="border-b border-gray-200 pb-5">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Geo tests</h3>
      </div>

      <section class="mt-4 space-y-2">
        <ToggleField v-model="enableMeasurements">Enable measurements</ToggleField>
        <ToggleField v-model="showSegments">Show segments</ToggleField>
        <ToggleField v-model="clearPrevious">Clear previous</ToggleField>
        <fieldset class="mt-4">
          <legend class="sr-only">Measurement method</legend>
          <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
            <div class="flex items-center">
              <input
                id="a"
                type="radio"
                value="LineString"
                v-model="measurementType"
                class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label for="a" class="ml-3 block text-sm font-medium text-gray-700">
                Length
              </label>
            </div>
            <div class="flex items-center">
              <input
                id="b"
                type="radio"
                value="Polygon"
                v-model="measurementType"
                class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label for="b" class="ml-3 block text-sm font-medium text-gray-700">
                Area
              </label>
            </div>
          </div>
        </fieldset>
        <BaseButton @click="clear()">Clear</BaseButton>
      </section>
    </aside>
    <main class="flex-auto bg-green-100">
      <MapContainer @ready="onMapReady" />
    </main>
  </div>
</template>
