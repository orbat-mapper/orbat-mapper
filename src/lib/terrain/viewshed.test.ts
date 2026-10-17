import { describe, expect, it } from "vitest";
import {
  clipToFan,
  gridAround,
  gridPositions,
  heightsToRgba,
  lineLength,
  maskingHeights,
  sampleGrid,
  viewshed,
  visibleShare,
  Visibility,
  type DemGrid,
  type ElevationSampler,
  type LngLat,
} from ".";

const distance = (a: LngLat, b: LngLat) =>
  lineLength({ type: "LineString", coordinates: [a, b] });

/** Heights for every cell of a grid, from its column and row. */
function heightsOf(grid: DemGrid, height: (column: number, row: number) => number) {
  const heights = new Float32Array(grid.width * grid.height);
  for (let row = 0; row < grid.height; row++)
    for (let column = 0; column < grid.width; column++)
      heights[row * grid.width + column] = height(column, row);
  return heights;
}

const at = (grid: DemGrid, mask: Uint8Array, column: number, row: number) =>
  mask[row * grid.width + column];

const eyes = { observerHeight: 2, targetHeight: 2 };

describe("gridAround", () => {
  it("centres the observer in an odd, square grid of cells about cellSize apart", () => {
    const grid = gridAround([10, 0], 1000, 21);
    expect(grid).toMatchObject({ width: 21, height: 21, cellSize: 100 });
    const positions = gridPositions(grid);
    const centre = positions[10 * 21 + 10]!;
    expect(centre[0]).toBeCloseTo(10, 9);
    expect(centre[1]).toBeCloseTo(0, 9);
    expect(distance(centre, positions[10 * 21 + 11]!)).toBeCloseTo(100, 0);
    expect(distance(centre, positions[11 * 21 + 10]!)).toBeCloseTo(100, 0);
  });

  it("keeps cells square on the ground away from the equator", () => {
    const grid = gridAround([10, 60], 1000, 21);
    const positions = gridPositions(grid);
    const centre = positions[10 * 21 + 10]!;
    expect(centre[1]).toBeCloseTo(60, 9);
    expect(distance(centre, positions[10 * 21 + 11]!)).toBeCloseTo(100, 0);
    expect(distance(centre, positions[11 * 21 + 10]!)).toBeCloseTo(100, 0);
  });

  it("is regular in Web Mercator, so an image overlay needs no reprojection", () => {
    const grid = gridAround([0, 60], 50_000, 21);
    const mercatorY = (lat: number) =>
      Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    const ys = gridPositions(grid)
      .filter((_, i) => i % grid.width === 0)
      .map(([, lat]) => mercatorY(lat));
    const steps = ys.slice(1).map((y, i) => ys[i]! - y);
    for (const step of steps) expect(step).toBeCloseTo(steps[0]!, 12);
    const [, south, , north] = grid.bounds;
    expect(mercatorY(north) - mercatorY(south)).toBeCloseTo(steps[0]! * grid.height, 12);
  });

  it("needs an odd size, so the centre has a middle cell", () => {
    expect(() => gridAround([0, 0], 1000, 20)).toThrow(RangeError);
  });
});

describe("sampleGrid", () => {
  it("samples every cell at the grid's resolution, with NaN where there is no data", async () => {
    const grid = gridAround([0, 0], 100, 3);
    let resolution: number | undefined;
    const sampler: ElevationSampler = {
      sample: async () => [],
      async heights(positions, options) {
        resolution = options?.resolution;
        return Float64Array.from(positions, ([lng], i) =>
          i === 0 ? NaN : Math.round(lng * 1e5),
        );
      },
      finestResolution: () => 1,
      pixelsAround: async () => {
        throw new Error("not used by sampleGrid");
      },
    };
    const heights = await sampleGrid(sampler, grid);
    expect(resolution).toBe(100);
    expect(heights).toHaveLength(9);
    expect(heights[0]).toBeNaN();
    expect(heights[4]).toBe(0);
    expect(heights[5]).toBeCloseTo(90, -1);
  });
});

