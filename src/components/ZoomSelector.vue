<script setup lang="ts">
import { useMapViewStore } from "@/stores/mapViewStore";
import ZoomSlider from "@/components/ZoomSlider.vue";
import { computed, ref } from "vue";
const range = defineModel<[number, number]>({ default: () => [0, 24] });

const mapView = useMapViewStore();
const zoomAsPercentage = computed(() => {
  return `${Math.round((mapView.zoomLevel / 24) * 100)}%`;
});
</script>
<template>
  <div class="relative h-10">
    <ZoomSlider v-model="range" :min="0" :max="24" />
    <div class="absolute select-none" :style="{ left: zoomAsPercentage }">
      <div class="-mx-4 w-8 text-center text-xs text-red-800">▲</div>
      <div
        class="-mx-4 -mt-1 w-8 rounded border bg-muted text-center text-xs text-muted-foreground"
      >
        {{ mapView.zoomLevel.toFixed(1) }}
      </div>
    </div>
  </div>
</template>
