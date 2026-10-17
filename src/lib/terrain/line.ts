import type { LineString } from "geojson";
import { RAD } from "./mercator";

/** The mean Earth radius, as Turf uses. */
export const EARTH_RADIUS = 6371008.8;

export type LngLat = [lng: number, lat: number];

/** Positions along a line with their distance from its start in metres. */
export interface DenseLine {
  coordinates: LngLat[];
  distances: number[];
}

type Vector = [number, number, number];

function toVector([lng, lat]: LngLat): Vector {
  const cosLat = Math.cos(lat * RAD);
  return [
    cosLat * Math.cos(lng * RAD),
    cosLat * Math.sin(lng * RAD),
    Math.sin(lat * RAD),
  ];
}

/** Haversine: stable for the short segments a profile is mostly made of. */
function centralAngle([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
  const h =
    Math.sin(((lat2 - lat1) * RAD) / 2) ** 2 +
    Math.cos(lat1 * RAD) *
      Math.cos(lat2 * RAD) *
      Math.sin(((lng2 - lng1) * RAD) / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Metres between two positions along a great circle. */
export const distanceBetween = (a: LngLat, b: LngLat): number =>
  centralAngle(a, b) * EARTH_RADIUS;

/** Spherical interpolation. The longitude is unwound towards `a`, so a segment
 *  across the antimeridian keeps its points continuous with its ends. */
function interpolate(a: LngLat, b: LngLat, angle: number, fraction: number): LngLat {
  const [ax, ay, az] = toVector(a);
  const [bx, by, bz] = toVector(b);
  const sinAngle = Math.sin(angle);
  const wa = Math.sin((1 - fraction) * angle) / sinAngle;
  const wb = Math.sin(fraction * angle) / sinAngle;
  const x = wa * ax + wb * bx;
  const y = wa * ay + wb * by;
  const z = wa * az + wb * bz;
  const lat = Math.atan2(z, Math.hypot(x, y)) / RAD;
  const lng = Math.atan2(y, x) / RAD;
  return [lng + 360 * Math.round((a[0] - lng) / 360), lat];
}

function vertexList(line: LineString): LngLat[] {
  return line.coordinates.map(([lng, lat]) => [lng!, lat!] as LngLat);
}

/** A line's length in metres along great circles. */
export function lineLength(line: LineString): number {
  const vertices = vertexList(line);
  let length = 0;
  for (let i = 1; i < vertices.length; i++)
    length += centralAngle(vertices[i - 1]!, vertices[i]!) * EARTH_RADIUS;
  return length;
}

/** Samples a line along great circles, no more than `spacing` metres apart,
 *  keeping every original vertex. Each segment is cut into equal steps. */
export function densifyLine(line: LineString, spacing: number): DenseLine {
  const vertices = vertexList(line);
  const first = vertices[0];
  if (!first) return { coordinates: [], distances: [] };
  const coordinates: LngLat[] = [first];
  const distances = [0];
  let travelled = 0;
  for (let i = 1; i < vertices.length; i++) {
    const a = vertices[i - 1]!;
    const b = vertices[i]!;
    const angle = centralAngle(a, b);
    const length = angle * EARTH_RADIUS;
    const steps = spacing > 0 ? Math.max(1, Math.ceil(length / spacing)) : 1;
    for (let step = 1; step < steps; step++) {
      coordinates.push(interpolate(a, b, angle, step / steps));
      distances.push(travelled + (length * step) / steps);
    }
    travelled += length;
    coordinates.push(b);
    distances.push(travelled);
  }
  return { coordinates, distances };
}
