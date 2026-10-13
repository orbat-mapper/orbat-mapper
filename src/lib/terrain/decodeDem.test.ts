import { describe, expect, it } from "vitest";
import { decodeDem } from ".";

const pixels = (...rgb: [number, number, number][]) =>
  new Uint8ClampedArray(rgb.flatMap(([r, g, b]) => [r, g, b, 255]));

describe("decodeDem", () => {
  it("decodes terrarium pixels to metres", () => {
    const heights = decodeDem(
      pixels([128, 0, 0], [129, 2, 128], [127, 255, 0]),
      "terrarium",
    );
    expect([...heights]).toEqual([0, 258.5, -1]);
  });

  it("decodes mapbox pixels to metres", () => {
    const heights = decodeDem(pixels([1, 134, 160], [1, 134, 170], [0, 0, 0]), "mapbox");
    expect(heights[0]).toBeCloseTo(0, 5);
    expect(heights[1]).toBeCloseTo(1, 5);
    expect(heights[2]).toBeCloseTo(-10000, 5);
  });
});
