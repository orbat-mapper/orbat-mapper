<script setup lang="ts">
import type { Map as MlMap } from "maplibre-gl";
import type { Feature } from "geojson";
import { useGeoStore } from "@/stores/geoStore";
import { useScenarioMapSearchActions } from "@/modules/scenarioeditor/useScenarioMapSearchActions";
import type { PhotonSearchResult } from "@/composables/geosearching";

const props = defineProps<{
  mlMap?: MlMap;
}>();

const geoStore = useGeoStore();

const SOURCE_ID = "place-search-highlight-source";
const POINT_LAYER_ID = "place-search-highlight-point";
const POLYGON_LAYER_ID = "place-search-highlight-polygon";
const HIGHLIGHT_DURATION_MS = 2000;

let activeTimeout: ReturnType<typeof setTimeout> | null = null;

function removeHighlight(map: MlMap) {
  try {
    if (map.getLayer(POINT_LAYER_ID)) map.removeLayer(POINT_LAYER_ID);
    if (map.getLayer(POLYGON_LAYER_ID)) map.removeLayer(POLYGON_LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  } catch {
    // map style may already be torn down
  }
}

function focusPlace(
  item: PhotonSearchResult,
  extent: [number, number, number, number] | undefined,
) {
  const map = props.mlMap;
  if (!map) return;

  const features: Feature[] = [];
  if (extent) {
    const [minX, minY, maxX, maxY] = extent;
    features.push({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [minX, minY],
            [maxX, minY],
            [maxX, maxY],
            [minX, maxY],
            [minX, minY],
          ],
        ],
      },
      properties: {},
    });
  }
  features.push({
    type: "Feature",
    geometry: { type: "Point", coordinates: item.geometry.coordinates },
    properties: {},
  });

  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
  removeHighlight(map);

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features },
  });
  if (extent) {
    map.addLayer({
      id: POLYGON_LAYER_ID,
      type: "line",
      source: SOURCE_ID,
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: {
        "line-color": "#f00",
        "line-width": 2,
      },
    });
  }
  map.addLayer({
    id: POINT_LAYER_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["==", ["geometry-type"], "Point"],
    paint: {
      "circle-radius": 12,
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": "#f00",
      "circle-stroke-width": 4,
    },
  });

  activeTimeout = setTimeout(() => {
    activeTimeout = null;
    removeHighlight(map);
  }, HIGHLIGHT_DURATION_MS);
}

useScenarioMapSearchActions({
  zoomToUnit: (unit) => geoStore.zoomToUnit(unit),
  focusPlace,
  showLeftPanelOnLayerSelect: true,
  showLeftPanelOnImageLayerSelect: true,
  showLeftPanelOnAddLayer: true,
});
</script>

<template></template>
