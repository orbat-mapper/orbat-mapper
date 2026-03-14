<script setup lang="ts">
import { onMounted, onUnmounted, useAttrs, useTemplateRef, watch } from "vue";
import { GlobeControl, Map as MlMap, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { GlobeBasemapStyle } from "@/modules/globeview/globeBasemaps";
import { applyGlobeProjection } from "@/modules/globeview/maplibreGlobe";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  basemapId: string;
  styleSpec: GlobeBasemapStyle;
}>();
const emit = defineEmits(["ready"]);
const attrs = useAttrs();

const mapContainerElement = useTemplateRef("mapContainerElement");
let mlMap: MlMap;

onMounted(async () => {
  mlMap = new MlMap({
    container: mapContainerElement.value as HTMLElement,
    style: props.styleSpec,
    center: [0, 0], // starting position [lng, lat]
    zoom: 3, // starting zoom
  });
  mlMap.addControl(new GlobeControl());
  mlMap.addControl(
    new NavigationControl({
      visualizePitch: true,
      visualizeRoll: true,
      showZoom: true,
      showCompass: true,
    }),
  );

  mlMap.on("style.load", () => {
    applyGlobeProjection(mlMap);
  });

  mlMap.on("load", async () => {
    emit("ready", mlMap);
  });
});

watch(
  () => props.basemapId,
  () => {
    if (!mlMap) return;
    mlMap.setStyle(props.styleSpec);
  },
);

onUnmounted(() => {
  mlMap?.remove();
});
</script>
<template>
  <div ref="mapContainerElement" class="relative h-full w-full" v-bind="attrs" />
</template>
