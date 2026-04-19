import turfBuffer from "@turf/buffer";
import { simplify as turfSimplify } from "@turf/simplify";
import { union as turfUnion } from "@turf/union";
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";
import WorkerConstructor from "@/geo/routing/shortestPath.worker?worker";
import type {
  RoutingOptions,
  RoutingRequest,
  RoutingResult,
  RoutingWorkerRequest,
  RoutingWorkerResponse,
} from "@/geo/routing/types";
import { RoutingError } from "@/geo/routing/types";

const DEFAULT_ROUTING_OPTIONS: RoutingOptions = {
  bufferObstacles: true,
  bufferRadius: 300,
};

type PendingRequest = {
  resolve: (value: RoutingResult) => void;
  reject: (reason?: unknown) => void;
  options: RoutingOptions;
  timeoutId: ReturnType<typeof setTimeout>;
};

const ROUTING_WORKER_TIMEOUT_MS = 30_000;

function cloneGeoJson<T>(value: T): T {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      // Vue-managed objects and some browser-native wrappers are not structured-cloneable.
      // GeoJSON is JSON-safe, so fall back to a JSON clone in those cases.
    }
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function toRoutingError(error: unknown): RoutingError {
  if (error instanceof RoutingError) {
    return error;
  }
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "Routing worker failed.";
  return new RoutingError(message, "worker-error");
}

