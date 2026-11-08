import { describe, expect, it, vi } from "vitest";
import {
  applyElevationBands,
  elevationBandRamp,
  isElevationBandPreset,
} from "./elevationBands";

function fakeMap(layerIds: string[]) {
  return {
    getLayersOrder: () => layerIds,
    setPaintProperty: vi.fn<(id: string, name: string, value: unknown) => void>(),
  };
}

describe("elevation bands", () => {
  it("draws hard bands above each preset's three thresholds", () => {
    expect(elevationBandRamp("upland")).toEqual([
      "interpolate",
      ["linear"],
      ["elevation"],
      499.9,
      "rgba(255,255,255,0)",
      500,
      "#ffe8ba",
      999.9,
      "#ffe8ba",
      1000,
      "#e5d0a7",
      1499.9,
      "#e5d0a7",
      1500,
      "#ccba95",
    ]);
    expect(
      elevationBandRamp("highland").filter((stop) => typeof stop === "number"),
    ).toEqual([1499.9, 1500, 1999.9, 2000, 2499.9, 2500]);
  });

  it("draws five bands for Alpine, darkening above 1,000 and 2,000 m like the plates", () => {
    expect(elevationBandRamp("alpine")).toEqual([
      "interpolate",
      ["linear"],
      ["elevation"],
      99.9,
      "rgba(255,255,255,0)",
      100,
      "#ffe8ba",
      199.9,
      "#ffe8ba",
      200,
      "#e5d0a7",
      499.9,
      "#e5d0a7",
      500,
      "#ccba95",
      999.9,
      "#ccba95",
      1000,
      "#b2a282",
      1999.9,
      "#b2a282",
      2000,
      "#998b70",
    ]);
  });

  it("repaints every elevation band layer and leaves the rest alone", () => {
    const map = fakeMap([
      "background",
      "elevation-bands-4",
      "water",
      "elevation-bands-11",
    ]);
    expect(applyElevationBands(map, "highland")).toBe(true);
    expect(map.setPaintProperty.mock.calls).toEqual([
      ["elevation-bands-4", "color-relief-color", elevationBandRamp("highland")],
      ["elevation-bands-11", "color-relief-color", elevationBandRamp("highland")],
    ]);
  });

  it("reports a style without elevation bands", () => {
    const map = fakeMap(["background", "water"]);
    expect(applyElevationBands(map, "upland")).toBe(false);
    expect(map.setPaintProperty).not.toHaveBeenCalled();
  });

  it("recognizes only the known presets", () => {
    expect(isElevationBandPreset("highland")).toBe(true);
    expect(isElevationBandPreset("alpine")).toBe(true);
    expect(isElevationBandPreset("arctic")).toBe(false);
    expect(isElevationBandPreset(undefined)).toBe(false);
  });
});
