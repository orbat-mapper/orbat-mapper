<script setup lang="ts">
import {
  type GeoJSONSource,
  type MapMouseEvent,
  type MapStyleImageMissingEvent,
  type Map as MlMap,
  type PointLike,
} from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import { onUnmounted, provide, watch } from "vue";
import type { Feature } from "geojson";
import { symbolGenerator } from "@/symbology/milsymbwrapper.ts";
import { featureCollection } from "@turf/helpers";
import { centerOfMass } from "@turf/turf";
import {
  activeScenarioKey,
  activeScenarioMapEngineKey,
  searchActionsKey,
} from "@/components/injects.ts";
import { usePlaybackStore } from "@/stores/playbackStore.ts";
import { useGlobeMapDrop } from "@/modules/globeview/useGlobeMapDrop.ts";
import { useRafFn } from "@vueuse/core";
import { hashObject, injectStrict } from "@/utils";
import { useSelectedItems } from "@/stores/selectedStore";

const { mlMap, activeScenario } = defineProps<{
  mlMap: MlMap;
  activeScenario: TScenario;
}>();

provide(activeScenarioKey, activeScenario);

const { unitActions } = activeScenario;

type SymbolCacheEntry = {
  sidc: string;
  symbolOptions: ReturnType<typeof unitActions.getCombinedSymbolOptions>;
};

const symbolCache: Map<string, SymbolCacheEntry> = new Map();
const usedImageIds = new Set<string>();
let shouldCenterOnNextStyleLoad = true;

const playback = usePlaybackStore();
const engineRef = injectStrict(activeScenarioMapEngineKey);
const { onUnitSelectHook } = injectStrict(searchActionsKey);
const { selectedUnitIds } = useSelectedItems();

const { isDragging, formattedPosition } = useGlobeMapDrop(
  engineRef.value!.map,
  activeScenario,
  () => addUnits(),
);
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
}

function styleImageMissing(e: MapStyleImageMissingEvent) {
  if (usedImageIds.has(e.id) || mlMap.hasImage(e.id)) return;

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
  if (data) {
    mlMap.addImage(e.id, data, { pixelRatio: 2 });
    usedImageIds.add(e.id);
  }
}

function onStyleLoad() {
  usedImageIds.clear();
  setupMapLayers();
  addUnits(shouldCenterOnNextStyleLoad);
  shouldCenterOnNextStyleLoad = false;
}

mlMap.on("styleimagemissing", styleImageMissing);
mlMap.on("style.load", onStyleLoad);

function queryUnitFeatures(point: PointLike) {
  if (!mlMap.getLayer("unitLayer")) return [];
  return mlMap.queryRenderedFeatures(point, { layers: ["unitLayer"] });
}

function onMapClick(e: MapMouseEvent) {
  const unitId = queryUnitFeatures(e.point)[0]?.properties?.id;
  if (!unitId) return;
  onUnitSelectHook.trigger({ unitId, options: { noZoom: true } });
}

function onMapMouseMove(e: MapMouseEvent) {
  mlMap.getCanvas().style.cursor = queryUnitFeatures(e.point).length ? "pointer" : "";
}

mlMap.on("click", onMapClick);
mlMap.on("mousemove", onMapMouseMove);

if (activeScenario.store.state.id === "demo-falklands82") {
  // activeScenario.time.setCurrentTime(+new Date("1982-05-21T12:00:00-04:00"));
}

watch(
  () => activeScenario.store.state.currentTime,
  () => {
    addUnits();
  },
);

watch(selectedUnitIds, () => addUnits(), { deep: true });

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
      const isSelected = selectedUnitIds.value.has(unit.id);
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: unit._state?.location,
        },
        properties: {
          id: unit.id,
          symbolKey: isSelected ? `sel-${symbolKey}` : symbolKey,
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

onUnmounted(() => {
  if (!mlMap) return;
  mlMap.off("styleimagemissing", styleImageMissing);
  mlMap.off("style.load", onStyleLoad);
  mlMap.off("click", onMapClick);
  mlMap.off("mousemove", onMapMouseMove);
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
  <div v-if="isDragging" class="pointer-events-none absolute inset-0 z-10">
    <p
      class="text-foreground bg-background absolute bottom-1 left-2 rounded px-1 text-base tracking-tighter tabular-nums"
    >
      {{ formattedPosition }}
    </p>
  </div>
</template>
