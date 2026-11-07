import { defineStore } from "pinia";
import type { Unit } from "@/types/scenarioModels";
import type { MeasurementTypes, MeasurementUnit } from "@/geo/measurementTypes";
import type { NUnit } from "@/types/internalModels";
import type { GeoJSON, Position } from "geojson";
import { type AllGeoJSON, featureCollection, point as turfPoint } from "@turf/helpers";
import turfCenter from "@turf/center";
import type { GeoJsonOverlayStyle, MapAdapter } from "@/geo/contracts/mapAdapter";
import { useMapViewStore } from "@/stores/mapViewStore";

import { shallowRef, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";

export interface ZoomOptions {
  maxZoom?: number;
  duration?: number;
  padding?: [number, number, number, number];
}

/** Zoom level used when zooming to a single unit from far out. */
const UNIT_ZOOM = 15;
/** At or above this zoom, zooming to a unit only pans, so the view never jumps. */
const UNIT_PAN_ONLY_ZOOM = 10;

/**
 * The zoom to use when zooming to a single unit: never zoom out, and only zoom
 * in when the map is so far out that the unit is hard to see.
 */
function unitZoomTarget(currentZoom: number | undefined) {
  if (currentZoom === undefined) return UNIT_ZOOM;
  return currentZoom >= UNIT_PAN_ONLY_ZOOM ? currentZoom : UNIT_ZOOM;
}

const FLASH_OVERLAY_ID = "flash-outline";
const FLASH_DURATION_MS = 3000;
const FLASH_COLOR = "#dc2626";
const FLASH_STYLE: GeoJsonOverlayStyle = {
  strokeColor: FLASH_COLOR,
  strokeWidth: 3,
  strokeLineDash: [4, 3],
  fillColor: "rgba(0,0,0,0)",
  // The overlay's circle layer also marks line and polygon vertices, so it stays
  // invisible unless the outline is a single point.
  circleRadius: 0,
  circleStrokeWidth: 0,
};
const FLASH_POINT_STYLE: GeoJsonOverlayStyle = {
  ...FLASH_STYLE,
  circleRadius: 18,
  circleFillColor: "rgba(0,0,0,0)",
  circleStrokeColor: FLASH_COLOR,
  circleStrokeWidth: 3,
};

/** The units' current locations as points, or undefined if none has a location. */
function unitPoints(units: NUnit[]) {
  const points = units
    .map((u) => u._state?.location)
    .filter((loc): loc is Position => !!loc)
    .map((loc) => turfPoint(loc));
  return points.length ? featureCollection(points) : undefined;
}

function isPointGeoJson(geojson: GeoJSON) {
  const geometry = geojson.type === "Feature" ? geojson.geometry : geojson;
  return geometry?.type === "Point" || geometry?.type === "MultiPoint";
}

export const useGeoStore = defineStore("geo", () => {
  const mapAdapter = shallowRef<MapAdapter | null>(null);
  const mapViewStore = useMapViewStore();
  let stopViewTracking: (() => void) | null = null;

  function setMapAdapter(adapter: MapAdapter | null) {
    stopViewTracking?.();
    stopViewTracking = null;
    mapAdapter.value = adapter;
    if (!adapter) {
      mapViewStore.viewBbox = null;
      return;
    }
    const syncView = () => {
      mapViewStore.zoomLevel = adapter.getZoom() ?? 0;
      mapViewStore.viewBbox = adapter.getViewBbox() ?? null;
    };
    syncView();
    stopViewTracking = adapter.on("moveend", syncView);
  }

  function zoomToUnit(unit?: Unit | NUnit | null, duration = 900) {
    if (!mapAdapter.value) return;
    const location = unit?._state?.location;
    if (!location) return;
    const zoom = unitZoomTarget(mapAdapter.value.getZoom());
    mapAdapter.value.animateView({ zoom, center: location, duration });
  }

  function zoomToUnits(units: NUnit[], options: ZoomOptions = {}) {
    const { duration = 900, maxZoom = 15, padding } = options;
    const points = unitPoints(units);
    if (!points) return;
    zoomToGeometry(points, { duration, maxZoom, padding });
  }

  function zoomToGeometry(geometry: AllGeoJSON, options: ZoomOptions = {}) {
    if (!mapAdapter.value) return;
    mapAdapter.value.fitGeometry(geometry, options);
  }

  function zoomToLocation(location?: Position, duration = 900) {
    if (!mapAdapter.value) return;
    if (!location) return;
    mapAdapter.value.animateView({ zoom: 10, center: location, duration });
  }

  function panToUnit(unit?: Unit | NUnit | null, duration = 900) {
    if (!mapAdapter.value) return;
    const location = unit?._state?.location;
    if (!location) return;
    mapAdapter.value.animateView({ center: location, duration });
  }

  /** Centers the map on the middle of the units' extent, keeping the zoom. */
  function panToUnits(units: NUnit[], duration = 900) {
    const points = unitPoints(units);
    if (!points) return;
    panToLocation(turfCenter(points).geometry.coordinates, duration);
  }

  function panToLocation(location?: Position, duration = 900) {
    if (!mapAdapter.value) return;
    if (!location) return;
    mapAdapter.value.animateView({ center: location, duration });
  }

  function updateMapSize() {
    mapAdapter.value?.updateSize();
  }

  function getMapViewBbox(): [number, number, number, number] | undefined {
    return mapAdapter.value?.getViewBbox();
  }

  let flashTimeout: ReturnType<typeof setTimeout> | undefined;

  /** Shows a dashed outline on the map for a moment, replacing any earlier one. */
  function flashOutline(geojson: GeoJSON, durationMs = FLASH_DURATION_MS) {
    const adapter = mapAdapter.value;
    if (!adapter) return;
    clearTimeout(flashTimeout);
    adapter.addGeoJsonOverlay(FLASH_OVERLAY_ID, geojson, {
      style: isPointGeoJson(geojson) ? FLASH_POINT_STYLE : FLASH_STYLE,
    });
    flashTimeout = setTimeout(
      () => adapter.removeGeoJsonOverlay(FLASH_OVERLAY_ID),
      durationMs,
    );
  }

  function getUnobstructedMapViewBbox(): [number, number, number, number] | undefined {
    return mapAdapter.value?.getUnobstructedViewBbox();
  }

  function zoomToBbox(bbox: [number, number, number, number], options: ZoomOptions = {}) {
    if (!mapAdapter.value) return;
    mapAdapter.value.fitExtent(bbox, options);
  }

  return {
    mapAdapter,
    setMapAdapter,
    zoomToUnit,
    zoomToUnits,
    zoomToGeometry,
    flashOutline,
    zoomToLocation,
    panToUnit,
    panToUnits,
    panToLocation,
    updateMapSize,
    getMapViewBbox,
    getUnobstructedMapViewBbox,
    zoomToBbox,
  };
});

export const useMeasurementsStore = defineStore("measurements", () => {
  const measurementType = ref<MeasurementTypes>("LineString");
  const clearPrevious = ref(true);
  const showSegments = ref(true);
  const measurementUnit = ref<MeasurementUnit>("metric");
  const snap = ref(true);
  const showCircle = useLocalStorage("showMeasurementCircle", true);
  const showGeodesicPaths = useLocalStorage("showGeodesicPaths", true);

  return {
    measurementType,
    clearPrevious,
    showSegments,
    measurementUnit,
    snap,
    showCircle,
    showGeodesicPaths,
  };
});

export const useUnitSettingsStore = defineStore("unitSettings", () => {
  const showHistory = useLocalStorage("showHistory", true);
  const editHistory = ref(false);
  const moveUnitEnabled = ref(false);
  const rotateUnitEnabled = ref(false);
  const showWaypointTimestamps = useLocalStorage("showWaypointTimestamps", false);

  return {
    showHistory,
    editHistory,
    moveUnitEnabled,
    rotateUnitEnabled,
    showWaypointTimestamps,
  };
});
