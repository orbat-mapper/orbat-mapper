/**
 * The `tacticalGraphic` layer item to `ControlMeasure` seam.
 *
 * This is the *only* place that turns a stored control measure into something the
 * library will render, and it owns two responsibilities that live nowhere else:
 *
 * 1. **Per-kind option typing.** `TacticalGraphicOptions` is deliberately opaque in
 *    the stored model (see `@/types/scenarioLayerItems`). This function is the one
 *    place that knows `graphicKind` statically, so the narrowing happens here.
 * 2. **The host projections.** The library models neither identity colouring nor
 *    status, so `standardIdentity` / `colorMode` / `status` resolve into
 *    `style.color` / `style.strokeDash` here — at read time, never in storage.
 *
 * It lives in `src/geo/` beside `unitStyles.ts` and `featureStyles.ts`, which are the
 * same kind of thing (a stored item projected into a renderer's input) and are
 * likewise engine-agnostic. It is deliberately *not* under `src/modules/maplibreview/`:
 * the GeoJSON export path in `src/importexport/` needs it too, and must not have to
 * reach into a view module for it.
 */
import { cloneControlMeasure } from "@orbat-mapper/control-measures";
import type {
  ControlMeasure,
  ControlMeasureKind,
  ControlMeasureStyle,
  OptionsByKind,
} from "@orbat-mapper/control-measures";
import type { Feature, MultiPoint, Position } from "geojson";
import { toRaw } from "vue";
import { identityColor } from "@/symbology/identityColors";
import type {
  TacticalGraphicLayerItem,
  TacticalGraphicOptions,
} from "@/types/scenarioLayerItems";

/** Fixed, not a surface tone: this app's dark mode tracks UI chrome, basemaps never invert. */
export const MONOCHROME_COLOR = "#000000";

/** The dash pattern a Planned control measure gets when it has no authored one. */
export const PLANNED_STROKE_DASH: readonly number[] = [8, 6];

/**
 * The fields `toControlMeasure` reads. Everything else on the item (name, media,
 * visibility, …) is host bookkeeping the library never sees.
 */
type ProjectionInputs = Pick<
  TacticalGraphicLayerItem,
  | "graphicKind"
  | "controlPoints"
  | "options"
  | "textAmplifiers"
  | "amplifierPlacements"
  | "style"
  | "standardIdentity"
  | "colorMode"
  | "status"
>;

const PROJECTION_FIELDS = [
  "graphicKind",
  "controlPoints",
  "options",
  "textAmplifiers",
  "amplifierPlacements",
  "style",
  "standardIdentity",
  "colorMode",
  "status",
] as const satisfies readonly (keyof ProjectionInputs)[];

/**
 * The item's fields with its projected timed state folded on top.
 *
 * `_state` is the base pass's projection of `state[]` at the current scenario time.
 * It is derived and lives only on the in-memory item, so reading it here keeps the
 * ADR's "projections resolve at read time" rule intact.
 *
 * Every value is unwrapped with `toRaw`: the item is a Vue `reactive()` object, and a
 * reactive proxy must not travel any further than this function. `toRaw` is enough on
 * its own because a reactive proxy wraps the untouched original, whose nested values
 * are themselves raw — so the result is raw all the way down, and `structuredClone`
 * (which refuses a proxied array outright) can copy it in `buildControlMeasure`.
 * Unwrapping does not detach: these are still store references, so anything that
 * hands them onwards must copy.
 */
function resolveProjectionInputs(item: TacticalGraphicLayerItem): ProjectionInputs {
  const resolved = {} as Record<string, unknown>;
  const current = item._state;
  for (const field of PROJECTION_FIELDS) {
    const patched = current?.[field];
    resolved[field] = toRaw(patched !== undefined ? patched : item[field]);
  }
  return resolved as ProjectionInputs;
}

