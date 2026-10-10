import { describe, expect, it } from "vitest";
import {
  apparentPointSymbolPixels,
  convertPointSymbolSize,
  DEFAULT_GROUND_SIZE_METERS,
  groundPointSymbolSize,
  metersPerPixelAtZoom,
  MIN_GROUND_SIZE_PX,
  newPointSymbolSize,
} from "@/geo/pointSymbolSizing";

const ZOOM = 12;

describe("point symbol sizing", () => {
  it("matches MapLibre's 512 px world at zoom 0", () => {
    expect(metersPerPixelAtZoom(0) * 512).toBeCloseTo(40075016.686);
    expect(metersPerPixelAtZoom(1)).toBeCloseTo(metersPerPixelAtZoom(0) / 2);
  });

  it("keeps the apparent size when switching to ground", () => {
    const ground = convertPointSymbolSize({ value: 30, unit: "pixels" }, "meters", ZOOM);
    expect(ground).toEqual(
      groundPointSymbolSize(Math.round(30 * metersPerPixelAtZoom(ZOOM)), 30),
    );
    expect(apparentPointSymbolPixels(ground, ZOOM)).toBeCloseTo(30, 0);
  });

  it("clamps a ground size between its floor and cap", () => {
    const ground = groundPointSymbolSize(1000, 40);
    expect(apparentPointSymbolPixels(ground, 20)).toBe(40);
    expect(apparentPointSymbolPixels(ground, 0)).toBe(MIN_GROUND_SIZE_PX);
  });

  it("switches back to the size it is drawn at, not the raw projection", () => {
    const ground = groundPointSymbolSize(1000, 40);
    expect(convertPointSymbolSize(ground, "pixels", 20)).toEqual({
      value: 40,
      unit: "pixels",
    });
    expect(convertPointSymbolSize(ground, "pixels", 0)).toEqual({
      value: MIN_GROUND_SIZE_PX,
      unit: "pixels",
    });
  });

  it("falls back to fixed sizes without a zoom", () => {
    expect(convertPointSymbolSize({ value: 30, unit: "pixels" }, "meters")).toEqual(
      groundPointSymbolSize(DEFAULT_GROUND_SIZE_METERS, 30),
    );
    expect(convertPointSymbolSize(groundPointSymbolSize(500, 24), "pixels")).toEqual({
      value: 24,
      unit: "pixels",
    });
  });

  it("keeps sub-10 m ground sizes to a decimal", () => {
    const ground = convertPointSymbolSize({ value: 30, unit: "pixels" }, "meters", 20);
    expect(ground.value).toBe(Math.round(30 * metersPerPixelAtZoom(20) * 10) / 10);
  });

  it("leaves a size already in the unit alone", () => {
    const pixels = { value: 18, unit: "pixels" } as const;
    expect(convertPointSymbolSize(pixels, "pixels", ZOOM)).toBe(pixels);
  });

  it("births new symbols at the default screen size", () => {
    expect(newPointSymbolSize("pixels", ZOOM)).toEqual({ value: 30, unit: "pixels" });
    expect(newPointSymbolSize("meters", ZOOM).unit).toBe("meters");
  });
});
