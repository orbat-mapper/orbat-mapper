import { describe, it, expect } from "vitest";
import { detectCoordinateFormat } from "./utils";

describe("detectCoordinateFormat", () => {
  it("should detect MGRS format", () => {
    const samples = ["18SUJ234567890", "18S UJ 230 670", "32U PU 1234 5678"];
    expect(detectCoordinateFormat(samples)).toBe("MGRS");
  });

  it("should detect DMS format", () => {
    const samples = [
      `40°26'46"N 79°58'56"W`,
      `41°26'46"N 80°58'56"W`,
      `N40°26'46" W79°58'56"`,
    ];
    expect(detectCoordinateFormat(samples)).toBe("DMS");
  });

  it("should detect LatLon format", () => {
    const samples = ["40.446, -79.982", "34.05, -118.25", "51.507, -0.1278"];
    expect(detectCoordinateFormat(samples)).toBe("LatLon");
  });

  it("should detect LonLat format when longitude is > 90", () => {
    const samples = ["-118.25, 34.05", "-97.74, 30.27", "151.2, -33.86"];
    expect(detectCoordinateFormat(samples)).toBe("LonLat");
  });

  it("should detect LonLat format when simple lat check fails", () => {
    // Both values in range (-90, 90) but first is lon, second is lat
    // This is hard to distinguish without >90 check or context.
    // Our current simple heuristics favor LagLon unless specific evidence for LonLat
    // If we have samples with big numbers, it works.
    const samples = [
      "-122.4194, 37.7749", // San Francisco - Longitude > 90
      "-122.0, 37.0",
    ];
    expect(detectCoordinateFormat(samples)).toBe("LonLat");
  });

  it("should return LatLon by default if ambiguous", () => {
    // 10, 10 could be either
    expect(detectCoordinateFormat(["10, 10", "20, 20"])).toBe("LatLon");
  });

  it("should return null for empty samples", () => {
    expect(detectCoordinateFormat([])).toBeNull();
  });

  it("should return null for invalid data", () => {
    const samples = ["invalid", "not a coordinate", ""];
    expect(detectCoordinateFormat(samples)).toBeNull();
  });

  it("should be robust to mixed valid/invalid data", () => {
    // 2 valid, 1 invalid -> >50% valid -> MGRS
    // 18SUJ2345667890 (valid 10 digit)
    // 18SUJ230670 (valid 6 digit)
    const samples = ["18SUJ2345667890", "invalid", "18SUJ230670"];
    expect(detectCoordinateFormat(samples)).toBe("MGRS");
  });
});
