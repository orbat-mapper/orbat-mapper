<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useGeoStore } from "@/stores/geoStore";
import { Button } from "@/components/ui/button";
import DescriptionItem from "@/components/DescriptionItem.vue";
import type { BBox } from "geojson";
import { featureCollection, point as turfPoint } from "@turf/helpers";
import turfBbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import { useSelectedItems } from "@/stores/selectedStore";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import { useBoxDraw } from "@/composables/geoBoxDraw";
import {
  BBOX_FILL_LAYER_ID,
  BBOX_LINE_LAYER_ID,
  BBOX_SOURCE_ID,
} from "@/geo/engines/maplibre/bboxLayer";

const scn = injectStrict(activeScenarioKey);
const { store } = scn;
const geoStore = useGeoStore();

const { selectedUnitIds } = useSelectedItems();

const boundingBox = computed(() => store.state.boundingBox);

const {
  isActive: isDrawing,
  start: startDrawing,
  cancel: stopDrawing,
  onDrawEnd,
} = useBoxDraw(() => geoStore.mapAdapter);

onDrawEnd((bbox) => updateBoundingBox(bbox));

const hasBbox = computed(() => {
  const bbox = boundingBox.value;
  return bbox && bbox.length === 4;
});

const formattedBbox = computed(() => {
  const bbox = boundingBox.value;
  if (!bbox || bbox.length !== 4) return "Not set";
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return `SW: ${minLat.toFixed(4)}°, ${minLon.toFixed(4)}° — NE: ${maxLat.toFixed(4)}°, ${maxLon.toFixed(4)}°`;
});

function getNativeMap(): MlMap | undefined {
  return geoStore.mapAdapter?.getNativeMap() as MlMap | undefined;
}

// --- MapLibre bbox layer ---
let mlMapRef: MlMap | null = null;

function setupMLLayers(mlMap: MlMap) {
  mlMapRef = mlMap;
  if (!mlMap.getSource(BBOX_SOURCE_ID)) {
    mlMap.addSource(BBOX_SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }
  if (!mlMap.getLayer(BBOX_FILL_LAYER_ID)) {
    mlMap.addLayer({
      id: BBOX_FILL_LAYER_ID,
      type: "fill",
      source: BBOX_SOURCE_ID,
      paint: {
        "fill-color": "rgba(59, 130, 246, 0.1)",
      },
    });
  }
  if (!mlMap.getLayer(BBOX_LINE_LAYER_ID)) {
    mlMap.addLayer({
      id: BBOX_LINE_LAYER_ID,
      type: "line",
      source: BBOX_SOURCE_ID,
      paint: {
        "line-color": "#3b82f6",
        "line-width": 2,
        "line-dasharray": [4, 4],
      },
    });
  }
}

function drawMLBbox() {
  if (!mlMapRef) return;
  const source = mlMapRef.getSource(BBOX_SOURCE_ID) as GeoJSONSource | undefined;
  if (!source) return;
  const bbox = boundingBox.value;
  if (bbox && bbox.length === 4) {
    const polygon = bboxPolygon(bbox as [number, number, number, number]);
    source.setData(polygon);
  } else {
    source.setData({ type: "FeatureCollection", features: [] });
  }
}

function cleanupMLLayers() {
  if (!mlMapRef) return;
  if (mlMapRef.getLayer(BBOX_LINE_LAYER_ID)) mlMapRef.removeLayer(BBOX_LINE_LAYER_ID);
  if (mlMapRef.getLayer(BBOX_FILL_LAYER_ID)) mlMapRef.removeLayer(BBOX_FILL_LAYER_ID);
  if (mlMapRef.getSource(BBOX_SOURCE_ID)) mlMapRef.removeSource(BBOX_SOURCE_ID);
  mlMapRef = null;
}

// --- Engine-agnostic wiring ---

function drawBboxOnMap() {
  drawMLBbox();
}

watch(boundingBox, () => {
  drawBboxOnMap();
});

onMounted(() => {
  const map = getNativeMap();
  if (!map) return;
  setupMLLayers(map as MlMap);
  drawMLBbox();
});

onUnmounted(() => {
  stopDrawing();
  cleanupMLLayers();
});

function updateBoundingBox(bbox: BBox | [number, number, number, number] | null) {
  store.update((s) => {
    s.boundingBox = bbox;
  });
}

function toggleDrawing() {
  if (isDrawing.value) {
    stopDrawing();
  } else {
    startDrawing();
  }
}

function setFromMapView() {
  const bbox = geoStore.getMapViewBbox();
  if (!bbox) return;
  updateBoundingBox(bbox);
}

function setFromUnits() {
  const units = Object.values(store.state.unitMap);
  const points = units
    .map((u) => u._state?.location)
    .filter((loc): loc is [number, number] => !!loc)
    .map((loc) => turfPoint(loc));

  if (points.length === 0) return;

  const fc = featureCollection(points);
  const bbox = turfBbox(fc);
  const expanded = expandBbox(bbox as BBox, 0.1);
  updateBoundingBox(expanded);
}

function expandBbox(bbox: BBox, factor: number): BBox {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const width = maxLon - minLon;
  const height = maxLat - minLat;
  const dx = width === 0 ? 0.01 : width * factor;
  const dy = height === 0 ? 0.01 : height * factor;

  return [minLon - dx, minLat - dy, maxLon + dx, maxLat + dy];
}

function setFromSelectedUnits() {
  const units = [...selectedUnitIds.value]
    .map((id) => store.state.unitMap[id])
    .filter((u) => !!u);

  if (units.length === 0) return;

  const points = units
    .map((u) => u._state?.location)
    .filter((loc): loc is [number, number] => !!loc)
    .map((loc) => turfPoint(loc));

  if (points.length === 0) return;

  const fc = featureCollection(points);
  const bbox = turfBbox(fc);
  const expanded = expandBbox(bbox as BBox, 0.1);
  updateBoundingBox(expanded);
}

function zoomToBbox() {
  const bbox = boundingBox.value;
  if (bbox && bbox.length === 4) {
    geoStore.zoomToBbox(bbox as [number, number, number, number]);
  }
}

function clearBbox() {
  updateBoundingBox(null);
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-muted-foreground text-sm">
      Define a bounding box to set the initial map view when the scenario is loaded.
    </p>
    <DescriptionItem label="Current bounding box">
      <span :class="{ 'text-gray-400 dark:text-gray-500': !hasBbox }">
        {{ formattedBbox }}
      </span>
    </DescriptionItem>

    <div class="flex flex-wrap gap-2">
      <Button
        :variant="isDrawing ? 'default' : 'outline'"
        size="sm"
        @click="toggleDrawing"
      >
        {{ isDrawing ? "Cancel drawing" : "Draw on map" }}
      </Button>
      <Button variant="outline" size="sm" @click="setFromMapView">
        Set from map view
      </Button>
      <Button variant="outline" size="sm" @click="setFromUnits"> Set from units </Button>
      <Button
        variant="outline"
        size="sm"
        @click="setFromSelectedUnits"
        :disabled="selectedUnitIds.size === 0"
      >
        Set from selected units
      </Button>
      <Button variant="outline" size="sm" @click="zoomToBbox" :disabled="!hasBbox">
        Zoom to bbox
      </Button>
      <Button variant="outline" size="sm" @click="clearBbox" :disabled="!hasBbox">
        Clear
      </Button>
    </div>
  </div>
</template>
