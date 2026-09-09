import { describe, expect, it } from "vitest";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import {
  DEFAULT_GRID_APPEARANCE,
  buildLatLongGridPortrayal,
  formatAngularReference,
  nearestPointOnAngularLine,
  splitAtAntimeridian,
  visibleAngularInterval,
} from "./index";
import { faithfulPixelFor } from "./roundTrip";
import { unwrapLongitude } from "./geo";

function flatAdapter(
  center: [number, number] = [10, 50],
  pixelsPerDegree = 20,
): MapAdapter {
  return {
    getViewportSize: () => ({ width: 800, height: 600 }),
    getResolution: () => 1,
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) => [
      center[0] + (x - 400) / pixelsPerDegree,
      center[1] - (y - 300) / pixelsPerDegree,
    ],
    getPixelFromCoordinate: (coordinate: number[]) => [
      400 + (unwrapLongitude(center[0], coordinate[0]!) - center[0]) * pixelsPerDegree,
      300 - (coordinate[1]! - center[1]) * pixelsPerDegree,
    ],
  } as unknown as MapAdapter;
}

function globeAdapter(): MapAdapter {
  const radius = 250;
  return {
    getViewportSize: () => ({ width: 800, height: 600 }),
    getResolution: () => 1,
    getPixelFromCoordinate: ([longitude, latitude]: number[]) => {
      const lon = (longitude! * Math.PI) / 180;
      const lat = (latitude! * Math.PI) / 180;
      return [400 + radius * Math.cos(lat) * Math.sin(lon), 300 - radius * Math.sin(lat)];
    },
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) => {
      let dx = (x - 400) / radius;
      let dy = (y - 300) / radius;
      const length = Math.hypot(dx, dy);
      if (length > 1) {
        dx /= length;
        dy /= length;
      }
      const latitude = (-Math.asin(dy) * 180) / Math.PI;
      const longitude =
        (Math.atan2(dx, Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy))) * 180) / Math.PI;
      return [longitude, latitude];
    },
  } as unknown as MapAdapter;
}

describe("Latitude/longitude references", () => {
  it("uses stable decimal 1–2–5 adaptive intervals", () => {
    expect(visibleAngularInterval(0.01, 0.0001)).toBe(0.01);
    expect(visibleAngularInterval(0.01, 0.001)).toBe(0.05);
    expect(visibleAngularInterval(0.01, 0.01)).toBe(0.5);
    expect(visibleAngularInterval(0.01, 0.1)).toBe(5);
  });

  it("formats compact decimal hemisphere references", () => {
    expect(formatAngularReference(10.5, "longitude", 0.25)).toBe("10.5°E");
    expect(formatAngularReference(-60.25, "latitude", 0.25)).toBe("60.25°S");
    expect(formatAngularReference(0, "longitude", 1)).toBe("0°E");
  });

  it("splits a continuous line at the antimeridian", () => {
    expect(
      splitAtAntimeridian([
        [179, 10],
        [181, 10],
      ]),
    ).toEqual([
      [
        [179, 10],
        [180, 10],
      ],
      [
        [-180, 10],
        [-179, 10],
      ],
    ]);
  });
});

describe("Latitude/longitude portrayal", () => {
  it("renders and labels the active Mercator world copy", () => {
    const result = buildLatLongGridPortrayal(
      flatAdapter([179, 20]),
      { interval: 1 },
      DEFAULT_GRID_APPEARANCE,
    );
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.labels.map((label) => label.anchor)).toContain("bottom");
    expect(result?.labels.map((label) => label.anchor)).toContain("left");
    expect(new Set(result?.labels.map((label) => label.text)).size).toBe(
      result?.labels.length,
    );
    for (const feature of result?.features ?? []) {
      for (let index = 1; index < feature.geometry.coordinates.length; index++) {
        expect(
          Math.abs(
            feature.geometry.coordinates[index]![0]! -
              feature.geometry.coordinates[index - 1]![0]!,
          ),
        ).toBeLessThanOrEqual(180);
      }
    }
  });

  it("densely approximates visible globe parallels and rejects the far side", () => {
    const adapter = globeAdapter();
    const result = buildLatLongGridPortrayal(
      adapter,
      { interval: 10 },
      DEFAULT_GRID_APPEARANCE,
    );
    const parallel = result?.features.find((feature) =>
      String(feature.id).includes("latlong-lat"),
    );
    expect(parallel?.geometry.coordinates.length).toBeGreaterThan(2);
    expect(result?.labels.map((label) => label.anchor)).toContain("bottom");
    expect(result?.labels.map((label) => label.anchor)).toContain("left");
    for (const feature of result?.features ?? []) {
      for (const coordinate of feature.geometry.coordinates) {
        expect(faithfulPixelFor(adapter, coordinate as [number, number])).not.toBeNull();
      }
    }
  });

  it("snaps against the same visible screen-space curve near the globe horizon", () => {
    const adapter = globeAdapter();
    const coordinate = nearestPointOnAngularLine(adapter, [645, 250], "latitude", 10, 0);
    expect(coordinate).not.toBeNull();
    expect(coordinate?.[1]).toBeCloseTo(10, 8);
    expect(faithfulPixelFor(adapter, coordinate!)).not.toBeNull();
    expect(nearestPointOnAngularLine(adapter, [790, 10], "longitude", 180, 0)).toBeNull();
  });
});
