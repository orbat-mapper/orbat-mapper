import type { GeoJsonProperties, Geometry } from "geojson";
import type {
  AmplifierPlacements,
  ControlMeasureKind,
  ControlMeasureStyle,
  TextAmplifiers as ControlMeasureTextAmplifiers,
} from "@orbat-mapper/control-measures";
import type { SimpleStyleSpec } from "@/geo/simplestyle";
import type { ScenarioTime } from "@/types/base";
import type { SidValue } from "@/symbology/values";
import type {
  CurrentStateType,
  Media,
  ScenarioEventDescription,
} from "@/types/scenarioModels";
import type {
  LayerId,
  Position,
  ScenarioFeatureType,
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
  "geometry" | "annotation" | "tacticalGraphic" | "measurement";

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

/**
 * The kind-agnostic shape of a projected `_state`.
 *
 * Every layer-item kind folds its `state[]` patches onto this. Kinds that carry a
 * meaningful patch narrow `_state` to their own current-state interface (see
 * `CurrentGeometryLayerItemState`, `CurrentTacticalGraphicLayerItemState`).
 */
export interface CurrentScenarioLayerItemState extends Partial<ScenarioEventDescription> {
  t: ScenarioTime;
  type?: CurrentStateType;
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
  userData?: Record<string, unknown>;
  /**
   * Derived, never serialized. Computed by the kind-agnostic base pass from
   * `visibleFromT`/`visibleUntilT`/`isHidden` against the current scenario time.
   */
  _hidden?: boolean;
  /**
   * Derived, never serialized. The `state[]` projection at the current scenario time,
   * or `undefined` when the item has no timed state.
   */
  _state?: CurrentScenarioLayerItemState | null;
}

// Canonical, strict geometry metadata. Each geometryKind carries only the
// extra fields that are meaningful for it:
// - "Circle" is stored as a Point geometry plus a required radius (metres).
// - "Polygon" may be marked as an axis-aligned rectangle; the geometry itself
//   stays a plain Polygon.
// All other kinds carry no extra fields.
export type GeometryLayerMeta =
  | { geometryKind: "Circle"; radius: number }
  | { geometryKind: "Polygon"; shape?: "rectangle" }
  | { geometryKind: Exclude<ScenarioFeatureType, "Circle" | "Polygon"> };

// Loose, non-discriminated counterpart for data that is still being loaded,
// upgraded, or partially patched, where the kind and its extra fields cannot
// yet be guaranteed to line up.
export type LoadableGeometryLayerMeta = {
  geometryKind?: ScenarioFeatureType;
  radius?: number;
  shape?: "rectangle";
};

export interface GeometryLayerItemStatePatch {
  geometry?: Geometry;
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
    });

export interface CurrentGeometryLayerItemState
  extends CurrentScenarioLayerItemState, GeometryLayerItemStatePatch {}

