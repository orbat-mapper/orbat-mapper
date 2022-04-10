import { Feature as GeoJsonFeature, LineString, Point, Polygon } from "geojson";
import { SimpleStyleSpec } from "../geo/simplestyle";

export type Position = number[];
export type ScenarioFeatureType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "Circle"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon"
  | "GeometryCollection";

export interface ScenarioFeatureProperties extends Partial<SimpleStyleSpec> {
  type: ScenarioFeatureType;

  [name: string]: any;
}

// A scenario feature is just a GeoJSON Feature with a required id field.
// Might have to change this to support time varying geometries
export interface ScenarioFeature
  extends GeoJsonFeature<Point | LineString | Polygon, ScenarioFeatureProperties> {
  id: string | number;
}

export interface ScenarioLayer {
  id: string | number;
  name: string;
  description?: string;
  features: ScenarioFeature[];
  _isNew?: boolean;
  isHidden?: boolean;
}

export interface ScenarioLayerInstance extends ScenarioLayer {
  //isVisible?: boolean;
}
