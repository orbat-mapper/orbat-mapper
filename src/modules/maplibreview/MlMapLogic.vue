<script setup lang="ts">
import {
  type AddLayerObject,
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapMouseEvent,
  type MapStyleImageMissingEvent,
  type MapTouchEvent,
  type Map as MlMap,
  type PointLike,
} from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import type { CustomSymbol, TextAmplifiers } from "@/types/scenarioModels";
import { computed, onUnmounted, provide, watch, watchEffect } from "vue";
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
import {
  isMapLibreKmlRenderedLayerId,
  toReferenceFeatureSelection,
} from "@/geo/kml/maplibre";
import {
  isUnitLayerId,
  UNIT_LAYER_ID,
  UNIT_LAYER_PREFIX,
} from "@/geo/engines/maplibre/unitLayer";
import { useSelectedItems } from "@/stores/selectedStore";
import { useSelectionActions } from "@/composables/selectionActions";
import { useUiStore } from "@/stores/uiStore";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useMaplibreRangeRings } from "@/composables/maplibreRangeRings";
import {
  UNIT_HISTORY_LAYER_IDS,
  useMaplibreUnitHistory,
} from "@/composables/maplibreUnitHistory";
import { saveMapLibreMapAsPng } from "@/modules/maplibreview/imageExport/mapLibreExport";
import {
  registerSymbolImageSource,
  unregisterSymbolImageSource,
} from "@/modules/maplibreview/symbolImageRegistry";
import { getSpritePixelRatio } from "@/modules/maplibreview/spriteConfig";
import { TAB_TOOLS } from "@/types/constants";
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
import { useMaplibreDayNightTerminator } from "@/composables/maplibreDayNightTerminator";
import { provideMapHoverContext, type HoverFeatureLike } from "@/composables/geoHover";
import MapHoverFeatureTooltip from "@/components/MapHoverFeatureTooltip.vue";
import { CUSTOM_SYMBOL_PREFIX, CUSTOM_SYMBOL_SLICE } from "@/config/constants";
import { SID_INDEX } from "@/symbology/sidc";

const ALWAYS_VISIBLE_UNIT_GROUP_ID = "always";
const NATIVE_CAPTURE_OPTIONS = { capture: true };
const NATIVE_CAPTURE_ONCE_OPTIONS = { capture: true, once: true };

// Hit-test tolerance (in pixels) used to buffer the click/hover point so thin
// features such as lines are easier to select. Touch devices get a wider box
// since fingertips are far less precise than a mouse cursor. The selection
// values mirror the OpenLayers engine (which uses hitTolerance: 20 for picking,
// ~3 for hover) so both map engines feel the same.
const MOUSE_HIT_TOLERANCE_PX = 20;
const TOUCH_HIT_TOLERANCE_PX = 26;
const HOVER_HIT_TOLERANCE_PX = 6;

const coarsePointerQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer: coarse)")
    : null;

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

type MilSymbolCacheEntry = {
  kind: "milsymbol";
  sidc: string;
  symbolOptions: ReturnType<typeof unitActions.getCombinedSymbolOptions>;
  textAmplifiers: Omit<TextAmplifiers, "uniqueDesignation">;
  uniqueDesignation: string;
};

type CustomSymbolCacheEntry = {
  kind: "custom";
  customSymbol: CustomSymbol;
  size: number;
  color?: string;
};

type SymbolCacheEntry = MilSymbolCacheEntry | CustomSymbolCacheEntry;

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
  activeReferenceFeature,
  clear: clearSelectedItems,
} = useSelectedItems();
const { toggleUnitSelection, toggleFeatureSelection } = useSelectionActions();
const { unitSelectEnabled, featureSelectEnabled, hoverEnabled, selectionSuppressed } =
  storeToRefs(useMapSelectStore());
const { moveUnitEnabled, rotateUnitEnabled } = storeToRefs(useUnitSettingsStore());
const routingStore = useRoutingStore();
const { mapLibreUnitRotationMode } = storeToRefs(mapSettings);
const { setHoveredFeatures, clearHoveredFeatures } = provideMapHoverContext();
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
let suppressNextNativeClick = false;
let suppressNextNativeClickTimer: number | undefined;

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
      "text-offset": ["get", "textOffset"],
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

function getUnitMapSymbolSize(unit: { style?: { mapSymbolSize?: number } }) {
  return typeof unit.style?.mapSymbolSize === "number"
    ? unit.style.mapSymbolSize
    : mapSettings.mapIconSize;
}

