<script setup lang="ts">
import {
  type AddLayerObject,
  type GeoJSONSource,
  type MapMouseEvent,
  type MapStyleImageMissingEvent,
  type MapTouchEvent,
  type Map as MlMap,
  type PointLike,
} from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import type { TextAmplifiers } from "@/types/scenarioModels";
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
import { useMaplibreRotateInteraction } from "@/modules/maplibreview/useMaplibreRotateInteraction";
import { useMaplibreBoxSelect } from "@/composables/useMaplibreBoxSelect";
import {
  useMapSettingsStore,
  type MapLibreUnitRotationMode,
} from "@/stores/mapSettingsStore";
import { useRoutingStore } from "@/stores/routingStore";

const UNIT_LAYER_ID = "unitLayer";
const UNIT_LAYER_PREFIX = `${UNIT_LAYER_ID}-`;
const ALWAYS_VISIBLE_UNIT_GROUP_ID = "always";

type UnitVisibilityGroup = {
  id: string;
  minzoom?: number;
  maxzoom?: number;
};

import type { ScenarioMapViewSnapshot } from "@/modules/scenarioeditor/scenarioMapViewSnapshot";

const { mlMap, activeScenario, initialMapView } = defineProps<{
  mlMap: MlMap;
  activeScenario: TScenario;
  initialMapView?: ScenarioMapViewSnapshot;
}>();

provide(activeScenarioKey, activeScenario);

const { unitActions } = activeScenario;
const getUnitById = activeScenario.helpers?.getUnitById ?? (() => undefined);

type SymbolCacheEntry = {
  sidc: string;
  symbolOptions: ReturnType<typeof unitActions.getCombinedSymbolOptions>;
  textAmplifiers: Omit<TextAmplifiers, "uniqueDesignation">;
  uniqueDesignation: string;
};

const symbolCache: Map<string, SymbolCacheEntry> = new Map();
const usedImageIds = new Set<string>();
const unitLayerIds = new Set<string>([UNIT_LAYER_ID]);
let shouldCenterOnNextStyleLoad = !initialMapView;

const playback = usePlaybackStore();
const uiStore = useUiStore();
const mapSettings = useMapSettingsStore();
const engineRef = injectStrict(activeScenarioMapEngineKey);
const { onUnitSelectHook, onFeatureSelectHook, onScenarioActionHook } =
  injectStrict(searchActionsKey);
const {
  selectedFeatureIds,
  selectedUnitIds,
  clear: clearSelectedItems,
} = useSelectedItems();
const { toggleUnitSelection, toggleFeatureSelection } = useSelectionActions();
const { unitSelectEnabled, featureSelectEnabled, hoverEnabled } =
  storeToRefs(useMapSelectStore());
