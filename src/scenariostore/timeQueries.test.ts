import { describe, expect, it } from "vitest";
import type { Polygon } from "geojson";
import type { NState, NUnit } from "@/types/internalModels";
import { closestApproach, unitsAt } from "./timeQueries";

function createUnit(id: string, overrides: Partial<NUnit> = {}): NUnit {
  return {
    id,
    name: id,
    sidc: "10031000000000000000",
    subUnits: [],
    _pid: "group-1",
    _sid: "side-1",
    ...overrides,
  } as NUnit;
}

// A box around [0, 1].
const box: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-0.5, 0.5],
      [0.5, 0.5],
      [0.5, 1.5],
      [-0.5, 1.5],
      [-0.5, 0.5],
    ],
  ],
};

describe("unitsAt", () => {
  const moving = createUnit("moving", {
    state: [
      { id: "a", t: 0, location: [0, 0] },
      { id: "b", t: 2000, location: [0, 2] },
    ] as NState[],
  });
  const outside = createUnit("outside", { location: [5, 5] });
  const noLocation = createUnit("no-location");

  it("returns the units inside the area at the given time", () => {
    const result = unitsAt([moving, outside, noLocation], 1000, { within: box });
    expect(result.map((r) => r.unit.id)).toEqual(["moving"]);
    expect(result[0].state.location?.[1]).toBeCloseTo(1, 6);
  });

  it("leaves out a unit that is only inside the area at another time", () => {
    expect(unitsAt([moving, outside], 0, { within: box })).toEqual([]);
  });

  it("returns every unit with a location when no area is given", () => {
    const result = unitsAt([moving, outside, noLocation], 0);
    expect(result.map((r) => r.unit.id)).toEqual(["moving", "outside"]);
  });
});

const HOUR = 3_600_000;
// 0.01 degrees along a meridian, on Turf's earth radius of 6,371,008.8 m.
const ONE_HUNDREDTH_DEGREE_M = 1111.95;

describe("closestApproach", () => {
  it("finds when a moving unit passes closest to a stationary one", () => {
    const a = createUnit("a", {
      state: [
        { id: "a1", t: 0, location: [0, 0] },
        { id: "a2", t: 2 * HOUR, location: [2, 0] },
      ] as NState[],
    });
    const b = createUnit("b", { location: [1, 0.01] });

    const result = closestApproach(a, b, [0, 2 * HOUR]);

    expect(result?.distanceMeters).toBeCloseTo(ONE_HUNDREDTH_DEGREE_M, -1);
    expect(Math.abs(result!.time - HOUR)).toBeLessThan(1000);
  });

  it("finds the closest point between two moving units", () => {
    const a = createUnit("a", {
      state: [
        { id: "a1", t: 0, location: [0, 0] },
        { id: "a2", t: 2 * HOUR, location: [2, 0] },
      ] as NState[],
    });
    const b = createUnit("b", {
      state: [
        { id: "b1", t: 0, location: [2, 0.02] },
        { id: "b2", t: 2 * HOUR, location: [0, 0.02] },
      ] as NState[],
    });

    const result = closestApproach(a, b, [0, 2 * HOUR]);

    expect(result?.distanceMeters).toBeCloseTo(2 * ONE_HUNDREDTH_DEGREE_M, -1);
    expect(Math.abs(result!.time - HOUR)).toBeLessThan(1000);
  });

  it("follows a leg's via points", () => {
    // A detours north through [1, 1]; halfway along the two equal segments is that point.
    const a = createUnit("a", {
      state: [
        { id: "a1", t: 0, location: [0, 0] },
        { id: "a2", t: 2 * HOUR, location: [2, 0], via: [[1, 1]] },
      ] as NState[],
    });
    const b = createUnit("b", { location: [1, 1.01] });

    const result = closestApproach(a, b, [0, 2 * HOUR]);

    expect(result?.distanceMeters).toBeCloseTo(ONE_HUNDREDTH_DEGREE_M, -1);
    expect(Math.abs(result!.time - HOUR)).toBeLessThan(1000);
  });

  it("finds the closer of two passes", () => {
    // A drives past B 0.02 degrees away, turns and comes back on a line through [1, 0.01].
    const a = createUnit("a", {
      state: [
        { id: "a1", t: 0, location: [0, 0.02] },
        { id: "a2", t: HOUR, location: [2, 0.02] },
        { id: "a3", t: 2 * HOUR, location: [0, 0] },
      ] as NState[],
    });
    const b = createUnit("b", { location: [1, 0] });

    const result = closestApproach(a, b, [0, 2 * HOUR]);

    expect(result?.distanceMeters).toBeCloseTo(ONE_HUNDREDTH_DEGREE_M, -1);
    expect(Math.abs(result!.time - 1.5 * HOUR)).toBeLessThan(1000);
  });

  it("only counts times when both units have a location", () => {
    const a = createUnit("a", {
      state: [{ id: "a1", t: HOUR, location: [1, 0] }] as NState[],
    });
    const b = createUnit("b", { location: [1, 0.01] });

    const result = closestApproach(a, b, [0, 2 * HOUR]);

    expect(result?.distanceMeters).toBeCloseTo(ONE_HUNDREDTH_DEGREE_M, -1);
    expect(result?.time).toBe(HOUR);
  });

  it("returns undefined when the units never both have a location", () => {
    const a = createUnit("a", {
      state: [{ id: "a1", t: 3 * HOUR, location: [1, 0] }] as NState[],
    });
    const b = createUnit("b", { location: [1, 0.01] });

    expect(closestApproach(a, b, [0, 2 * HOUR])).toBeUndefined();
  });
});