describe("viewshed", () => {
  const grid = gridAround([0, 0], 1000, 21);

  it("sees all of flat ground within the radius, and nothing beyond it", () => {
    const mask = viewshed(
      grid,
      heightsOf(grid, () => 100),
      eyes,
    );
    expect(at(grid, mask, 10, 10)).toBe(Visibility.Visible);
    expect(at(grid, mask, 20, 10)).toBe(Visibility.Visible);
    expect(at(grid, mask, 17, 17)).toBe(Visibility.Visible);
    expect(at(grid, mask, 0, 0)).toBe(Visibility.NoData);
    expect(at(grid, mask, 20, 20)).toBe(Visibility.NoData);
  });

  it("hides the ground behind a ridge, but not the ridge itself", () => {
    const ridge = heightsOf(grid, (column) => (column === 14 ? 200 : 100));
    const mask = viewshed(grid, ridge, eyes);
    expect(at(grid, mask, 12, 10)).toBe(Visibility.Visible);
    expect(at(grid, mask, 14, 10)).toBe(Visibility.Visible);
    expect(at(grid, mask, 16, 10)).toBe(Visibility.Hidden);
    expect(at(grid, mask, 19, 12)).toBe(Visibility.Hidden);
    expect(at(grid, mask, 6, 10)).toBe(Visibility.Visible);
  });

  it("sees a target tall enough to show over the ridge", () => {
    const ridge = heightsOf(grid, (column) => (column === 14 ? 200 : 100));
    const mask = viewshed(grid, ridge, { observerHeight: 2, targetHeight: 200 });
    expect(at(grid, mask, 16, 10)).toBe(Visibility.Visible);
  });

  it("loses sight over the horizon of a curved Earth", () => {
    // Two 2 m eyes see each other to about 10.8 km with standard refraction.
    const sea = gridAround([0, 0], 20_000, 81);
    const mask = viewshed(
      sea,
      heightsOf(sea, () => 0),
      eyes,
    );
    const centre = (sea.width - 1) / 2;
    expect(at(sea, mask, centre + 10, centre)).toBe(Visibility.Visible);
    expect(at(sea, mask, centre + 36, centre)).toBe(Visibility.Hidden);
    const flat = viewshed(
      sea,
      heightsOf(sea, () => 0),
      { ...eyes, refraction: 1 },
    );
    // A refraction of 1 bends sight lines as much as the Earth curves.
    expect(at(sea, flat, centre + 36, centre)).toBe(Visibility.Visible);
  });

  it("lets cells without data neither block the view nor be seen", () => {
    const gap = heightsOf(grid, (column) => (column === 14 ? NaN : 100));
    const mask = viewshed(grid, gap, eyes);
    expect(at(grid, mask, 14, 10)).toBe(Visibility.NoData);
    expect(at(grid, mask, 16, 10)).toBe(Visibility.Visible);
  });

  it("reports the share of the ground with data that can be seen", () => {
    expect(visibleShare(Uint8Array.of(1, 1, 1, 0, 255))).toBe(0.75);
    expect(visibleShare(Uint8Array.of(255, 255))).toBeNull();
  });

  it("sees nothing when the observer stands where there is no data", () => {
    const hole = heightsOf(grid, (column, row) =>
      column === 10 && row === 10 ? NaN : 100,
    );
    expect(viewshed(grid, hole, eyes).every((value) => value === Visibility.NoData)).toBe(
      true,
    );
  });
});

describe("maskingHeights", () => {
  const grid = gridAround([0, 0], 1000, 21);
  const value = (masking: Float32Array, column: number, row: number) =>
    masking[row * grid.width + column]!;

  it("is zero wherever the ground itself is seen, and NaN beyond the radius", () => {
    const masking = maskingHeights(
      grid,
      heightsOf(grid, () => 100),
      { observerHeight: 2 },
    );
    expect(value(masking, 10, 10)).toBe(0);
    expect(value(masking, 20, 10)).toBe(0);
    expect(value(masking, 17, 17)).toBe(0);
    expect(value(masking, 0, 0)).toBeNaN();
  });

  it("is how high a target behind a ridge must rise to show over it", () => {
    // The eye at 102 m grazes the 200 m ridge 400 m out: 0.245 m up per metre.
    const ridge = heightsOf(grid, (column) => (column === 14 ? 200 : 100));
    const masking = maskingHeights(grid, ridge, { observerHeight: 2 });
    expect(value(masking, 12, 10)).toBe(0);
    expect(value(masking, 14, 10)).toBe(0);
    expect(value(masking, 16, 10)).toBeCloseTo(102 + 0.245 * 600 - 100, 0);
    expect(value(masking, 19, 10)).toBeCloseTo(102 + 0.245 * 900 - 100, 0);
  });

  it("falls as the observer climbs", () => {
    const ridge = heightsOf(grid, (column) => (column === 14 ? 200 : 100));
    const low = maskingHeights(grid, ridge, { observerHeight: 2 });
    const high = maskingHeights(grid, ridge, { observerHeight: 150 });
    expect(value(high, 16, 10)).toBeLessThan(value(low, 16, 10));
  });

  it("rises beyond the horizon of a curved Earth", () => {
    // A 2 m eye's horizon is about 5.4 km out; 12.6 km beyond it the Earth,
    // less refraction, hides about 10.8 m.
    const sea = gridAround([0, 0], 20_000, 81);
    const masking = maskingHeights(
      sea,
      heightsOf(sea, () => 0),
      { observerHeight: 2 },
    );
    const centre = (sea.width - 1) / 2;
    expect(masking[centre * sea.width + centre + 4]).toBe(0);
    expect(masking[centre * sea.width + centre + 36]).toBeCloseTo(10.8, 0);
  });

  it("is NaN where there is no data, which blocks nothing", () => {
    const gap = heightsOf(grid, (column) => (column === 14 ? NaN : 100));
    const masking = maskingHeights(grid, gap, { observerHeight: 2 });
    expect(value(masking, 14, 10)).toBeNaN();
    expect(value(masking, 16, 10)).toBe(0);
  });
});

