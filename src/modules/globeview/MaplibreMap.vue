<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import { GlobeControl, Map as MlMap, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const emit = defineEmits(["ready"]);

const mapContainerElement = useTemplateRef("mapContainerElement");
let mlMap: MlMap;

onMounted(async () => {
  mlMap = new MlMap({
    container: mapContainerElement.value as HTMLElement,
    // style: "https://demotiles.maplibre.org/style.json", // style URL
    style: "https://tiles.openfreemap.org/styles/positron", // style URL
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
    mlMap.setProjection({
      type: "globe", // Set projection to globe
    });
  });

  mlMap.on("load", async () => {
    emit("ready", mlMap);
  });
});

onUnmounted(() => {
  mlMap?.remove();
});
</script>
<template>
  <div ref="mapContainerElement" class="relative h-full w-full" />
</template>
