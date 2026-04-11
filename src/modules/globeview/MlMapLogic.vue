<script setup lang="ts">
import {
  type GeoJSONSource,
  type MapMouseEvent,
  type MapStyleImageMissingEvent,
  type Map as MlMap,
  type PointLike,
} from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import { computed, onUnmounted, provide, watch } from "vue";
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
import {
  getFeatureIdFromRenderedFeature,
  getLayerIdFromRenderedFeature,
  isManagedScenarioFeatureLayerId,
} from "@/modules/globeview/maplibreScenarioFeatures";
import { useSelectedItems } from "@/stores/selectedStore";
import { useSelectionActions } from "@/composables/selectionActions";
import { useUiStore } from "@/stores/uiStore";
import { useGlobeRangeRings } from "@/composables/globeRangeRings";

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
const uiStore = useUiStore();
const engineRef = injectStrict(activeScenarioMapEngineKey);
const { onUnitSelectHook, onFeatureSelectHook } = injectStrict(searchActionsKey);
const {
  selectedFeatureIds,
  selectedUnitIds,
  clear: clearSelectedItems,
} = useSelectedItems();
const { toggleUnitSelection, toggleFeatureSelection } = useSelectionActions();
const doNotFilterLayers = computed(() => uiStore.layersPanelActive);

const { setupRangeRingLayers, drawRangeRings } = useGlobeRangeRings(
  mlMap,
  activeScenario,
);

const { isDragging, formattedPosition } = useGlobeMapDrop(
  engineRef.value!.map,
  activeScenario,
  () => {
    addUnits();
    drawRangeRings();
  },
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

  setupRangeRingLayers("unitLayer");
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
  const anchor = symb.getAnchor();
  const sourceCanvas = symb.asCanvas(2);
  if (!sourceCanvas) return;

  // milsymbol canvases are not centered on the symbol anchor — pad the image
  // so the anchor sits at the canvas center, which is what MapLibre uses as
  // the icon's origin.
  const pixelRatio = 2;
  const halfW = Math.max(anchor.x, width - anchor.x);
  const halfH = Math.max(anchor.y, height - anchor.y);
  const paddedWidth = Math.ceil(2 * halfW * pixelRatio);
  const paddedHeight = Math.ceil(2 * halfH * pixelRatio);
  const drawX = Math.round((halfW - anchor.x) * pixelRatio);
  const drawY = Math.round((halfH - anchor.y) * pixelRatio);

  const canvas = document.createElement("canvas");
  canvas.width = paddedWidth;
  canvas.height = paddedHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(sourceCanvas, drawX, drawY);
  const data = ctx.getImageData(0, 0, paddedWidth, paddedHeight);
  if (data) {
    mlMap.addImage(e.id, data, { pixelRatio });
    usedImageIds.add(e.id);
  }
}

function onStyleLoad() {
  usedImageIds.clear();
  setupMapLayers();
  addUnits(shouldCenterOnNextStyleLoad);
  drawRangeRings();
  shouldCenterOnNextStyleLoad = false;
}

mlMap.on("styleimagemissing", styleImageMissing);
mlMap.on("style.load", onStyleLoad);
onStyleLoad();

function queryInteractiveFeatures(point: PointLike) {
  return mlMap
    .queryRenderedFeatures(point)
    .filter(
      (feature) =>
        feature.layer.id === "unitLayer" ||
        isManagedScenarioFeatureLayerId(feature.layer.id),
    );
}

function onMapClick(e: MapMouseEvent) {
  const topHit = queryInteractiveFeatures(e.point)[0];
  const additive = e.originalEvent.shiftKey;
  if (!topHit) {
    if (!additive) clearSelectedItems();
    return;
  }
  if (topHit.layer.id === "unitLayer") {
    const unitId = topHit.properties?.id;
    if (!unitId) return;
    if (additive) {
      toggleUnitSelection(unitId);
      return;
    }
    onUnitSelectHook.trigger({ unitId, options: { noZoom: true } });
    return;
  }
  const featureId = getFeatureIdFromRenderedFeature(topHit);
  const layerId = getLayerIdFromRenderedFeature(topHit);
  if (!(featureId && layerId)) return;
  if (additive) {
    toggleFeatureSelection(featureId);
    return;
  }
  onFeatureSelectHook.trigger({ featureId, layerId, options: { noZoom: true } });
}

function onMapMouseMove(e: MapMouseEvent) {
  mlMap.getCanvas().style.cursor = queryInteractiveFeatures(e.point).length
    ? "pointer"
    : "";
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
    drawRangeRings();
  },
);

watch(
  () => activeScenario.store.state.rangeRingStateCounter,
  () => drawRangeRings(),
);

watch(selectedUnitIds, () => addUnits(), { deep: true });

watch(
  [() => activeScenario.store.state.featureStateCounter, doNotFilterLayers],
  () => {
    engineRef.value?.layers.refreshScenarioFeatureLayers({
      doClearCache: false,
      filterVisible: !doNotFilterLayers.value,
    });
  },
  { immediate: true },
);

watch(
  () => [...selectedFeatureIds.value],
  () => {
    engineRef.value?.layers.refreshScenarioFeatureLayers({
      doClearCache: false,
      filterVisible: !doNotFilterLayers.value,
    });
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
  if (initial && features.features.length > 0) {
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

const { pause, resume } = useRafFn(
  () => {
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
