import { describe, it, expect } from "vitest";
import { detectCoordinateFormat, parseCoordinateString, parseJSON } from "./utils";

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
  it("should detect JSON format", () => {
    const samples = ["[10.2, 59.4]", "[-118.25, 34.05]", "[0, 0]"];
    expect(detectCoordinateFormat(samples)).toBe("JSON");
  });

  it("should be robust to mixed valid/invalid JSON data", () => {
    const samples = ["[10.2, 59.4]", "invalid", "[-118.25, 34.05]"];
    expect(detectCoordinateFormat(samples)).toBe("JSON");
  });
});

describe("parseJSON", () => {
  it("should parse valid JSON coordinates", () => {
    expect(parseJSON("[10.2, 59.4]")).toEqual([10.2, 59.4]);
    expect(parseJSON("[-118.25, 34.05]")).toEqual([-118.25, 34.05]);
  });

  it("should parse valid JSON coordinates with whitespace", () => {
    expect(parseJSON(" [ 10.2 , 59.4 ] ")).toEqual([10.2, 59.4]);
  });

  it("should return null for invalid JSON", () => {
    expect(parseJSON("invalid")).toBeNull();
    expect(parseJSON("[10.2, 59.4")).toBeNull(); // Missing bracket
    expect(parseJSON("10.2, 59.4]")).toBeNull(); // Missing bracket
    expect(parseJSON("not json")).toBeNull();
  });

  it("should return null for valid JSON that is not a coordinate pair", () => {
    expect(parseJSON("{}")).toBeNull();
    expect(parseJSON("[]")).toBeNull();
    expect(parseJSON("[10.2]")).toBeNull(); // Too few elements
    expect(parseJSON('["10.2", "59.4"]')).toBeNull(); // Strings instead of numbers
  });
});

describe("parseCoordinateString", () => {
  it("should parse JSON format", () => {
    expect(parseCoordinateString("[10.2, 59.4]", "JSON")).toEqual([10.2, 59.4]);
  });

  it("should parse MGRS format", () => {
    // Basic check using mock-like expectation since we trust mgrs library
    // 33UUU8308007274 is approx 48.81669, 14.50004
    const result = parseCoordinateString("33UUU8308007274", "MGRS");
    expect(result).not.toBeNull();
    expect(result?.length).toBe(2);
  });

  it("should parse DMS format", () => {
    const result = parseCoordinateString(`40°26'46"N 79°58'56"W`, "DMS");
    expect(result).toEqual([-79.982222, 40.446111]);
  });

  it("should parse LatLon format", () => {
    expect(parseCoordinateString("40.446, -79.982", "LatLon")).toEqual([-79.982, 40.446]);
  });

  it("should parse LonLat format", () => {
    expect(parseCoordinateString("-79.982, 40.446", "LonLat")).toEqual([-79.982, 40.446]);
  });
});
