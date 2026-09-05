import type { Position } from "geojson";

const BISECT_STEPS = 18;

/** Sample a projected grid line densely enough to follow its curvature. */
export function gridLineSampleCount(length: number, spacing: number): number {
  return Math.max(8, Math.min(512, Math.ceil(length / Math.max(500, spacing * 5))));
}

export interface SampledLineClip<P> {
  lerp(a: P, b: P, ratio: number): P;
  toCoordinate(point: P): Position;
  isValid(coordinate: Position): boolean;
}

/**
 * Walk a straight line in a projected space and return the runs that stay
 * inside the mode's validity envelope, bisecting to land on each boundary.
 */
export function clipSampledLine<P>(
  start: P,
  end: P,
  sampleCount: number,
  clip: SampledLineClip<P>,
): Position[][] {
  const boundary = (validPoint: P, invalidPoint: P): Position => {
    let valid = validPoint;
    let invalid = invalidPoint;
    for (let index = 0; index < BISECT_STEPS; index++) {
      const middle = clip.lerp(valid, invalid, 0.5);
      if (clip.isValid(clip.toCoordinate(middle))) valid = middle;
      else invalid = middle;
    }
    return clip.toCoordinate(valid);
  };

  const samples = Array.from({ length: sampleCount + 1 }, (_, index) => {
    const point = clip.lerp(start, end, index / sampleCount);
    const coordinate = clip.toCoordinate(point);
    return { point, coordinate, valid: clip.isValid(coordinate) };
  });

  const segments: Position[][] = [];
  let current: Position[] = [];
  for (let index = 0; index < samples.length; index++) {
    const sample = samples[index]!;
    const previous = samples[index - 1];
    if (sample.valid) {
      if (previous && !previous.valid)
        current.push(boundary(sample.point, previous.point));
      current.push(sample.coordinate);
    } else if (previous?.valid) {
      current.push(boundary(previous.point, sample.point));
      if (current.length >= 2) segments.push(current);
      current = [];
    }
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

export interface ProjectedEnvelope {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface LatLonRect {
  west: number;
  east: number;
  south: number;
  north: number;
}

/**
 * Walk a lat/lon rectangle's four edges and return the projected bounding box.
 * Sampling the edges rather than the corners keeps the envelope tight where the
 * projection curves; samples the projector rejects are skipped.
 */
export function projectedRectEnvelope(
  rect: LatLonRect,
  project: (coordinate: readonly [number, number]) => { x: number; y: number } | null,
  sampleCount = 8,
): ProjectedEnvelope {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let index = 0; index <= sampleCount; index++) {
    const ratio = index / sampleCount;
    const longitude = rect.west + (rect.east - rect.west) * ratio;
    const latitude = rect.south + (rect.north - rect.south) * ratio;
    for (const coordinate of [
      [longitude, rect.south],
      [longitude, rect.north],
      [rect.west, latitude],
      [rect.east, latitude],
    ] as const) {
      const point = project(coordinate);
      if (!point) continue;
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
  }
  return { minX, maxX, minY, maxY };
}
