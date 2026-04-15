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
import type { Feature, Position } from "geojson";
import { symbolGenerator } from "@/symbology/milsymbwrapper.ts";
import { featureCollection } from "@turf/helpers";
import { centerOfMass } from "@turf/turf";
import {
  activeScenarioKey,
  activeScenarioMapEngineKey,
  searchActionsKey,
} from "@/components/injects.ts";
import { usePlaybackStore } from "@/stores/playbackStore.ts";
import { useMaplibreMapDrop } from "@/modules/maplibreview/useMaplibreMapDrop.ts";
import { useRafFn } from "@vueuse/core";
import { hashObject, injectStrict } from "@/utils";
import {
  getFeatureIdFromRenderedFeature,
  getLayerIdFromRenderedFeature,
  isManagedScenarioFeatureLayerId,
} from "@/modules/maplibreview/maplibreScenarioFeatures";
import { useSelectedItems } from "@/stores/selectedStore";
import { useSelectionActions } from "@/composables/selectionActions";
import { useUiStore } from "@/stores/uiStore";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useMaplibreRangeRings } from "@/composables/maplibreRangeRings";
import {
  UNIT_HISTORY_LAYER_IDS,
  useMaplibreUnitHistory,
} from "@/composables/maplibreUnitHistory";
import { saveMapLibreMapAsPng } from "@/modules/maplibreview/mapLibreExport";
import { storeToRefs } from "pinia";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useRecordingStore } from "@/stores/recordingStore";

const { mlMap, activeScenario } = defineProps<{
  mlMap: MlMap;
  activeScenario: TScenario;
}>();

provide(activeScenarioKey, activeScenario);

const { unitActions } = activeScenario;
const getUnitById = activeScenario.helpers?.getUnitById ?? (() => undefined);

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
const { onUnitSelectHook, onFeatureSelectHook, onScenarioActionHook } =
  injectStrict(searchActionsKey);
const {
  selectedFeatureIds,
  selectedUnitIds,
  clear: clearSelectedItems,
} = useSelectedItems();
const { toggleUnitSelection, toggleFeatureSelection } = useSelectionActions();
const { hoverEnabled } = storeToRefs(useMapSelectStore());
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());
const doNotFilterLayers = computed(() => uiStore.layersPanelActive);
const recordingStore = useRecordingStore();
let unitDragState: {
  clickedUnitId: string;
  additive: boolean;
  startPointer: Position;
  startPositions: Map<string, Position>;
  moved: boolean;
} | null = null;

const { setupRangeRingLayers, drawRangeRings } = useMaplibreRangeRings(
  mlMap,
  activeScenario,
);

const {
  setupUnitHistoryLayers,
  drawHistory,
  handleMapClick: handleHistoryMapClick,
  dispose: disposeUnitHistory,
} = useMaplibreUnitHistory(mlMap, activeScenario);

const { isDragging, formattedPosition } = useMaplibreMapDrop(
  engineRef.value!.map,
  activeScenario,
  () => {
    addUnits();
    drawRangeRings();
    drawHistory();
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
      paint: {
        "text-color": "#111827",
        "text-halo-color": "rgba(255, 255, 255, 0.9)",
        "text-halo-width": 1.75,
        "text-halo-blur": 0.6,
      },
    });

  setupRangeRingLayers("unitLayer");
  setupUnitHistoryLayers("unitLayer");
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
  drawHistory();
  engineRef.value?.layers.refreshScenarioFeatureLayers({
    doClearCache: false,
    filterVisible: !doNotFilterLayers.value,
  });
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
        UNIT_HISTORY_LAYER_IDS.includes(feature.layer.id) ||
        isManagedScenarioFeatureLayerId(feature.layer.id),
    );
}

function getMovableUnitIds(clickedUnitId: string | undefined): string[] {
  if (!clickedUnitId || unitActions.isUnitLocked(clickedUnitId)) return [];

  const candidateIds = selectedUnitIds.value.has(clickedUnitId)
    ? [...selectedUnitIds.value]
    : [clickedUnitId];

  return candidateIds.filter((unitId) => {
    const unit = getUnitById(unitId);
    return !!unit?._state?.location && !unitActions.isUnitLocked(unitId);
  });
}

function onMapClick(e: MapMouseEvent) {
  if (moveUnitEnabled.value) return;
  if (handleHistoryMapClick(e)) return;
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
  if (unitDragState) {
    previewDraggedUnits([e.lngLat.lng, e.lngLat.lat]);
    mlMap.getCanvas().style.cursor = "grabbing";
    return;
  }
  if (moveUnitEnabled.value && recordingStore.isRecordingLocation) {
    const topHit = queryInteractiveFeatures(e.point)[0];
    const movableUnitIds =
      topHit?.layer.id === "unitLayer" ? getMovableUnitIds(topHit.properties?.id) : [];
    mlMap.getCanvas().style.cursor = movableUnitIds.length ? "move" : "";
    return;
  }
  if (!hoverEnabled.value) {
    mlMap.getCanvas().style.cursor = "crosshair";
    return;
  }
  mlMap.getCanvas().style.cursor = queryInteractiveFeatures(e.point).length
    ? "pointer"
    : "";
}

