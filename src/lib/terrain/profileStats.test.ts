import { describe, expect, it } from "vitest";
import { profileIndexAt, profileStats, type ElevationProfile } from ".";

const profile = (elevations: (number | null)[]): ElevationProfile => ({
  coordinates: elevations.map((_, i) => [i * 0.001, 0]),
  distances: elevations.map((_, i) => i * 100),
  elevations,
});

describe("profileStats", () => {
  it("summarises extremes, climb, descent and the steepest grade", () => {
    expect(profileStats(profile([10, 20, 15, 45, 40]))).toEqual({
      length: 400,
      minElevation: 10,
      maxElevation: 45,
      climb: 40,
      descent: 10,
      steepestGrade: 0.3,
    });
  });

  it("does not bridge a gap in the data with a climb or a grade", () => {
    expect(profileStats(profile([10, 20, null, 80, 75]))).toMatchObject({
      minElevation: 10,
      maxElevation: 80,
      climb: 10,
      descent: 5,
      steepestGrade: 0.1,
    });
  });

  it("has no extremes or grade where no sample has data", () => {
    expect(profileStats(profile([null, null]))).toEqual({
      length: 100,
      minElevation: null,
      maxElevation: null,
      climb: 0,
      descent: 0,
      steepestGrade: null,
    });
  });
});

describe("profileIndexAt", () => {
  const samples = profile([1, 2, 3, 4]);

  it("finds the sample nearest a distance along the line", () => {
    expect(profileIndexAt(samples, 140)).toBe(1);
    expect(profileIndexAt(samples, 160)).toBe(2);
  });

  it("clamps a distance beyond either end", () => {
    expect(profileIndexAt(samples, -50)).toBe(0);
    expect(profileIndexAt(samples, 1000)).toBe(3);
  });
});
