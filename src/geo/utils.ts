import dayjs from "dayjs";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { toStringHDMS } from "ol/coordinate";
import { formatDecimalDegrees, formatMGRS } from "@/utils/geoConvert";
import type { MeasurementUnit } from "@/composables/geoMeasurement";

const s = useMapSettingsStore();

export function formatDateString(value?: number, timeZone?: string, template?: string) {
  if (value === undefined || value === null) return "";
  if (timeZone) return dayjs(value).tz(timeZone).format(template);

  return dayjs.utc(value).format(template);
}

export function formatPosition(value?: number[]) {
  if (value) {
    const format = s.coordinateFormat;
    if (format === "DegreeMinuteSeconds") return toStringHDMS(value, 0);
    if (format === "MGRS") return formatMGRS(value, 4);
    return formatDecimalDegrees(value, 3);
  }
  return "";
}

export function formatLength(length: number, unit: MeasurementUnit = "metric") {
  let output: string = "";
  if (unit === "metric") {
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + " km";
    } else {
      output = Math.round(length * 100) / 100 + " m";
    }
  } else if (unit === "imperial") {
    const miles = length * 0.000621371192;
    if (miles > 0.1) {
      output = miles.toFixed(2) + " mi";
    } else {
      output = (miles * 5280).toFixed(2) + " ft";
    }
  } else if (unit === "nautical") {
    const nm = length * 0.000539956803;
    if (nm > 0.1) {
      output = nm.toFixed(2) + " nm";
    } else {
      output = nm.toFixed(3) + " nm";
    }
  }
  return output;
}

export function formatArea(area: number, unit: MeasurementUnit = "metric"): string {
  let output = "";
  if (unit === "metric") {
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
    } else {
      output = Math.round(area * 100) / 100 + " m\xB2";
    }
  } else if (unit === "imperial") {
    const squareMiles = area * 0.0000003861021585424458;
    if (squareMiles > 0.1) {
      output = squareMiles.toFixed(2) + " mi\xB2";
    } else {
      output = (area * 10.7639104167097).toFixed(2) + " ft\xB2";
    }
  } else if (unit === "nautical") {
    const squareNM = area * 0.0000003599999999999999;
    if (squareNM > 0.1) {
      output = squareNM.toFixed(2) + " nm\xB2";
    } else {
      output = (area * 10.7639104167097).toFixed(2) + " ft\xB2";
    }
  }
  return output;
}
