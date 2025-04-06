<script setup lang="ts">
import CoordinateInput, {
  type CoordinateInputFormat,
} from "@/components/CoordinateInput.vue";
import { ref } from "vue";
import type { Position } from "geojson";
import { formatPosition } from "@/geo/utils";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";

const position = ref<Position>([13.369, 37.598]);
const format = ref<CoordinateInputFormat>("LonLat");
</script>
<template>
  <div class="mt-4 space-y-4">
    <div class="flex gap-8">
      <CoordinateInput v-model="position" :format="format" class="max-w-sm" />
      <InputGroupTemplate label="Label">
        <CoordinateInput
          v-model="position"
          :format="format"
          @update:format="console.log('update format to', $event)"
        />
      </InputGroupTemplate>
    </div>
    <div class="grid grid-cols-4">
      <div>{{ position }}</div>
      <div>{{ formatPosition(position, { format: "DecimalDegrees" }) }}</div>
      <div>{{ formatPosition(position, { format: "DegreeMinuteSeconds" }) }}</div>
      <div>{{ formatPosition(position, { format: "MGRS" }) }}</div>
    </div>
  </div>
</template>
