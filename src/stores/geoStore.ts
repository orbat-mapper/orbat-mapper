import { defineStore } from "pinia";
import OLMap from "ol/Map";
import { Unit } from "@/types/scenarioModels";
import { fromLonLat } from "ol/proj";
import { MeasurementTypes, MeasurementUnit } from "@/composables/geoMeasurement";
import { NUnit } from "@/types/internalModels";
import type { Geometry, Position } from "geojson";
import { featureCollection, point as turfPoint } from "@turf/helpers";
import GeoJSON from "ol/format/GeoJSON";
import turfEnvelope from "@turf/envelope";

import Feature from "ol/Feature";
import { shallowRef } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { AllGeoJSON } from "@turf/helpers";

export interface ZoomOptions {
  maxZoom?: number;
  duration?: number;
}

export const useGeoStore = defineStore("geo", {
  state: () => ({
    olMap: shallowRef<OLMap | null | undefined>(null),
  }),
  actions: {
    zoomToUnit(unit?: Unit | NUnit | null, duration = 900) {
      if (!this.olMap) return;
      const location = unit?._state?.location;
      if (!location) return;
      const view = this.olMap.getView();
      view.animate({
        zoom: 15,
        center: fromLonLat(location, view.getProjection()),
        duration,
      });
    },

    zoomToUnits(units: NUnit[], options: ZoomOptions = {}) {
      const { duration = 900, maxZoom = 15 } = options;
      const points = units
        .filter((u) => u._state?.location)
        .map((u) => turfPoint(u._state?.location!));
      if (!points.length) return;
      const c = featureCollection(points);
      this.zoomToGeometry(c, { duration, maxZoom });
    },

    zoomToGeometry(geometry: AllGeoJSON, options: ZoomOptions = {}) {
      if (!this.olMap) return;
      const { duration = 900, maxZoom = 15 } = options;
      const bb = new GeoJSON().readFeature(turfEnvelope(geometry), {
        featureProjection: "EPSG:3857",
        dataProjection: "EPSG:4326",
      }) as Feature<any>;
      if (!bb) return;
      this.olMap.getView().fit(bb.getGeometry(), { maxZoom, duration });
    },

    zoomToLocation(location?: Position, duration = 900) {
      if (!this.olMap) return;
      if (!location) return;
      const view = this.olMap!.getView();
      view.animate({
        zoom: 10,
        center: fromLonLat(location, view.getProjection()),
        duration,
      });
    },

    panToUnit(unit?: Unit | NUnit | null, duration = 900) {
      if (!this.olMap) return;
      const location = unit?._state?.location;
      if (!location) return;
      const view = this.olMap.getView();
      view.animate({
        center: fromLonLat(location, view.getProjection()),
        duration,
      });
    },

    panToLocation(location?: Position, duration = 900) {
      if (!this.olMap) return;
      if (!location) return;
      const view = this.olMap.getView();
      view.animate({
        center: fromLonLat(location, view.getProjection()),
        duration,
      });
    },

    updateMapSize() {
      this.olMap?.updateSize();
    },
  },
});

export const useMeasurementsStore = defineStore("measurements", {
  state() {
    return {
      measurementType: "LineString" as MeasurementTypes,
      clearPrevious: true,
      showSegments: true,
      measurementUnit: "metric" as MeasurementUnit,
      snap: true,
    };
  },
});

export const useUnitSettingsStore = defineStore("unitSettings", {
  state() {
    return {
      showHistory: useLocalStorage("showHistory", true),
      editHistory: false,
      moveUnitEnabled: false,
      showWaypointTimestamps: useLocalStorage("showWaypointTimestamps", false),
    };
  },
});
