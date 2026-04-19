import { afterEach, describe, expect, it, vi } from "vitest";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import turfBuffer from "@turf/buffer";
import { booleanPointInPolygon, point } from "@turf/turf";
import type { RoutingWorkerRequest, RoutingWorkerResponse } from "@/geo/routing/types";
import { RoutingError } from "@/geo/routing/types";
import { computeVisibilityGraphRoute } from "@/geo/routing/visibilityGraph";
import {
  getRoutingObstacleSimplificationToleranceDegrees,
  prepareRoutingObstacles,
  ShortestPathService,
} from "@/geo/routing/shortestPathService";

function emptyObstacles(): FeatureCollection<Polygon | MultiPolygon> {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

function polygonObstacles(
  polygons: Polygon["coordinates"][],
): FeatureCollection<Polygon | MultiPolygon> {
  return {
    type: "FeatureCollection",
    features: polygons.map((coordinates) => ({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates,
      },
    })),
  };
}

function countPolygonVertices(obstacles: FeatureCollection<Polygon | MultiPolygon>) {
  return obstacles.features.reduce((total, feature) => {
    if (feature.geometry.type === "Polygon") {
      return (
        total +
        feature.geometry.coordinates.reduce(
          (ringTotal, ring) => ringTotal + ring.length,
          0,
        )
      );
    }

    return (
      total +
      feature.geometry.coordinates.reduce(
        (polygonTotal, polygon) =>
          polygonTotal + polygon.reduce((ringTotal, ring) => ringTotal + ring.length, 0),
        0,
      )
    );
  }, 0);
}

function createWorkerHarness() {
  const messages: RoutingWorkerRequest[] = [];
  const worker = {
    onmessage: null as ((event: MessageEvent<RoutingWorkerResponse>) => void) | null,
    postMessage(message: RoutingWorkerRequest) {
      messages.push(message);
    },
    terminate() {},
  } as unknown as Worker;

  return {
    worker,
    messages,
    respond(response: RoutingWorkerResponse) {
      worker.onmessage?.({ data: response } as MessageEvent<RoutingWorkerResponse>);
    },
  };
}

