import { gridAxes, type DemGrid } from "./grid";
import { EARTH_RADIUS } from "./line";
import { latitudeAt, mercatorY, RAD } from "./mercator";
import { Visibility } from "./viewshed";

/** What a viewshed shows, cell by cell over its grid. */
export interface Coverage {
  grid: DemGrid;
  /** One `Visibility` per cell, in grid order. */
  mask: Uint8Array;
  /** Metres a target must rise to be seen, per cell; NaN where there is no data. */
  masking: Float32Array;
  /** How many observers see each cell, for viewsheds combined; up to 255. */
  seenBy?: Uint8Array;
}

/**
 * Several viewsheds as one: ground is seen where any observer sees it, hidden
 * where some observer covers it but none sees it, and its masking height is
 * the least of any observer's; `seenBy` counts the observers that see each
 * cell. The combined grid spans them all, as fine as
 * the finest, unless that takes more than `maxSize` cells a side. A single
 * viewshed comes back as it is.
 *
 * Every grid is regular in Web Mercator, so each cell of the combined grid
 * reads the cell of each viewshed its centre falls in; the column and row of
 * that cell are worked out once per column and once per row.
 */
export function combineViewsheds(
  viewsheds: readonly Coverage[],
  maxSize = 4097,
): Coverage {
  if (viewsheds.length === 1) return viewsheds[0]!;
  if (!viewsheds.length) throw new RangeError("Nothing to combine.");
  let west = Infinity;
  let east = -Infinity;
  let top = -Infinity;
  let bottom = Infinity;
  // Square cells in Mercator, in radians.
  let step = Infinity;
  for (const { grid } of viewsheds) {
    const [w, s, e, n] = grid.bounds;
    west = Math.min(west, w * RAD);
    east = Math.max(east, e * RAD);
    top = Math.max(top, mercatorY(n));
    bottom = Math.min(bottom, mercatorY(s));
    step = Math.min(step, ((e - w) * RAD) / grid.width);
  }
  step = Math.max(step, Math.max(east - west, top - bottom) / maxSize);
  const width = Math.max(1, Math.min(maxSize, Math.ceil((east - west) / step)));
  const height = Math.max(1, Math.min(maxSize, Math.ceil((top - bottom) / step)));
  bottom = top - height * step;
  const centerLat = latitudeAt((top + bottom) / 2);
  const grid: DemGrid = {
    center: [(west + (width * step) / 2) / RAD, centerLat],
    radius:
      ((Math.max(width, height) * step) / 2) * EARTH_RADIUS * Math.cos(centerLat * RAD),
    cellSize: step * EARTH_RADIUS * Math.cos(centerLat * RAD),
    width,
    height,
    bounds: [
      west / RAD,
      latitudeAt(bottom),
      (west + width * step) / RAD,
      latitudeAt(top),
    ],
  };
  const cells = width * height;
  const mask = new Uint8Array(cells).fill(Visibility.NoData);
  const masking = new Float32Array(cells).fill(NaN);
  const seenBy = new Uint8Array(cells);
  const { lng, lat } = gridAxes(grid);

  for (const viewshed of viewsheds) {
    const source = viewshed.grid;
    const axes = gridAxes(source);
    // Each column of the combined grid's column in this one, or -1; rows alike.
    const columns = Int32Array.from({ length: width }, (_, column) =>
      axes.column(lng(column)),
    );
    const rows = Int32Array.from({ length: height }, (_, row) => axes.row(lat(row)));
    // The columns it covers run in one stretch: loop over just those.
    const first = columns.findIndex((across) => across >= 0);
    if (first < 0) continue;
    let last = width - 1;
    while (columns[last]! < 0) last--;
    for (let row = 0; row < height; row++) {
      const from = rows[row]!;
      if (from < 0) continue;
      for (let column = first; column <= last; column++) {
        const across = columns[column]!;
        if (across < 0) continue;
        const i = from * source.width + across;
        const seen = viewshed.mask[i]!;
        if (seen === Visibility.NoData) continue;
        const o = row * width + column;
        if (seen === Visibility.Visible && seenBy[o]! < 255) seenBy[o] = seenBy[o]! + 1;
        if (mask[o] !== Visibility.Visible) mask[o] = seen;
        const below = viewshed.masking[i]!;
        if (!(masking[o]! <= below)) masking[o] = below;
      }
    }
  }
  return { grid, mask, masking, seenBy };
}
