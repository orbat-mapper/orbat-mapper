import type { Position } from "geojson";
import { distanceMeters } from "@/geo/distance";
import type { NState, NUnit } from "@/types/internalModels";
import { convertSpeedToMetric } from "@/utils/convert";

const DEFAULT_SPEED_KMH = 30;

/**
 * A point on a unit's drawn path. The unit's initial location has no timestamp
 * of its own, so `t` is left out for it.
 */
export interface TrackPoint {
  location: Position;
  t?: number;
}

export interface FollowingLocationState {
  index: number;
  state: NState;
}

/**
 * The point a state entry is travelled to from: the closest preceding state
 * entry with a location, or the unit's own location when there is none.
 * Returns null when the path is broken before `stateIndex`, since there is no
 * leg to convert points on in that case.
 */
export function findPrecedingTrackPoint(
  unit: NUnit,
  stateIndex: number,
): TrackPoint | null {
  for (let i = stateIndex - 1; i >= 0; i--) {
    const s = unit.state?.[i];
    if (!s || s.location === undefined) continue;
    // A null location takes the unit off the map and a non-interpolated entry
    // starts a new part, so neither leaves a leg behind it.
    if (s.location === null || s.interpolate === false) return null;
    return { location: s.location, t: s.t };
  }
  return unit.location ? { location: unit.location } : null;
}

/**
 * The state entry the path continues to after `stateIndex`. Returns null when
 * the path ends or is broken there.
 */
export function findFollowingLocationState(
  unit: NUnit,
  stateIndex: number,
): FollowingLocationState | null {
  const state = unit.state ?? [];
  for (let i = stateIndex + 1; i < state.length; i++) {
    const s = state[i];
    if (!s || s.location === undefined) continue;
    if (s.location === null || s.interpolate === false) return null;
    return { index: i, state: s };
  }
  return null;
}

/** The unit's own speed in m/s, falling back to a default when it has none. */
export function getUnitSpeedMps(unit: NUnit): number {
  const speedValue = unit.properties?.averageSpeed || unit.properties?.maxSpeed;
  const speed = speedValue
    ? convertSpeedToMetric(speedValue.value, speedValue.uom)
    : undefined;
  return speed !== undefined && speed > 0
    ? speed
    : convertSpeedToMetric(DEFAULT_SPEED_KMH, "km/h");
}

/** Distance in meters from the first coordinate to each of the others. */
function cumulativeLengths(coordinates: Position[]): number[] {
  const lengths = [0];
  for (let i = 1; i < coordinates.length; i++) {
    lengths.push(lengths[i - 1]! + distanceMeters(coordinates[i - 1]!, coordinates[i]!));
  }
  return lengths;
}

/**
 * The timestamp a unit passes the via point at `viaIndex` of `entry` at. The
 * unit covers the leg at a constant average speed, so the time is the leg's
 * time span split by the distance travelled so far. When the leg has no usable
 * start time — it begins at the unit's untimed initial location — the unit's
 * own speed is used to work backwards from the arrival time instead.
 */
export function computeViaPointTime(
  prev: TrackPoint,
  entry: NState,
  viaIndex: number,
  fallbackSpeedMps: number,
): number {
  const lengths = cumulativeLengths([
    prev.location,
    ...(entry.via ?? []),
    entry.location!,
  ]);
  const total = lengths[lengths.length - 1]!;
  const travelled = lengths[viaIndex + 1]!;
  const startTime = entry.viaStartTime ?? prev.t;

  let t: number;
  if (startTime === undefined || total <= 0 || entry.t <= startTime) {
    t = entry.t - ((total - travelled) / fallbackSpeedMps) * 1000;
  } else {
    t = startTime + ((entry.t - startTime) * travelled) / total;
  }

  // Keep the new waypoint strictly inside the leg, so neither half of the split
  // ends up with a zero-length time span.
  const upper = entry.t - 1;
  let clamped = Math.min(Math.round(t), upper);
  if (startTime !== undefined)
    clamped = Math.max(clamped, Math.min(startTime + 1, upper));
  return clamped;
}

/** True when the via point can be turned into a waypoint of its own. */
export function canConvertViaPointToWaypoint(
  unit: NUnit,
  stateIndex: number,
  viaIndex: number,
): boolean {
  const s = unit.state?.[stateIndex];
  if (!s?.location || s.interpolate === false) return false;
  if (!s.via || viaIndex < 0 || viaIndex >= s.via.length) return false;
  return findPrecedingTrackPoint(unit, stateIndex) !== null;
}

/** True when the waypoint can be turned into a via point on the merged leg. */
export function canConvertWaypointToViaPoint(unit: NUnit, stateIndex: number): boolean {
  const s = unit.state?.[stateIndex];
  if (!s?.location || s.interpolate === false) return false;
  if (!findPrecedingTrackPoint(unit, stateIndex)) return false;
  return findFollowingLocationState(unit, stateIndex) !== null;
}
