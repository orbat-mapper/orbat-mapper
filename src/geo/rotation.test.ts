import { describe, expect, it } from "vitest";
import {
  normalizeRotation,
  shortestRotationDelta,
  toHeadingFromNorthDegrees,
} from "./rotation";

describe("normalizeRotation", () => {
  it("returns values in [0, 360)", () => {
    expect(normalizeRotation(0)).toBe(0);
    expect(normalizeRotation(45)).toBe(45);
    expect(normalizeRotation(360)).toBe(0);
    expect(normalizeRotation(720)).toBe(0);
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(-450)).toBe(270);
  });
});

describe("toHeadingFromNorthDegrees", () => {
  const center = [0, 0];

  it("returns 0 for a point due north", () => {
    expect(toHeadingFromNorthDegrees(center, [0, 1])).toBeCloseTo(0);
  });

  it("returns 90 for a point due east", () => {
    expect(toHeadingFromNorthDegrees(center, [1, 0])).toBeCloseTo(90);
  });

  it("returns 180 for a point due south", () => {
    expect(toHeadingFromNorthDegrees(center, [0, -1])).toBeCloseTo(180);
  });

  it("returns 270 for a point due west", () => {
    expect(toHeadingFromNorthDegrees(center, [-1, 0])).toBeCloseTo(270);
  });

  it("returns 45 for NE", () => {
    expect(toHeadingFromNorthDegrees(center, [1, 1])).toBeCloseTo(45);
  });
});

describe("shortestRotationDelta", () => {
  it("returns 0 for identical angles", () => {
    expect(shortestRotationDelta(90, 90)).toBe(0);
  });

  it("takes the shorter CCW path", () => {
    expect(shortestRotationDelta(350, 10)).toBeCloseTo(-20);
  });

  it("takes the shorter CW path", () => {
    expect(shortestRotationDelta(10, 350)).toBeCloseTo(20);
  });

  it("handles 180 at the boundary", () => {
    expect(Math.abs(shortestRotationDelta(180, 0))).toBeCloseTo(180);
  });
});