export interface GeometryLayerItem extends ScenarioLayerItemBase {
  kind: "geometry";
  geometry: Geometry;
  geometryMeta: GeometryLayerMeta;
  style: Partial<SimpleStyleSpec>;
  state?: GeometryLayerItemState[];
  _zIndex?: number;
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

/**
 * Per-kind option typing deliberately does NOT live here.
 *
 * `@orbat-mapper/control-measures` types options as a discriminated map over 78
 * kinds (`OptionsByKind`). Reproducing that in the *stored* model would force every
 * scenario-store write to narrow on `graphicKind`, and would reject any kind a newer
 * library adds. Options are therefore stored opaquely and typed at the
 * `toControlMeasure` seam, which is the only place that knows the kind statically.
 */
export type TacticalGraphicOptions = Record<string, unknown>;

/** Host-owned. The library models identity colouring nowhere. */
export type TacticalGraphicColorMode = "identity" | "monochrome";

/** Host-owned. The library models status nowhere. */
export type TacticalGraphicStatus = "present" | "planned";

export interface TacticalGraphicLayerItemStatePatch {
  graphicKind?: ControlMeasureKind;
  controlPoints?: Position[];
  options?: TacticalGraphicOptions;
  textAmplifiers?: ControlMeasureTextAmplifiers;
  amplifierPlacements?: AmplifierPlacements;
  style?: ControlMeasureStyle;
  standardIdentity?: SidValue;
  colorMode?: TacticalGraphicColorMode;
  status?: TacticalGraphicStatus;
  name?: string;
  description?: string;
  isHidden?: boolean;
}

export interface TacticalGraphicLayerItemState {
  id: string;
  t: ScenarioTime;
  note?: string;
  // Deliberately wide: recording only ever writes `controlPoints`, but an imported
  // scenario may carry a richer patch and must still project.
  patch: TacticalGraphicLayerItemStatePatch;
}

export interface CurrentTacticalGraphicLayerItemState
  extends CurrentScenarioLayerItemState, TacticalGraphicLayerItemStatePatch {}

/**
 * A doctrinal control measure.
 *
 * This *flattens* the library's `ControlMeasure` rather than embedding one: the same
 * field names, so `toControlMeasure` is a projection and not a translation. Three
 * fields — `standardIdentity`, `colorMode`, `status` — are host-owned and have no
 * library counterpart; they resolve into `style.color` / `style.strokeDash` at the
 * `toControlMeasure` seam and are never written back into storage.
 *
 * There is intentionally no `standard` field (the library is 2525E-only) and no
 * `schemaVersion` (the library reads it nowhere; the exact package pin makes the
 * scenario file version a faithful proxy).
 */
export interface TacticalGraphicLayerItem extends ScenarioLayerItemBase {
  kind: "tacticalGraphic";
  /**
   * The library's `ControlMeasureKind`. An unrecognised value is stored verbatim
   * and filtered out of the render batch — see `isSupportedTacticalGraphic`.
   */
  graphicKind: ControlMeasureKind;
  controlPoints: Position[];
  options?: TacticalGraphicOptions;
  textAmplifiers?: ControlMeasureTextAmplifiers;
  amplifierPlacements?: AmplifierPlacements;
  /** The library's `ControlMeasureStyle` verbatim, not `ScenarioLayerItemStyle`. */
  style?: ControlMeasureStyle;
  standardIdentity?: SidValue;
  colorMode?: TacticalGraphicColorMode;
  status?: TacticalGraphicStatus;
  state?: TacticalGraphicLayerItemState[];
  _state?: CurrentTacticalGraphicLayerItemState | null;
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

// `_hidden` and `_state` live on ScenarioLayerItemBase, so every kind carries them
// and there is a single declaration site.
export type NScenarioLayerItem = ScenarioLayerItem & {
  _pid: LayerId;
};

export type NGeometryLayerItem = GeometryLayerItem & {
  _pid: LayerId;
};

export type NTacticalGraphicLayerItem = TacticalGraphicLayerItem & {
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

/**
 * Kind-agnostic base pass: the seed a `state[]` fold starts from.
 *
 * Geometry seeds with its own current geometry so an item with timed state still
 * projects a geometry before the first entry's `t`. No other kind has a seedable
 * field today.
 */
export function createInitialScenarioLayerItemState(
  item: ScenarioLayerItem,
): CurrentScenarioLayerItemState {
  if (item.kind === "geometry") return createInitialGeometryLayerItemState(item);
  return { t: Number.MIN_SAFE_INTEGER };
}

/** Kind-agnostic base pass: flatten one state entry's patch over its own fields. */
export function projectScenarioLayerItemState(
  state: ScenarioLayerItemState,
): CurrentScenarioLayerItemState {
  const {
    id: _id,
    patch,
    ...rest
  } = state as unknown as {
    id: string;
    t: ScenarioTime;
    patch?: Record<string, unknown>;
  } & Record<string, unknown>;
  return { ...rest, ...(patch ?? {}) } as CurrentScenarioLayerItemState;
}

/**
 * Kind-agnostic base pass: fold every state entry at or before `timestamp`.
 *
 * `state[]` is assumed sorted by `t`, matching every existing writer.
 */
export function projectScenarioLayerItemStateAt(
  item: ScenarioLayerItem,
  timestamp: number,
): CurrentScenarioLayerItemState {
  let currentState = createInitialScenarioLayerItemState(item);
  const entries = (item.state ?? []) as ScenarioLayerItemState[];
  for (const entry of entries) {
    if (entry.t > timestamp) break;
    currentState = { ...currentState, ...projectScenarioLayerItemState(entry) };
  }
  return currentState;
}

/**
 * Kind-agnostic base pass: is this item hidden at `currentTime`?
 *
 * `visibleFromT`/`visibleUntilT` are exclusive bounds, matching the pre-existing
 * geometry-only behaviour exactly.
 */
export function computeScenarioLayerItemHidden(
  item: Pick<ScenarioLayerItemBase, "visibleFromT" | "visibleUntilT" | "isHidden">,
  currentTime: number,
): boolean {
  const visibleFromT = item.visibleFromT ?? Number.MIN_SAFE_INTEGER;
  const visibleUntilT = item.visibleUntilT ?? Number.MAX_SAFE_INTEGER;
  const timeHidden = currentTime <= visibleFromT || currentTime >= visibleUntilT;
  return timeHidden || !!item.isHidden;
}

export function isTacticalGraphicLayerItem(
  item: unknown,
): item is TacticalGraphicLayerItem {
  if (!item || typeof item !== "object") return false;
  return (item as { kind?: string }).kind === "tacticalGraphic";
}

export function isNTacticalGraphicLayerItem(
  item: NScenarioLayerItem,
): item is NTacticalGraphicLayerItem {
  return isTacticalGraphicLayerItem(item);
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
  // TODO: Remove the legacy `meta` branch once all geometry items enter through
  // the shared-base upgrade pipeline.
  // Remove this once all call sites operate on canonical ScenarioLayerItem objects only.
  return (
    candidate.type === "Feature" &&
    !!candidate.geometry &&
    ("geometryMeta" in candidate || "meta" in candidate)
  );
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
  const { geometry, ...rest } = legacyState;
  return {
    ...rest,
    patch: {
      ...(geometry !== undefined ? { geometry } : {}),
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
  Omit<NGeometryLayerItem, "id" | "geometryMeta" | "kind">
> {
  geometryMeta?: LoadableGeometryLayerMeta;
}

/**
 * The kind-agnostic slice of a layer-item update: only fields declared on
 * `ScenarioLayerItemBase`, so it is valid for every kind.
 *
 * `GeometryLayerItemUpdate` stays the richer, geometry-only form. This exists because
 * `updateFeature` narrows to geometry before it touches `style`/`geometry`/
 * `geometryMeta`, which leaves shared chrome — the layers panel's visibility and lock
 * toggles — with no way to write a `tacticalGraphic`.
 */
export type ScenarioLayerItemUpdate = Partial<
  Pick<
    ScenarioLayerItemBase,
    | "name"
    | "description"
    | "externalUrl"
    | "locked"
    | "isHidden"
    | "visibleFromT"
    | "visibleUntilT"
    | "media"
    | "userData"
  >
>;

/**
 * The `tacticalGraphic`-only slice of a layer-item update — the authoring fields a
 * settled edit session folds back in.
 *
 * A closed allowlist rather than a `Partial<TacticalGraphicLayerItem>`: the writer
 * copies field by field, so anything nameable here is writable, and `state` / `_state`
 * / `_pid` / `kind` / `graphicKind` must never be reachable through this door.
 * `graphicKind` is excluded because changing it would invalidate `options`, which is
 * typed per kind at the `toControlMeasure` seam; a different kind is a different
 * graphic. The shared base fields (name, visibility, lock, …) keep going through
 * `ScenarioLayerItemUpdate`.
 */
export type TacticalGraphicLayerItemUpdate = Partial<
  Pick<
    TacticalGraphicLayerItem,
    | "controlPoints"
    | "options"
    | "textAmplifiers"
    | "amplifierPlacements"
    | "style"
    | "standardIdentity"
    | "colorMode"
    | "status"
  >
>;

/** The fields `updateTacticalGraphic` copies, in the order it copies them. */
export const TACTICAL_GRAPHIC_UPDATE_FIELDS = [
  "controlPoints",
  "options",
  "textAmplifiers",
  "amplifierPlacements",
  "style",
  "standardIdentity",
  "colorMode",
  "status",
] as const satisfies readonly (keyof TacticalGraphicLayerItemUpdate)[];

export interface FullScenarioLayerItemsLayer extends Omit<
  ScenarioLayerItemsLayer,
  "items"
> {
  items: NScenarioLayerItem[];
}

const RESERVED_GEOMETRY_ITEM_USERDATA_KEYS = new Set([
  "type",
  "radius",
  "shape",
  "name",
  "description",
  "externalUrl",
  "locked",
  "isHidden",
  "visibleFromT",
  "visibleUntilT",
  "_zIndex",
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-style",
  "marker-color",
  "marker-size",
  "marker-symbol",
  "showLabel",
  "title",
  "text-placement",
  "text-align",
  "text-offset-x",
  "text-offset-y",
  "limitVisibility",
  "minZoom",
  "maxZoom",
  "textMinZoom",
  "textMaxZoom",
  "arrow-start",
  "arrow-end",
]);

export function getGeometryLayerItemLabelText(
  item: Pick<GeometryLayerItem, "name" | "userData">,
): string {
  const title = item.userData?.title;
  const userName = item.userData?.name;
  return (
    item.name ||
    (typeof title === "string" ? title : undefined) ||
    (typeof userName === "string" ? userName : undefined) ||
    ""
  );
}

export function toGeometryLayerItemGeoJsonProperties(
  item: Pick<
    GeometryLayerItem,
    | "name"
    | "description"
    | "externalUrl"
    | "locked"
    | "isHidden"
    | "visibleFromT"
    | "visibleUntilT"
    | "style"
    | "userData"
    | "geometryMeta"
    | "_zIndex"
  >,
): GeoJsonProperties {
  const properties: Record<string, unknown> = {
    ...(item.geometryMeta.geometryKind ? { type: item.geometryMeta.geometryKind } : {}),
    ...("radius" in item.geometryMeta && item.geometryMeta.radius !== undefined
      ? { radius: item.geometryMeta.radius }
      : {}),
    ...("shape" in item.geometryMeta && item.geometryMeta.shape !== undefined
      ? { shape: item.geometryMeta.shape }
      : {}),
    ...(item.name !== undefined ? { name: item.name } : {}),
    ...(item.description !== undefined ? { description: item.description } : {}),
    ...(item.externalUrl !== undefined ? { externalUrl: item.externalUrl } : {}),
    ...(item.locked !== undefined ? { locked: item.locked } : {}),
    ...(item.isHidden !== undefined ? { isHidden: item.isHidden } : {}),
    ...(item.visibleFromT !== undefined ? { visibleFromT: item.visibleFromT } : {}),
    ...(item.visibleUntilT !== undefined ? { visibleUntilT: item.visibleUntilT } : {}),
    ...(item._zIndex !== undefined ? { _zIndex: item._zIndex } : {}),
    ...(item.style ?? {}),
  };

  Object.entries(item.userData ?? {}).forEach(([key, value]) => {
    if (RESERVED_GEOMETRY_ITEM_USERDATA_KEYS.has(key) || value === undefined) return;
    properties[key] = value;
  });

  return properties;
}