function isHostileSidc(sidc: string) {
  return sidc[SID_INDEX] === "6";
}

function getUnitLabelOffsetY(symbolSize: number, sidc: string) {
  const frameMultiplier = isHostileSidc(sidc) ? 1.25 : 1;
  return Math.max(1.5, (symbolSize / 20) * frameMultiplier);
}

function getCustomSymbolId(sidc: string) {
  return sidc.startsWith(CUSTOM_SYMBOL_PREFIX) ? sidc.slice(CUSTOM_SYMBOL_SLICE) : "";
}

// Rasterize a loaded custom-symbol image (with optional selection highlight and
// color tint) to a canvas at the given pixel ratio. Pure draw step shared by the
// live map and the export, which differ only in the target pixel ratio.
function drawCustomSymbolCanvas(
  image: HTMLImageElement,
  imageId: string,
  { customSymbol, size, color }: CustomSymbolCacheEntry,
  pixelRatio: number,
): HTMLCanvasElement | null {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!(width > 0 && height > 0)) return null;

  const isSelected = imageId.startsWith("sel-");
  const highlightPadding = isSelected ? Math.max(8, Math.ceil(size * 0.3)) : 0;
  const anchor = customSymbol.anchor ?? [0.5, 0.5];
  const anchorX = anchor[0] * size;
  const anchorY = anchor[1] * size;
  const halfW = Math.max(anchorX, size - anchorX);
  const halfH = Math.max(anchorY, size - anchorY);
  const paddedWidth = Math.ceil((2 * halfW + highlightPadding * 2) * pixelRatio);
  const paddedHeight = Math.ceil((2 * halfH + highlightPadding * 2) * pixelRatio);
  const drawX = Math.round((halfW - anchorX + highlightPadding) * pixelRatio);
  const drawY = Math.round((halfH - anchorY + highlightPadding) * pixelRatio);
  const drawSize = Math.round(size * pixelRatio);

  const canvas = document.createElement("canvas");
  canvas.width = paddedWidth;
  canvas.height = paddedHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (isSelected) {
    const outlineCanvas = document.createElement("canvas");
    outlineCanvas.width = drawSize;
    outlineCanvas.height = drawSize;
    const outlineCtx = outlineCanvas.getContext("2d");
    if (outlineCtx) {
      outlineCtx.drawImage(image, 0, 0, drawSize, drawSize);
      outlineCtx.globalCompositeOperation = "source-in";
      outlineCtx.fillStyle = "yellow";
      outlineCtx.fillRect(0, 0, drawSize, drawSize);
      const outlineWidth = Math.max(4, Math.round(size * 0.12 * pixelRatio));
      for (const [offsetX, offsetY] of [
        [-outlineWidth, 0],
        [outlineWidth, 0],
        [0, -outlineWidth],
        [0, outlineWidth],
        [-outlineWidth, -outlineWidth],
        [outlineWidth, -outlineWidth],
        [-outlineWidth, outlineWidth],
        [outlineWidth, outlineWidth],
      ]) {
        ctx.drawImage(outlineCanvas, drawX + offsetX, drawY + offsetY);
      }
    }
    ctx.shadowColor = "yellow";
    ctx.shadowBlur = Math.max(10, Math.round(size * 0.35));
  }
  ctx.drawImage(image, drawX, drawY, drawSize, drawSize);
  ctx.shadowBlur = 0;
  if (color && typeof ctx.fillRect === "function") {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.fillRect(drawX, drawY, drawSize, drawSize);
    ctx.globalCompositeOperation = "source-over";
  }
  return canvas;
}

function createCustomSymbolImage(imageId: string, entry: CustomSymbolCacheEntry) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    if (mlMap.hasImage(imageId)) return;
    const pixelRatio = getSpritePixelRatio();
    const canvas = drawCustomSymbolCanvas(image, imageId, entry, pixelRatio);
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (data) {
        mlMap.addImage(imageId, data, { pixelRatio });
        usedImageIds.add(imageId);
      }
    } catch {
      mlMap.addImage(imageId, image);
      usedImageIds.add(imageId);
    }
  };
  image.onerror = () => {};
  image.src = entry.customSymbol.src;
}

