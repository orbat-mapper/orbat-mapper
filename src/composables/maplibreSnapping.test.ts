import { describe, expect, it, vi } from "vitest";
import type { Geometry } from "geojson";
import type { PointLike } from "maplibre-gl";
import { getMapLibreSnapPosition } from "@/composables/maplibreSnapping";

type SnapMap = Parameters<typeof getMapLibreSnapPosition>[0];
type SnapFeature = {
  layer: { id: string };
  geometry: Geometry;
  properties?: Record<string, unknown>;
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

  it("snaps to nearby unit layer features", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "unitLayer" },
        geometry: {
          type: "Point",
          coordinates: [5, 5],
        },
      },
    ]);

    expect(getMapLibreSnapPosition(mlMap, pointLike(5.1, 5.1))).toEqual([5, 5]);
  });

  it("snaps to nearby KML reference features", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenario-kml-layer-abc-line" },
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

  it("snaps to the scenario bounding box outline", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenarioBboxLine" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [10, 0],
              [10, 10],
              [0, 10],
              [0, 0],
            ],
          ],
        },
      },
    ]);

    expect(getMapLibreSnapPosition(mlMap, pointLike(10.1, 9.9))).toEqual([10, 10]);
  });

  it("snaps to the map settings max-extent outline", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "mapSettingsExtentLine" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [10, 0],
              [10, 10],
              [0, 10],
              [0, 0],
            ],
          ],
        },
      },
    ]);

    expect(getMapLibreSnapPosition(mlMap, pointLike(10.1, 9.9))).toEqual([10, 10]);
  });

  it("ignores non-snappable rendered layers", () => {
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

  it("queries a tolerance-sized box around the pointer", () => {
    const mlMap = createMap(() => []);

    getMapLibreSnapPosition(mlMap, pointLike(50, 50));

    expect(mlMap.queryRenderedFeatures).toHaveBeenCalledWith([
      [38, 38],
      [62, 62],
    ]);
  });

  it("snaps a vertex back to its own geometry when not excluded", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenario-feature-layer-1" },
        properties: { featureId: "feat-1" },
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [100, 0],
          ],
        },
      },
    ]);

    // Dragging the [0, 0] vertex 3px away still snaps back to it.
    expect(getMapLibreSnapPosition(mlMap, pointLike(0, 3))).toEqual([0, 0]);
  });

  it("excludes the edited feature so its vertex does not snap to itself", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenario-feature-layer-1" },
        properties: { featureId: "feat-1" },
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [100, 0],
          ],
        },
      },
    ]);

    expect(
      getMapLibreSnapPosition(mlMap, pointLike(0, 3), {
        excludeFeatureIds: new Set(["feat-1"]),
      }),
    ).toBeNull();
  });

  it("still snaps to other features while the edited feature is excluded", () => {
    const mlMap = createMap(() => [
      {
        layer: { id: "scenario-feature-layer-1" },
        properties: { featureId: "feat-1" },
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
        properties: { featureId: "feat-2" },
        geometry: {
          type: "Point",
          coordinates: [2, 2],
        },
      },
    ]);

    expect(
      getMapLibreSnapPosition(mlMap, pointLike(0, 3), {
        excludeFeatureIds: new Set(["feat-1"]),
      }),
    ).toEqual([2, 2]);
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
