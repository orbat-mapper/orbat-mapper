import { Feature as GeoJsonFeature, LineString, Point, Polygon } from "geojson";
import { SimpleStyleSpec } from "@/geo/simplestyle";
import { ScenarioTime } from "@/types/base";

export interface VisibilityInfo {
  visibleFromT: ScenarioTime;
  visibleUntilT: ScenarioTime;
}

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

export interface ScenarioFeatureProperties
  extends Partial<SimpleStyleSpec>,
    Partial<VisibilityInfo> {
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

export interface ScenarioLayer extends Partial<VisibilityInfo> {
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

export interface LayerFeatureItem {
  id: FeatureId;
  type: "layer" | ScenarioFeatureType;
  name: string;
  description?: string;
  _pid?: FeatureId;
}
