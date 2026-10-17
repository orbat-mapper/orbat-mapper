import { distanceBetween, type LngLat } from "./line";
import type { ElevationSampler } from "./sampler";

export interface ExtremeNearOptions {
  /** Metres from the centre to look. */
  radius: number;
  find: "highest" | "lowest";
  /** Ground to keep while it is still within reach and level with the
   *  extreme, e.g. where the last search landed; the centre by default. */
  prefer?: LngLat;
  signal?: AbortSignal;
}

/** Metres within which ground counts as level with the extreme: a DEM's noise
 *  would otherwise send the point across a plateau or a lake for centimetres. */
const LEVEL = 0.5;
/** The most pixels across the radius the search reads, so it stays quick
 *  enough to run on every move of a drag. */
const MAX_ACROSS = 81;
/** How far round a summit it must be the highest, as a share of the radius. */
const PROMINENCE = 0.5;

/** The greatest value within `reach` cells of each, along rows (`stride` 1)
 *  or columns (`stride` the width) of a square block; NaN is no value. */
function slidingMax(
  values: Float64Array,
  width: number,
  reach: number,
  stride: 1 | number,
) {
  const result = new Float64Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const at = stride === 1 ? i % width : Math.floor(i / width);
    let max = -Infinity;
    for (let k = Math.max(0, at - reach); k <= Math.min(width - 1, at + reach); k++) {
      const value = values[i + (k - at) * stride]!;
      if (value > max) max = value;
    }
    result[i] = max;
  }
  return result;
}

/**
 * The highest summit, or lowest pit, within `radius` metres of `center`, and
 * its height: ground that is the highest (or lowest) for half the radius
 * round it. Null where there is none, as on a slope, whose highest ground
 * within reach would lie on the rim and move with it, or without data.
 *
 * Read from the DEM's own pixels, so the same summit is found at the same
 * place and height wherever the search is centred. Of the summits level with
 * the extreme, the one nearest `prefer` (or the centre) is taken, so the point
 * stays put on a plateau or a lake, or on the first of two summits as high.
 */
export async function extremeNear(
  sampler: ElevationSampler,
  center: LngLat,
  { radius, find, prefer, signal }: ExtremeNearOptions,
): Promise<{ position: LngLat; height: number } | null> {
  const around = radius * PROMINENCE;
  const { width, positions, heights, resolution } = await sampler.pixelsAround(
    center,
    radius + around,
    { maxAcross: MAX_ACROSS * (1 + PROMINENCE), signal },
  );
  const sign = find === "highest" ? 1 : -1;
  const values = heights.map((height) => height * sign);
  const reach = Math.max(1, Math.round(around / resolution));
  const nearby = slidingMax(slidingMax(values, width, reach, 1), width, reach, width);

  const summits: number[] = [];
  let extreme = -Infinity;
  values.forEach((value, i) => {
    if (!(value >= nearby[i]! - LEVEL) || distanceBetween(center, positions[i]!) > radius)
      return;
    summits.push(i);
    if (value > extreme) extreme = value;
  });
  if (!summits.length) return null;

  const anchor = prefer && distanceBetween(center, prefer) <= radius ? prefer : center;
  let best = -1;
  let nearest = Infinity;
  for (const i of summits) {
    if (values[i]! < extreme - LEVEL) continue;
    const distance = distanceBetween(anchor, positions[i]!);
    if (distance < nearest) {
      best = i;
      nearest = distance;
    }
  }
  return { position: positions[best]!, height: heights[best]! };
}
