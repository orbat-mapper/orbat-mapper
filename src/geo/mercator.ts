import type { Map as MlMap } from "maplibre-gl";
import type { Position } from "geojson";
import { unwrapPositionRelative } from "@/geo/longitude";

export function latitudeToMercatorY(latitude: number): number {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const radians = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

export function mercatorYToLatitude(y: number): number {
  return (Math.atan(Math.exp(y)) * 2 - Math.PI / 2) * (180 / Math.PI);
}

// Midpoint of the straight line rendered between two vertices in Mercator
// projection. Mercator stretches latitude, so the visual midpoint sits at the
// average mercator-Y, not the average latitude.
export function mercatorMidpoint(a: Position, b: Position): Position {
  const end = unwrapPositionRelative(a, b);
  const midLng = (a[0] + end[0]) / 2;
  const startY = latitudeToMercatorY(a[1]);
  const endY = latitudeToMercatorY(end[1]);
  return [midLng, mercatorYToLatitude((startY + endY) / 2)];
}

export function isGlobeProjection(map: MlMap): boolean {
  const projection = (map as any).getProjection?.();
  const projectionType =
    typeof projection === "string" ? projection : (projection?.type ?? projection?.name);
  return projectionType === "globe";
}