/**
 * The single deliberate narrowing of the opaque stored options.
 *
 * There is no runtime validation to do here: the library validates options itself at
 * render time, and an unrecognised `graphicKind` is filtered out of the batch before
 * it ever reaches this function (see `isSupportedTacticalGraphic`).
 */
function narrowOptions<K extends ControlMeasureKind>(
  _kind: K,
  options: TacticalGraphicOptions,
): OptionsByKind[K] {
  return options as OptionsByKind[K];
}

/**
 * `color = style.color ?? (monochrome ? "#000000" : identityColor(sid))`
 *
 * An authored colour always wins, so an imported control measure keeps its colour
 * whatever its identity says.
 */
export function resolveControlMeasureColor(item: TacticalGraphicLayerItem): string {
  return colorFromInputs(resolveProjectionInputs(item));
}

/**
 * The same projection, over loose fields rather than a stored item.
 *
 * The styling UI edits `style` / `colorMode` / `standardIdentity` and has to show the
 * colour they resolve to — including for the authoring *defaults*, which have no item
 * to hang on at all. Exported so that projection is never re-implemented there.
 */
export function resolveControlMeasureColorFrom(
  inputs: Pick<ProjectionInputs, "style" | "colorMode" | "standardIdentity">,
): string {
  return colorFromInputs(inputs as ProjectionInputs);
}

function colorFromInputs({
  style,
  colorMode,
  standardIdentity,
}: ProjectionInputs): string {
  if (style?.color !== undefined) return style.color;
  return colorMode === "monochrome" ? MONOCHROME_COLOR : identityColor(standardIdentity);
}

/**
 * `strokeDash = style.strokeDash ?? (planned ? [8, 6] : [])`
 *
 * Present is an explicit empty array rather than `undefined`, so the projection
 * always overrides whatever the library's own per-kind default would have been.
 */
export function resolveControlMeasureStrokeDash(
  item: TacticalGraphicLayerItem,
): number[] {
  return strokeDashFromInputs(resolveProjectionInputs(item));
}

function strokeDashFromInputs({ style, status }: ProjectionInputs): number[] {
  if (style?.strokeDash !== undefined) return [...style.strokeDash];
  return status === "planned" ? [...PLANNED_STROKE_DASH] : [];
}

/**
 * The item's control points with its timed state folded on top.
 *
 * Exported because selection needs a zoom target for a control measure and must read
 * the same projected points the renderer does — a recorded `controlPoints` patch has
 * to move the zoom target with the graphic.
 */
export function resolveControlMeasureControlPoints(
  item: TacticalGraphicLayerItem,
): Position[] {
  return resolveProjectionInputs(item).controlPoints ?? [];
}

/**
 * The projected generator options, for the same reason as `resolveControlMeasureControlPoints`:
 * the options editor has to show the values the map is drawing with, and a recorded
 * options patch replaces them at the current time.
 */
export function resolveControlMeasureOptions(
  item: TacticalGraphicLayerItem,
): TacticalGraphicOptions | undefined {
  return resolveProjectionInputs(item).options;
}

/**
 * A GeoJSON stand-in for a control measure's extent, for `fitGeometry` / `centerOfMass`.
 *
 * Deliberately the **control points**, not `renderControlMeasure`'s output. The points
 * are what the user placed and always bound the graphic closely enough to frame it,
 * they cost nothing, and — unlike a render — they exist for an unsupported
 * `graphicKind` too, so "zoom to" still works on a graphic that cannot be drawn.
 * The cost is that a kind whose rendering bulges outside its control points (an arc,
 * a fan) can frame slightly tight. Returns `undefined` when there is nothing to frame.
 */
export function controlMeasureExtentFeature(
  item: TacticalGraphicLayerItem,
): Feature<MultiPoint> | undefined {
  const controlPoints = resolveControlMeasureControlPoints(item);
  if (controlPoints.length === 0) return undefined;
  return {
    type: "Feature",
    id: item.id,
    properties: {},
    geometry: { type: "MultiPoint", coordinates: controlPoints.map((p) => [...p]) },
  };
}

