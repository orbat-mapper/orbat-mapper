import type { FeatureCollection, MultiPolygon } from "geojson";

export interface DayNightTerminatorWorkerRequest {
  requestId: number;
  time: number;
}

export interface DayNightTerminatorWorkerResponse {
  requestId: number;
  featureCollection: FeatureCollection<MultiPolygon>;
}
