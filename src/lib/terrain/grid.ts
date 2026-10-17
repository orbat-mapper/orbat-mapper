import { EARTH_RADIUS, type LngLat } from "./line";
import { clampLatitude, latitudeAt, mercatorY, RAD } from "./mercator";
import type { ElevationSampler } from "./sampler";

/**
 * A square grid of cells around a centre, regular in Web Mercator: rows are
 * evenly spaced in Mercator y, not in latitude, so a raster on it lines up with
 * an image overlay on any Web Mercator map without reprojection. An odd number
 * of cells a side span the radius each way from the middle cell, which is
 * centred on the centre. Cells run west to east, then north to south.
 */
export interface DemGrid {
  center: LngLat;
  /** Metres from the centre that the grid covers. */
  radius: number;
  /** Ground metres per cell at the centre. */
  cellSize: number;
  width: number;
  height: number;
  /** The outer edges of the grid: [west, south, east, north]. */
  bounds: [number, number, number, number];
}

/** Converts grid space, where cell (column, row) is centred on (column, row),
 *  to longitude and latitude, fractional positions included; and back, to the
 *  column or row a longitude or latitude lies in, or -1 outside the grid. */
export function gridAxes({ width, height, bounds }: DemGrid) {
  const [west, south, east, north] = bounds;
  const top = mercatorY(north);
  const rowStep = (top - mercatorY(south)) / height;
  const columnStep = (east - west) / width;
  const within = (index: number, size: number) =>
    index >= 0 && index < size ? index : -1;
  return {
    lng: (x: number) => west + (x + 0.5) * columnStep,
    lat: (y: number) => latitudeAt(top - (y + 0.5) * rowStep),
    column: (lng: number) => within(Math.floor((lng - west) / columnStep), width),
    row: (lat: number) => within(Math.floor((top - mercatorY(lat)) / rowStep), height),
  };
}

/** The index of the grid's middle cell, the one on its centre. */
export function centreIndex({ width, height }: DemGrid): number {
  return ((height - 1) / 2) * width + (width - 1) / 2;
}

/** The index of the cell `position` lies in, or -1 outside the grid. */
export function cellAt(grid: DemGrid, [lng, lat]: LngLat): number {
  const axes = gridAxes(grid);
  const column = axes.column(lng);
  const row = axes.row(lat);
  return column < 0 || row < 0 ? -1 : row * grid.width + column;
}

/** How fine a grid is asked to be. */
export interface GridDetail {
  /** Metres a cell should span at most; without it, as fine as allowed. */
  cellSize?: number;
  /** The most cells a side. */
  maxSize: number;
}

export interface GridSizeOptions extends GridDetail {
  /** Metres the finest cell may span, e.g. one DEM pixel: finer cells only
   *  interpolate, which costs work and adds no detail. */
  finest?: number;
}

/** Cells a side for a grid of `radius` metres: odd, so the centre has a cell
 *  of its own, and at least 3. */
export function gridSizeFor(
  radius: number,
  { cellSize, maxSize, finest = 0 }: GridSizeOptions,
): number {
  let half = Math.floor((maxSize - 1) / 2);
  if (cellSize) half = Math.min(half, Math.ceil(radius / cellSize));
  if (finest > 0) half = Math.min(half, Math.floor(radius / finest));
  return 2 * Math.max(1, half) + 1;
}

export function gridAround(center: LngLat, radius: number, size: number): DemGrid {
  if (size < 3 || size % 2 === 0)
    throw new RangeError(`A grid needs an odd size, not ${size}.`);
  const half = (size - 1) / 2;
  const cellSize = radius / half;
  const [lng, lat] = center;
  const clamped = clampLatitude(lat);
  // Mercator stretches the ground by 1 / cos(latitude).
  const extent = ((half + 0.5) * cellSize) / (EARTH_RADIUS * Math.cos(clamped * RAD));
  const y = mercatorY(clamped);
  return {
    center,
    radius,
    cellSize,
    width: size,
    height: size,
    bounds: [
      lng - extent / RAD,
      latitudeAt(y - extent),
      lng + extent / RAD,
      latitudeAt(y + extent),
    ],
  };
}

/** The centre of every cell, in grid order. */
export function gridPositions(grid: DemGrid): LngLat[] {
  const { lng, lat } = gridAxes(grid);
  const positions: LngLat[] = [];
  for (let row = 0; row < grid.height; row++) {
    const latitude = lat(row);
    for (let column = 0; column < grid.width; column++)
      positions.push([lng(column), latitude]);
  }
  return positions;
}

/** The ground height of every cell in metres, NaN where the DEM has no data. */
export async function sampleGrid(
  sampler: ElevationSampler,
  grid: DemGrid,
): Promise<Float32Array> {
  return new Float32Array(
    await sampler.heights(gridPositions(grid), { resolution: grid.cellSize }),
  );
}
