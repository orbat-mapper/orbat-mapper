import type { MultiPolygon, Polygon } from "geojson";
import { booleanPointInPolygon, distance } from "@turf/turf";
import type { NUnit } from "@/types/internalModels";
import type { CurrentState } from "@/types/scenarioModels";
import { unitLegs, unitStateAt, viaPointTimes } from "./time";

/**
 * Questions about where units are at a given time, answered without moving the scenario
 * clock or changing what the map shows. They work on the units' state entries alone.
 *
 * Which side or parent a unit belongs to at a time (the timed hierarchy) is not covered.
 */

export type UnitAtTime = {
  unit: NUnit;
  /** The unit's state at the queried time. Always has a location. */
  state: CurrentState & { location: NonNullable<CurrentState["location"]> };
};

export type UnitsAtOptions = {
  /** Only units whose location at the time is inside this area. */
  within?: Polygon | MultiPolygon;
};

/** The units that have a location at `timestamp`, optionally only those inside an area. */
export function unitsAt(
  units: Iterable<NUnit>,
  timestamp: number,
  options: UnitsAtOptions = {},
): UnitAtTime[] {
  const result: UnitAtTime[] = [];
  for (const unit of units) {
    const state = unitStateAt(unit, timestamp);
    const location = state?.location;
    if (!state || !location) continue;
    if (options.within && !booleanPointInPolygon(location, options.within)) continue;
    result.push({ unit, state: { ...state, location } });
  }
  return result;
}

export type ClosestApproach = {
  /** Distance between the two units at `time`, in meters. */
  distanceMeters: number;
  time: number;
};

export type ClosestApproachOptions = {
  /** How close in time the result must be, in milliseconds. Defaults to one second. */
  toleranceMs?: number;
};

/**
 * When, within `[from, until]`, two units are closest to each other, and how far apart
 * they are then. Only times when both units have a location count. Returns `undefined`
 * if there are none.
 *
 * The interval is split wherever either unit starts or ends a leg or turns at a via
 * point. Between those times both units move at constant speed along one great-circle
 * segment each. For legs much shorter than the earth's radius, the distance then has a
 * single minimum in each span, which a golden-section search finds to within
 * `toleranceMs`. The result is a close approximation, not an exact solution.
 */
export function closestApproach(
  a: NUnit,
  b: NUnit,
  [from, until]: [number, number],
  { toleranceMs = 1000 }: ClosestApproachOptions = {},
): ClosestApproach | undefined {
  const times = [
    ...new Set([from, until, ...trackBreakpoints(a), ...trackBreakpoints(b)]),
  ]
    .filter((t) => t >= from && t <= until)
    .sort((x, y) => x - y);

  let best: ClosestApproach | undefined;
  const measureAndKeepBest = (time: number) => {
    const d = distanceAt(a, b, time);
    if (d !== undefined && (!best || d < best.distanceMeters)) {
      best = { distanceMeters: d, time };
    }
    return d;
  };

  times.forEach((t) => measureAndKeepBest(t));
  for (let i = 0; i < times.length - 1; i++) {
    const lo = times[i];
    const hi = times[i + 1];
    // Whether the units have a location only changes at state entries, which are all
    // breakpoints, so the middle of the span tells for the whole open span.
    if (hi - lo <= toleranceMs || measureAndKeepBest((lo + hi) / 2) === undefined)
      continue;
    goldenSectionSearch(lo, hi, toleranceMs, measureAndKeepBest);
  }
  return best;
}

function distanceAt(a: NUnit, b: NUnit, time: number): number | undefined {
  const locA = unitStateAt(a, time)?.location;
  const locB = unitStateAt(b, time)?.location;
  if (!locA || !locB) return undefined;
  return distance(locA, locB, { units: "meters" });
}

const INV_PHI = (Math.sqrt(5) - 1) / 2;

function goldenSectionSearch(
  lo: number,
  hi: number,
  toleranceMs: number,
  f: (t: number) => number | undefined,
) {
  let x1 = hi - INV_PHI * (hi - lo);
  let x2 = lo + INV_PHI * (hi - lo);
  let f1 = f(x1) ?? Infinity;
  let f2 = f(x2) ?? Infinity;
  while (hi - lo > toleranceMs) {
    if (f1 < f2) {
      hi = x2;
      x2 = x1;
      f2 = f1;
      x1 = hi - INV_PHI * (hi - lo);
      f1 = f(x1) ?? Infinity;
    } else {
      lo = x1;
      x1 = x2;
      f1 = f2;
      x2 = lo + INV_PHI * (hi - lo);
      f2 = f(x2) ?? Infinity;
    }
  }
}

/**
 * Times at which a unit's movement can change direction or speed: its state entries,
 * the start of each leg and the times it passes each via point. Extra times are
 * harmless, they only split the search into more spans.
 */
function trackBreakpoints(unit: NUnit): number[] {
  const times = (unit.state ?? []).map((entry) => entry.t);
  for (const leg of unitLegs(unit)) {
    times.push(leg.start, leg.end, ...viaPointTimes(leg));
  }
  return times;
}
