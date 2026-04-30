import { describe, expect, it, vi } from "vitest";
import type { Geometry } from "geojson";
import type { PointLike } from "maplibre-gl";
import { getMapLibreSnapPosition } from "@/composables/maplibreSnapping";

type SnapMap = Parameters<typeof getMapLibreSnapPosition>[0];
type SnapFeature = {
  layer: { id: string };
  geometry: Geometry;
};

function createMap(queryRenderedFeatures: () => SnapFeature[]): SnapMap {
  return {
    project: vi.fn(([lng, lat]: [number, number]) => ({ x: lng, y: lat })),
    queryRenderedFeatures: vi.fn(() => queryRenderedFeatures()),
  };
}

function pointLike(x: number, y: number): PointLike {
  return [x, y];
}

describe("getMapLibreSnapPosition", () => {
  it("snaps to nearby rendered scenario vertices", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenario-feature-layer-1" },
        geometry: {
          type: "LineString",
          coordinates: [
            [5, 5],
            [10, 10],
          ],
        },
      },
    ]);

    expect(getMapLibreSnapPosition(mlMap, pointLike(5.1, 5.1))).toEqual([5, 5]);
  });

  it("snaps to the nearest rendered scenario segment point", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenario-feature-layer-1" },
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [100, 0],
          ],
        },
      },
    ]);

    expect(getMapLibreSnapPosition(mlMap, pointLike(40, 1))).toEqual([40, 0]);
  });

  it("prefers vertices over segment points within tolerance", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenario-feature-layer-1" },
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [100, 0],
          ],
        },
      },
      {
        layer: { id: "scenario-feature-layer-2" },
        geometry: {
          type: "Point",
          coordinates: [40, 8],
        },
      },
    ]);

    expect(getMapLibreSnapPosition(mlMap, pointLike(40, 1))).toEqual([40, 8]);
  });

  it("ignores non-scenario rendered layers", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "background-layer" },
        geometry: {
          type: "Point",
          coordinates: [5, 5],
        },
      },
    ]);

    expect(getMapLibreSnapPosition(mlMap, pointLike(5.1, 5.1))).toBeNull();
  });

  it("returns null when candidates are outside tolerance", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenario-feature-layer-1" },
        geometry: {
          type: "Point",
          coordinates: [100, 100],
        },
      },
    ]);

    expect(getMapLibreSnapPosition(mlMap, pointLike(5, 5))).toBeNull();
  });
});