/**
 * Keys the item-level GeoJSON bag owns. `userData` may not shadow them.
 *
 * Mirrors `RESERVED_GEOMETRY_ITEM_USERDATA_KEYS` in `@/types/scenarioLayerItems`,
 * and additionally reserves the three structural keys the export stamps on every
 * rendered part (`cmId`, `part`, `index`) plus `id`.
 */
const RESERVED_TACTICAL_GRAPHIC_USERDATA_KEYS: ReadonlySet<string> = new Set([
  "graphicKind",
  "controlPoints",
  "options",
  "textAmplifiers",
  "amplifierPlacements",
  "style",
  "standardIdentity",
  "colorMode",
  "status",
  "name",
  "description",
  "externalUrl",
  "locked",
  "isHidden",
  "visibleFromT",
  "visibleUntilT",
  "id",
  "cmId",
  "part",
  "index",
]);

/**
 * The item-level parameter bag carried on every exported feature of a control measure.
 *
 * The exported *geometry* is `renderControlMeasure`'s output, which cannot be turned
 * back into an item; this bag is what makes the export reconstructable. It is
 * therefore the **authoring parameters**, not the resolved render style:
 * `style` here is the item's own `ControlMeasureStyle` and is emitted alongside
 * `standardIdentity` / `colorMode` / `status`, so a reconstruction re-runs the host
 * projections rather than baking a colour in twice.
 *
 * Values are read through `resolveProjectionInputs`, so the bag describes the graphic
 * **as exported** — i.e. with its timed state projected at the current scenario time,
 * matching the geometry that sits beside it.
 *
 * Write-only until import reconstruction (#646) exists.
 */
export function toTacticalGraphicGeoJsonProperties(
  item: TacticalGraphicLayerItem,
): Record<string, unknown> {
  const inputs = resolveProjectionInputs(item);
  const properties: Record<string, unknown> = {
    graphicKind: inputs.graphicKind,
    // Copied out: the stored array is reactive state and this bag outlives the read.
    controlPoints: (inputs.controlPoints ?? []).map((position) => [...position]),
    ...(inputs.options !== undefined ? { options: inputs.options } : {}),
    ...(inputs.textAmplifiers !== undefined
      ? { textAmplifiers: inputs.textAmplifiers }
      : {}),
    ...(inputs.amplifierPlacements !== undefined
      ? { amplifierPlacements: inputs.amplifierPlacements }
      : {}),
    ...(inputs.style !== undefined ? { style: inputs.style } : {}),
    ...(inputs.standardIdentity !== undefined
      ? { standardIdentity: inputs.standardIdentity }
      : {}),
    ...(inputs.colorMode !== undefined ? { colorMode: inputs.colorMode } : {}),
    ...(inputs.status !== undefined ? { status: inputs.status } : {}),
    ...(item.name !== undefined ? { name: item.name } : {}),
    ...(item.description !== undefined ? { description: item.description } : {}),
    ...(item.externalUrl !== undefined ? { externalUrl: item.externalUrl } : {}),
    ...(item.locked !== undefined ? { locked: item.locked } : {}),
    ...(item.isHidden !== undefined ? { isHidden: item.isHidden } : {}),
    ...(item.visibleFromT !== undefined ? { visibleFromT: item.visibleFromT } : {}),
    ...(item.visibleUntilT !== undefined ? { visibleUntilT: item.visibleUntilT } : {}),
  };

  Object.entries(item.userData ?? {}).forEach(([key, value]) => {
    if (RESERVED_TACTICAL_GRAPHIC_USERDATA_KEYS.has(key) || value === undefined) return;
    properties[key] = value;
  });

  return properties;
}

/** The stored style with the two host projections resolved on top. */
export function resolveControlMeasureStyle(
  item: TacticalGraphicLayerItem,
): ControlMeasureStyle {
  return styleFromInputs(resolveProjectionInputs(item));
}

