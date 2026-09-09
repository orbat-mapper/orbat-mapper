import { describe, expect, it } from "vitest";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import {
  DEFAULT_GRID_APPEARANCE,
  buildLocalGridPortrayal,
  isLocalGridCoordinateValid,
  localGridAccuracy,
  localGridIntervalForDisplay,
  localGridIntervalFromDisplay,
  normalizeLocalGridBearing,
  projectToLocalGrid,
  unprojectFromLocalGrid,
  type LocalGridDefinition,
} from "./index";

const definition: LocalGridDefinition = { origin: [10, 60], interval: 100, bearing: 0 };

function localAdapter(
  grid: LocalGridDefinition,
  center: [number, number] = grid.origin as [number, number],
  resolution = 20,
): MapAdapter {
  const localCenter = projectToLocalGrid(grid, center);
  return {
    getViewportSize: () => ({ width: 800, height: 600 }),
    getResolution: () => resolution,
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) =>
      unprojectFromLocalGrid(grid, {
        x: localCenter.x + (x - 400) * resolution,
        y: localCenter.y - (y - 300) * resolution,
      }),
    getPixelFromCoordinate: (coordinate: number[]) => {
      const local = projectToLocalGrid(grid, coordinate as [number, number]);
      return [
        400 + (local.x - localCenter.x) / resolution,
        300 - (local.y - localCenter.y) / resolution,
      ];
    },
  } as unknown as MapAdapter;
}

function latitudeAtVariation(originLatitude: number, variation: number): number {
  const ratio = 1 - variation;
  return (Math.acos(Math.cos((originLatitude * Math.PI) / 180) * ratio) * 180) / Math.PI;
}

describe("Local Grid coordinates", () => {
  it("round-trips a fixed scaled-Mercator lattice", () => {
    const coordinate: [number, number] = [10.02, 60.01];
    const local = projectToLocalGrid(definition, coordinate);
    const roundTrip = unprojectFromLocalGrid(definition, local);
    expect(roundTrip[0]).toBeCloseTo(coordinate[0], 12);
    expect(roundTrip[1]).toBeCloseTo(coordinate[1], 12);
  });

  it("defines positive local north clockwise from true north", () => {
    const eastFacing = { ...definition, bearing: 90 };
    const localNorth = unprojectFromLocalGrid(eastFacing, { x: 0, y: 1_000 });
    const localEast = unprojectFromLocalGrid(eastFacing, { x: 1_000, y: 0 });
    expect(localNorth[0]).toBeGreaterThan(definition.origin[0]!);
    expect(localNorth[1]).toBeCloseTo(definition.origin[1]!, 6);
    expect(localEast[1]).toBeLessThan(definition.origin[1]!);
    expect(localEast[0]).toBeCloseTo(definition.origin[0]!, 6);
    expect(normalizeLocalGridBearing(-10)).toBe(350);
    expect(normalizeLocalGridBearing(720)).toBe(0);
  });

  it.each([
    [0.01, "ok"],
    [0.010_001, "notice"],
    [0.02, "notice"],
    [0.020_001, "warning"],
    [0.05, "warning"],
    [0.050_001, "clipped"],
  ] as const)("classifies %s variation as %s", (variation, expected) => {
    expect(localGridAccuracy(variation)).toBe(expected);
    const coordinate: [number, number] = [10, latitudeAtVariation(60, variation)];
    expect(isLocalGridCoordinateValid(definition, coordinate)).toBe(variation <= 0.05);
  });

  it("round-trips Page measurement units through canonical metres", () => {
    expect(localGridIntervalForDisplay(30.48, "imperial")).toBeCloseTo(100);
    expect(localGridIntervalFromDisplay(100, "imperial")).toBeCloseTo(30.48);
    expect(localGridIntervalForDisplay(1_852, "nautical")).toBe(1);
    expect(localGridIntervalFromDisplay(1, "nautical")).toBe(1_852);
  });
});

describe("Local Grid portrayal", () => {
  it("can calculate saved-grid status without rebuilding linework", () => {
    const result = buildLocalGridPortrayal(
      localAdapter(definition),
      definition,
      DEFAULT_GRID_APPEARANCE,
      false,
    );

    expect(result).toMatchObject({ features: [], accuracy: "ok" });
    expect(result?.spacing).toBeGreaterThan(0);
  });

  it("keeps the pinned lattice fixed while the viewport pans", () => {
    const first = buildLocalGridPortrayal(
      localAdapter(definition, [10, 60]),
      definition,
      DEFAULT_GRID_APPEARANCE,
    );
    const second = buildLocalGridPortrayal(
      localAdapter(definition, [10.01, 60.005]),
      definition,
      DEFAULT_GRID_APPEARANCE,
    );
    const firstLineIds = new Set(first?.features.map((feature) => feature.id));
    const sharedLineIds = second?.features.filter((feature) =>
      firstLineIds.has(feature.id),
    );
    expect(sharedLineIds?.length).toBeGreaterThan(0);
  });

  it("clips geometry beyond the shared 5% validity limit", () => {
    const result = buildLocalGridPortrayal(
      localAdapter(definition, [10, 60], 5_000),
      definition,
      DEFAULT_GRID_APPEARANCE,
    );
    expect(result?.accuracy).toBe("clipped");
    expect(result?.features.length).toBeGreaterThan(0);
    for (const feature of result?.features ?? []) {
      for (const coordinate of feature.geometry.coordinates) {
        expect(
          isLocalGridCoordinateValid(definition, coordinate as [number, number]),
        ).toBe(true);
      }
    }
  });
});
