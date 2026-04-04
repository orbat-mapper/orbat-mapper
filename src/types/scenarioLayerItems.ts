import type { GeoJsonProperties, Geometry } from "geojson";
import type { SimpleStyleSpec } from "@/geo/simplestyle";
import type { ScenarioTime } from "@/types/base";
import type {
  CurrentStateType,
  Media,
  ScenarioEventDescription,
} from "@/types/scenarioModels";
import type {
  LayerId,
  Position,
  ScenarioFeatureMeta,
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
 * GeometryLayerItem intentionally mirrors the existing geometry feature shape so
 * the geometry editor can migrate without renderer-specific coupling.
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

export interface GeometryLayerItemStatePatch {
  geometry?: Geometry;
  properties?: GeoJsonProperties;
}

export interface GeometryLayerItemState extends Partial<ScenarioEventDescription> {
  id: string;
  t: ScenarioTime;
  patch: GeometryLayerItemStatePatch;
}

export type LoadableGeometryLayerItemState =
  | GeometryLayerItemState
  | (Partial<ScenarioEventDescription> & {
      id: string;
      t: ScenarioTime;
      geometry?: Geometry;
      properties?: GeoJsonProperties;
    });

export interface CurrentGeometryLayerItemState
  extends Omit<GeometryLayerItemState, "id" | "patch">, GeometryLayerItemStatePatch {
  type?: CurrentStateType;
}

export interface GeometryLayerItem {
  kind: "geometry";
  type: "Feature";
  id: LayerItemId;
  geometry: Geometry;
  properties: GeoJsonProperties;
  meta: ScenarioFeatureMeta;
  style: Partial<SimpleStyleSpec>;
  state?: GeometryLayerItemState[];
  media?: Media[];
  _hidden?: boolean;
  _state?: CurrentGeometryLayerItemState | null;
}

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

export type NScenarioLayerItem = ScenarioLayerItem & {
  _pid: LayerId;
  _hidden?: boolean;
};

export type NGeometryLayerItem = GeometryLayerItem & {
  _pid: LayerId;
};

export type GeometryLayerItemLike = Omit<GeometryLayerItem, "kind"> & {
  kind?: "geometry";
};

export function createInitialGeometryLayerItemState(
  feature: Pick<GeometryLayerItem, "geometry">,
): CurrentGeometryLayerItemState {
  return {
    t: Number.MIN_SAFE_INTEGER,
    geometry: feature.geometry,
  };
}

export function isGeometryLayerItem(item: unknown): item is GeometryLayerItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<GeometryLayerItem> & { kind?: string };
  return candidate.kind === "geometry";
}

export function isGeometryLayerItemLike(item: unknown): item is GeometryLayerItemLike {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<GeometryLayerItem> & { kind?: string; type?: string };
  if (candidate.kind !== undefined) {
    return candidate.kind === "geometry";
  }
  // Transitional fallback for legacy feature-shaped data loaded before kind tagging.
  // Remove this once all call sites operate on canonical ScenarioLayerItem objects only.
  return candidate.type === "Feature" && !!candidate.geometry && !!candidate.meta;
}

export function isNGeometryLayerItem(
  item: NScenarioLayerItem,
): item is NGeometryLayerItem {
  return isGeometryLayerItem(item);
}

export function normalizeGeometryLayerItemState(
  state: LoadableGeometryLayerItemState,
): GeometryLayerItemState {
  if ("patch" in state && state.patch) {
    return state;
  }
  const legacyState = state as Exclude<
    LoadableGeometryLayerItemState,
    GeometryLayerItemState
  >;
  const { geometry, properties, ...rest } = legacyState;
  return {
    ...rest,
    patch: {
      ...(geometry !== undefined ? { geometry } : {}),
      ...(properties !== undefined ? { properties } : {}),
    },
  };
}

export function flattenGeometryLayerItemState(
  state: GeometryLayerItemState,
): Omit<LoadableGeometryLayerItemState, "patch"> {
  const { patch, ...rest } = state;
  return { ...rest, ...patch };
}

export function projectGeometryLayerItemState(
  state: GeometryLayerItemState,
): CurrentGeometryLayerItemState {
  const { id: _id, patch, ...rest } = state;
  return { ...rest, ...patch };
}

export type ScenarioLayerItemState =
  | GeometryLayerItemState
  | AnnotationLayerItemState
  | TacticalGraphicLayerItemState
  | MeasurementLayerItemState;

export interface ScenarioLayerItemsLayer extends Omit<ScenarioLayer, "features"> {
  items: ScenarioLayerItem[];
}

export interface NScenarioLayerItemsLayer extends Omit<ScenarioLayerItemsLayer, "items"> {
  items: LayerItemId[];
}

export interface GeometryLayerItemUpdate extends Partial<
  Omit<NGeometryLayerItem, "id" | "meta" | "kind">
> {
  meta?: Partial<ScenarioFeatureMeta>;
  _hidden?: boolean;
}

export interface FullScenarioLayerItemsLayer extends Omit<
  ScenarioLayerItemsLayer,
  "items"
> {
  items: NScenarioLayerItem[];
}
