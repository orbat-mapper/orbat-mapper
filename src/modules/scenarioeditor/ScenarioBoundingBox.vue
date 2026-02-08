<script setup lang="ts">
import { activeScenarioKey, activeMapKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useGeoStore } from "@/stores/geoStore";
import { Button } from "@/components/ui/button";
import DescriptionItem from "@/components/DescriptionItem.vue";
import type { BBox } from "geojson";
import { featureCollection, point as turfPoint } from "@turf/helpers";
import turfBbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { drawGeoJsonLayer } from "@/composables/openlayersHelpers";
import Draw, { createBox } from "ol/interaction/Draw";
import { transformExtent, toLonLat } from "ol/proj";
import { useUiStore, useWidthStore } from "@/stores/uiStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { storeToRefs } from "pinia";

const scn = injectStrict(activeScenarioKey);
const { store } = scn;
const geoStore = useGeoStore();
const olMapRef = injectStrict(activeMapKey);

const uiStore = useUiStore();
const widthStore = useWidthStore();
const { orbatPanelWidth, detailsWidth } = storeToRefs(widthStore);
const { showLeftPanel } = storeToRefs(uiStore);
const {
  selectedFeatureIds,
  selectedUnitIds,
  activeScenarioEventId,
  activeMapLayerId,
  showScenarioInfo,
} = useSelectedItems();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const showDetailsPanel = computed(() => {
  return Boolean(
    selectedFeatureIds.value.size ||
    selectedUnitIds.value.size ||
    activeScenarioEventId.value ||
    activeMapLayerId.value ||
    showScenarioInfo.value,
  );
});

const boundingBox = computed(() => store.state.boundingBox);
const isDrawing = ref(false);
let drawInteraction: Draw | null = null;

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

// Create a layer to show the bounding box on the map
const bboxLayer = new VectorLayer({
  source: new VectorSource({}),
  style: {
    "stroke-color": "#3b82f6",
    "stroke-width": 2,
    "stroke-line-dash": [8, 8],
    "fill-color": "rgba(59, 130, 246, 0.1)",
  },
});

function drawBboxOnMap() {
  const bbox = boundingBox.value;
  if (bbox && bbox.length === 4) {
    const polygon = bboxPolygon(bbox as [number, number, number, number]);
    drawGeoJsonLayer(bboxLayer, polygon);
  } else {
    bboxLayer.getSource()?.clear();
  }
}

// Watch for bbox changes and redraw
watch(boundingBox, () => {
  drawBboxOnMap();
});

onMounted(() => {
  olMapRef.value.addLayer(bboxLayer);
  drawBboxOnMap();
});

onUnmounted(() => {
  stopDrawing();
  bboxLayer.getSource()?.clear();
  olMapRef.value.removeLayer(bboxLayer);
});

function updateBoundingBox(bbox: BBox | null) {
  store.update((s) => {
    s.boundingBox = bbox;
  });
}

function startDrawing() {
  isDrawing.value = true;
  drawInteraction = new Draw({
    type: "Circle",
    geometryFunction: createBox(),
  });

  drawInteraction.on("drawend", (e) => {
    const geometry = e.feature.getGeometry();
    if (!geometry) return;
    const extent = geometry.getExtent();
    const bbox = transformExtent(extent, "EPSG:3857", "EPSG:4326");
    updateBoundingBox(bbox as BBox);
    stopDrawing();
  });

  olMapRef.value.addInteraction(drawInteraction);
}

function stopDrawing() {
  if (drawInteraction) {
    olMapRef.value.removeInteraction(drawInteraction);
    drawInteraction = null;
  }
  isDrawing.value = false;
}

function toggleDrawing() {
  if (isDrawing.value) {
    stopDrawing();
  } else {
    startDrawing();
  }
}

function setFromMapView() {
  const map = olMapRef.value;
  if (!map) return;
  const size = map.getSize();
  if (!size) return;

  const leftWidth = !isMobile.value && showLeftPanel.value ? orbatPanelWidth.value : 0;
  const rightWidth = !isMobile.value && showDetailsPanel.value ? detailsWidth.value : 0;

  const [width, height] = size;

  const blPixel = [leftWidth, height];
  const trPixel = [width - rightWidth, 0];

  const blCoord = map.getCoordinateFromPixel(blPixel);
  const trCoord = map.getCoordinateFromPixel(trPixel);

  if (!blCoord || !trCoord) return;

  const blLonLat = toLonLat(blCoord);
  const trLonLat = toLonLat(trCoord);

  const bbox: BBox = [blLonLat[0], blLonLat[1], trLonLat[0], trLonLat[1]];
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
  // If point, give some default size or just keep as point?
  // Usually if width is 0, we can add a small delta.
  // But let's just add factor * width. If width is 0, it stays 0.
  // To ensure visibility of a single point, we might need a minimum size or rely on map zoom limits.
  // Let's assume factor is applied. For single point, we might want fixed margin in degrees?
  // Let's use simple expansion for now. If width is 0, add 0.01 degrees?
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
