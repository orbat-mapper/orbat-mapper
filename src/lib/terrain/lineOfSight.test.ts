import { describe, expect, it } from "vitest";
import { lineOfSight, type ElevationProfile } from ".";

/** A profile of `count` samples spread evenly over `length` metres. */
function profile(length: number, elevation: (i: number) => number | null, count = 101) {
  const indices = [...Array(count).keys()];
  return {
    coordinates: indices.map(() => [0, 0]),
    distances: indices.map((i) => (length * i) / (count - 1)),
    elevations: indices.map(elevation),
  } satisfies ElevationProfile;
}

const eyes = { observerHeight: 2, targetHeight: 2 };

describe("lineOfSight", () => {
  it("sees across flat ground", () => {
    expect(
      lineOfSight(
        profile(1000, () => 100),
        eyes,
      ),
    ).toEqual({
      visible: true,
      obstructionIndex: null,
    });
  });

  it("is blocked by the first sample that rises above the sight line", () => {
    const ridge = profile(1000, (i) => (i === 30 || i === 60 ? 110 : 100));
    expect(lineOfSight(ridge, eyes)).toEqual({ visible: false, obstructionIndex: 30 });
  });

  it("loses sight over the horizon of a curved Earth", () => {
    // Two 2 m eyes see each other to about 10.8 km with standard refraction.
    expect(
      lineOfSight(
        profile(8000, () => 0),
        eyes,
      ).visible,
    ).toBe(true);
    expect(
      lineOfSight(
        profile(20_000, () => 0),
        eyes,
      ).visible,
    ).toBe(false);
  });

  it("lets refraction bend the sight line over the horizon", () => {
    // Without refraction the two eyes only see each other to about 10.1 km.
    const sea = profile(10_500, () => 0);
    expect(lineOfSight(sea, { ...eyes, refraction: 0 }).visible).toBe(false);
    expect(lineOfSight(sea, eyes).visible).toBe(true);
  });

  it("ignores samples without data, but cannot judge without both ends", () => {
    const holes = profile(1000, (i) => (i % 2 ? null : 100));
    expect(lineOfSight(holes, eyes).visible).toBe(true);
    expect(
      lineOfSight(
        profile(1000, (i) => (i === 0 ? null : 100)),
        eyes,
      ),
    ).toEqual({
      visible: null,
      obstructionIndex: null,
    });
  });
});
