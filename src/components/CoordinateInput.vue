<script setup lang="ts">
import { ref, watch } from "vue";
import { MapPinIcon } from "@heroicons/vue/20/solid";

import * as mgrsLib from "mgrs";
import type { Position } from "geojson";
import { parseCoordinates } from "@/geo/utils";
import { getErrorMessage } from "@/utils";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import { truncate } from "@turf/truncate";
import { point } from "@turf/helpers";

const props = defineProps<{ label?: string; format?: CoordinateInputFormat }>();
const modelValue = defineModel<Position>({ required: true });
const inputFormat = ref<CoordinateInputFormat>(props.format ?? "LonLat");

const isInvalid = ref();
const localValue = ref<string>(convertToLocalValue(modelValue.value));
let isInternal = false;
watch(modelValue, (v) => {
  if (isInternal) {
    isInternal = false;
    return;
  }
  localValue.value = convertToLocalValue(v);
});

watch([localValue, inputFormat], ([v, inpFormat], [oldV, oldInpFormat]) => {
  if (isInternal) {
    isInternal = false;
    return;
  }
  if (inpFormat !== oldInpFormat) {
    isInternal = true;
    isInvalid.value = undefined;
    localValue.value = convertToLocalValue(modelValue.value);
    return;
  }
  let lon,
    lat = 0;

  if (inputFormat.value === "MGRS") {
    try {
      [lon, lat] = truncate(point(mgrsLib.toPoint(v) as Position)).geometry.coordinates;
    } catch (error) {
      isInvalid.value = true;
      console.error("Invalid MGRS input", getErrorMessage(error));
      return;
    }
  } else {
    try {
      const [first, second] = parseCoordinates(v);
      if (inputFormat.value === "LatLon") {
        lat = first;
        lon = second;
      } else {
        lon = first;
        lat = second;
      }
    } catch (error) {
      isInvalid.value = true;
      console.error("Invalid LatLon input", getErrorMessage(error));
      return;
    }
  }
  isInternal = true;
  isInvalid.value = undefined;
  modelValue.value = [lon, lat];
});

function convertToLocalValue(v: Position) {
  if (inputFormat.value === "MGRS") {
    return mgrsLib.forward(v as [number, number], 5);
  } else {
    const [lon, lat] = v as [number, number];
    if (inputFormat.value === "LatLon") {
      return `${lat},${lon}`;
    } else {
      return `${lon},${lat}`;
    }
  }
}
</script>

<script lang="ts">
export type CoordinateInputFormat = "MGRS" | "LatLon" | "LonLat";
</script>

<template>
  <div class="">
    <div>
      <InputGroupTemplate :label="label" v-slot="{ id }">
        <div class="relative rounded-sm shadow-sm">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <MapPinIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            :id="id"
            class="block w-full rounded-md border-0 py-1.5 pl-10 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 data-[invalid]:bg-red-200 sm:text-sm sm:leading-6"
            placeholder="10.0,10.0"
            :data-invalid="isInvalid"
            v-model="localValue"
          />
          <div class="absolute inset-y-0 right-0 flex items-center">
            <label for="coordinate-format" class="sr-only">Coordinate format</label>
            <select
              id="coordinate-format"
              class="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              v-model="inputFormat"
            >
              <option value="LatLon">LAT,LON</option>
              <option value="LonLat">LON, LAT</option>
              <option value="MGRS">MGRS</option>
            </select>
          </div>
        </div>
      </InputGroupTemplate>
    </div>
  </div>
</template>