function styleFromInputs(inputs: ProjectionInputs): ControlMeasureStyle {
  return {
    ...inputs.style,
    color: colorFromInputs(inputs),
    strokeDash: strokeDashFromInputs(inputs),
  };
}

function buildControlMeasure(item: TacticalGraphicLayerItem): ControlMeasure {
  const inputs = resolveProjectionInputs(item);
  const kind = inputs.graphicKind;
  const measure: ControlMeasure = {
    // No id reconciliation: the host injects `nanoid` as tactical-draw's `generateId`,
    // so `ControlMeasure.id === item.id` from birth.
    id: item.id,
    kind,
    controlPoints: inputs.controlPoints ?? [],
    style: styleFromInputs(inputs),
  };
  if (inputs.options !== undefined) measure.options = narrowOptions(kind, inputs.options);
  if (inputs.textAmplifiers !== undefined) measure.textAmplifiers = inputs.textAmplifiers;
  if (inputs.amplifierPlacements !== undefined) {
    measure.amplifierPlacements = inputs.amplifierPlacements;
  }
  // Detached from the store before it leaves this function. `resolveProjectionInputs`
  // has already unwrapped the reactive proxies, but the values are still the store's
  // own arrays and objects; ADR-0006 forbids reactivity reaching anything the engine
  // holds (deep reactivity breaks tactical-draw's object-identity render cache), and
  // the dev-only guard inside `render()` is shallow by construction and cannot see a
  // proxy nested in a raw `Graphic`. Handing over live store references would also let
  // a future re-`reactive()` of the same target reintroduce exactly that. The library's
  // own `structuredClone`-backed deep clone is used rather than a hand-rolled copy so
  // it stays correct as `ControlMeasure` grows fields. Inside the memoised builder, so
  // it is paid once per item change, not once per render.
  return cloneControlMeasure(measure);
}

interface CacheEntry {
  /** Reference snapshot of every projection input, in `PROJECTION_FIELDS` order. */
  signature: unknown[];
  /** The projected `_state`, which is replaced wholesale on every time projection. */
  state: unknown;
  measure: ControlMeasure;
}

const cache = new WeakMap<TacticalGraphicLayerItem, CacheEntry>();

function currentSignature(item: TacticalGraphicLayerItem): unknown[] {
  return PROJECTION_FIELDS.map((field) => item[field]);
}

function isFresh(entry: CacheEntry, item: TacticalGraphicLayerItem): boolean {
  if (entry.state !== item._state) return false;
  const signature = currentSignature(item);
  if (signature.length !== entry.signature.length) return false;
  return signature.every((value, i) => value === entry.signature[i]);
}

/**
 * Project a stored `tacticalGraphic` item into the library's `ControlMeasure`.
 *
 * Memoised by **item identity** in a `WeakMap`, as the ADR requires, so repeated
 * renders hand tactical-draw the same object and its identity render cache holds.
 *
 * The ADR says "memoised by item identity" and stops there, but item identity alone
 * is not a sufficient invalidation signal in this store: `useImmerStore` applies RFC
 * 6902 patches onto the live reactive state, so editing a field mutates the existing
 * item object rather than replacing it. The cache entry is therefore additionally
 * validated against a shallow reference snapshot of the nine projection inputs plus
 * `_state`. That is nine identity comparisons, and it is correct for every write this
 * store performs (whole-field replacement) — see `isFresh`.
 *
 * Nothing here is written back: the result is derived, and no cache goes near the
 * scenario store.
 */
export function toControlMeasure(item: TacticalGraphicLayerItem): ControlMeasure {
  const cached = cache.get(item);
  if (cached && isFresh(cached, item)) return cached.measure;
  const measure = buildControlMeasure(item);
  cache.set(item, {
    signature: currentSignature(item),
    state: item._state,
    measure,
  });
  return measure;
}
