import { defineStore } from "pinia";
import OLMap from "ol/Map";
import type { Unit } from "@/types/scenarioModels";
import { fromLonLat } from "ol/proj";
import type { MeasurementTypes, MeasurementUnit } from "@/composables/geoMeasurement";
import type { NUnit } from "@/types/internalModels";
import type { Position } from "geojson";
import { type AllGeoJSON, featureCollection, point as turfPoint } from "@turf/helpers";
import GeoJSON from "ol/format/GeoJSON";
import turfEnvelope from "@turf/envelope";

import Feature from "ol/Feature";
import { shallowRef, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";

export interface ZoomOptions {
  maxZoom?: number;
  duration?: number;
}

export const useGeoStore = defineStore("geo", () => {
  const olMap = shallowRef<OLMap | null | undefined>(null);

  function zoomToUnit(unit?: Unit | NUnit | null, duration = 900) {
    if (!olMap.value) return;
    const location = unit?._state?.location;
    if (!location) return;
    const view = olMap.value.getView();
    view.animate({
      zoom: 15,
      center: fromLonLat(location, view.getProjection()),
      duration,
    });
  }

  function zoomToUnits(units: NUnit[], options: ZoomOptions = {}) {
    const { duration = 900, maxZoom = 15 } = options;
    const points = units
      .filter((u) => u._state?.location)
      .map((u) => turfPoint(u._state?.location!));
    if (!points.length) return;
    const c = featureCollection(points);
    zoomToGeometry(c, { duration, maxZoom });
  }

  function zoomToGeometry(geometry: AllGeoJSON, options: ZoomOptions = {}) {
    if (!olMap.value) return;
    const { duration = 900, maxZoom = 15 } = options;
    const bb = new GeoJSON().readFeature(turfEnvelope(geometry), {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    }) as Feature<any>;
    if (!bb) return;
    olMap.value.getView().fit(bb.getGeometry(), { maxZoom, duration });
  }

  function zoomToLocation(location?: Position, duration = 900) {
    if (!olMap.value) return;
    if (!location) return;
    const view = olMap.value.getView();
    view.animate({
      zoom: 10,
      center: fromLonLat(location, view.getProjection()),
      duration,
    });
  }

  function panToUnit(unit?: Unit | NUnit | null, duration = 900) {
    if (!olMap.value) return;
    const location = unit?._state?.location;
    if (!location) return;
    const view = olMap.value.getView();
    view.animate({
      center: fromLonLat(location, view.getProjection()),
      duration,
    });
  }

  function panToLocation(location?: Position, duration = 900) {
    if (!olMap.value) return;
    if (!location) return;
    const view = olMap.value.getView();
    view.animate({
      center: fromLonLat(location, view.getProjection()),
      duration,
    });
  }

  function updateMapSize() {
    olMap.value?.updateSize();
  }

  return {
    olMap,
    zoomToUnit,
    zoomToUnits,
    zoomToGeometry,
    zoomToLocation,
    panToUnit,
    panToLocation,
    updateMapSize,
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
  const showWaypointTimestamps = useLocalStorage("showWaypointTimestamps", false);

  return {
    showHistory,
    editHistory,
    moveUnitEnabled,
    showWaypointTimestamps,
  };
});
