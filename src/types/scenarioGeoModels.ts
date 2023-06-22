import type { Feature as GeoJsonFeature, LineString, Point, Polygon } from "geojson";
import { SimpleStyleSpec } from "@/geo/simplestyle";
import { ScenarioTime } from "@/types/base";
import { CurrentStateType, ScenarioEventDescription } from "@/types/scenarioModels";

export interface VisibilityInfo {
  visibleFromT: ScenarioTime;
  visibleUntilT: ScenarioTime;
}

export type FeatureId = string | number;
export type LayerId = string | number;
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

interface ScenarioMapLayerBase extends Partial<VisibilityInfo> {
  id: FeatureId;
  name: string;
  description?: string;
  attributions?: string | string[];
  isHidden?: boolean;
  opacity?: number;
  extent?: number[];
  _isNew?: boolean;
  _status?: "uninitialized" | "loading" | "initialized" | "error";
}

export interface ScenarioImageLayer extends ScenarioMapLayerBase {
  type: "ImageLayer";
  url: string;
  imageCenter?: number[];
  imageScale?: number | number[];
  imageRotate?: number;
}

export interface ScenarioXYZLayer extends ScenarioMapLayerBase {
  type: "XYZLayer";
  url: string;
}

export interface ScenarioTileJSONLayer extends ScenarioMapLayerBase {
  type: "TileJSONLayer";
  url: string;
}

export type ScenarioMapLayer =
  | ScenarioImageLayer
  | ScenarioTileJSONLayer
  | ScenarioXYZLayer;

export type ScenarioMapLayerType = ScenarioMapLayer["type"];

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