function onUnitDragStart(e: MapMouseEvent) {
  if (!moveUnitEnabled.value || !recordingStore.isRecordingLocation) return;

  const topHit = queryInteractiveFeatures(e.point)[0];
  if (!topHit || topHit.layer.id !== "unitLayer") return;

  const clickedUnitId = topHit.properties?.id;
  const movableUnitIds = getMovableUnitIds(clickedUnitId);
  if (!movableUnitIds.length) return;
  const startPositions = new Map<string, Position>(
    movableUnitIds.flatMap((unitId) => {
      const location = getUnitById(unitId)?._state?.location;
      return location ? [[unitId, location]] : [];
    }),
  );
  if (!startPositions.size) return;

  unitDragState = {
    clickedUnitId,
    additive: e.originalEvent.shiftKey,
    startPointer: [e.lngLat.lng, e.lngLat.lat],
    startPositions,
    moved: false,
  };
  e.preventDefault();
  e.originalEvent.preventDefault();
  e.originalEvent.stopPropagation();
  mlMap.getCanvas().style.cursor = "grabbing";
}

function previewDraggedUnits(pointer: Position) {
  if (!unitDragState) return;
  const dx = pointer[0] - unitDragState.startPointer[0];
  const dy = pointer[1] - unitDragState.startPointer[1];
  const positionOverrides = new Map<string, Position>();
  unitDragState.startPositions.forEach((position, unitId) => {
    positionOverrides.set(unitId, [position[0] + dx, position[1] + dy]);
  });
  unitDragState.moved = true;
  addUnits(false, positionOverrides);
}

function onUnitDragEnd(e: MapMouseEvent) {
  if (!unitDragState) return;
  const dragState = unitDragState;
  unitDragState = null;
  mlMap.getCanvas().style.cursor = "";

  if (!dragState.moved) {
    addUnits();
    if (dragState.additive) {
      toggleUnitSelection(dragState.clickedUnitId);
    } else {
      onUnitSelectHook.trigger({
        unitId: dragState.clickedUnitId,
        options: { noZoom: true },
      });
    }
    return;
  }

  const dx = e.lngLat.lng - dragState.startPointer[0];
  const dy = e.lngLat.lat - dragState.startPointer[1];
  const commitMove = () => {
    dragState.startPositions.forEach((position, unitId) => {
      activeScenario.geo.addUnitPosition(unitId, [position[0] + dx, position[1] + dy]);
    });
  };
  if (activeScenario.store.groupUpdate) {
    activeScenario.store.groupUpdate(commitMove);
  } else {
    commitMove();
  }
}

mlMap.on("click", onMapClick);
mlMap.on("mousedown", onUnitDragStart);
mlMap.on("mousemove", onMapMouseMove);
mlMap.on("mouseup", onUnitDragEnd);

if (activeScenario.store.state.id === "demo-falklands82") {
  // activeScenario.time.setCurrentTime(+new Date("1982-05-21T12:00:00-04:00"));
}

watch(
  [
    () => activeScenario.store.state.currentTime,
    () => activeScenario.store.state.unitStateCounter,
    () => activeScenario.geo.everyVisibleUnit.value.length,
  ],
  () => {
    addUnits();
    drawRangeRings();
  },
  { immediate: true },
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

onScenarioActionHook.on(async ({ action }) => {
  if (action !== "exportToImage") return;
  await saveMapLibreMapAsPng(mlMap);
});

function addUnits(initial = false, positionOverrides?: ReadonlyMap<string, Position>) {
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
          coordinates: positionOverrides?.get(unit.id) ?? unit._state?.location,
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
    const bbox = activeScenario.store.state.boundingBox;
    if (bbox && bbox.length === 4) {
      mlMap.fitBounds(bbox as [number, number, number, number], {
        padding: 20,
        duration: 0,
        maxZoom: 16,
      });
    } else if (features.features.length > 0) {
      const center = centerOfMass(features);
      mlMap.setCenter(center.geometry.coordinates as [number, number]);
    }
  }
  source.setData(features);
}

onUnmounted(() => {
  if (!mlMap) return;
  disposeUnitHistory();
  mlMap.off("styleimagemissing", styleImageMissing);
  mlMap.off("style.load", onStyleLoad);
  mlMap.off("click", onMapClick);
  mlMap.off("mousedown", onUnitDragStart);
  mlMap.off("mousemove", onMapMouseMove);
  mlMap.off("mouseup", onUnitDragEnd);
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
