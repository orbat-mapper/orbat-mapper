<script setup lang="ts">
import { onMounted, onUnmounted, useAttrs, useTemplateRef, watch } from "vue";
import {
  GlobeControl,
  Map as MlMap,
  NavigationControl,
  type MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MaplibreBasemapStyle } from "@/modules/maplibreview/maplibreBasemaps";
import type { MapProjection } from "@/stores/mapSettingsStore";
import { applyProjection } from "@/modules/maplibreview/maplibreProjection";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  basemapId: string;
  styleSpec: MaplibreBasemapStyle;
  projection: MapProjection;
}>();
const emit = defineEmits<{
  ready: [map: MlMap];
  "update:projection": [projection: MapProjection];
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
    canvasContextAttributes: {
      preserveDrawingBuffer: true,
    },
  });
  mlMap.boxZoom.disable();
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
    applyProjection(mlMap, props.projection);
  });

  mlMap.on("projectiontransition", (e) => {
    const newProjection = e.newProjection as MapProjection;
    if (newProjection === "globe" || newProjection === "mercator") {
      emit("update:projection", newProjection);
    }
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
    mlMap.setStyle(props.styleSpec, { diff: false });
  },
);

watch(
  () => props.projection,
  (projection) => {
    if (!mlMap) return;
    applyProjection(mlMap, projection);
  },
);

onUnmounted(() => {
  mlMap?.remove();
});
</script>
<template>
  <div ref="mapContainerElement" class="relative h-full w-full" v-bind="attrs" />
</template>
