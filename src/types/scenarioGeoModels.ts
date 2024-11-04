import type { Feature as GeoJsonFeature, Geometry } from "geojson";
import { FillStyleSpec, SimpleStyleSpec, StrokeStyleSpec } from "@/geo/simplestyle";
import { ScenarioTime } from "@/types/base";
import {
  CurrentStateType,
  Media,
  ScenarioEventDescription,
} from "@/types/scenarioModels";

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

  [attribute: string]: any;
}

export interface ScenarioFeatureMeta extends Partial<VisibilityInfo> {
  type: ScenarioFeatureType;
  name?: string;
  description?: string;
  externalUrl?: string;
  radius?: number;
  locked?: boolean;
  // internal runtime only state
  _zIndex?: number;
}

export interface ScenarioFeatureState extends Partial<ScenarioEventDescription> {
  id: string;
  t: ScenarioTime;
  geometry?: Geometry;
  properties?: ScenarioFeatureProperties;
}

export interface CurrentScenarioFeatureState extends Omit<ScenarioFeatureState, "id"> {
  type?: CurrentStateType;
}

// A scenario feature is basically just a GeoJSON Feature with a required id field.
export interface ScenarioFeature extends GeoJsonFeature {
  id: FeatureId;
  meta: ScenarioFeatureMeta;
  style: Partial<SimpleStyleSpec>;
  state?: ScenarioFeatureState[];
  media?: Media[];
  // internal runtime only state
  _hidden?: boolean;
  _state?: CurrentScenarioFeatureState | null;
}

export interface ScenarioLayer extends Partial<VisibilityInfo> {
  id: FeatureId;
  name: string;
  description?: string;
  attributions?: string;
  externalUrl?: string;
  features: ScenarioFeature[];
  isHidden?: boolean;
  opacity?: number;
  locked?: boolean;
  _isNew?: boolean;
  _isOpen?: boolean;
  _hidden?: boolean;
}

interface ScenarioMapLayerBase extends Partial<VisibilityInfo> {
  id: FeatureId;
  name: string;
  description?: string;
  attributions?: string;
  externalUrl?: string;
  isHidden?: boolean;
  opacity?: number;
  extent?: number[];
  _isNew?: boolean;
  _status?: "uninitialized" | "loading" | "initialized" | "error";
  _isTemporary?: boolean;
}

export interface ScenarioImageLayer extends ScenarioMapLayerBase {
  type: "ImageLayer";
  url: string;
  imageCenter?: number[];
  imageScale?: number | number[];
  imageRotate?: number;
}

export interface ScenarioKMLLayer extends ScenarioMapLayerBase {
  type: "KMLLayer";
  url: string;
  extractStyles?: boolean;
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
  | ScenarioXYZLayer
  | ScenarioKMLLayer;

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

export interface RangeRing {
  name: string;
  range: number;
  uom: "m" | "km" | "ft" | "mi" | "nmi";
  hidden?: boolean;
  style?: Partial<RangeRingStyle>;
  group?: string | null;
  _counter?: number;
}

export interface RangeRingGroup {
  name: string;
  style?: Partial<RangeRingStyle>;
}

export interface RangeRingStyle extends StrokeStyleSpec, FillStyleSpec {}
