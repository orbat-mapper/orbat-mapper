<script setup lang="ts">
import { type GeoJSONSource, type Map as MlMap } from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import { onMounted, onUnmounted, provide, watch } from "vue";
import type { Feature } from "geojson";
import { symbolGenerator } from "@/symbology/milsymbwrapper.ts";
import { featureCollection } from "@turf/helpers";
import { centerOfMass } from "@turf/turf";
import { activeScenarioKey } from "@/components/injects.ts";
import PlaybackMenu from "@/modules/scenarioeditor/PlaybackMenu.vue";
import { usePlaybackStore } from "@/stores/playbackStore.ts";
import { useRafFn } from "@vueuse/core";
import { hashObject } from "@/utils";

const { mlMap, activeScenario } = defineProps<{
  mlMap: MlMap;
  activeScenario: TScenario;
}>();

provide(activeScenarioKey, activeScenario);

const { unitActions } = activeScenario;

const symbolCache: Map<string, Record<string, any>> = new Map();

const playback = usePlaybackStore();

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
        "icon-image": ["get", "symbolKey"],
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

    const { sidc = "xxxxxxx", symbolOptions = {} } = symbolCache.get(symbolCode) ?? {};

    const options = isSelected
      ? { outlineWidth: 20, outlineColor: "yellow" }
      : { outlineWidth: 7, outlineColor: "white" };
    const symb = symbolGenerator(sidc, {
      size: 25,
      ...options,
      ...symbolOptions,
    });
    const { width, height } = symb.getSize();
    const data = symb
      .asCanvas(2)
      ?.getContext("2d")
      ?.getImageData(0, 0, 2 * width, 2 * height);
    if (data && !mlMap.hasImage(e.id)) {
      mlMap.addImage(e.id, data, { pixelRatio: 2 });
    }
  });
}

setupMapLayers();
if (activeScenario.store.state.id === "demo-falklands82") {
  // activeScenario.time.setCurrentTime(+new Date("1982-05-21T12:00:00-04:00"));
}

addUnits(true);

watch(
  () => activeScenario.store.state.currentTime,
  (time) => {
    addUnits();
  },
);

function addUnits(initial = false) {
  const source = mlMap.getSource("unitSource") as GeoJSONSource;
  if (!source) return;

  const visibleUnits = activeScenario.geo.everyVisibleUnit.value;

  const features = featureCollection(
    visibleUnits.map((unit) => {
      const symbolData = {
        sidc: unit.sidc,
        symbolOptions: unitActions.getCombinedSymbolOptions(unit),
      };
      const symbolKey = hashObject(symbolData);
      if (!symbolCache.has(symbolKey)) {
        symbolCache.set(symbolKey, symbolData);
      }
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: unit._state?.location,
        },
        properties: {
          id: unit.id,
          symbolKey,
          sidc: unit.sidc,
          label: unit.shortName || unit.name || "Unnamed Unit",
        },
      } as Feature;
    }),
  );
  if (initial) {
    const center = centerOfMass(features);
    mlMap.setCenter(center.geometry.coordinates as [number, number]);
  }
  source.setData(features);
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

const { pause, resume, isActive } = useRafFn(
  ({ delta }) => {
    if (
      playback.playbackLooping &&
      playback.endMarker !== undefined &&
      playback.startMarker !== undefined
    ) {
      if (activeScenario.store.state.currentTime >= playback.endMarker) {
        activeScenario.time.setCurrentTime(playback.startMarker);
        return;
      }
    }

    const newTime = activeScenario.store.state.currentTime + playback.playbackSpeed;
    activeScenario.time.setCurrentTime(newTime);
  },
  { immediate: false, fpsLimit: 60 },
);

watch(
  () => playback.playbackRunning,
  (running) => {
    if (running) {
      resume();
    } else {
      pause();
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="fixed top-0 right-0"><PlaybackMenu /></div>
</template>
