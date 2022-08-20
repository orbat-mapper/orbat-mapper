import OLMap from "ol/Map";
import MousePosition from "ol/control/MousePosition";
import { Coordinate, type CoordinateFormat, toStringHDMS } from "ol/coordinate";
import { forward } from "mgrs";
import { type MaybeRef, tryOnBeforeUnmount } from "@vueuse/core";
import { ref, watch } from "vue";

export type CoordinateFormatType = "MGRS" | "DecimalDegrees" | "DegreeMinuteSeconds";
export interface GeoShowLocationOptions {
  projection?: MaybeRef<string>;
  coordinateFormat: MaybeRef<CoordinateFormatType>;
  enable: MaybeRef<boolean>;
}
export function useShowLocationControl(
  olMap: OLMap,
  options: Partial<GeoShowLocationOptions> = {}
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
    { immediate: true }
  );

  watch(
    coordinateFormatRef,
    (f) => {
      mousePositionControl.setCoordinateFormat(getCoordinateFormat());
      // @ts-ignore
      if (enableRef.value) mousePositionControl?.updateHTML_([0, 0]);
    },
    { immediate: true }
  );

  tryOnBeforeUnmount(() => {
    olMap.removeControl(mousePositionControl);
  });

  function getCoordinateFormat(): CoordinateFormat {
    const format = coordinateFormatRef.value;
    if (format === "DegreeMinuteSeconds") return (v: any) => toStringHDMS(v, 0);
    if (format === "MGRS") return (v) => formatMGRS(v, 4);
    return (v: any) => formatDecimalDegrees(v, 3);
  }

  return { enable: enableRef };
}

function formatDecimalDegrees(p: Coordinate, precision: number) {
  const [lon, lat] = p;
  return `${Math.abs(lat).toFixed(precision)}° ${lat >= 0 ? "N" : "S"} ${Math.abs(
    lon
  ).toFixed(precision)}° ${lon >= 0 ? "E" : "W"}`;
}

function formatMGRS(p: Coordinate | undefined, precision: 1 | 2 | 3 | 4 | 5 = 5) {
  const mgrs: string = p && forward(p, precision);
  const n = mgrs.length;
  const eastingI = n - precision * 2;
  return `${mgrs.slice(0, eastingI - 2)} ${mgrs.slice(
    eastingI - 2,
    eastingI
  )} ${mgrs.slice(eastingI, n - precision)} ${mgrs.slice(n - precision)}`;
}