describe("clipToFan", () => {
  // 21 cells of 100 m a side: the observer in cell (10, 10), north up.
  const grid = gridAround([10, 50], 1000, 21);
  const flat = heightsOf(grid, () => 100);
  const cell = (masking: Float32Array, column: number, row: number) =>
    masking[row * grid.width + column];

  it("keeps the masking heights clockwise from the left limit to the right, between the ranges", () => {
    const masking = maskingHeights(grid, flat, { observerHeight: 2 });
    const fan = clipToFan(grid, masking, {
      left: 45,
      right: 135,
      minRange: 250,
      maxRange: 800,
    });
    expect(cell(fan, 17, 10)).toBe(0); // east, 700 m
    expect(cell(fan, 15, 13)).toBe(0); // east-south-east
    expect(cell(fan, 10, 3)).toBeNaN(); // north, outside the arc
    expect(cell(fan, 3, 10)).toBeNaN(); // west
    expect(cell(fan, 12, 10)).toBeNaN(); // east, short of the minimum range
    expect(cell(fan, 19, 10)).toBeNaN(); // east, past the maximum range
    expect(cell(fan, 10, 10)).toBeNaN(); // the observer, inside the minimum range
  });

  it("sweeps clockwise across north when the left limit is the larger bearing", () => {
    const masking = maskingHeights(grid, flat, { observerHeight: 2 });
    const fan = clipToFan(grid, masking, {
      left: 315,
      right: 45,
      minRange: 0,
      maxRange: 1000,
    });
    expect(cell(fan, 10, 3)).toBe(0); // north
    expect(cell(fan, 10, 10)).toBe(0); // the observer
    expect(cell(fan, 17, 10)).toBeNaN(); // east
    expect(cell(fan, 10, 17)).toBeNaN(); // south
  });

  it("keeps terrain outside the fan masking the ground inside it", () => {
    // A ridge west of the observer, then the fan pointing west beyond it, with
    // the ridge itself short of the minimum range.
    const ridge = heightsOf(grid, (column) => (column === 8 ? 200 : 100));
    const masking = maskingHeights(grid, ridge, { observerHeight: 2 });
    const fan = clipToFan(grid, masking, {
      left: 225,
      right: 315,
      minRange: 400,
      maxRange: 1000,
    });
    expect(cell(fan, 8, 10)).toBeNaN();
    expect(cell(fan, 4, 10)).toBeGreaterThan(0);
    expect(cell(fan, 4, 10)).toBe(cell(masking, 4, 10));
  });

  it("leaves the masking heights it was given alone", () => {
    const masking = maskingHeights(grid, flat, { observerHeight: 2 });
    clipToFan(grid, masking, { left: 0, right: 10, minRange: 0, maxRange: 100 });
    expect(cell(masking, 17, 10)).toBe(0);
  });
});

describe("heightsToRgba", () => {
  const bands = [
    { max: 0, color: [0, 255, 0, 100] },
    { max: 50, color: [255, 255, 0, 100] },
    { max: Infinity, color: [255, 0, 0, 100] },
  ] as const;

  it("colours each cell by the first band it fits under, and leaves no data clear", () => {
    const pixels = heightsToRgba(Float32Array.of(0, 30, 50, 51, 900, NaN), bands);
    const pixel = (i: number) => Array.from(pixels.subarray(i * 4, i * 4 + 4));
    expect(pixel(0)).toEqual([0, 255, 0, 100]);
    expect(pixel(1)).toEqual([255, 255, 0, 100]);
    expect(pixel(2)).toEqual([255, 255, 0, 100]);
    expect(pixel(3)).toEqual([255, 0, 0, 100]);
    expect(pixel(4)).toEqual([255, 0, 0, 100]);
    expect(pixel(5)).toEqual([0, 0, 0, 0]);
  });
});
