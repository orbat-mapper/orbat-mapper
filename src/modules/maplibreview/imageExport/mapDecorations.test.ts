import { describe, expect, it } from "vitest";
import {
  computeScaleBar,
  formatScaleLabel,
  niceScaleMeters,
} from "@/modules/maplibreview/imageExport/mapDecorations";

describe("niceScaleMeters", () => {
  it("rounds down to 1/2/3/5 × a power of ten", () => {
    expect(niceScaleMeters(0.9)).toBe(0.5);
    expect(niceScaleMeters(1)).toBe(1);
    expect(niceScaleMeters(2.4)).toBe(2);
    expect(niceScaleMeters(4.9)).toBe(3);
    expect(niceScaleMeters(7)).toBe(5);
    expect(niceScaleMeters(12)).toBe(10);
    expect(niceScaleMeters(1500)).toBe(1000);
    expect(niceScaleMeters(73000)).toBe(50000);
  });

  it("returns 0 for non-positive input", () => {
    expect(niceScaleMeters(0)).toBe(0);
    expect(niceScaleMeters(-5)).toBe(0);
    expect(niceScaleMeters(NaN)).toBe(0);
  });
});

describe("formatScaleLabel", () => {
  it("appends the unit, trimming trailing zeros", () => {
    expect(formatScaleLabel(500, "m")).toBe("500 m");
    expect(formatScaleLabel(1, "km")).toBe("1 km");
    expect(formatScaleLabel(1.5, "km")).toBe("1.5 km");
    expect(formatScaleLabel(50, "km")).toBe("50 km");
    expect(formatScaleLabel(2, "mi")).toBe("2 mi");
    expect(formatScaleLabel(0.5, "mi")).toBe("0.5 mi");
  });
});

describe("computeScaleBar", () => {
  it("fits a nice distance within the allowed width and reports its pixel span", () => {
    // 10 m/px, up to 200 px → up to 2000 m; nearest nice value is 2000 m → 200 px.
    const bar = computeScaleBar(10, 200);
    expect(bar).toEqual({ meters: 2000, widthPx: 200, label: "2 km" });
  });

  it("labels in miles/feet for the imperial system", () => {
    // 10 m/px, up to 200 px → up to 2000 m ≈ 1.24 mi; nice value 1 mi.
    const bar = computeScaleBar(10, 200, "imperial");
    expect(bar!.label).toBe("1 mi");
    expect(bar!.meters).toBeCloseTo(1609.344, 3);
    // Short spans fall back to feet.
    const short = computeScaleBar(1, 200, "imperial");
    expect(short!.label.endsWith(" ft")).toBe(true);
  });

  it("labels in nautical miles for the nautical system", () => {
    // 20 m/px, up to 200 px → up to 4000 m ≈ 2.16 nm; nice value 2 nm.
    const bar = computeScaleBar(20, 200, "nautical");
    expect(bar!.label).toBe("2 nm");
    expect(bar!.meters).toBeCloseTo(3704, 0);
  });

  it("never exceeds the allowed width", () => {
    const maxWidth = 240;
    for (const system of ["metric", "imperial", "nautical"] as const) {
      const bar = computeScaleBar(3.3, maxWidth, system);
      expect(bar).not.toBeNull();
      expect(bar!.widthPx).toBeLessThanOrEqual(maxWidth);
    }
  });

  it("returns null for invalid inputs", () => {
    expect(computeScaleBar(0, 200)).toBeNull();
    expect(computeScaleBar(10, 0)).toBeNull();
  });
});
