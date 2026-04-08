<script setup lang="ts">
import { UnitActions } from "@/types/constants";
import { injectStrict } from "@/utils";
import { activeNativeMapKey } from "@/components/injects";
import { useUnitActions } from "@/composables/scenarioActions";
import { applyTransform } from "ol/extent";
import OlPoint from "ol/geom/Point";
import { fromExtent as polygonFromExtent } from "ol/geom/Polygon";
import VectorLayer from "ol/layer/Vector";
import { getTransform } from "ol/proj";
import VectorSource from "ol/source/Vector";
import OlFeature from "ol/Feature";
import type { PhotonSearchResult } from "@/composables/geosearching";
import { useScenarioMapSearchActions } from "@/modules/scenarioeditor/useScenarioMapSearchActions";

const mapRef = injectStrict(activeNativeMapKey);
const { onUnitAction } = useUnitActions();
function focusPlace(
  item: PhotonSearchResult,
  extent: [number, number, number, number] | undefined,
) {
  const map = mapRef.value;
  if (!map) return;
  const transform = getTransform("EPSG:4326", map.getView().getProjection());
  const polygon = extent && polygonFromExtent(applyTransform(extent, transform));
  const p = new OlPoint(item.geometry.coordinates).transform(
    "EPSG:4326",
    map.getView().getProjection(),
  ) as any;

  // add temporary layer
  const layer = new VectorLayer({
    source: new VectorSource({
      features: [new OlFeature({ geometry: polygon || p })],
    }),
    style: {
      "stroke-color": "#f00",
      "stroke-width": 2,
      "circle-radius": 12,
      "circle-stroke-color": "#f00",
      "circle-stroke-width": 4,
    },
  });
  layer.setMap(map);
  setTimeout(() => layer.setMap(null), 2000);

  map.getView().fit(polygon || p, { maxZoom: 15 });
}

useScenarioMapSearchActions({
  zoomToUnit: (unit) => onUnitAction(unit, UnitActions.Zoom),
  focusPlace,
});
</script>
<template></template>
