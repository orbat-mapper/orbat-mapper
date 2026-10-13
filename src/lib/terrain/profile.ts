import type { LineString } from "geojson";
import { densifyLine, lineLength, type DenseLine } from "./line";
import type { ElevationSampler } from "./sampler";

/** Ground elevation in metres along a densified line; null where the DEM has no data. */
export interface ElevationProfile extends DenseLine {
  elevations: (number | null)[];
}

export interface ProfileStats {
  /** Metres along the line. */
  length: number;
  minElevation: number | null;
  maxElevation: number | null;
  /** Total ascent and descent in metres, both positive. */
  climb: number;
  descent: number;
  /** The largest |rise / run| between neighbouring samples, as a fraction. */
  steepestGrade: number | null;
}

/** A gap in the data is not bridged: a climb or grade needs both samples. */
export function profileStats({ distances, elevations }: ElevationProfile): ProfileStats {
  let minElevation: number | null = null;
  let maxElevation: number | null = null;
  let climb = 0;
  let descent = 0;
  let steepestGrade: number | null = null;
  elevations.forEach((elevation, i) => {
    if (elevation === null) return;
    minElevation = Math.min(minElevation ?? elevation, elevation);
    maxElevation = Math.max(maxElevation ?? elevation, elevation);
    const previous = elevations[i - 1];
    if (previous === null || previous === undefined) return;
    const rise = elevation - previous;
    if (rise > 0) climb += rise;
    else descent -= rise;
    const run = distances[i]! - distances[i - 1]!;
    if (run > 0) steepestGrade = Math.max(steepestGrade ?? 0, Math.abs(rise) / run);
  });
  return {
    length: distances[distances.length - 1] ?? 0,
    minElevation,
    maxElevation,
    climb,
    descent,
    steepestGrade,
  };
}

/** The sample nearest a distance along the line: distances only grow. */
export function profileIndexAt(
  { distances }: ElevationProfile,
  distance: number,
): number {
  let lo = 0;
  let hi = distances.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (distances[mid]! < distance) lo = mid + 1;
    else hi = mid;
  }
  return lo > 0 && distance - distances[lo - 1]! < distances[lo]! - distance
    ? lo - 1
    : lo;
}

/** Enough to draw a chart, few enough to sample quickly. */
const MAX_SAMPLES = 500;

export interface ElevationProfileOptions {
  /** Metres between samples; defaults to the line's length over 500. */
  spacing?: number;
  signal?: AbortSignal;
}

/** Ground elevation along a line, sampled at a resolution matching the spacing. */
export async function elevationProfile(
  line: LineString,
  sampler: ElevationSampler,
  { spacing, signal }: ElevationProfileOptions = {},
): Promise<ElevationProfile> {
  const step = spacing ?? lineLength(line) / MAX_SAMPLES;
  const dense = densifyLine(line, step);
  const elevations = await sampler.sample(dense.coordinates, {
    resolution: step,
    signal,
  });
  return { ...dense, elevations };
}
