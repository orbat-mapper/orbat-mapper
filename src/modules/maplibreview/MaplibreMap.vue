<script setup lang="ts">
import { onMounted, onUnmounted, ref, useAttrs, useTemplateRef, watch } from "vue";
import { useThrottleFn } from "@vueuse/core";
import {
  GlobeControl,
  Map as MlMap,
  NavigationControl,
  type MapProjectionEvent,
  ScaleControl,
  type MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { storeToRefs } from "pinia";
import type { MaplibreBasemapStyle } from "@/modules/maplibreview/maplibreBasemaps";
import type { MapProjection } from "@/stores/mapSettingsStore";
import { applyProjection } from "@/modules/maplibreview/maplibreProjection";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useMeasurementsStore } from "@/stores/geoStore";
import { getCoordinateFormatFunction } from "@/utils/geoConvert";
import type { Position } from "geojson";

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
const formattedLocation = ref("");
let mlMap: MlMap;
let replayingContextMenu = false;
let scaleControl: ScaleControl | null = null;
let scaleControlAttached = false;
let lastPointerLocation: Position | null = null;
let mouseLeaveHandler: (() => void) | null = null;
let mapContainerDomElement: HTMLElement | null = null;

const { showLocation, coordinateFormat, showScaleLine } =
  storeToRefs(useMapSettingsStore());
const { measurementUnit } = storeToRefs(useMeasurementsStore());

function applyFormattedLocation(position: Position | null) {
  if (!position) {
    formattedLocation.value = "";
    return;
  }
  formattedLocation.value = getCoordinateFormatFunction(coordinateFormat.value)(position);
}

const throttledApplyFormattedLocation = useThrottleFn(
  () => {
    if (!showLocation.value) return;
    applyFormattedLocation(lastPointerLocation);
  },
  16,
  true,
  true,
) as ReturnType<typeof useThrottleFn> & {
  cancel?: () => void;
};

function syncScaleControl() {
  if (!mlMap || !scaleControl) return;
  if (showScaleLine.value && !scaleControlAttached) {
    mlMap.addControl(scaleControl, "bottom-left");
    scaleControlAttached = true;
    return;
  }
  if (!showScaleLine.value && scaleControlAttached) {
    mlMap.removeControl(scaleControl);
    scaleControlAttached = false;
  }
}

function handleStyleLoad() {
  applyProjection(mlMap, props.projection);
}

function handleMapLoad() {
  emit("ready", mlMap);
}

function handleMouseMove(event: MapMouseEvent) {
  lastPointerLocation = [event.lngLat.lng, event.lngLat.lat];
  if (!showLocation.value) return;
  throttledApplyFormattedLocation();
}

function handleProjectionTransition(event: MapProjectionEvent) {
  const newProjection = event.newProjection as MapProjection;
  if (newProjection === "globe" || newProjection === "mercator") {
    emit("update:projection", newProjection);
  }
}

function handleContextMenu(event: MapMouseEvent) {
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
}

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
  scaleControl = new ScaleControl({
    maxWidth: 100,
    unit: measurementUnit.value,
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
  syncScaleControl();

  mlMap.on("style.load", handleStyleLoad);
  mlMap.on("projectiontransition", handleProjectionTransition);
  mlMap.on("load", handleMapLoad);
  mlMap.on("mousemove", handleMouseMove);
  mlMap.on("contextmenu", handleContextMenu);

  mouseLeaveHandler = () => {
    lastPointerLocation = null;
    formattedLocation.value = "";
  };
  mapContainerDomElement = mapContainerElement.value;
  mapContainerDomElement?.addEventListener("mouseleave", mouseLeaveHandler);
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

watch(coordinateFormat, () => {
  if (!showLocation.value) return;
  applyFormattedLocation(lastPointerLocation);
});

watch(measurementUnit, (unit) => {
  scaleControl?.setUnit(unit);
});

watch(showLocation, (enabled) => {
  if (enabled) {
    applyFormattedLocation(lastPointerLocation);
    return;
  }
  formattedLocation.value = "";
});

watch(showScaleLine, () => {
  syncScaleControl();
});

onUnmounted(() => {
  if (mouseLeaveHandler && mapContainerDomElement) {
    mapContainerDomElement.removeEventListener("mouseleave", mouseLeaveHandler);
  }
  throttledApplyFormattedLocation.cancel?.();
  mlMap?.off("style.load", handleStyleLoad);
  mlMap?.off("projectiontransition", handleProjectionTransition);
  mlMap?.off("load", handleMapLoad);
  mlMap?.off("mousemove", handleMouseMove);
  mlMap?.off("contextmenu", handleContextMenu);
  mlMap?.remove();
});
</script>
<template>
  <div
    ref="mapContainerElement"
    class="map-ui-root relative h-full w-full"
    v-bind="attrs"
  >
    <div
      v-if="showLocation && formattedLocation"
      class="location-control pointer-events-none z-10"
    >
      {{ formattedLocation }}
    </div>
  </div>
</template>

<style>
.maplibregl-ctrl-scale {
  background-color: var(--color-card);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
  font-weight: 500;
  box-shadow: none;
}
</style>
