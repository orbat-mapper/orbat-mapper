import { describe, expect, it } from "vitest";
import {
  cellAt,
  combineViewsheds,
  gridAround,
  gridPositions,
  Visibility,
  type DemGrid,
  type LngLat,
} from ".";

/** A viewshed whose every cell reads the same. */
function uniform(center: LngLat, visibility: Visibility, masking: number) {
  const grid = gridAround(center, 1000, 21);
  const cells = grid.width * grid.height;
  return {
    grid,
    mask: new Uint8Array(cells).fill(visibility),
    masking: new Float32Array(cells).fill(masking),
  };
}

const read = (
  { grid, mask, masking }: { grid: DemGrid; mask: Uint8Array; masking: Float32Array },
  position: LngLat,
) => {
  const i = cellAt(grid, position);
  return i < 0 ? null : { visibility: mask[i], masking: masking[i] };
};

describe("cellAt", () => {
  it("finds the cell a position lies in, and none outside the grid", () => {
    const grid = gridAround([10, 50], 1000, 21);
    const positions = gridPositions(grid);
    expect(cellAt(grid, positions[0]!)).toBe(0);
    expect(cellAt(grid, positions[7 * 21 + 3]!)).toBe(7 * 21 + 3);
    expect(cellAt(grid, [10, 50])).toBe(10 * 21 + 10);
    expect(cellAt(grid, [11, 50])).toBe(-1);
    expect(cellAt(grid, [10, 49])).toBe(-1);
  });
});

describe("combineViewsheds", () => {
  it("leaves a single viewshed as it is", () => {
    const one = uniform([10, 50], Visibility.Visible, 0);
    const combined = combineViewsheds([one]);
    expect(combined.grid).toBe(one.grid);
    expect(combined.mask).toBe(one.mask);
    expect(combined.masking).toBe(one.masking);
  });

  it("covers every viewshed, and nothing between them", () => {
    const west = uniform([10, 50], Visibility.Visible, 0);
    const east = uniform([10.1, 50], Visibility.Visible, 0);
    const combined = combineViewsheds([west, east]);
    const [w, s, e, n] = combined.grid.bounds;
    const slack = 1e-9;
    expect(w).toBeLessThanOrEqual(west.grid.bounds[0] + slack);
    expect(e).toBeGreaterThanOrEqual(east.grid.bounds[2] - slack);
    expect(s).toBeLessThanOrEqual(west.grid.bounds[1] + slack);
    expect(n).toBeGreaterThanOrEqual(west.grid.bounds[3] - slack);
    expect(read(combined, [10, 50])?.visibility).toBe(Visibility.Visible);
    expect(read(combined, [10.1, 50])?.visibility).toBe(Visibility.Visible);
    expect(read(combined, [10.05, 50])?.visibility).toBe(Visibility.NoData);
    expect(read(combined, [10.05, 50])?.masking).toBeNaN();
  });

  it("shows ground as seen where any observer sees it, with the least masking height", () => {
    const hidden = uniform([10, 50], Visibility.Hidden, 50);
    const seen = uniform([10.01, 50], Visibility.Visible, 0);
    const combined = combineViewsheds([hidden, seen]);
    // Only the first reaches here; both overlap at 10.005.
    expect(read(combined, [9.995, 50])).toEqual({
      visibility: Visibility.Hidden,
      masking: 50,
    });
    expect(read(combined, [10.005, 50])).toEqual({
      visibility: Visibility.Visible,
      masking: 0,
    });
    expect(read(combined, [10.015, 50])).toEqual({
      visibility: Visibility.Visible,
      masking: 0,
    });
  });

  it("counts the observers that see each cell", () => {
    const first = uniform([10, 50], Visibility.Visible, 0);
    const second = uniform([10.01, 50], Visibility.Visible, 0);
    const blind = uniform([10.005, 50], Visibility.Hidden, 80);
    const combined = combineViewsheds([first, second, blind]);
    const seenBy = (position: LngLat) =>
      combined.seenBy![cellAt(combined.grid, position)];
    expect(seenBy([9.995, 50])).toBe(1);
    expect(seenBy([10.005, 50])).toBe(2);
    expect(seenBy([10.015, 50])).toBe(1);
  });

  it("is as fine as the finest viewshed, within the most cells a side", () => {
    const coarse = uniform([10, 50], Visibility.Visible, 0);
    const fine = (() => {
      const grid = gridAround([10.01, 50], 1000, 41);
      const cells = grid.width * grid.height;
      return {
        grid,
        mask: new Uint8Array(cells).fill(Visibility.Visible),
        masking: new Float32Array(cells).fill(0),
      };
    })();
    const combined = combineViewsheds([coarse, fine]);
    expect(combined.grid.cellSize).toBeCloseTo(fine.grid.cellSize, 0);
    const capped = combineViewsheds(
      [coarse, uniform([12, 50], Visibility.Visible, 0)],
      101,
    );
    expect(Math.max(capped.grid.width, capped.grid.height)).toBeLessThanOrEqual(101);
    expect(read(capped, [12, 50])?.visibility).toBe(Visibility.Visible);
  });
});
