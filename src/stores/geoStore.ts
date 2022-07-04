import { defineStore } from "pinia";
import OLMap from "ol/Map";
import { Unit } from "../types/scenarioModels";
import { fromLonLat } from "ol/proj";
import { MeasurementTypes } from "../composables/geoMeasurement";
import { NUnit } from "@/types/internalModels";

export const useGeoStore = defineStore("geo", {
  state: () => ({
    olMap: null as OLMap | null | undefined,
  }),
  actions: {
    zoomToUnit(unit?: Unit | NUnit | null, duration = 900) {
      const location = unit?._state?.location;
      if (!location) return;
      const view = this.olMap!.getView();
      view.animate({
        zoom: 10,
        center: fromLonLat(location, view.getProjection()),
        duration,
      });
    },

    panToUnit(unit?: Unit | NUnit | null, duration = 900) {
      const location = unit?._state?.location;
      if (!location) return;
      const view = this.olMap!.getView();
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
    };
  },
});

if (import.meta.hot) {
  // HMR code
  import.meta.hot.decline();
}
