<script setup lang="ts">
import CoordinateInput, { CoordinateInputFormat } from "@/components/CoordinateInput.vue";
import { ref } from "vue";
import type { Position } from "geojson";
import { formatPosition } from "@/geo/utils";

const position = ref<Position>([13.369, 37.598]);
const format = ref<CoordinateInputFormat>("LonLat");
</script>
<template>
  <div class="mt-4 space-y-4">
    <CoordinateInput v-model="position" :format="format" class="max-w-sm" />
    <div class="grid grid-cols-4">
      <div>{{ position }}</div>
      <div>{{ formatPosition(position, { format: "DecimalDegrees" }) }}</div>
      <div>{{ formatPosition(position, { format: "DegreeMinuteSeconds" }) }}</div>
      <div>{{ formatPosition(position, { format: "MGRS" }) }}</div>
    </div>
  </div>
</template>
