import type { LocationState, Unit } from "@/types/scenarioModels";
import type { NUnit } from "@/types/internalModels";
import { greatCircle } from "@turf/great-circle";
import type {
  Feature as GeoJsonFeature,
  LineString as GeoJsonLineString,
  Point as GeoJsonPoint,
  Position,
} from "geojson";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { distanceMeters } from "@/geo/distance";
import { unwindCoordinates, unwrapLongitude } from "@/geo/longitude";

export const VIA_TIME = -1337;
// Marks the synthetic waypoint for a unit's initial location (`unit.location`),
// which is not backed by a state entry.
export const INITIAL_TIME = Number.MIN_SAFE_INTEGER;

/**
 * Describes where a new via point would go if it was inserted at a given
 * position in a leg. `stateIndex` is an index into `unit.state`, `viaIndex` the
 * insertion index within that state entry's `via` array.
 */
export interface LegSegmentMeta {
  stateIndex: number;
  viaIndex: number;
}

/**
 * Identifies the point a leg coordinate was drawn from, so a drag can rewrite
 * that coordinate for a live preview of the line.
 */
export interface LegVertexMeta {
  stateIndex: number;
  /** Absent for a waypoint coordinate, set for a via coordinate. */
  viaIndex?: number;
  isInitial?: boolean;
}

export interface UnitPathGeoJson {
  legs: GeoJsonFeature<GeoJsonLineString>[];
  arcs: GeoJsonFeature<GeoJsonLineString>[];
  waypoints: GeoJsonFeature<GeoJsonPoint>[];
  viaPoints: GeoJsonFeature<GeoJsonPoint>[];
}

export function createArcCoords(leg: Position[]): Position[] {
  const coords: Position[] = [];
  for (let i = 0; i < leg.length - 1; i++) {
    const from = leg[i];
    const to = leg[i + 1];
    const distance = distanceMeters(from, to);
    if (distance > 100000) {
      const arcLine = greatCircle(from, to, {
        offset: -100000,
        npoints: Math.min(Math.ceil(distance / 200000), 50),
      });
      if (arcLine.geometry.type === "LineString") {
        coords.push(...(arcLine.geometry.coordinates as Position[]));
      } else {
        for (const line of arcLine.geometry.coordinates) {
          coords.push(...(line as Position[]));
        }
      }
    } else {
      coords.push(from, to);
    }
  }
  return coords;
}

