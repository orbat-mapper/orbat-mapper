import { centreIndex, gridAxes, type DemGrid } from "./grid";
import { EARTH_RADIUS } from "./line";
import { curvatureDrop, STANDARD_REFRACTION } from "./lineOfSight";
import { RAD } from "./mercator";

/** The value of each cell in a viewshed mask. */
export const Visibility = { Hidden: 0, Visible: 1, NoData: 255 } as const;
export type Visibility = (typeof Visibility)[keyof typeof Visibility];

/** Metres from a point to every cell centre, by haversine. The latitude terms
 *  vary only by row and the longitude term only by column, so each cell costs
 *  one square root and one arcsine. */
function distancesFrom(grid: DemGrid, [lng0, lat0]: [number, number]): Float32Array {
  const { width, height } = grid;
  const { lng, lat } = gridAxes(grid);
  const cos0 = Math.cos(lat0 * RAD);
  const across = Float64Array.from(
    { length: width },
    (_, column) => Math.sin(((lng(column) - lng0) * RAD) / 2) ** 2,
  );
  // Single precision is centimetres at 200 km, and halves the largest buffer.
  const distances = new Float32Array(width * height);
  for (let row = 0; row < height; row++) {
    const latitude = lat(row);
    const along = Math.sin(((latitude - lat0) * RAD) / 2) ** 2;
    const scale = cos0 * Math.cos(latitude * RAD);
    for (let column = 0; column < width; column++) {
      const h = along + scale * across[column]!;
      distances[row * width + column] =
        2 * EARTH_RADIUS * Math.asin(Math.sqrt(Math.min(1, h)));
    }
  }
  return distances;
}

/** What an observer's height is measured from: the ground for someone
 *  standing or a mast, sea level for an aircraft or drone holding an altitude. */
export type ObserverAbove = "ground" | "sea-level";

export interface MaskingOptions {
  /** Metres above the ground at the grid's centre, or above sea level. */
  observerHeight: number;
  /** What `observerHeight` is measured from; the ground by default. */
  observerAbove?: ObserverAbove;
  /** Whether the grid's radius is the straight-line distance from the eye to
   *  the ground, as a sensor or radio reaches, rather than the distance along
   *  the ground. Ground beyond it still masks. False by default. */
  slantRange?: boolean;
  /** Coefficient of atmospheric refraction; 0.13 is the standard atmosphere. */
  refraction?: number;
}

export interface ViewshedOptions extends MaskingOptions {
  /** Metres above the ground a cell must be seen at, e.g. 0 for the ground itself. */
  targetHeight: number;
}

/**
 * The masking height of every cell, seen from the centre of a grid within its
 * radius: how many metres above the ground a target there must rise to be
 * seen, 0 where the ground itself is. NaN where there is no data and beyond
 * the radius. Also called minimum visible height, or low-level coverage.
 *
 * An R2 sweep casts a ray from the observer to every edge cell and walks it
 * outwards, keeping the steepest angle to the ground so far; a cell's masking
 * height on a ray is how far below that sight line its ground lies, and the
 * cell keeps the least over every ray through it. Each cell is lowered by the
 * Earth's curvature, less what refraction bends back: d²/(2R)·(1−k). Cells
 * without data neither block the view nor are seen.
 */
export function maskingHeights(
  grid: DemGrid,
  heights: Float32Array,
  {
    observerHeight,
    observerAbove = "ground",
    slantRange = false,
    refraction = STANDARD_REFRACTION,
  }: MaskingOptions,
): Float32Array {
  const { width, height, center, radius } = grid;
  const masking = new Float32Array(width * height).fill(NaN);
  const column0 = (width - 1) / 2;
  const row0 = (height - 1) / 2;
  const origin = centreIndex(grid);
  const ground = heights[origin]!;
  if (Number.isNaN(ground)) return masking;
  const eye = observerAbove === "sea-level" ? observerHeight : ground + observerHeight;
  masking[origin] = 0;

  const reach = radius * (1 + 1e-9);
  const slantReach = reach * reach;
  const distances = distancesFrom(grid, center);

  function cast(column: number, row: number) {
    const dc = column - column0;
    const dr = row - row0;
    const steps = Math.max(Math.abs(dc), Math.abs(dr));
    let steepest = -Infinity;
    for (let step = 1; step <= steps; step++) {
      const i =
        (row0 + Math.round((dr * step) / steps)) * width +
        column0 +
        Math.round((dc * step) / steps);
      const d = distances[i]!;
      if (d > reach) return;
      const h = heights[i]!;
      if (Number.isNaN(h)) continue;
      const surface = h - curvatureDrop(d, refraction) - eye;
      // Slant range is never shorter than the distance along the ground, so
      // the ray walks on past a cell out of reach: what lies beyond may rise
      // back into it.
      if (!slantRange || d * d + surface * surface <= slantReach) {
        const below = Math.max(0, steepest * d - surface);
        // NaN, not yet reached by a ray, compares false and takes the first.
        if (!(masking[i]! <= below)) masking[i] = below;
      }
      steepest = Math.max(steepest, surface / d);
    }
  }

  for (let column = 0; column < width; column++) {
    cast(column, 0);
    cast(column, height - 1);
  }
  for (let row = 1; row < height - 1; row++) {
    cast(0, row);
    cast(width - 1, row);
  }
  return masking;
}

/**
 * A sector of fire: the ground clockwise from the `left` limit to the `right`,
 * between a minimum and a maximum range. Bearings are degrees clockwise from
 * true north, ranges metres from the observer.
 */
export interface RangeFan {
  left: number;
  right: number;
  minRange: number;
  maxRange: number;
}

