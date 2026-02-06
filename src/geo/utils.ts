import dayjs from "dayjs";
import { resolveTimeZone } from "@/utils/militaryTimeZones";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { toStringHDMS } from "ol/coordinate";
import { formatDecimalDegrees, formatMGRS, type MGRSPrecision } from "@/utils/geoConvert";
import type { MeasurementUnit } from "@/composables/geoMeasurement";
import { type CoordinateFormatType } from "@/composables/geoShowLocation";
import { truncate } from "@turf/truncate";
import { point } from "@turf/helpers";
import type { Position } from "geojson";
import * as mgrsLib from "mgrs";

// const s = useMapSettingsStore();

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
  if (timeZone) return dayjs(value).tz(resolveTimeZone(timeZone)).format(template);

  return dayjs.utc(value).format(template);
}

export function formatDTG(value: number, timeZone: string) {
  if (value === undefined || value === null) return "";
  const date = dayjs(value).tz(resolveTimeZone(timeZone));
  const offset = Math.round(date.utcOffset() / 60).toString();
  const letter = UTC2MILITARY[offset] ?? "Z";
  return date.format(`DDHHmm[${letter}]MMMYY`).toUpperCase();
}

export function formatPosition(
  value?: number[],
  options: { format?: CoordinateFormatType; mgrsPrecision?: MGRSPrecision } = {},
) {
  if (value) {
    const s = useMapSettingsStore();
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

/**
 * Parse MGRS string to [lon, lat] position.
 * Uses the mgrs library for conversion.
 */
export function parseMGRS(value: string): Position | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!trimmed) return null;

  try {
    const result = mgrsLib.toPoint(trimmed);
    if (result && result.length >= 2) {
      return truncatePosition(result as Position);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse Degree-Minute-Seconds format to [lon, lat] position.
 * Supports formats like:
 * - 40°26'46"N 79°58'56"W
 * - 40°26'46.123"N, 79°58'56.456"W
 * - N40°26'46" W79°58'56"
 */
export function parseDMS(value: string): Position | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Pattern to match DMS components
  const dmsPattern = /([NSEW])?\s*(\d+)[°\s]+(\d+)['\s]+(\d+(?:\.\d+)?)["\s]*([NSEW])?/gi;
  const matches = [...trimmed.matchAll(dmsPattern)];

  if (matches.length < 2) return null;

  const results: { value: number; isLat: boolean }[] = [];

  for (const match of matches) {
    const prefix = match[1]?.toUpperCase();
    const suffix = match[5]?.toUpperCase();
    const direction = prefix || suffix;

    const degrees = parseFloat(match[2]);
    const minutes = parseFloat(match[3]);
    const seconds = parseFloat(match[4]);

    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) continue;

    let decimal = degrees + minutes / 60 + seconds / 3600;

    const isNegative = direction === "S" || direction === "W";
    if (isNegative) decimal = -decimal;

    const isLat = direction === "N" || direction === "S";
    results.push({ value: decimal, isLat });
  }

  if (results.length < 2) return null;

  const lat = results.find((r) => r.isLat)?.value;
  const lon = results.find((r) => !r.isLat)?.value;

  if (lat === undefined || lon === undefined) return null;

  // Validate ranges
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return truncatePosition([lon, lat]);
}

/**
 * Parse separate latitude and longitude values to [lon, lat] position.
 * Handles string or numeric inputs.
 */
export function parseLatLonPair(
  lat: string | number | unknown,
  lon: string | number | unknown,
): Position | null {
  const latNum = typeof lat === "number" ? lat : parseFloat(String(lat));
  const lonNum = typeof lon === "number" ? lon : parseFloat(String(lon));

  if (isNaN(latNum) || isNaN(lonNum)) return null;

  // Validate ranges
  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) return null;

  return truncatePosition([lonNum, latNum]);
}

/**
 * Parse a combined coordinate string in various formats.
 * Supports: MGRS, decimal degrees (lat,lon or lon,lat), DMS.
 */
export function parseCoordinateString(
  value: string,
  format: "MGRS" | "LatLon" | "LonLat" | "DMS",
): Position | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (format === "MGRS") {
    return parseMGRS(trimmed);
  }

  if (format === "DMS") {
    return parseDMS(trimmed);
  }

  // Decimal degrees - split on comma, semicolon, or whitespace
  const parts = trimmed.split(/[,;\s]+/).filter((p) => p.length > 0);
  if (parts.length < 2) return null;

  const first = parseFloat(parts[0]);
  const second = parseFloat(parts[1]);

  if (isNaN(first) || isNaN(second)) return null;

  if (format === "LatLon") {
    return parseLatLonPair(first, second);
  } else {
    // LonLat
    return parseLatLonPair(second, first);
  }
}

export type CombinedCoordinateFormat = "MGRS" | "LatLon" | "LonLat" | "DMS";

export function detectCoordinateFormat(
  samples: string[],
): CombinedCoordinateFormat | null {
  if (samples.length === 0) return null;

  let mgrsCount = 0;
  let dmsCount = 0;
  let latLonCount = 0;
  let lonLatCount = 0;

  for (const sample of samples) {
    if (!sample || typeof sample !== "string" || sample.trim().length === 0) continue;

    // Check MGRS
    if (parseMGRS(sample)) mgrsCount++;

    // Check DMS
    if (parseDMS(sample)) dmsCount++;

    // Check LatLon / LonLat
    // We parse manually to check values
    const parts = sample.split(/[,;\s]+/).filter((p) => p.length > 0);
    if (parts.length >= 2) {
      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);
      if (!isNaN(a) && !isNaN(b)) {
        // Basic range check
        const aIsLat = Math.abs(a) <= 90;
        const aIsLon = Math.abs(a) <= 180;
        const bIsLat = Math.abs(b) <= 90;
        const bIsLon = Math.abs(b) <= 180;

        if (aIsLat && bIsLon) latLonCount++;
        if (aIsLon && bIsLat) {
          // If a > 90, it MUST be lon
          // Strong signal if first value is > 90 (can't be lat)
          if (Math.abs(a) > 90) lonLatCount += 2;
          else lonLatCount++;
        }
      }
    }
  }

  // Decision logic
  if (mgrsCount > samples.length / 2) return "MGRS";
  if (dmsCount > samples.length / 2) return "DMS";
  if (lonLatCount > latLonCount) return "LonLat";
  if (latLonCount > 0) return "LatLon";

  return null;
}
