import { describe, expect, it } from "vitest";
import { toStringHDMS } from "./coordinateFormat";

describe("toStringHDMS", () => {
  it("returns an empty string for missing coordinates", () => {
    expect(toStringHDMS(undefined)).toBe("");
  });

  it("formats without fractional digits by default", () => {
    expect(toStringHDMS([7.85, 47.983333])).toBe("47° 59′ N 7° 51′ E");
  });

  it("formats with hemispheres", () => {
    expect(toStringHDMS([-79.982, 40.4461], 0)).toBe("40° 26′ 46″ N 79° 58′ 55″ W");
    expect(toStringHDMS([123.456789, -12.3456789], 2)).toBe(
      "12° 20′ 44.44″ S 123° 27′ 24.44″ E",
    );
    expect(toStringHDMS([-122.4194, 37.7749], 4)).toBe(
      "37° 46′ 29.6400″ N 122° 25′ 09.8400″ W",
    );
  });

  it("omits the hemisphere for zero degrees", () => {
    expect(toStringHDMS([0, 0], 0)).toBe("0° 0°");
  });

  it("normalizes longitudes outside [-180, 180]", () => {
    expect(toStringHDMS([180, 90], 0)).toBe("90° N 180° W");
    expect(toStringHDMS([-180, -90], 2)).toBe("90° S 180° W");
    expect(toStringHDMS([359.9999, 89.99999], 0)).toBe("90° N 0° W");
  });

  it("pads minutes and seconds", () => {
    expect(toStringHDMS([-0.0001, 0.5], 3)).toBe("0° 30′ N 0° 00′ 00.360″ W");
  });
});
