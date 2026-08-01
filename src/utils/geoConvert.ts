import type { Position } from "geojson";
import { forward } from "mgrs";
import {
  type CoordinateFormat,
  type CoordinateFormatType,
  toStringHDMS,
} from "@/geo/coordinateFormat";
export type MGRSPrecision = 1 | 2 | 3 | 4 | 5;
export function formatDecimalDegrees(p: Position, precision: number) {
  const [lon, lat] = p;
  return `${Math.abs(lat).toFixed(precision)}° ${lat >= 0 ? "N" : "S"} ${Math.abs(
    lon,
  ).toFixed(precision)}° ${lon >= 0 ? "E" : "W"}`;
}

export function formatMGRS(p: Position | undefined, precision: MGRSPrecision = 5) {
  if (!p) return "";
  const mgrs: string = p && forward(p as [number, number], precision);
  const n = mgrs.length;
  const eastingI = n - precision * 2;
  return `${mgrs.slice(0, eastingI - 2)} ${mgrs.slice(
    eastingI - 2,
    eastingI,
  )} ${mgrs.slice(eastingI, n - precision)} ${mgrs.slice(n - precision)}`;
}

export function getCoordinateFormatFunction(
  format: CoordinateFormatType,
): CoordinateFormat {
  if (format === "DegreeMinuteSeconds" || format === "dms")
    return (v: any) => toStringHDMS(v, 0);
  if (format === "MGRS") return (v: any) => formatMGRS(v, 4);
  return (v: any) => formatDecimalDegrees(v, 3);
}

export function fixExtent(extent: number[] | null | undefined = []) {
  if (!extent || extent.length === 0) return;
  const [minx, miny, maxx, maxy] = extent;
  return [
    Math.min(minx, maxx),
    Math.min(miny, maxy),
    Math.max(minx, maxx),
    Math.max(miny, maxy),
  ];
}

const EARTH_RADIUS = 6378137;

/** Convert an EPSG:3857 coordinate to EPSG:4326 (longitude, latitude). */
export function webMercatorToLonLat(coordinate: number[]): Position {
  const [x = 0, y = 0] = coordinate ?? [];
  return [
    (x * 180) / (EARTH_RADIUS * Math.PI),
    ((2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * 180) / Math.PI,
  ];
}