describe("ShortestPathService", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("unions overlapping polygon obstacles without buffering", () => {
    const prepared = prepareRoutingObstacles(
      polygonObstacles([
        [
          [
            [0, 0],
            [2, 0],
            [2, 2],
            [0, 2],
            [0, 0],
          ],
        ],
        [
          [
            [1, 0],
            [3, 0],
            [3, 2],
            [1, 2],
            [1, 0],
          ],
        ],
      ]),
      {
        bufferObstacles: false,
        bufferRadius: 0,
      },
    );

    expect(prepared.features).toHaveLength(1);
    expect(prepared.features[0]?.geometry.type).toBe("Polygon");
  });

  it("unions obstacles that overlap after buffering", () => {
    const prepared = prepareRoutingObstacles(
      polygonObstacles([
        [
          [
            [0, 0],
            [0.001, 0],
            [0.001, 0.001],
            [0, 0.001],
            [0, 0],
          ],
        ],
        [
          [
            [0.003, 0],
            [0.004, 0],
            [0.004, 0.001],
            [0.003, 0.001],
            [0.003, 0],
          ],
        ],
      ]),
      {
        bufferObstacles: true,
        bufferRadius: 200,
      },
    );

    expect(prepared.features).toHaveLength(1);
    expect(prepared.features[0]?.geometry.type).toBe("Polygon");
  });

  it("keeps disjoint polygon obstacles as one unioned multipolygon", () => {
    const prepared = prepareRoutingObstacles(
      polygonObstacles([
        [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
        [
          [
            [3, 0],
            [4, 0],
            [4, 1],
            [3, 1],
            [3, 0],
          ],
        ],
      ]),
      {
        bufferObstacles: false,
        bufferRadius: 0,
      },
    );

    expect(prepared.features).toHaveLength(1);
    expect(prepared.features[0]?.geometry.type).toBe("MultiPolygon");
  });

  it("routes against the unioned blocked area instead of individual overlaps", () => {
    const prepared = prepareRoutingObstacles(
      polygonObstacles([
        [
          [
            [0, 0],
            [2, 0],
            [2, 2],
            [0, 2],
            [0, 0],
          ],
        ],
        [
          [
            [1, 0],
            [3, 0],
            [3, 2],
            [1, 2],
            [1, 0],
          ],
        ],
      ]),
      {
        bufferObstacles: false,
        bufferRadius: 0,
      },
    );

    const path = computeVisibilityGraphRoute([-1, 1], [4, 1], prepared);
    const blocker = prepared.features[0]!;

    expect(path.geometry.coordinates.length).toBeGreaterThan(2);
    for (let index = 1; index < path.geometry.coordinates.length; index += 1) {
      const start = path.geometry.coordinates[index - 1]!;
      const end = path.geometry.coordinates[index]!;
      const midpoint = point([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]);
      expect(booleanPointInPolygon(midpoint, blocker, { ignoreBoundary: true })).toBe(
        false,
      );
    }
  });

  it("simplifies buffered routing obstacles to reduce vertex count", () => {
    const baseObstacles = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0.01, 0],
                [0.01, 0.01],
                [0, 0.01],
                [0, 0],
              ],
            ],
          },
        },
      ],
    } satisfies FeatureCollection<Polygon | MultiPolygon>;
    const options = {
      bufferObstacles: true,
      bufferRadius: 300,
    } as const;

    const rawBuffered = turfBuffer(baseObstacles, options.bufferRadius, {
      units: "meters",
    }) as FeatureCollection<Polygon | MultiPolygon>;
    const prepared = prepareRoutingObstacles(baseObstacles, options);

    expect(countPolygonVertices(prepared)).toBeLessThan(
      countPolygonVertices(rawBuffered),
    );
    expect(
      getRoutingObstacleSimplificationToleranceDegrees(options.bufferRadius),
    ).toBeGreaterThan(0);
  });

  it("rejects stale pending requests when a newer preview starts", async () => {
    const harness = createWorkerHarness();
    const service = new ShortestPathService(() => harness.worker);
    const request = {
      start: [0, 0] as [number, number],
      end: [1, 1] as [number, number],
      obstacles: emptyObstacles(),
    };

    const firstPromise = service.computeRoute(request);
    const secondPromise = service.computeRoute({
      ...request,
      end: [2, 2],
    });

    harness.respond({
      requestId: harness.messages[0]!.requestId,
      ok: true,
      path: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
        properties: {},
      },
      totalLengthMeters: 0,
    });

    await expect(firstPromise).rejects.toMatchObject({ code: "cancelled" });

    harness.respond({
      requestId: harness.messages[1]!.requestId,
      ok: true,
      path: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [2, 2],
          ],
        },
        properties: {},
      },
      totalLengthMeters: 0,
    });

    await expect(secondPromise).resolves.toMatchObject({
      waypoints: [
        [0, 0],
        [2, 2],
      ],
    });
  });

  it("returns typed worker failures", async () => {
    const harness = createWorkerHarness();
    const service = new ShortestPathService(() => harness.worker);

    const routePromise = service.computeRoute({
      start: [0, 0],
      end: [1, 1],
      obstacles: emptyObstacles(),
    });

    harness.respond({
      requestId: harness.messages[0]!.requestId,
      ok: false,
      code: "blocked-endpoint",
      message: "The selected destination is inside a routing obstacle.",
    });

    await expect(routePromise).rejects.toEqual(
      new RoutingError(
        "The selected destination is inside a routing obstacle.",
        "blocked-endpoint",
      ),
    );
  });

  it("wraps postMessage failures as typed worker errors", async () => {
    const worker = {
      onmessage: null as ((event: MessageEvent<RoutingWorkerResponse>) => void) | null,
      postMessage() {
        throw new DOMException("Could not clone routing request.", "DataCloneError");
      },
      terminate() {},
    } as unknown as Worker;
    const service = new ShortestPathService(() => worker);

    await expect(
      service.computeRoute({
        start: [0, 0],
        end: [1, 1],
        obstacles: emptyObstacles(),
      }),
    ).rejects.toMatchObject({
      code: "worker-error",
      message: "Could not clone routing request.",
    });
  });

  it("falls back to JSON cloning when structuredClone rejects the request payload", async () => {
    const harness = createWorkerHarness();
    const service = new ShortestPathService(() => harness.worker);
    const originalStructuredClone = globalThis.structuredClone;

    globalThis.structuredClone = (() => {
      throw new DOMException(
        "Failed to execute 'structuredClone' on 'Window': #<Object> could not be cloned.",
        "DataCloneError",
      );
    }) as typeof structuredClone;

    try {
      const routePromise = service.computeRoute({
        start: [0, 0],
        end: [1, 1],
        obstacles: {
          ...emptyObstacles(),
        },
      });

      expect(harness.messages[0]).toMatchObject({
        start: [0, 0],
        end: [1, 1],
      });

      harness.respond({
        requestId: harness.messages[0]!.requestId,
        ok: true,
        path: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          properties: {},
        },
        totalLengthMeters: 0,
      });

      await expect(routePromise).resolves.toMatchObject({
        waypoints: [
          [0, 0],
          [1, 1],
        ],
      });
    } finally {
      globalThis.structuredClone = originalStructuredClone;
    }
  });

  it("preserves the worker path coordinates in the routing result", async () => {
    const harness = createWorkerHarness();
    const service = new ShortestPathService(() => harness.worker);
    const routePromise = service.computeRoute({
      start: [179, 0],
      end: [-179, 0],
      obstacles: emptyObstacles(),
      options: {
        bufferRadius: 150,
      },
    });

    harness.respond({
      requestId: harness.messages[0]!.requestId,
      ok: true,
      path: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [179, 0],
            [180, 1],
            [181, 0],
          ],
        },
        properties: {},
      },
      totalLengthMeters: 0,
    });

    await expect(routePromise).resolves.toMatchObject({
      waypoints: [
        [179, 0],
        [180, 1],
        [181, 0],
      ],
      options: {
        bufferRadius: 150,
      },
    });
  });

  it("posts precomputed obstacles to the worker without recomputing them", async () => {
    const harness = createWorkerHarness();
    const service = new ShortestPathService(() => harness.worker);
    const preparedObstacles: FeatureCollection<Polygon | MultiPolygon> = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "prepared-obstacle",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 0],
              ],
            ],
          },
        },
      ],
    };

    const routePromise = service.computeRoute({
      start: [0, 0],
      end: [2, 2],
      obstacles: emptyObstacles(),
      preparedObstacles,
    });

    expect(harness.messages[0]?.obstacles).toEqual(preparedObstacles);

    harness.respond({
      requestId: harness.messages[0]!.requestId,
      ok: true,
      path: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [2, 2],
          ],
        },
        properties: {},
      },
      totalLengthMeters: 0,
    });

    await expect(routePromise).resolves.toMatchObject({
      waypoints: [
        [0, 0],
        [2, 2],
      ],
    });
  });

  it("times out stuck worker requests and recovers", async () => {
    vi.useFakeTimers();
    const harness = createWorkerHarness();
    const service = new ShortestPathService(() => harness.worker);

    const timedOutRoute = service.computeRoute({
      start: [0, 0],
      end: [1, 1],
      obstacles: emptyObstacles(),
    });
    const timedOutExpectation = expect(timedOutRoute).rejects.toEqual(
      new RoutingError(
        "Routing timed out while computing the path. Try reducing obstacles near the route.",
        "worker-error",
      ),
    );

    await vi.advanceTimersByTimeAsync(30_100);
    await timedOutExpectation;

    const nextRoute = service.computeRoute({
      start: [0, 0],
      end: [2, 2],
      obstacles: emptyObstacles(),
    });

    harness.respond({
      requestId: harness.messages[1]!.requestId,
      ok: true,
      path: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [2, 2],
          ],
        },
        properties: {},
      },
      totalLengthMeters: 0,
    });

    await expect(nextRoute).resolves.toMatchObject({
      waypoints: [
        [0, 0],
        [2, 2],
      ],
    });
  });
});
