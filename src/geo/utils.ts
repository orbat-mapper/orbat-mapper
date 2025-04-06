import dayjs from "dayjs";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { toStringHDMS } from "ol/coordinate";
import { formatDecimalDegrees, formatMGRS, type MGRSPrecision } from "@/utils/geoConvert";
import type { MeasurementUnit } from "@/composables/geoMeasurement";
import { type CoordinateFormatType } from "@/composables/geoShowLocation";
import { truncate } from "@turf/truncate";
import { point } from "@turf/helpers";
import type { Position } from "geojson";

const s = useMapSettingsStore();

export const UTC2MILITARY: Record<string, string> = {
  "-12": "Y",
  "-11": "X",
  "-10": "W",
  "-9": "V",
  "-8": "U",
  "-7": "T",
  "-6": "S",
  "-5": "R",
  "-4": "Q",
  "-3": "P",
  "-2": "O",
  "-1": "N",
  "0": "Z",
  "1": "A",
  "2": "B",
  "3": "C",
  "4": "D",
  "5": "E",
  "6": "F",
  "7": "G",
  "8": "H",
  "9": "I",
  "10": "K",
  "11": "L",
  "12": "M",
};

export function formatDateString(value?: number, timeZone?: string, template?: string) {
  if (value === undefined || value === null) return "";
  if (timeZone) return dayjs(value).tz(timeZone).format(template);

  return dayjs.utc(value).format(template);
}

export function formatDTG(value: number, timeZone: string) {
  if (value === undefined || value === null) return "";
  const date = dayjs(value).tz(timeZone);
  const offset = Math.round(date.utcOffset() / 60).toString();
  const letter = UTC2MILITARY[offset] ?? "Z";
  return date.format(`DDHHmm[${letter}]MMMYY`).toUpperCase();
}

export function formatPosition(
  value?: number[],
  options: { format?: CoordinateFormatType; mgrsPrecision?: MGRSPrecision } = {},
) {
  if (value) {
    const format = options.format ?? s.coordinateFormat;
    const mgrsPrecision = options.mgrsPrecision ?? 4;
    if (format === "DegreeMinuteSeconds") return toStringHDMS(value, 0);
    if (format === "MGRS") return formatMGRS(value, mgrsPrecision);
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

export function parseCoordinates(coordinateString: string): [number, number] {
  const parts = coordinateString.split(",").map((s) => s.trim());

  if (parts.length !== 2) {
    throw new Error("Invalid coordinate format. Expected format: 'latitude,longitude'");
  }

  const [latStr, lonStr] = parts;
  const latitude = parseFloat(latStr);
  const longitude = parseFloat(lonStr);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Invalid coordinate values. Coordinates must be numbers.");
  }

  return [latitude, longitude];
}

export function truncatePosition(
  p: Position,
  options?: { precision?: number },
): Position {
  return truncate(point(p), options).geometry.coordinates;
}
