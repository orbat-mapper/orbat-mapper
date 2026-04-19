import { describe, expect, it } from "vitest";
import { buffer as turfBuffer, lineString } from "@turf/turf";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { RoutingError } from "@/geo/routing/types";
import { computeVisibilityGraphRoute } from "@/geo/routing/visibilityGraph";

function emptyObstacles(): FeatureCollection<Polygon | MultiPolygon> {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

function polygonObstacle(
  coordinates: Polygon["coordinates"],
): FeatureCollection<Polygon | MultiPolygon> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates,
        },
      },
    ],
  };
}

describe("computeVisibilityGraphRoute", () => {
  it("returns a direct sampled geodesic when there are no obstacles", () => {
    const path = computeVisibilityGraphRoute([0, 0], [1, 0], emptyObstacles());

    expect(path.geometry.coordinates[0]).toEqual([0, 0]);
    expect(path.geometry.coordinates[path.geometry.coordinates.length - 1]).toEqual([
      1, 0,
    ]);
  });

  it("routes around polygon obstacles", () => {
    const path = computeVisibilityGraphRoute(
      [0, 0],
      [4, 0],
      polygonObstacle([
        [
          [1, -1],
          [3, -1],
          [3, 1],
          [1, 1],
          [1, -1],
        ],
      ]),
    );

    expect(path.geometry.coordinates.length).toBeGreaterThan(2);
    expect(
      path.geometry.coordinates.some(([, latitude]) => Math.abs(latitude) >= 1),
    ).toBe(true);
  });

  it("routes around buffered line obstacles", () => {
    const buffered = turfBuffer(
      lineString([
        [1, -1],
        [1, 1],
      ]),
      30,
      { units: "kilometers" },
    ) as
      | FeatureCollection<Polygon | MultiPolygon>
      | {
          type: "Feature";
          geometry: Polygon | MultiPolygon;
          properties: Record<string, unknown>;
        };
    const obstacles =
      buffered.type === "FeatureCollection"
        ? buffered
        : {
            type: "FeatureCollection" as const,
            features: [buffered],
          };

    const path = computeVisibilityGraphRoute([0, 0], [2, 0], obstacles);

    expect(path.geometry.coordinates.length).toBeGreaterThan(2);
    expect(path.geometry.coordinates.some(([, latitude]) => Math.abs(latitude) > 0)).toBe(
      true,
    );
  });

  it("rejects blocked start points", () => {
    expect(() =>
      computeVisibilityGraphRoute(
        [2, 0],
        [4, 0],
        polygonObstacle([
          [
            [1, -1],
            [3, -1],
            [3, 1],
            [1, 1],
            [1, -1],
          ],
        ]),
      ),
    ).toThrowError(
      new RoutingError(
        "The selected start point is inside a routing obstacle.",
        "blocked-endpoint",
      ),
    );
  });

  it("returns a dateline-crossing path on the short side of the world", () => {
    const path = computeVisibilityGraphRoute([179, 0], [-179, 0], emptyObstacles());
    const coordinates = path.geometry.coordinates;

    expect(coordinates[0]).toEqual([179, 0]);
    expect(coordinates[coordinates.length - 1]![0]).toBeGreaterThan(180);
    coordinates.slice(1).forEach((coordinate, index) => {
      expect(Math.abs(coordinate[0] - coordinates[index]![0])).toBeLessThan(10);
    });
  });

  it("detours around dateline obstacles without world-spanning jumps", () => {
    const path = computeVisibilityGraphRoute(
      [179, 0],
      [-179, 0],
      polygonObstacle([
        [
          [179.4, -1],
          [-179.4, -1],
          [-179.4, 1],
          [179.4, 1],
          [179.4, -1],
        ],
      ]),
    );
    const coordinates = path.geometry.coordinates;

    expect(coordinates.some(([, latitude]) => Math.abs(latitude) >= 1)).toBe(true);
    coordinates.slice(1).forEach((coordinate, index) => {
      expect(Math.abs(coordinate[0] - coordinates[index]![0])).toBeLessThan(10);
    });
  });

  it("drops colinear and duplicate coordinates from the generated path", () => {
    const path = computeVisibilityGraphRoute(
      [0, 0],
      [4, 0],
      polygonObstacle([
        [
          [1, -1],
          [3, -1],
          [3, 1],
          [1, 1],
          [1, -1],
        ],
      ]),
    );
    const coordinates = path.geometry.coordinates;

    for (let index = 1; index < coordinates.length; index += 1) {
      expect(coordinates[index]).not.toEqual(coordinates[index - 1]);
    }

    for (let index = 1; index < coordinates.length - 1; index += 1) {
      const [ax, ay] = coordinates[index - 1]!;
      const [bx, by] = coordinates[index]!;
      const [cx, cy] = coordinates[index + 1]!;
      const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      expect(Math.abs(cross)).toBeGreaterThan(1e-9);
    }
  });

  it("reports no route when obstacles enclose the destination", () => {
    expect(() =>
      computeVisibilityGraphRoute([5, 0], [0, 0], {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [-4, -4],
                  [4, -4],
                  [4, 4],
                  [-4, 4],
                  [-4, -4],
                ],
                [
                  [-1, -1],
                  [-1, 1],
                  [1, 1],
                  [1, -1],
                  [-1, -1],
                ],
              ],
            },
          },
        ],
      }),
    ).toThrowError(
      new RoutingError(
        "No route could be found for the selected destination.",
        "no-route",
      ),
    );
  });
});