// Export variant: load and rasterize a custom symbol at an arbitrary pixel ratio,
// resolving to the raw ImageData rather than adding it to the live map.
function buildCustomSymbolImageData(
  imageId: string,
  entry: CustomSymbolCacheEntry,
  pixelRatio: number,
): Promise<ImageData | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = drawCustomSymbolCanvas(image, imageId, entry, pixelRatio);
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return resolve(null);
      try {
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = entry.customSymbol.src;
  });
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

// Rasterize a milsymbol icon to ImageData at the given pixel ratio. Pure build
// step shared by the live map and the export.
function buildMilSymbolImageData(
  imageId: string,
  cachedSymbol: SymbolCacheEntry | undefined,
  pixelRatio: number,
): ImageData | null {
  const isSelected = imageId.startsWith("sel-");
  const {
    sidc = "xxxxxxx",
    symbolOptions = {},
    textAmplifiers = {},
    uniqueDesignation = "",
  } = cachedSymbol?.kind === "milsymbol" ? cachedSymbol : {};

  const options = isSelected
    ? { outlineWidth: 20, outlineColor: "yellow" }
    : { outlineWidth: 7, outlineColor: "white" };
  const symb = symbolGenerator(sidc, {
    uniqueDesignation,
    ...options,
    ...textAmplifiers,
    ...symbolOptions,
  });
  const { width, height } = symb.getSize();
  const anchor = symb.getAnchor();
  const sourceCanvas = symb.asCanvas(pixelRatio);
  if (!sourceCanvas) return null;

  // milsymbol canvases are not centered on the symbol anchor — pad the image
  // so the anchor sits at the canvas center, which is what MapLibre uses as
  // the icon's origin.
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
  if (!ctx) return null;
  ctx.drawImage(sourceCanvas, drawX, drawY);
  return ctx.getImageData(0, 0, paddedWidth, paddedHeight);
}

// Re-rasterize any programmatic symbol (milsymbol or custom) at an arbitrary
// pixel ratio for the image export, so supersampled exports get crisp icons
// instead of upscaled copies of the on-screen bitmap.
async function buildSymbolImageData(
  imageId: string,
  pixelRatio: number,
): Promise<ImageData | null> {
  const symbolCode = imageId.startsWith("sel-") ? imageId.slice(4) : imageId;
  const cachedSymbol = symbolCache.get(symbolCode);
  if (cachedSymbol?.kind === "custom") {
    return buildCustomSymbolImageData(imageId, cachedSymbol, pixelRatio);
  }
  return buildMilSymbolImageData(imageId, cachedSymbol, pixelRatio);
}

