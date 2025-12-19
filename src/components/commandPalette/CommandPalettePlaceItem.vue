<script setup lang="ts">
import { IconMapMarker, IconVectorSquare } from "@iconify-prerendered/vue-mdi";
import { formatLength } from "@/geo/utils.ts";
import { type PhotonSearchResult } from "@/composables/geosearching.ts";
import type { Feature, Point } from "geojson";
import { type GeoSearchProperties } from "@/types/search.ts";
import { getDistance } from "ol/sphere";
import { useMeasurementsStore } from "@/stores/geoStore.ts";

const measurementsStore = useMeasurementsStore();
const props = defineProps<{
  item: PhotonSearchResult;
  center?: number[] | null;
}>();
function getFromCenter(f: Feature<Point, GeoSearchProperties>) {
  const distance = props.center && getDistance(props.center, f.geometry.coordinates);
  return distance ? formatLength(distance, measurementsStore.measurementUnit) : "";
}
</script>

<template>
  <div>
    <component
      :is="item.properties.extent ? IconVectorSquare : IconMapMarker"
      class="h-5 w-5 text-gray-400"
      aria-hidden="true"
    />
  </div>
  <div class="ml-4 flex-auto">
    <p :class="['text-sm font-medium']">
      {{ item.properties.name }}
    </p>
    <div :class="['flex justify-between text-sm']">
      <div class="space-x-1">
        <span class="text-xs text-gray-400 uppercase">{{
          item.properties.category
        }}</span>
        <span>{{ item.properties.city }}</span>
        <span>{{ item.properties.state }}</span>
        <span>{{ item.properties.country }}</span>
      </div>
      <span class="text-muted-foreground text-xs">{{ getFromCenter(item) }}</span>
    </div>
  </div>
</template>
