import { Feature as GeoJsonFeature, LineString, Point, Polygon } from "geojson";

export type Position = number[];

// A scenario feature is just a GeoJSON Feature with a required id field.
// Might have to change this to support time varying geometries
export interface ScenarioFeature extends GeoJsonFeature<Point | LineString | Polygon> {
  id: string | number;
}

export interface ScenarioLayer {
  id: string | number;
  name: string;
  description?: string;
  features: ScenarioFeature[];
}
