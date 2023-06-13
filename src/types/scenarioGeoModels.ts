import type { Feature as GeoJsonFeature, LineString, Point, Polygon } from "geojson";
import { SimpleStyleSpec } from "@/geo/simplestyle";
import { ScenarioTime } from "@/types/base";
import { CurrentStateType, ScenarioEventDescription } from "@/types/scenarioModels";

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

export interface ScenarioFeatureState extends Partial<ScenarioEventDescription> {
  id: string;
  t: ScenarioTime;
  geometry?: Point | LineString | Polygon;
  properties?: ScenarioFeatureProperties;
}

export interface CurrentScenarioFeatureState extends Omit<ScenarioFeatureState, "id"> {
  type?: CurrentStateType;
}

// A scenario feature is basically just a GeoJSON Feature with a required id field.
export interface ScenarioFeature
  extends GeoJsonFeature<Point | LineString | Polygon, ScenarioFeatureProperties> {
  id: FeatureId;
  state?: ScenarioFeatureState[];
  // internal runtime only state
  _hidden?: boolean;
  _state?: CurrentScenarioFeatureState | null;
}

export interface ScenarioLayer extends Partial<VisibilityInfo> {
  id: FeatureId;
  name: string;
  description?: string;
  features: ScenarioFeature[];
  _isNew?: boolean;
  isHidden?: boolean;
  _isOpen?: boolean;
  _hidden?: boolean;
}

export interface ScenarioImageLayer extends Partial<VisibilityInfo> {
  id: FeatureId;
  name: string;
  description?: string;
  attributions?: string | string[];
  url: string;
  imageCenter?: number[];
  imageScale?: number | number[];
  imageRotate?: number;
  opacity?: number;
  isHidden?: boolean;
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
