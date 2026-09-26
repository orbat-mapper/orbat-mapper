import { describe, expect, it } from "vitest";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import {
  buildGridFeatures,
  gridScaleCellCount,
  lonLatToMercator,
  mercatorToLonLat,
  projectToGrid,
  unprojectFromGrid,
  visibleGridSpacing,
} from "./index";

function distanceMeters(a: readonly number[], b: readonly number[]): number {
  const radians = Math.PI / 180;
  const latitudeA = a[1]! * radians;
  const latitudeB = b[1]! * radians;
  const deltaLatitude = latitudeB - latitudeA;
  const deltaLongitude = (b[0]! - a[0]!) * radians;
  const h =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(deltaLongitude / 2) ** 2;
  return 6_371_008.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function adapterForViewport(): MapAdapter {
  return {
    getResolution: () => 2,
    getViewportSize: () => ({ width: 900, height: 900 }),
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) =>
      mercatorToLonLat([x * 2, (900 - y) * 2]),
  } as unknown as MapAdapter;
}

function adapterCenteredAt(latitude: number): MapAdapter {
  const [centerX, centerY] = lonLatToMercator([0, latitude]);
  return {
    getResolution: () => 2,
    getViewportSize: () => ({ width: 900, height: 900 }),
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) =>
      mercatorToLonLat([centerX + (x - 450) * 2, centerY + (450 - y) * 2]),
  } as unknown as MapAdapter;
}

function adapterCenteredAtPosition(longitude: number, latitude: number): MapAdapter {
  const [centerX, centerY] = lonLatToMercator([longitude, latitude]);
  return {
    getResolution: () => 2,
    getViewportSize: () => ({ width: 900, height: 900 }),
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) =>
      mercatorToLonLat([centerX + (x - 450) * 2, centerY + (450 - y) * 2]),
  } as unknown as MapAdapter;
}

function projectedAdapter(
  longitude: number,
  latitude: number,
  metresPerPixel: number,
): MapAdapter {
  const [centerX, centerY] = lonLatToMercator([longitude, latitude]);
  return {
    getResolution: () => metresPerPixel,
    getViewportSize: () => ({ width: 900, height: 900 }),
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) =>
      mercatorToLonLat([
        centerX + (x - 450) * metresPerPixel,
        centerY + (450 - y) * metresPerPixel,
      ]),
    getPixelFromCoordinate: (position: [number, number]) => {
      const [x, y] = lonLatToMercator(position);
      return [(x - centerX) / metresPerPixel + 450, 450 - (y - centerY) / metresPerPixel];
    },
  } as unknown as MapAdapter;
}

