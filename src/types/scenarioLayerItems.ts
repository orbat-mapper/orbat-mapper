import type { SimpleStyleSpec } from "@/geo/simplestyle";
import type { ScenarioTime } from "@/types/base";
import type { CurrentStateType, Media } from "@/types/scenarioModels";
import type {
  LayerId,
  Position,
  ScenarioFeature,
  ScenarioFeatureState,
  ScenarioLayer,
  VisibilityInfo,
} from "@/types/scenarioGeoModels";

/**
 * Transitional vNext layer-item model.
 *
 * The current runtime still uses the geometry-only ScenarioFeature model directly.
 * This file introduces the broader item taxonomy so the loader/store/render path
 * can migrate incrementally without changing behavior yet.
 *
 * GeometryLayerItem intentionally aliases the existing ScenarioFeature shape for
 * compatibility during the transition.
 */

export type LayerItemId = string;
export type ScenarioLayerItemKind =
  | "geometry"
  | "annotation"
  | "tacticalGraphic"
  | "measurement";

export type ShapeGeometry =
  | { type: "Point"; coordinates: Position }
  | { type: "LineString"; coordinates: Position[] }
  | { type: "Polygon"; coordinates: Position[][] }
  | { type: "MultiPoint"; coordinates: Position[] }
  | { type: "MultiLineString"; coordinates: Position[][] }
  | { type: "MultiPolygon"; coordinates: Position[][][] }
  | { type: "Circle"; center: Position; radius: number }
  | { type: "GeometryCollection"; geometries: ShapeGeometry[] };

/**
 * Shared renderer-agnostic item styling.
 *
 * This intentionally reuses the project's existing simplestyle fields rather
 * than exposing renderer-specific style objects as part of the stored model.
 */
export interface ScenarioLayerItemStyle extends Partial<SimpleStyleSpec> {
  label?: {
    show?: boolean;
    text?: string;
    minZoom?: number;
    maxZoom?: number;
    align?: "left" | "center" | "right";
    offset?: [number, number];
  };
}

export interface ScenarioLayerItemBase extends Partial<VisibilityInfo> {
  id: LayerItemId;
  kind: ScenarioLayerItemKind;
  name?: string;
  description?: string;
  externalUrl?: string;
  locked?: boolean;
  isHidden?: boolean;
  media?: Media[];
}

export type GeometryLayerItem = ScenarioFeature & { kind: "geometry" };
export type GeometryLayerItemState = ScenarioFeatureState;

export type AnnotationAnchor =
  | { type: "point"; position: Position }
  | { type: "layerItem"; layerItemId: LayerItemId; offset?: [number, number] }
  | {
      type: "line";
      layerItemId: LayerItemId;
      distance: number;
      offset?: [number, number];
    };

export interface AnnotationLayerItemState {
  id: string;
  t: ScenarioTime;
  note?: string;
  patch: Partial<
    Pick<
      AnnotationLayerItem,
      "anchor" | "content" | "style" | "name" | "description" | "isHidden"
    >
  >;
}

export interface AnnotationLayerItem extends ScenarioLayerItemBase {
  kind: "annotation";
  annotationType: "label" | "note" | "callout" | "image";
  anchor: AnnotationAnchor;
  content: {
    text?: string;
    markdown?: string;
    imageUrl?: string;
  };
  style?: ScenarioLayerItemStyle & {
    textAlign?: "left" | "center" | "right";
    textSize?: number;
    textColor?: string;
    backgroundColor?: string;
  };
  state?: AnnotationLayerItemState[];
}

export interface TacticalGraphicLayerItemState {
  id: string;
  t: ScenarioTime;
  note?: string;
  patch: Partial<
    Pick<
      TacticalGraphicLayerItem,
      | "graphicCode"
      | "controlPoints"
      | "modifiers"
      | "style"
      | "name"
      | "description"
      | "isHidden"
    >
  >;
}

export interface TacticalGraphicLayerItem extends ScenarioLayerItemBase {
  kind: "tacticalGraphic";
  standard?: "2525" | "app6";
  graphicCode: string;
  controlPoints: Position[];
  modifiers?: Record<string, string | number | boolean>;
  style?: ScenarioLayerItemStyle;
  state?: TacticalGraphicLayerItemState[];
}

export interface MeasurementLayerItemState {
  id: string;
  t: ScenarioTime;
  note?: string;
  patch: Partial<
    Pick<
      MeasurementLayerItem,
      | "source"
      | "units"
      | "precision"
      | "live"
      | "style"
      | "name"
      | "description"
      | "isHidden"
    >
  >;
}

export interface MeasurementLayerItem extends ScenarioLayerItemBase {
  kind: "measurement";
  measurementType: "distance" | "area" | "bearing" | "radius" | "route";
  source:
    | { type: "geometry"; geometry: ShapeGeometry }
    | { type: "layerItems"; layerItemIds: LayerItemId[] };
  units?: {
    length?: string;
    area?: string;
    angle?: string;
  };
  precision?: number;
  live?: boolean;
  style?: ScenarioLayerItemStyle;
  state?: MeasurementLayerItemState[];
}

export type ScenarioLayerItem =
  | GeometryLayerItem
  | AnnotationLayerItem
  | TacticalGraphicLayerItem
  | MeasurementLayerItem;

export type ScenarioLayerItemState =
  | GeometryLayerItemState
  | AnnotationLayerItemState
  | TacticalGraphicLayerItemState
  | MeasurementLayerItemState;

export type ProjectedScenarioLayerItem = ScenarioLayerItem & {
  projectionType?: CurrentStateType;
};

export interface ScenarioLayerItemsLayer extends Omit<ScenarioLayer, "features"> {
  items: ScenarioLayerItem[];
}

export interface NScenarioLayerItemsLayer extends Omit<ScenarioLayerItemsLayer, "items"> {
  items: LayerItemId[];
}

export type NScenarioLayerItem = ScenarioLayerItem & {
  _pid: LayerId;
  _state?: ProjectedScenarioLayerItem | null;
  _hidden?: boolean;
};