export function createUnitPathGeoJson(unit: Unit | NUnit): UnitPathGeoJson {
  const fmt = useTimeFormatStore();
  const state = [
    { location: unit.location, t: INITIAL_TIME },
    ...(unit.state || []),
  ].filter((s) => s.location !== undefined) as LocationState[];

  const parts = splitLocationStateIntoParts(state);

  const waypoints: GeoJsonFeature<GeoJsonPoint>[] = [];
  const viaPoints: GeoJsonFeature<GeoJsonPoint>[] = [];
  const legs: GeoJsonFeature<GeoJsonLineString>[] = [];
  const arcs: GeoJsonFeature<GeoJsonLineString>[] = [];

  // The initial waypoint is the unit's own location and has no state entry.
  const getStateIndex = (s: LocationState) =>
    s.t === INITIAL_TIME ? -1 : (unit.state?.findIndex((entry) => entry.t === s.t) ?? -1);

  let waypointIndex = 0;
  parts.forEach((part) => {
    part.forEach((s) => {
      waypointIndex += 1;
      const isInitial = s.t === INITIAL_TIME;
      const label = isInitial
        ? `#${waypointIndex}`
        : `#${waypointIndex} ${fmt.trackFormatter.format(s.t)}`;
      const stateIndex = getStateIndex(s);
      const feature: GeoJsonFeature<GeoJsonPoint> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [s.location[0], s.location[1]],
        },
        properties: {
          unitId: unit.id,
          waypointId: s.id,
          t: s.t,
          stateIndex,
          label,
          isInitial,
        },
      };
      if (s.id !== undefined) feature.id = s.id;
      waypoints.push(feature);
      s.via?.forEach((viaCoord, viaIndex) => {
        viaPoints.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [viaCoord[0], viaCoord[1]],
          },
          properties: {
            unitId: unit.id,
            stateIndex,
            viaIndex,
          },
        });
      });
    });

    if (part.length < 2) return;
    const segment: Position[] = [];
    // Where a via point inserted *at* the coordinate with the same index would
    // go. Via points belong to the state entry at the end of the leg segment
    // they precede, so a waypoint coordinate maps to an append at the end of
    // its own via list.
    const coordinateMeta: LegSegmentMeta[] = [];
    // `vertexMeta[i]` identifies the point coordinate i was drawn from.
    const vertexMeta: LegVertexMeta[] = [];
    for (let i = 0; i < part.length - 1; i++) {
      const from = part[i];
      const to = part[i + 1];
      if (i === 0) {
        const fromStateIndex = getStateIndex(from);
        segment.push([from.location[0], from.location[1]]);
        coordinateMeta.push({ stateIndex: fromStateIndex, viaIndex: 0 });
        vertexMeta.push({
          stateIndex: fromStateIndex,
          isInitial: from.t === INITIAL_TIME,
        });
      }
      const toStateIndex = getStateIndex(to);
      if (to.via) {
        to.via.forEach((v, viaIndex) => {
          segment.push([v[0], v[1]]);
          coordinateMeta.push({ stateIndex: toStateIndex, viaIndex });
          vertexMeta.push({ stateIndex: toStateIndex, viaIndex });
        });
      }
      segment.push([to.location[0], to.location[1]]);
      coordinateMeta.push({
        stateIndex: toStateIndex,
        viaIndex: to.via?.length ?? 0,
      });
      vertexMeta.push({ stateIndex: toStateIndex, isInitial: to.t === INITIAL_TIME });
    }
    legs.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: unwindCoordinates(segment),
      },
      // `segments[i]` describes the segment between coordinate i and i + 1,
      // `vertices[i]` the point coordinate i came from.
      properties: {
        unitId: unit.id,
        segments: coordinateMeta.slice(1),
        vertices: vertexMeta,
      },
    });
    arcs.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: unwindCoordinates(createArcCoords(segment)),
      },
      properties: { unitId: unit.id },
    });
  });

  return { legs, arcs, waypoints, viaPoints };
}

function squaredDistanceToSegment(p: Position, a: Position, b: Position): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  let t = 0;
  if (lengthSquared > 0) {
    t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
  }
  const ex = a[0] + t * dx - p[0];
  const ey = a[1] + t * dy - p[1];
  return ex * ex + ey * ey;
}

export interface LegSegmentHit extends LegSegmentMeta {
  unitId?: string;
}

/**
 * Finds the leg segment closest to `point`, so a grabbed leg can be resolved to
 * the via point insertion position it represents.
 */
export function findClosestLegSegment(
  legs: GeoJsonFeature<GeoJsonLineString>[],
  point: Position,
  unitId?: string,
): LegSegmentHit | null {
  let best: LegSegmentHit | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const leg of legs) {
    const legUnitId = leg.properties?.unitId as string | undefined;
    if (unitId !== undefined && legUnitId !== unitId) continue;
    const segments = leg.properties?.segments as LegSegmentMeta[] | undefined;
    if (!segments) continue;
    const coordinates = leg.geometry?.coordinates ?? [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const meta = segments[i];
      if (!meta) continue;
      const a = coordinates[i];
      const b = coordinates[i + 1];
      // Leg coordinates are unwound, so bring the query point into the same
      // longitude window before measuring.
      const reference = (a[0] + b[0]) / 2;
      const shifted: Position = [unwrapLongitude(reference, point[0]), point[1]];
      const distance = squaredDistanceToSegment(shifted, a, b);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { unitId: legUnitId, ...meta };
      }
    }
  }
  return best;
}

export function splitLocationStateIntoParts(state: LocationState[]): LocationState[][] {
  const parts: LocationState[][] = [];
  let currentPart: LocationState[] = [];
  state.forEach((s) => {
    if (s.location === null || s.interpolate === false) {
      if (currentPart.length) parts.push(currentPart);
      currentPart = [];
    } else {
      currentPart.push(s);
    }
  });
  if (currentPart.length) parts.push(currentPart);
  return parts;
}