describe("adaptive grid", () => {
  it("round-trips Web Mercator coordinates", () => {
    const source: [number, number] = [10.7522, 59.9139];
    const roundTrip = mercatorToLonLat(lonLatToMercator(source));
    expect(roundTrip[0]).toBeCloseTo(source[0], 10);
    expect(roundTrip[1]).toBeCloseTo(source[1], 10);
  });

  it("preserves readable spacing and suppresses dense subdivisions by exact powers of five", () => {
    expect(visibleGridSpacing(100, 2)).toBe(100);
    expect(visibleGridSpacing(10, 20)).toBe(1_250);
    expect(visibleGridSpacing(0.3048, 100)).toBeCloseTo(4_762.5);
    expect(visibleGridSpacing(0, 2)).toBe(0);
  });

  it("caps the compact scale graphic", () => {
    expect(gridScaleCellCount(30, 180)).toBe(5);
    expect(gridScaleCellCount(70, 180)).toBe(2);
    expect(gridScaleCellCount(240, 180)).toBe(0);
  });

  it("bounds lines to the viewport and aligns them to exact projected intervals", () => {
    const crs = { kind: "utm", zone: 31, hemisphere: "north" } as const;
    const result = buildGridFeatures(adapterForViewport(), 100, crs);
    expect(result).not.toBeNull();
    expect(result!.spacing).toBe(100);
    expect(result!.features.length).toBeGreaterThan(2);

    for (const feature of result!.features) {
      const first = feature.geometry.coordinates[0];
      if (!first) throw new Error("Grid line is missing an endpoint");
      const projected = projectToGrid(crs, first as [number, number]);
      const fixedAxis = String(feature.id).startsWith("grid-x-")
        ? projected.easting
        : projected.northing;
      expect(fixedAxis / result!.spacing).toBeCloseTo(
        Math.round(fixedAxis / result!.spacing),
        6,
      );
    }
  });

  it("keeps the configured minor cell equal to measured ground distance", () => {
    const result = buildGridFeatures(adapterCenteredAt(60), 100)!;
    const verticalLines = result.features.filter((feature) =>
      String(feature.id).startsWith("grid-x-"),
    );
    const horizontalLines = result.features.filter((feature) =>
      String(feature.id).startsWith("grid-y-"),
    );
    const firstVertical = verticalLines[0]!.geometry.coordinates[0]!;
    const secondVertical = verticalLines[1]!.geometry.coordinates[0]!;
    const firstHorizontal = horizontalLines[0]!.geometry.coordinates[0]!;
    const secondHorizontal = horizontalLines[1]!.geometry.coordinates[0]!;

    expect(distanceMeters(firstVertical, secondVertical)).toBeCloseTo(100, 0);
    expect(distanceMeters(firstHorizontal, secondHorizontal)).toBeCloseTo(100, 0);
  });

  it("keeps every line on the same locked metric grid while panning", () => {
    const crs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    for (const latitude of [59, 60]) {
      const result = buildGridFeatures(
        adapterCenteredAtPosition(10, latitude),
        100,
        crs,
      )!;
      for (const feature of result.features) {
        const projected = feature.geometry.coordinates.map((position) =>
          projectToGrid(crs, position as [number, number]),
        );
        const fixedValues = String(feature.id).startsWith("grid-x-")
          ? projected.map((point) => point.easting)
          : projected.map((point) => point.northing);
        for (const value of fixedValues) {
          expect(value / 100).toBeCloseTo(Math.round(value / 100), 5);
        }
      }
    }
  });

  it("keeps rendered UPS chords within one pixel of the exact snapping grid", () => {
    const adapter = projectedAdapter(20, 85, 500);
    const crs = { kind: "ups", hemisphere: "north" } as const;
    const result = buildGridFeatures(adapter, 100, crs)!;
    let maximumDeviation = 0;

    for (const feature of result.features) {
      for (let index = 1; index < feature.geometry.coordinates.length; index++) {
        const start = feature.geometry.coordinates[index - 1]! as [number, number];
        const end = feature.geometry.coordinates[index]! as [number, number];
        const projectedStart = projectToGrid(crs, start);
        const projectedEnd = projectToGrid(crs, end);
        const exactMidpoint = unprojectFromGrid(crs, {
          easting: (projectedStart.easting + projectedEnd.easting) / 2,
          northing: (projectedStart.northing + projectedEnd.northing) / 2,
        }) as [number, number];
        const startPixel = adapter.getPixelFromCoordinate(start)!;
        const endPixel = adapter.getPixelFromCoordinate(end)!;
        const midpointPixel = adapter.getPixelFromCoordinate(exactMidpoint)!;
        const chordMidpoint: [number, number] = [
          (startPixel[0] + endPixel[0]) / 2,
          (startPixel[1] + endPixel[1]) / 2,
        ];
        maximumDeviation = Math.max(
          maximumDeviation,
          Math.hypot(
            midpointPixel[0] - chordMidpoint[0],
            midpointPixel[1] - chordMidpoint[1],
          ),
        );
      }
    }

    expect(maximumDeviation).toBeLessThanOrEqual(1);
  });

  it("applies configurable color, opacity, and width while strengthening every fifth line", () => {
    const result = buildGridFeatures(adapterForViewport(), 100, undefined, {
      color: "#ff8800",
      opacity: 0.65,
      strokeWidth: 2.5,
    })!;
    const major = result.features.find((feature) => feature.properties?.major === true)!;
    const minor = result.features.find((feature) => feature.properties?.major === false)!;

    expect(major.properties?.style).toEqual({
      strokeColor: "rgba(255, 136, 0, 0.65)",
      strokeWidth: 3.125,
    });
    expect(minor.properties?.style).toEqual({
      strokeColor: "rgba(255, 136, 0, 0.3)",
      strokeWidth: 2.5,
    });
  });
});
