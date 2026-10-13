import { describe, expect, it } from "vitest";
import type { Position } from "geojson";
import { gridAround, gridPositions, maskToPolygons, Visibility } from ".";

// 5 × 5 cells of 100 m around the equator.
const grid = gridAround([0, 0], 200, 5);
const positions = gridPositions(grid);

/** A mask from rows of "#" (visible), "." (hidden) and " " (no data). */
function mask(...rows: string[]) {
  return Uint8Array.from(rows.join(""), (cell) =>
    cell === "#"
      ? Visibility.Visible
      : cell === "."
        ? Visibility.Hidden
        : Visibility.NoData,
  );
}

/** Twice the signed area: positive when counterclockwise in lng/lat. */
function signedArea(ring: Position[]) {
  let sum = 0;
  for (let i = 1; i < ring.length; i++)
    sum += ring[i - 1]![0]! * ring[i]![1]! - ring[i]![0]! * ring[i - 1]![1]!;
  return sum;
}

function expectClosed(ring: Position[]) {
  expect(ring[0]).toEqual(ring[ring.length - 1]);
}

describe("maskToPolygons", () => {
  it("has no polygons where nothing is visible", () => {
    expect(
      maskToPolygons(grid, mask(".....", ".....", ".....", ".....", ".....")),
    ).toEqual({
      type: "MultiPolygon",
      coordinates: [],
    });
  });

  it("outlines a single visible cell with a diamond around its centre", () => {
    const { coordinates } = maskToPolygons(
      grid,
      mask(".....", ".....", "..#..", ".....", "....."),
    );
    expect(coordinates).toHaveLength(1);
    const [outer] = coordinates[0]!;
    expectClosed(outer!);
    expect(outer).toHaveLength(5);
    const [lng, lat] = positions[12]!;
    const xs = outer!.map(([x]) => x!);
    const ys = outer!.map(([, y]) => y!);
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(lng, 9);
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(lat, 9);
  });

  it("cuts the corners of a block and keeps its straight edges as single segments", () => {
    const { coordinates } = maskToPolygons(
      grid,
      mask(".....", ".###.", ".###.", ".###.", "....."),
    );
    expect(coordinates).toHaveLength(1);
    expect(coordinates[0]).toHaveLength(1);
    // Four sides and four chamfers, plus the closing position.
    expect(coordinates[0]![0]).toHaveLength(9);
  });

  it("winds the exterior counterclockwise and a hole clockwise", () => {
    const { coordinates } = maskToPolygons(
      grid,
      mask("#####", "#####", "##.##", "#####", "#####"),
    );
    expect(coordinates).toHaveLength(1);
    const [outer, hole] = coordinates[0]!;
    expectClosed(outer!);
    expectClosed(hole!);
    expect(signedArea(outer!)).toBeGreaterThan(0);
    expect(signedArea(hole!)).toBeLessThan(0);
  });

  it("makes a polygon of each separate visible area, and treats no data as unseen", () => {
    const { coordinates } = maskToPolygons(
      grid,
      mask("##...", "##...", ".....", "... #", "...##"),
    );
    expect(coordinates).toHaveLength(2);
    for (const polygon of coordinates) expect(polygon).toHaveLength(1);
  });

  it("keeps cells that touch only at a corner apart", () => {
    const { coordinates } = maskToPolygons(
      grid,
      mask(".....", ".#...", "..#..", ".....", "....."),
    );
    expect(coordinates).toHaveLength(2);
  });
});
