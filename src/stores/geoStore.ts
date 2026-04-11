import { defineStore } from "pinia";
import OLMap from "ol/Map";
import type { Unit } from "@/types/scenarioModels";
import type { MeasurementTypes, MeasurementUnit } from "@/composables/geoMeasurement";
import type { NUnit } from "@/types/internalModels";
import type { Position } from "geojson";
import { type AllGeoJSON, featureCollection, point as turfPoint } from "@turf/helpers";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import { useMapViewStore } from "@/stores/mapViewStore";

import { shallowRef, ref, computed } from "vue";
import { useLocalStorage } from "@vueuse/core";

export interface ZoomOptions {
  maxZoom?: number;
  duration?: number;
  padding?: [number, number, number, number];
}

export const useGeoStore = defineStore("geo", () => {
  const mapAdapter = shallowRef<MapAdapter | null>(null);
  const mapViewStore = useMapViewStore();
  let stopZoomTracking: (() => void) | null = null;

  /** @deprecated Use mapAdapter instead. Returns the native OL Map for backward compatibility. */
  const olMap = computed<OLMap | null>(() => {
    const native = mapAdapter.value?.getNativeMap();
    return native instanceof OLMap ? native : null;
  });

  function setMapAdapter(adapter: MapAdapter | null) {
    stopZoomTracking?.();
    stopZoomTracking = null;
    mapAdapter.value = adapter;
    if (!adapter) return;
    mapViewStore.zoomLevel = adapter.getZoom() ?? 0;
    stopZoomTracking = adapter.on("moveend", () => {
      mapViewStore.zoomLevel = adapter.getZoom() ?? 0;
    });
  }

  function zoomToUnit(unit?: Unit | NUnit | null, duration = 900) {
    if (!mapAdapter.value) return;
    const location = unit?._state?.location;
    if (!location) return;
    mapAdapter.value.animateView({ zoom: 15, center: location, duration });
  }

  function zoomToUnits(units: NUnit[], options: ZoomOptions = {}) {
    const { duration = 900, maxZoom = 15 } = options;
    const points = units
      .map((u) => u._state?.location)
      .filter((loc): loc is Position => !!loc)
      .map((loc) => turfPoint(loc));

    if (!points.length) return;
    const c = featureCollection(points);
    zoomToGeometry(c, { duration, maxZoom });
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

  function zoomToBbox(bbox: [number, number, number, number], options: ZoomOptions = {}) {
    if (!mapAdapter.value) return;
    mapAdapter.value.fitExtent(bbox, options);
  }

  return {
    mapAdapter,
    olMap,
    setMapAdapter,
    zoomToUnit,
    zoomToUnits,
    zoomToGeometry,
    zoomToLocation,
    panToUnit,
    panToLocation,
    updateMapSize,
    getMapViewBbox,
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

  return {
    measurementType,
    clearPrevious,
    showSegments,
    measurementUnit,
    snap,
    showCircle,
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