function styleImageMissing(e: MapStyleImageMissingEvent) {
  if (usedImageIds.has(e.id) || mlMap.hasImage(e.id)) return;

  const symbolCode = e.id.startsWith("sel-") ? e.id.slice(4) : e.id;
  const cachedSymbol = symbolCache.get(symbolCode);
  if (cachedSymbol?.kind === "custom") {
    createCustomSymbolImage(e.id, cachedSymbol);
    return;
  }

  const pixelRatio = getSpritePixelRatio();
  const data = buildMilSymbolImageData(e.id, cachedSymbol, pixelRatio);
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

useMaplibreDayNightTerminator(engineRef, activeScenario);

mlMap.on("styleimagemissing", styleImageMissing);
mlMap.on("style.load", onStyleLoad);
onStyleLoad();

// Let the image export re-rasterize symbols at its render scale (see
// symbolImageRegistry) so supersampled exports keep crisp icons.
registerSymbolImageSource(mlMap, {
  usedImageIds: () => usedImageIds,
  renderImage: async (id, pixelRatio) => {
    const data = await buildSymbolImageData(id, pixelRatio);
    return data ? { data, pixelRatio } : null;
  },
});
onUnmounted(() => unregisterSymbolImageSource(mlMap));

function pointToXY(point: PointLike): [number, number] {
  return Array.isArray(point) ? point : [point.x, point.y];
}

// A touch device, or an explicit touch-driven event, gets the wider tolerance.
// `originalEvent` is absent on the native MouseEvent passed by shift-click.
function getHitTolerance(e?: MapMouseEvent | MapTouchEvent | MouseEvent): number {
  const originalType =
    e && "originalEvent" in e
      ? e.originalEvent?.type
      : (e as MouseEvent | undefined)?.type;
  const isTouch =
    (originalType?.startsWith("touch") ?? false) ||
    (coarsePointerQuery?.matches ?? false);
  return isTouch ? TOUCH_HIT_TOLERANCE_PX : MOUSE_HIT_TOLERANCE_PX;
}

function collectInteractiveFeatures(
  geometry: PointLike | [PointLike, PointLike],
): MapGeoJSONFeature[] {
  const unitHits: MapGeoJSONFeature[] = [];
  const otherHits: MapGeoJSONFeature[] = [];
  for (const feature of mlMap.queryRenderedFeatures(geometry)) {
    const layerId = feature.layer.id;
    if (isUnitLayerId(layerId)) {
      unitHits.push(feature);
    } else if (
      UNIT_HISTORY_LAYER_IDS.includes(layerId) ||
      isMapLibreKmlRenderedLayerId(layerId) ||
      isManagedScenarioFeatureLayerId(layerId)
    ) {
      otherHits.push(feature);
    }
  }
  // Units must take precedence over reference layers (KML) even when those
  // layers happen to render above the unit symbols.
  return unitHits.length ? unitHits.concat(otherHits) : otherHits;
}

function queryInteractiveFeatures(
  point: PointLike,
  tolerance: number = MOUSE_HIT_TOLERANCE_PX,
) {
  // Prefer whatever sits directly under the pointer. Because unit precedence
  // promotes any unit ahead of other features, widening to the tolerance box
  // up front would let a unit up to `tolerance` px away swallow a click aimed
  // squarely at a feature/KML line. So we probe the exact point first and only
  // expand to the buffered box when nothing is directly under the pointer,
  // which is what makes thin features easier to grab.
  const exactHits = collectInteractiveFeatures(point);
  if (exactHits.length || tolerance <= 0) return exactHits;

  const [x, y] = pointToXY(point);
  return collectInteractiveFeatures([
    [x - tolerance, y - tolerance],
    [x + tolerance, y + tolerance],
  ]);
}

function updateHoveredScenarioFeatures(
  renderedFeatures: MapGeoJSONFeature[],
  e: MapMouseEvent,
) {
  if (!hoverEnabled.value) {
    clearHoveredFeatures();
    return;
  }

  // A single feature can be returned more than once when its geometry is split
  // across tile boundaries (especially via the buffered hit-test box), so dedupe
  // by id to avoid highlighting the same feature multiple times.
  const seenIds = new Set<string>();
  const features = renderedFeatures
    .filter((feature) => isManagedScenarioFeatureLayerId(feature.layer.id))
    .flatMap((feature) => {
      const featureId = getFeatureIdFromRenderedFeature(feature);
      if (!featureId || seenIds.has(featureId)) return [];
      seenIds.add(featureId);
      return [
        {
          getId: () => featureId,
        } satisfies HoverFeatureLike,
      ];
    });

  setHoveredFeatures(features, [e.point.x, e.point.y]);
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

function getEventPixel(e: MouseEvent): [number, number] {
  const rect = mlMap.getCanvas().getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top];
}

type ShiftClickTarget = { kind: "unit"; id: string } | { kind: "feature"; id: string };

// MapLibre's built-in box-zoom handler intercepts shift+mousedown, which prevents
// the synthetic `click` event additive selection would otherwise rely on. So both
// unit and feature shift-click selection are driven from the native mousedown
// instead (see onNativeCanvasMouseDown).
function getShiftClickTarget(e: MouseEvent): ShiftClickTarget | undefined {
  if (!e.shiftKey) return;
  if (e.button !== 0) return;
  if (routingStore.active) return;
  if (moveUnitEnabled.value) return;

  const topHit = queryInteractiveFeatures(getEventPixel(e), getHitTolerance(e))[0];
  if (!topHit) return;

  if (isUnitLayerId(topHit.layer.id)) {
    if (!unitSelectEnabled.value) return;
    const unitId = topHit.properties?.id;
    return unitId ? { kind: "unit", id: unitId } : undefined;
  }

  if (isManagedScenarioFeatureLayerId(topHit.layer.id)) {
    if (!featureSelectEnabled.value) return;
    const featureId = getFeatureIdFromRenderedFeature(topHit);
    return featureId ? { kind: "feature", id: featureId } : undefined;
  }
}

function queueSuppressNextNativeClickReset() {
  if (suppressNextNativeClickTimer !== undefined) {
    window.clearTimeout(suppressNextNativeClickTimer);
  }
  suppressNextNativeClickTimer = window.setTimeout(() => {
    clearSuppressNextNativeClick();
  }, 0);
}

function clearSuppressNextNativeClick() {
  suppressNextNativeClick = false;
  if (suppressNextNativeClickTimer !== undefined) {
    window.clearTimeout(suppressNextNativeClickTimer);
    suppressNextNativeClickTimer = undefined;
  }
  window.removeEventListener("mouseup", queueSuppressNextNativeClickReset, true);
  window.removeEventListener("blur", clearSuppressNextNativeClick, true);
}

function onNativeCanvasClick(e: MouseEvent) {
  if (!suppressNextNativeClick) return;
  clearSuppressNextNativeClick();
  e.preventDefault();
  e.stopPropagation();
}

function onNativeCanvasMouseDown(e: MouseEvent) {
  // Another interaction (e.g. an export-area box draw) owns selection; the
  // shift-click additive path must defer to it just like onMapClick does.
  if (selectionSuppressed.value) return;
  const target = getShiftClickTarget(e);
  if (!target) return;

  if (target.kind === "unit") {
    toggleUnitSelection(target.id);
  } else {
    toggleFeatureSelection(target.id);
  }
  suppressNextNativeClick = true;
  window.addEventListener(
    "mouseup",
    queueSuppressNextNativeClickReset,
    NATIVE_CAPTURE_ONCE_OPTIONS,
  );
  window.addEventListener(
    "blur",
    clearSuppressNextNativeClick,
    NATIVE_CAPTURE_ONCE_OPTIONS,
  );
  e.preventDefault();
  e.stopPropagation();
}

function onMapClick(e: MapMouseEvent) {
  // Another interaction (e.g. an export-area box draw) owns the clicks; don't
  // select underneath it.
  if (selectionSuppressed.value) return;
  if (routingStore.active) return;
  if (moveUnitEnabled.value) return;
  if (handleHistoryMapClick(e)) return;
  const topHit = queryInteractiveFeatures(e.point, getHitTolerance(e))[0];
  const additive = e.originalEvent.shiftKey;
  const selectionEnabled = unitSelectEnabled.value || featureSelectEnabled.value;
  if (!topHit) {
    if (!additive && selectionEnabled) clearSelectedItems();
    return;
  }
  if (isUnitLayerId(topHit.layer.id)) {
    if (!unitSelectEnabled.value) return;
    const unitId = topHit.properties?.id;
    if (!unitId) return;
    if (additive) return;
    onUnitSelectHook.trigger({ unitId, options: { noZoom: true } });
    return;
  }
  if (isMapLibreKmlRenderedLayerId(topHit.layer.id)) {
    activeReferenceFeature.value = toReferenceFeatureSelection(topHit);
    return;
  }
  if (!featureSelectEnabled.value) return;
  const featureId = getFeatureIdFromRenderedFeature(topHit);
  const layerId = getLayerIdFromRenderedFeature(topHit);
  if (!(featureId && layerId)) return;
  // Additive (shift) feature selection is handled by the native mousedown path
  // (onNativeCanvasMouseDown); the synthetic click must not toggle it again.
  if (additive) return;
  onFeatureSelectHook.trigger({ featureId, layerId, options: { noZoom: true } });
}

function onMapMouseMove(e: MapMouseEvent) {
  if (rotateInteraction.isRotating.value) {
    clearHoveredFeatures();
    return;
  }
  if (unitDragState) {
    clearHoveredFeatures();
    previewDraggedUnits([e.lngLat.lng, e.lngLat.lat]);
    mlMap.getCanvas().style.cursor = "grabbing";
    return;
  }
  if (rotateUnitEnabled.value) {
    clearHoveredFeatures();
    if (!unitSelectEnabled.value) return;
    const topHit = queryInteractiveFeatures(e.point, getHitTolerance(e))[0];
    const rotatableUnitIds = isUnitLayerId(topHit?.layer.id)
      ? rotateInteraction.getRotatableUnitIds(topHit.properties?.id)
      : [];
    mlMap.getCanvas().style.cursor = rotatableUnitIds.length ? "grab" : "";
    return;
  }
  if (moveUnitEnabled.value && recordingStore.isRecordingLocation) {
    clearHoveredFeatures();
    if (!unitSelectEnabled.value) return;
    const topHit = queryInteractiveFeatures(e.point, getHitTolerance(e))[0];
    const movableUnitIds = isUnitLayerId(topHit?.layer.id)
      ? getMovableUnitIds(topHit.properties?.id)
      : [];
    mlMap.getCanvas().style.cursor = movableUnitIds.length ? "move" : "";
    return;
  }
  if (!hoverEnabled.value) {
    clearHoveredFeatures();
    mlMap.getCanvas().style.cursor = "crosshair";
    return;
  }
  const features = queryInteractiveFeatures(e.point, HOVER_HIT_TOLERANCE_PX);
  mlMap.getCanvas().style.cursor = features.length ? "pointer" : "";
  updateHoveredScenarioFeatures(features, e);
}

function onMapMouseLeave() {
  clearHoveredFeatures();
}

function onMapTouchMove(e: MapTouchEvent) {
  if (rotateInteraction.isRotating.value) return;
  if (!unitDragState) return;
  previewDraggedUnits([e.lngLat.lng, e.lngLat.lat]);
}

function onUnitDragStart(e: MapMouseEvent | MapTouchEvent) {
  if (!moveUnitEnabled.value || !recordingStore.isRecordingLocation) return;
  if (!unitSelectEnabled.value) return;

  const topHit = queryInteractiveFeatures(e.point, getHitTolerance(e))[0];
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
mlMap
  .getCanvasContainer()
  .addEventListener("mousedown", onNativeCanvasMouseDown, NATIVE_CAPTURE_OPTIONS);
mlMap
  .getCanvasContainer()
  .addEventListener("click", onNativeCanvasClick, NATIVE_CAPTURE_OPTIONS);
mlMap.on("mousedown", onUnitDragStart);
mlMap.on("touchstart", onUnitDragStart);
mlMap.on("mousemove", onMapMouseMove);
mlMap.on("mouseleave", onMapMouseLeave);
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
  [
    () => mapSettings.mapUnitLabelBelow,
    () => mapSettings.mapIconSize,
    () => mapSettings.mapCustomIconScale,
  ],
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
  // The image export now lives in the sidebar's Tools tab; open it and ask the
  // panel to expand the export form directly. Mobile renders the same tools in
  // the bottom panel, which is controlled separately from the desktop sidebar.
  uiStore.showLeftPanel = true;
  uiStore.mobilePanelOpen = true;
  uiStore.activeTabIndex = TAB_TOOLS;
  uiStore.requestExportTool = true;
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
      const { size: _symbolOptionSize, ...combinedSymbolOptions } =
        unitActions.getCombinedSymbolOptions(unit);
      const customSymbolId = getCustomSymbolId(unit.sidc);
      const customSymbol = customSymbolId
        ? activeScenario.store.state.customSymbolMap[customSymbolId]
        : undefined;
      const baseSymbolSize = getUnitMapSymbolSize(unit);
      const renderedSymbolSize =
        customSymbol && customSymbolId
          ? baseSymbolSize * (mapSettings.mapCustomIconScale || 1.7)
          : baseSymbolSize;
      const symbolData: SymbolCacheEntry =
        customSymbol && customSymbolId
          ? {
              kind: "custom",
              customSymbol,
              size: renderedSymbolSize,
              color: combinedSymbolOptions.fillColor,
            }
          : {
              kind: "milsymbol",
              sidc: unit.sidc,
              symbolOptions: {
                size: renderedSymbolSize,
                ...combinedSymbolOptions,
              },
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
          textOffset: [0, getUnitLabelOffsetY(renderedSymbolSize, unit.sidc)],
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
  clearSuppressNextNativeClick();
  boxSelect.cleanup();
  disposeUnitHistory();
  mlMap.off("styleimagemissing", styleImageMissing);
  mlMap.off("style.load", onStyleLoad);
  mlMap.off("click", onMapClick);
  mlMap
    .getCanvasContainer()
    .removeEventListener("mousedown", onNativeCanvasMouseDown, NATIVE_CAPTURE_OPTIONS);
  mlMap
    .getCanvasContainer()
    .removeEventListener("click", onNativeCanvasClick, NATIVE_CAPTURE_OPTIONS);
  mlMap.off("mousedown", onUnitDragStart);
  mlMap.off("touchstart", onUnitDragStart);
  mlMap.off("mousemove", onMapMouseMove);
  mlMap.off("mouseleave", onMapMouseLeave);
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

watch(hoverEnabled, (enabled) => {
  if (!enabled) clearHoveredFeatures();
});
</script>
<template>
  <MapHoverFeatureTooltip :is-dragging="isDragging" />
  <div v-if="isDragging" class="pointer-events-none absolute inset-0 z-10">
    <p
      class="text-foreground bg-background absolute bottom-1 left-2 rounded px-1 text-base tracking-tighter tabular-nums"
    >
      {{ formattedPosition }}
    </p>
  </div>
</template>
