import { describe, expect, it } from "vitest";
import { unwindCoordinates, unwrapLongitude, wrapLongitude } from "@/geo/longitude";

describe("wrapLongitude", () => {
  it("wraps longitudes into [-180, 180]", () => {
    expect(wrapLongitude(190)).toBe(-170);
    expect(wrapLongitude(-190)).toBe(170);
    expect(wrapLongitude(10)).toBe(10);
  });
});

describe("unwrapLongitude", () => {
  it("picks the representation closest to the reference", () => {
    expect(unwrapLongitude(170, -170)).toBe(190);
    expect(unwrapLongitude(-170, 170)).toBe(-190);
  });
});

describe("unwindCoordinates", () => {
  it("keeps a path continuous across the antimeridian", () => {
    expect(
      unwindCoordinates([
        [170, 10],
        [-170, 12],
      ]),
    ).toEqual([
      [170, 10],
      [190, 12],
    ]);
  });

  it("preserves ordinates beyond longitude and latitude", () => {
    // The unit path encodes the waypoint time as a third (M) ordinate; dropping
    // it leaves the OpenLayers leg geometry without the times that path editing
    // needs to find the state entry to update.
    expect(
      unwindCoordinates([
        [170, 10, 1000],
        [-170, 12, 2000],
      ]),
    ).toEqual([
      [170, 10, 1000],
      [190, 12, 2000],
    ]);
  });

  it("preserves the extra ordinate of a single coordinate", () => {
    expect(unwindCoordinates([[10, 60, 1000]])).toEqual([[10, 60, 1000]]);
  });
});
