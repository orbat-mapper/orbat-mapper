<script setup lang="ts">
import { type GeoJSONSource, type Map as MlMap, type Subscription } from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import { onMounted, onUnmounted } from "vue";
import type { Feature } from "geojson";
import { symbolGenerator } from "@/symbology/milsymbwrapper.ts";
const { mlMap, activeScenario } = defineProps<{
  mlMap: MlMap;
  activeScenario: TScenario;
}>();

function setupMapLayers() {
  !mlMap.getSource("unitSource") &&
    mlMap.addSource("unitSource", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

  !mlMap.getLayer("unitLayer") &&
    mlMap.addLayer({
      id: "unitLayer",
      type: "symbol",
      source: "unitSource",
      layout: {
        "icon-image": [
          "case",
          ["==", ["get", "sidc"], ""],
          "10011500002201000000",
          ["get", "sidc"],
        ],
        "text-font": ["Noto Sans Italic"],
        "text-offset": [0, 1.5],
        "text-anchor": "top",
        "text-size": 12,
        "icon-allow-overlap": true,
        "text-allow-overlap": false,
        "text-overlap": "never",
        "text-ignore-placement": false,
        "text-optional": true,
        "icon-optional": false,
        "text-field": ["get", "label"],
      },
    });
  mlMap.on("styleimagemissing", function (e) {
    const isSelected = e.id.startsWith("sel-");
    const symbolCode = isSelected ? e.id.slice(4) : e.id;

    const options = isSelected
      ? { outlineWidth: 20, outlineColor: "yellow" }
      : { outlineWidth: 7, outlineColor: "white" };
    const symb = symbolGenerator(symbolCode, {
      size: 20,
      ...options,
    });
    const { width, height } = symb.getSize();
    const data = symb
      .asCanvas(2)
      ?.getContext("2d")
      ?.getImageData(0, 0, 2 * width, 2 * height);
    if (data) {
      mlMap.addImage(e.id, data, { pixelRatio: 2 });
    }
  });
}

setupMapLayers();
console.log("Initializing map for scenario ", activeScenario.store.state.id);
if (activeScenario.store.state.id === "demo-falklands82")
  activeScenario.time.setCurrentTime(+new Date("1982-05-21T12:00:00-04:00"));
addUnits();

function addUnits() {
  const source = mlMap.getSource("unitSource") as GeoJSONSource;
  if (!source) return;

  const visibleUnits = activeScenario.geo.everyVisibleUnit.value;
  const features = visibleUnits.map((unit) => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: unit._state?.location,
      },
      properties: {
        id: unit.id,
        sidc: unit.sidc,
        label: unit.shortName || unit.name || "Unnamed Unit",
      },
    };
  }) as Feature[];

  source.setData({
    type: "FeatureCollection",
    features: features,
  });
}

onMounted(() => {
  console.log("Loaded with ", activeScenario.store.state.info.name);
});

onUnmounted(() => {
  // if (!mlMap) return;
  // const layer = mlMap?.getLayer("unitLayer");
  // if (layer) {
  //   mlMap.removeLayer("unitLayer");
  // }
  // const source = mlMap?.getSource("unitSource") as GeoJSONSource;
  // if (source) {
  //   mlMap.removeSource("unitSource");
  // }
});
</script>
<template></template>