const { moveUnitEnabled, rotateUnitEnabled } = storeToRefs(useUnitSettingsStore());
const routingStore = useRoutingStore();
const { mapLibreUnitRotationMode } = storeToRefs(mapSettings);
const rotateInteraction = useMaplibreRotateInteraction(mlMap, activeScenario, {
  onPreview: (overrides) => addUnits(false, undefined, overrides),
  onPreviewEnd: () => addUnits(),
});
const boxSelect = useMaplibreBoxSelect(mlMap, {
  getUnitLayerIds: () => [...unitLayerIds],
  onBoxStart: () => clearSelectedItems(),
  onBoxEnd: (ids) => ids.forEach((id) => selectedUnitIds.value.add(id)),
  isEnabled: () => !moveUnitEnabled.value && !rotateUnitEnabled.value,
  suspend: suspendMapDragInteractions,
  restore: restoreMapDragInteractions,
});
const doNotFilterLayers = computed(() => uiStore.layersPanelActive);
const recordingStore = useRecordingStore();
let unitDragState: {
  clickedUnitId: string;
  additive: boolean;
  startPointer: Position;
  startPositions: Map<string, Position>;
  interactions: {
    dragPanEnabled: boolean;
    touchZoomRotateEnabled: boolean;
  };
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

function getUnitRotationAlignment(mode: MapLibreUnitRotationMode): {
  icon: "map" | "viewport";
  text: "map" | "viewport";
} {
  switch (mode) {
    case "map":
      return { icon: "map", text: "map" };
    case "mixed":
      return { icon: "map", text: "viewport" };
    case "screen":
    default:
      return { icon: "viewport", text: "viewport" };
  }
}

function isUnitLayerId(layerId: string | undefined | null) {
  return layerId === UNIT_LAYER_ID || layerId?.startsWith(UNIT_LAYER_PREFIX);
}

function getUnitVisibilityGroup(
  unit: (typeof activeScenario.geo.everyVisibleUnit.value)[number],
) {
  const style = unit.style ?? {};
  if (!style.limitVisibility) {
    return { id: ALWAYS_VISIBLE_UNIT_GROUP_ID } satisfies UnitVisibilityGroup;
  }

  return {
    id: hashObject({
      type: "unit-visibility",
      minZoom: style.minZoom ?? 0,
      maxZoom: style.maxZoom ?? 24,
    }),
    minzoom: style.minZoom ?? 0,
    maxzoom: style.maxZoom ?? 24,
  } satisfies UnitVisibilityGroup;
}

function getUnitLayerId(groupId: string) {
  return groupId === ALWAYS_VISIBLE_UNIT_GROUP_ID
    ? UNIT_LAYER_ID
    : `${UNIT_LAYER_PREFIX}${groupId}`;
}

function createUnitLayerSpec(
  layerId: string,
  group: UnitVisibilityGroup,
  alignment: ReturnType<typeof getUnitRotationAlignment>,
): AddLayerObject {
  return {
    id: layerId,
    type: "symbol" as const,
    source: "unitSource",
    filter: ["==", ["get", "visibilityGroup"], group.id] as any,
    layout: {
      "icon-image": ["get", "symbolKey"],
      "icon-rotate": ["get", "symbolRotation"],
      "icon-rotation-alignment": alignment.icon,
      "text-rotate": ["get", "symbolRotation"],
      "text-rotation-alignment": alignment.text,
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
    ...(typeof group.minzoom === "number" ? { minzoom: group.minzoom } : {}),
    ...(typeof group.maxzoom === "number" ? { maxzoom: group.maxzoom } : {}),
  };
}

function syncUnitLayers(groups: Iterable<UnitVisibilityGroup>) {
  const alignment = getUnitRotationAlignment(mapLibreUnitRotationMode.value);
  const desiredGroups = new Map<string, UnitVisibilityGroup>([
    [ALWAYS_VISIBLE_UNIT_GROUP_ID, { id: ALWAYS_VISIBLE_UNIT_GROUP_ID }],
  ]);
  for (const group of groups) {
    desiredGroups.set(group.id, group);
  }

  const desiredLayerIds = new Set<string>();
  for (const group of desiredGroups.values()) {
    const layerId = getUnitLayerId(group.id);
    desiredLayerIds.add(layerId);
    if (!mlMap.getLayer(layerId)) {
      mlMap.addLayer(createUnitLayerSpec(layerId, group, alignment));
    }
    unitLayerIds.add(layerId);
  }

  for (const layerId of [...unitLayerIds]) {
    if (desiredLayerIds.has(layerId)) continue;
    if (mlMap.getLayer(layerId)) {
      mlMap.removeLayer(layerId);
    }
    unitLayerIds.delete(layerId);
  }
}

function applyUnitLayerRotationAlignment() {
  const alignment = getUnitRotationAlignment(mapLibreUnitRotationMode.value);
  for (const layerId of unitLayerIds) {
    if (!mlMap.getLayer(layerId)) continue;
    mlMap.setLayoutProperty(layerId, "icon-rotation-alignment", alignment.icon);
    mlMap.setLayoutProperty(layerId, "text-rotation-alignment", alignment.text);
  }
}

function setupMapLayers() {
  !mlMap.getSource("unitSource") &&
    mlMap.addSource("unitSource", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

  syncUnitLayers([]);

  setupRangeRingLayers(UNIT_LAYER_ID);
  setupUnitHistoryLayers(UNIT_LAYER_ID);
}

function styleImageMissing(e: MapStyleImageMissingEvent) {
  if (usedImageIds.has(e.id) || mlMap.hasImage(e.id)) return;

  const isSelected = e.id.startsWith("sel-");
  const symbolCode = isSelected ? e.id.slice(4) : e.id;

  const {
    sidc = "xxxxxxx",
    symbolOptions = {},
    textAmplifiers = {},
    uniqueDesignation = "",
  } = symbolCache.get(symbolCode) ?? {};

  const options = isSelected
    ? { outlineWidth: 20, outlineColor: "yellow" }
    : { outlineWidth: 7, outlineColor: "white" };
  const symb = symbolGenerator(sidc, {
    size: 25,
    uniqueDesignation,
    ...options,
    ...textAmplifiers,
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
        isUnitLayerId(feature.layer.id) ||
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

function suspendMapDragInteractions() {
  const dragPanEnabled = mlMap.dragPan.isEnabled();
  const touchZoomRotateEnabled = mlMap.touchZoomRotate.isEnabled();

  if (dragPanEnabled) mlMap.dragPan.disable();
  if (touchZoomRotateEnabled) mlMap.touchZoomRotate.disable();

  return {
    dragPanEnabled,
    touchZoomRotateEnabled,
  };
}

function restoreMapDragInteractions(interactions: {
  dragPanEnabled: boolean;
  touchZoomRotateEnabled: boolean;
}) {
  if (interactions.dragPanEnabled && !mlMap.dragPan.isEnabled()) {
    mlMap.dragPan.enable();
  }
  if (interactions.touchZoomRotateEnabled && !mlMap.touchZoomRotate.isEnabled()) {
    mlMap.touchZoomRotate.enable();
  }
}

function onMapClick(e: MapMouseEvent) {
  if (routingStore.active) return;
  if (moveUnitEnabled.value) return;
  if (handleHistoryMapClick(e)) return;
  if (!unitSelectEnabled.value && !featureSelectEnabled.value) return;
  const topHit = queryInteractiveFeatures(e.point)[0];
  const additive = e.originalEvent.shiftKey;
  if (!topHit) {
    if (!additive) clearSelectedItems();
    return;
  }
  if (isUnitLayerId(topHit.layer.id)) {
    if (!unitSelectEnabled.value) return;
    const unitId = topHit.properties?.id;
    if (!unitId) return;
    if (additive) {
      toggleUnitSelection(unitId);
      return;
    }
    onUnitSelectHook.trigger({ unitId, options: { noZoom: true } });
    return;
  }
  if (!featureSelectEnabled.value) return;
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
  if (rotateInteraction.isRotating.value) return;
  if (unitDragState) {
    previewDraggedUnits([e.lngLat.lng, e.lngLat.lat]);
    mlMap.getCanvas().style.cursor = "grabbing";
    return;
  }
  if (rotateUnitEnabled.value) {
    if (!unitSelectEnabled.value) return;
    const topHit = queryInteractiveFeatures(e.point)[0];
    const rotatableUnitIds = isUnitLayerId(topHit?.layer.id)
      ? rotateInteraction.getRotatableUnitIds(topHit.properties?.id)
      : [];
    mlMap.getCanvas().style.cursor = rotatableUnitIds.length ? "grab" : "";
    return;
  }
  if (moveUnitEnabled.value && recordingStore.isRecordingLocation) {
    if (!unitSelectEnabled.value) return;
    const topHit = queryInteractiveFeatures(e.point)[0];
    const movableUnitIds = isUnitLayerId(topHit?.layer.id)
      ? getMovableUnitIds(topHit.properties?.id)
      : [];
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

function onMapTouchMove(e: MapTouchEvent) {
  if (rotateInteraction.isRotating.value) return;
  if (!unitDragState) return;
  previewDraggedUnits([e.lngLat.lng, e.lngLat.lat]);
}

function onUnitDragStart(e: MapMouseEvent | MapTouchEvent) {
  if (!moveUnitEnabled.value || !recordingStore.isRecordingLocation) return;
  if (!unitSelectEnabled.value) return;

  const topHit = queryInteractiveFeatures(e.point)[0];
  if (!topHit || !isUnitLayerId(topHit.layer.id)) return;

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
    additive: Boolean(e.originalEvent.shiftKey),
    startPointer: [e.lngLat.lng, e.lngLat.lat],
    startPositions,
    interactions: suspendMapDragInteractions(),
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

function onUnitDragEnd(e: MapMouseEvent | MapTouchEvent) {
  if (!unitDragState) return;
  const dragState = unitDragState;
  unitDragState = null;
  restoreMapDragInteractions(dragState.interactions);
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
mlMap.on("touchstart", onUnitDragStart);
mlMap.on("mousemove", onMapMouseMove);
mlMap.on("touchmove", onMapTouchMove);
mlMap.on("mouseup", onUnitDragEnd);
mlMap.on("touchend", onUnitDragEnd);
mlMap.on("touchcancel", onUnitDragEnd);

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
  () => mapSettings.mapUnitLabelBelow,
  () => addUnits(),
);

watch(mapLibreUnitRotationMode, () => {
  applyUnitLayerRotationAlignment();
});

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

function addUnits(
  initial = false,
  positionOverrides?: ReadonlyMap<string, Position>,
  rotationOverrides?: ReadonlyMap<string, number>,
) {
  const source = mlMap.getSource("unitSource") as GeoJSONSource;
  if (!source) return;

  const visibleUnits = activeScenario.geo.everyVisibleUnit.value;
  const visibilityGroups = new Map<string, UnitVisibilityGroup>();
  const activeImageIds = new Set<string>();

  const features = featureCollection(
    visibleUnits.map((unit) => {
      const visibilityGroup = getUnitVisibilityGroup(unit);
      visibilityGroups.set(visibilityGroup.id, visibilityGroup);
      const rawTextAmplifiers = unit.textAmplifiers || {};
      const hasOverriddenUniqueDesignation = Object.prototype.hasOwnProperty.call(
        rawTextAmplifiers,
        "uniqueDesignation",
      );
      const { uniqueDesignation, ...textAmplifiers } = rawTextAmplifiers;
      const resolvedUniqueDesignation =
        uniqueDesignation ?? unit.shortName ?? unit.name ?? "";
      const symbolUniqueDesignation =
        mapSettings.mapUnitLabelBelow && !hasOverriddenUniqueDesignation
          ? ""
          : resolvedUniqueDesignation;
      const symbolData: SymbolCacheEntry = {
        sidc: unit.sidc,
        symbolOptions: unitActions.getCombinedSymbolOptions(unit),
        textAmplifiers,
        uniqueDesignation: symbolUniqueDesignation,
      };
      const symbolKey = hashObject(symbolData);
      if (!symbolCache.has(symbolKey)) {
        symbolCache.set(symbolKey, symbolData);
      }
      const isSelected = selectedUnitIds.value.has(unit.id);
      const imageId = isSelected ? `sel-${symbolKey}` : symbolKey;
      activeImageIds.add(imageId);
      const rotationOverride = rotationOverrides?.get(unit.id);
      const symbolRotation =
        rotationOverride !== undefined
          ? rotationOverride
          : (unit._state?.symbolRotation ?? 0);
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: positionOverrides?.get(unit.id) ?? unit._state?.location,
        },
        properties: {
          id: unit.id,
          visibilityGroup: visibilityGroup.id,
          symbolKey: imageId,
          sidc: unit.sidc,
          label: mapSettings.mapUnitLabelBelow
            ? unit.shortName || unit.name || "Unnamed Unit"
            : "",
          symbolRotation,
        },
      } as Feature;
    }),
  );
  syncUnitLayers(visibilityGroups.values());
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
  pruneSymbolImages(activeImageIds);
}

// Skip the scan when stale entries can't have grown past this many — keeps
// playback/keystroke-driven `addUnits` calls cheap; one big sweep amortizes.
const PRUNE_THRESHOLD = 32;

function pruneSymbolImages(activeImageIds: ReadonlySet<string>) {
  if (usedImageIds.size <= activeImageIds.size + PRUNE_THRESHOLD) return;
  for (const imageId of usedImageIds) {
    if (activeImageIds.has(imageId)) continue;
    if (mlMap.hasImage(imageId)) mlMap.removeImage(imageId);
    usedImageIds.delete(imageId);
  }
  const activeSymbolKeys = new Set<string>();
  for (const imageId of activeImageIds) {
    activeSymbolKeys.add(imageId.startsWith("sel-") ? imageId.slice(4) : imageId);
  }
  for (const key of symbolCache.keys()) {
    if (!activeSymbolKeys.has(key)) symbolCache.delete(key);
  }
}

onUnmounted(() => {
  if (!mlMap) return;
  boxSelect.cleanup();
  disposeUnitHistory();
  mlMap.off("styleimagemissing", styleImageMissing);
  mlMap.off("style.load", onStyleLoad);
  mlMap.off("click", onMapClick);
  mlMap.off("mousedown", onUnitDragStart);
  mlMap.off("touchstart", onUnitDragStart);
  mlMap.off("mousemove", onMapMouseMove);
  mlMap.off("touchmove", onMapTouchMove);
  mlMap.off("mouseup", onUnitDragEnd);
  mlMap.off("touchend", onUnitDragEnd);
  mlMap.off("touchcancel", onUnitDragEnd);
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
