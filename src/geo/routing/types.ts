import type {
  Feature,
  FeatureCollection,
  LineString,
  MultiPolygon,
  Polygon,
  Position,
} from "geojson";

export type RoutingOutcome = "unitTrack" | "feature";
export type RoutingObstacleGeometry = Polygon | MultiPolygon;
export type RoutingObstacleCollection = FeatureCollection<RoutingObstacleGeometry>;

export interface RoutingOptions {
  bufferObstacles: boolean;
  bufferRadius: number;
}

export interface RoutingRequest {
  start: Position;
  end: Position;
  obstacles: RoutingObstacleCollection;
  preparedObstacles?: RoutingObstacleCollection;
  obstacleCacheKey?: string;
  options?: Partial<RoutingOptions>;
}

export interface RoutingResult {
  path: Feature<LineString>;
  totalLengthMeters: number;
  waypoints: Position[];
  options: RoutingOptions;
}

export type RoutingErrorCode =
  | "no-route"
  | "blocked-endpoint"
  | "invalid-obstacles"
  | "worker-error"
  | "cancelled";

export class RoutingError extends Error {
  constructor(
    message: string,
    public readonly code: RoutingErrorCode,
  ) {
    super(message);
    this.name = "RoutingError";
  }
}

export interface RoutingWorkerRequest {
  requestId: number;
  start: Position;
  end: Position;
  obstacles: RoutingObstacleCollection;
  obstacleCacheKey?: string;
}

export type RoutingWorkerResponse =
  | {
      requestId: number;
      ok: true;
      path: Feature<LineString>;
      totalLengthMeters: number;
    }
  | {
      requestId: number;
      ok: false;
      code: Exclude<RoutingErrorCode, "cancelled">;
      message: string;
    };

export interface RoutingPreview {
  path: Feature<LineString>;
  start: Position;
  end: Position;
  totalLengthMeters: number;
  waypoints: Position[];
}

export interface RoutingDraftRoute {
  routeOrigin: Position;
  waypoints: Position[];
  totalLengthMeters: number;
}
