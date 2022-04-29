import { Feature as GeoJsonFeature, LineString, Point, Polygon } from "geojson";
import { SimpleStyleSpec } from "../geo/simplestyle";

export type FeatureId = string | number;
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
  name?: string;
  description?: string;
  _zIndex?: number;
  [attribute: string]: any;
}

// A scenario feature is just a GeoJSON Feature with a required id field.
// Might have to change this to support time varying geometries
export interface ScenarioFeature
  extends GeoJsonFeature<Point | LineString | Polygon, ScenarioFeatureProperties> {
  id: FeatureId;
}

export interface ScenarioLayer {
  id: FeatureId;
  name: string;
  description?: string;
  features: ScenarioFeature[];
  _isNew?: boolean;
  isHidden?: boolean;
  _isOpen?: boolean;
}

export interface ScenarioLayerInstance extends ScenarioLayer {
  //isVisible?: boolean;
}