const clockwise = (from: number, to: number) => (((to - from) % 360) + 360) % 360;

/** Masking heights cut to a range fan: NaN at every cell whose centre lies
 *  outside it. The sweep that made them saw the whole radius, so terrain
 *  outside the fan still masks the ground inside it. */
export function clipToFan(
  grid: DemGrid,
  masking: Float32Array,
  { left, right, minRange, maxRange }: RangeFan,
): Float32Array {
  const { width, height, center } = grid;
  const [lng0, lat0] = center;
  const { lng, lat } = gridAxes(grid);
  const sweep = clockwise(left, right);
  // Ranges compared as haversine terms, sin²(d / 2R), as `distancesFrom` builds
  // them, so no cell needs its square root and arcsine.
  const term = (range: number) =>
    Math.sin(Math.min(range / (2 * EARTH_RADIUS), Math.PI / 2)) ** 2;
  const nearest = term(minRange);
  const farthest = term(maxRange);
  const sin0 = Math.sin(lat0 * RAD);
  const cos0 = Math.cos(lat0 * RAD);
  // Every term that varies only by column, once per column.
  const half = new Float64Array(width);
  const sinAcross = new Float64Array(width);
  const cosAcross = new Float64Array(width);
  for (let column = 0; column < width; column++) {
    const dLng = (lng(column) - lng0) * RAD;
    half[column] = Math.sin(dLng / 2) ** 2;
    sinAcross[column] = Math.sin(dLng);
    cosAcross[column] = Math.cos(dLng);
  }
  const clipped = new Float32Array(masking.length).fill(NaN);
  const origin = centreIndex(grid);
  for (let row = 0; row < height; row++) {
    const latitude = lat(row) * RAD;
    const sin = Math.sin(latitude);
    const cos = Math.cos(latitude);
    const along = Math.sin((latitude - lat0 * RAD) / 2) ** 2;
    const scale = cos0 * cos;
    for (let column = 0; column < width; column++) {
      const i = row * width + column;
      const h = along + scale * half[column]!;
      if (h < nearest || h > farthest) continue;
      // The observer's own cell has no bearing; it is in any fan that reaches it.
      if (i !== origin) {
        const bearing =
          Math.atan2(
            sinAcross[column]! * cos,
            cos0 * sin - sin0 * cos * cosAcross[column]!,
          ) / RAD;
        if (clockwise(left, bearing) > sweep) continue;
      }
      clipped[i] = masking[i]!;
    }
  }
  return clipped;
}

/** The viewshed for a target `targetHeight` metres above the ground, from a
 *  masking height map: one `Visibility` per cell. */
export function visibleAt(masking: Float32Array, targetHeight: number): Uint8Array {
  const mask = new Uint8Array(masking.length);
  for (let i = 0; i < masking.length; i++) {
    const below = masking[i]!;
    mask[i] = Number.isNaN(below)
      ? Visibility.NoData
      : below <= targetHeight
        ? Visibility.Visible
        : Visibility.Hidden;
  }
  return mask;
}

/** What can be seen from the centre of a grid, within its radius: one
 *  `Visibility` per cell, in grid order. See `maskingHeights`. */
export function viewshed(
  grid: DemGrid,
  heights: Float32Array,
  { targetHeight, ...options }: ViewshedOptions,
): Uint8Array {
  return visibleAt(maskingHeights(grid, heights, options), targetHeight);
}

/** The share of the cells with data that can be seen, or null if none has data. */
export function visibleShare(mask: Uint8Array): number | null {
  let visible = 0;
  let hidden = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === Visibility.Visible) visible++;
    else if (mask[i] === Visibility.Hidden) hidden++;
  }
  return visible + hidden ? visible / (visible + hidden) : null;
}

export type Rgba = readonly [r: number, g: number, b: number, a: number];

/** One RGBA pixel as a 32-bit word: the bytes land in RGBA order on
 *  little-endian platforms, which are all a browser runs on. */
const pack = ([r, g, b, a]: Rgba) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;

/** RGBA pixels for a mask, one per cell, for an image overlay: each visible and
 *  hidden cell in its colour, cells without data clear. */
export function maskToRgba(
  mask: Uint8Array,
  colors: { visible: Rgba; hidden: Rgba },
): Uint8ClampedArray<ArrayBuffer> {
  const pixels = new Uint8ClampedArray(mask.length * 4);
  // One 32-bit write per cell.
  const words = new Uint32Array(pixels.buffer);
  const visible = pack(colors.visible);
  const hidden = pack(colors.hidden);
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === Visibility.Visible) words[i] = visible;
    else if (mask[i] === Visibility.Hidden) words[i] = hidden;
  }
  return pixels;
}

/** RGBA pixels for a height per cell, one per cell, for an image overlay: each
 *  cell in the colour of the first band whose `max` it does not exceed, cells
 *  without data (NaN) or above every band clear. */
export function heightsToRgba(
  values: Float32Array,
  bands: readonly { readonly max: number; readonly color: Rgba }[],
): Uint8ClampedArray<ArrayBuffer> {
  const pixels = new Uint8ClampedArray(values.length * 4);
  const words = new Uint32Array(pixels.buffer);
  const maxes = bands.map(({ max }) => max);
  const packed = bands.map(({ color }) => pack(color));
  for (let i = 0; i < values.length; i++) {
    const value = values[i]!;
    if (Number.isNaN(value)) continue;
    for (let band = 0; band < maxes.length; band++)
      if (value <= maxes[band]!) {
        words[i] = packed[band]!;
        break;
      }
  }
  return pixels;
}
