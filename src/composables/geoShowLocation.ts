import OLMap from "ol/Map";
import MousePosition from "ol/control/MousePosition";
import { type CoordinateFormat } from "ol/coordinate";
import { type MaybeRef, tryOnBeforeUnmount } from "@vueuse/core";
import { ref, watch } from "vue";
import { getCoordinateFormatFunction } from "@/utils/geoConvert";

export type CoordinateFormatType =
  | "MGRS"
  | "DecimalDegrees"
  | "DegreeMinuteSeconds"
  | "dms"
  | "dd";

export interface GeoShowLocationOptions {
  projection?: MaybeRef<string>;
  coordinateFormat: MaybeRef<CoordinateFormatType>;
  enable: MaybeRef<boolean>;
}
export function useShowLocationControl(
  olMap: OLMap,
  options: Partial<GeoShowLocationOptions> = {},
) {
  const projectionRef = ref(options.projection ?? "EPSG:4326");
  const coordinateFormatRef = ref(options.coordinateFormat ?? "DecimalDegrees");
  const enableRef = ref(options.enable ?? true);
  const mousePositionControl = new MousePosition({
    projection: projectionRef.value,
    className: "location-control",
  });

  watch(
    enableRef,
    (enabled) => {
      mousePositionControl.setMap(enabled ? olMap : null);
    },
    { immediate: true },
  );

  watch(
    coordinateFormatRef,
    (f) => {
      mousePositionControl.setCoordinateFormat(getCoordinateFormat());
      // @ts-ignore
      if (enableRef.value) mousePositionControl?.updateHTML_([0, 0]);
    },
    { immediate: true },
  );

  tryOnBeforeUnmount(() => {
    olMap.removeControl(mousePositionControl);
  });

  function getCoordinateFormat(): CoordinateFormat {
    const format = coordinateFormatRef.value;
    return getCoordinateFormatFunction(format);
  }

  return { enable: enableRef };
}