function createEmptyObstacleCollection(): FeatureCollection<Polygon | MultiPolygon> {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

function metersToDegrees(meters: number) {
  return meters / 111_320;
}

function getObstacleSimplificationToleranceDegrees(bufferRadius: number) {
  // Keep simplification conservative so buffered blockers stay effectively intact
  // while removing the rounded-corner vertex churn produced by turf buffering.
  const toleranceMeters = Math.min(25, Math.max(5, bufferRadius * 0.08));
  return metersToDegrees(toleranceMeters);
}

function simplifyPreparedObstacles(
  obstacles: FeatureCollection<Polygon | MultiPolygon>,
  options: RoutingOptions,
) {
  if (obstacles.features.length === 0) {
    return obstacles;
  }

  return turfSimplify(obstacles, {
    tolerance: getObstacleSimplificationToleranceDegrees(options.bufferRadius),
    highQuality: false,
  }) as FeatureCollection<Polygon | MultiPolygon>;
}

function toObstacleCollection(
  obstacle:
    | Feature<Polygon | MultiPolygon>
    | FeatureCollection<Polygon | MultiPolygon>
    | undefined,
  failureMessage: string,
): FeatureCollection<Polygon | MultiPolygon> {
  if (!obstacle) {
    throw new RoutingError(failureMessage, "invalid-obstacles");
  }

  if (obstacle.type === "FeatureCollection") {
    return obstacle;
  }

  if (obstacle.type === "Feature") {
    return {
      type: "FeatureCollection",
      features: [obstacle],
    };
  }

  return createEmptyObstacleCollection();
}

function unionPreparedObstacles(
  obstacles: FeatureCollection<Polygon | MultiPolygon>,
): FeatureCollection<Polygon | MultiPolygon> {
  if (obstacles.features.length <= 1) {
    return obstacles;
  }

  try {
    return toObstacleCollection(
      turfUnion(obstacles) as Feature<Polygon | MultiPolygon> | undefined,
      "Failed to union routing obstacles.",
    );
  } catch (error) {
    if (error instanceof RoutingError) {
      throw error;
    }
    throw new RoutingError("Failed to union routing obstacles.", "invalid-obstacles");
  }
}

export function prepareRoutingObstacles(
  obstacles: FeatureCollection<Polygon | MultiPolygon>,
  options: RoutingOptions,
): FeatureCollection<Polygon | MultiPolygon> {
  const base = cloneGeoJson(obstacles);
  if (base.features.length === 0) {
    return base;
  }

  const shouldBuffer = options.bufferObstacles && options.bufferRadius > 0;
  if (!shouldBuffer) {
    return unionPreparedObstacles(base);
  }

  const buffered = toObstacleCollection(
    turfBuffer(base, options.bufferRadius, {
      units: "meters",
    }) as
      | Feature<Polygon | MultiPolygon>
      | FeatureCollection<Polygon | MultiPolygon>
      | undefined,
    "Failed to buffer routing obstacles.",
  );
  return simplifyPreparedObstacles(unionPreparedObstacles(buffered), options);
}

export function getRoutingObstacleSimplificationToleranceDegrees(bufferRadius: number) {
  return getObstacleSimplificationToleranceDegrees(bufferRadius);
}

export class ShortestPathService {
  private worker: Worker | null = null;

  private nextRequestId = 1;

  private latestRequestId = 0;

  private pending = new Map<number, PendingRequest>();

  constructor(
    private readonly createWorker: () => Worker = () => new WorkerConstructor(),
  ) {}

  private getWorker() {
    if (!this.worker) {
      this.worker = this.createWorker();
      this.worker.onmessage = (event: MessageEvent<RoutingWorkerResponse>) => {
        this.handleWorkerMessage(event.data);
      };
      this.worker.onerror = () => {
        this.resetWorker(new RoutingError("Routing worker failed.", "worker-error"));
      };
      this.worker.onmessageerror = () => {
        this.resetWorker(
          new RoutingError("Routing worker could not exchange data.", "worker-error"),
        );
      };
    }
    return this.worker;
  }

  private rejectAllPending(error: RoutingError) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timeoutId);
      pending.reject(error);
    }
    this.pending.clear();
  }

  private resetWorker(error: RoutingError) {
    this.worker?.terminate();
    this.worker = null;
    this.rejectAllPending(error);
  }

  private handleWorkerMessage(message: RoutingWorkerResponse) {
    const pending = this.pending.get(message.requestId);
    if (!pending) return;
    this.pending.delete(message.requestId);
    clearTimeout(pending.timeoutId);

    if (!message.ok) {
      pending.reject(new RoutingError(message.message, message.code));
      return;
    }

    pending.resolve({
      path: message.path,
      totalLengthMeters: message.totalLengthMeters,
      waypoints: message.path.geometry.coordinates,
      options: pending.options,
    });
  }

  private cancelStaleRequests(activeRequestId: number) {
    for (const [requestId, pending] of this.pending.entries()) {
      if (requestId >= activeRequestId) continue;
      pending.reject(new RoutingError("Routing request was superseded.", "cancelled"));
      this.pending.delete(requestId);
    }
  }

  async computeRoute(request: RoutingRequest): Promise<RoutingResult> {
    try {
      const options: RoutingOptions = {
        ...DEFAULT_ROUTING_OPTIONS,
        ...request.options,
      };

      const effectiveObstacles = request.preparedObstacles
        ? cloneGeoJson(request.preparedObstacles)
        : prepareRoutingObstacles(request.obstacles, options);
      const requestId = this.nextRequestId++;
      this.latestRequestId = requestId;
      this.cancelStaleRequests(requestId);

      const workerRequest: RoutingWorkerRequest = {
        requestId,
        start: cloneGeoJson(request.start),
        end: cloneGeoJson(request.end),
        obstacles: cloneGeoJson(effectiveObstacles),
        obstacleCacheKey: request.obstacleCacheKey,
      };

      const worker = this.getWorker();

      const result = await new Promise<RoutingResult>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.resetWorker(
            new RoutingError(
              "Routing timed out while computing the path. Try reducing obstacles near the route.",
              "worker-error",
            ),
          );
        }, ROUTING_WORKER_TIMEOUT_MS);
        this.pending.set(requestId, {
          resolve,
          reject,
          options,
          timeoutId,
        });
        try {
          worker.postMessage(workerRequest);
        } catch (error) {
          clearTimeout(timeoutId);
          this.pending.delete(requestId);
          reject(toRoutingError(error));
        }
      });

      if (requestId !== this.latestRequestId) {
        throw new RoutingError("Routing request was superseded.", "cancelled");
      }

      return result;
    } catch (error) {
      throw toRoutingError(error);
    }
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.rejectAllPending(new RoutingError("Routing service disposed.", "cancelled"));
  }
}

let sharedService: ShortestPathService | null = null;

export function getShortestPathService() {
  if (!sharedService) {
    sharedService = new ShortestPathService();
  }
  return sharedService;
}

export { DEFAULT_ROUTING_OPTIONS };
