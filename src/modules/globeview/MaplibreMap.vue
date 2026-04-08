<script setup lang="ts">
import { onMounted, onUnmounted, useAttrs, useTemplateRef, watch } from "vue";
import {
  GlobeControl,
  Map as MlMap,
  NavigationControl,
  type MapMouseEvent,
} from "maplibre-gl";
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
const emit = defineEmits<{
  ready: [map: MlMap];
}>();
const attrs = useAttrs();

const mapContainerElement = useTemplateRef("mapContainerElement");
let mlMap: MlMap;
let replayingContextMenu = false;

onMounted(async () => {
  mlMap = new MlMap({
    container: mapContainerElement.value as HTMLElement,
    style: props.styleSpec,
    center: [0, 0], // starting position [lng, lat]
    zoom: 3, // starting zoom
  });
  mlMap.addControl(new GlobeControl(), "top-left");
  mlMap.addControl(
    new NavigationControl({
      visualizePitch: true,
      visualizeRoll: true,
      showZoom: true,
      showCompass: true,
    }),
    "top-left",
  );

  mlMap.on("style.load", () => {
    applyGlobeProjection(mlMap);
  });

  mlMap.on("load", async () => {
    emit("ready", mlMap);
  });

  mlMap.on("contextmenu", (event: MapMouseEvent) => {
    if (replayingContextMenu || !mapContainerElement.value) return;

    const originalEvent = event.originalEvent as MouseEvent;
    originalEvent.preventDefault();
    originalEvent.stopPropagation();

    replayingContextMenu = true;
    mapContainerElement.value.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        composed: true,
        button: 2,
        buttons: originalEvent.buttons,
        clientX: originalEvent.clientX,
        clientY: originalEvent.clientY,
        ctrlKey: originalEvent.ctrlKey,
        altKey: originalEvent.altKey,
        shiftKey: originalEvent.shiftKey,
        metaKey: originalEvent.metaKey,
        screenX: originalEvent.screenX,
        screenY: originalEvent.screenY,
      }),
    );
    replayingContextMenu = false;
  });
});

watch(
  () => [props.basemapId, props.styleSpec] as const,
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
