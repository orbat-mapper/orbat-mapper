import { describe, expect, it } from "vitest";
import type { LineString } from "geojson";
import { densifyLine, lineLength } from ".";

const line = (...coordinates: [number, number][]): LineString => ({
  type: "LineString",
  coordinates,
});

/** One degree of arc on the mean-radius sphere (6371008.8 m). */
const DEGREE = 111195.08;

describe("densifyLine", () => {
  it("divides a segment into equal steps no longer than the spacing", () => {
    const { coordinates, distances } = densifyLine(line([0, 0], [1, 0]), 30_000);
    expect(coordinates.map(([lng]) => lng)).toEqual(
      [0, 0.25, 0.5, 0.75, 1].map((lng) => expect.closeTo(lng)),
    );
    expect(coordinates.every(([, lat]) => Math.abs(lat) < 1e-9)).toBe(true);
    expect(distances).toEqual(
      [0, 0.25, 0.5, 0.75, 1].map((f) => expect.closeTo(f * DEGREE, 0)),
    );
  });

  it("keeps every original vertex", () => {
    const { coordinates, distances } = densifyLine(
      line([0, 0], [0.1, 0], [0.1, 0.1]),
      1e6,
    );
    expect(coordinates).toEqual([
      [0, 0],
      [0.1, 0],
      [0.1, 0.1],
    ]);
    expect(distances).toEqual(
      [0, 0.1 * DEGREE, 0.2 * DEGREE].map((d) => expect.closeTo(d, 0)),
    );
  });

  it("samples along the great circle, not the straight line in degrees", () => {
    const { coordinates } = densifyLine(line([-45, 60], [45, 60]), 3_500_000);
    expect(coordinates).toHaveLength(3);
    // atan(tan 60° / cos 45°)
    expect(coordinates[1]![0]).toBeCloseTo(0, 6);
    expect(coordinates[1]![1]).toBeCloseTo(67.7923, 3);
  });
});

describe("lineLength", () => {
  it("sums the great-circle lengths of the segments", () => {
    expect(lineLength(line([0, 0], [0.1, 0], [0.1, 0.1]))).toBeCloseTo(0.2 * DEGREE, 0);
  });

  it("is zero for a line with fewer than two vertices", () => {
    expect(lineLength(line())).toBe(0);
    expect(lineLength(line([5, 5]))).toBe(0);
  });
});
