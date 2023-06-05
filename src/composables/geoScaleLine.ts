import OLMap from "ol/Map";
import { type MaybeRef, tryOnBeforeUnmount } from "@vueuse/core";
import { ref, watch } from "vue";
import { ScaleLine } from "ol/control";
import { MeasurementUnit } from "@/composables/geoMeasurement";

export type CoordinateFormatType = "MGRS" | "DecimalDegrees" | "DegreeMinuteSeconds";

export interface GeoShowLocationOptions {
  enabled: MaybeRef<boolean>;
  measurementUnits?: MaybeRef<MeasurementUnit>;
}
export function useShowScaleLine(
  olMap: OLMap,
  options: Partial<GeoShowLocationOptions> = {}
) {
  const enableRef = ref(options.enabled ?? true);
  const measurementUnitsRef = ref(options.measurementUnits ?? "metric");
  const scaleLineControl = new ScaleLine({ units: measurementUnitsRef.value });

  watch(
    enableRef,
    (enabled) => {
      scaleLineControl.setMap(enabled ? olMap : null);
    },
    { immediate: true }
  );

  watch(measurementUnitsRef, (units) => {
    scaleLineControl.setUnits(units);
  });

  tryOnBeforeUnmount(() => {
    olMap.removeControl(scaleLineControl);
  });

  return { enabled: enableRef };
}
