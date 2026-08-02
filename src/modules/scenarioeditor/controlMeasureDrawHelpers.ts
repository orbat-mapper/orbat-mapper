/**
 * The commit half of a control-measure draw session: turning the settled
 * `ControlMeasure` into a stored `tacticalGraphic` layer item.
 *
 * Kept out of `scenarioDrawHelpers.ts` deliberately — that module is the plain-shape
 * path and pulls in OpenLayers, while nothing here touches a map at all. Everything is
 * a pure function over the scenario store, so the fold is testable without a session.
 *
 * ADR-0006: exactly **one** store write per settled session. `addScenarioControlMeasure`
 * is therefore the only writer, and it groups the lazy layer creation together with the
 * item add so a drawn control measure is one undo step even the first time.
 */
import { getDefaultOptions } from "@orbat-mapper/control-measures";
import type { ControlMeasure, ControlMeasureStyle } from "@orbat-mapper/control-measures";
import type { Position } from "geojson";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type {
  TacticalGraphicColorMode,
  TacticalGraphicLayerItem,
  TacticalGraphicOptions,
  TacticalGraphicStatus,
} from "@/types/scenarioLayerItems";
import type { SidValue } from "@/symbology/values";
import { nanoid } from "@/utils";
import { resolveControlMeasureStyle } from "@/geo/controlMeasures";
import {
  CONTROL_MEASURE_LAYER_NAME,
  getControlMeasureLayerGroups,
} from "@/modules/scenarioeditor/controlMeasureLayers";

/**
 * The fields a newly drawn control measure is born with.
 *
 * The three projections from ADR-0006 plus the authored `style`, which is the
 * library's `ControlMeasureStyle` **verbatim** and is stored as-is. Nothing derived
 * gets in: the identity/status projections still resolve at read time, and it is the
 * caller's job to have narrowed `style` to what the kind may be authored with — see
 * `newControlMeasureDefaults` in `controlMeasureStyleOptions.ts`, where that UI-only
 * gate lives.
 */
export interface NewControlMeasureDefaults {
  standardIdentity?: SidValue;
  colorMode?: TacticalGraphicColorMode;
  status?: TacticalGraphicStatus;
  style?: ControlMeasureStyle;
}

/**
 * The item a set of defaults would produce, before it has any control points.
 *
 * Used both to resolve the in-flight draft's style and — with the settled control
 * points folded in — as the stored item, so the rubber-band preview and the committed
 * graphic are coloured by one code path.
 */
function newItemShell(
  measureKind: ControlMeasure["kind"],
  defaults: NewControlMeasureDefaults,
): TacticalGraphicLayerItem {
  return {
    kind: "tacticalGraphic",
    id: "",
    graphicKind: measureKind,
    controlPoints: [],
    ...(defaults.standardIdentity !== undefined
      ? { standardIdentity: defaults.standardIdentity }
      : {}),
    ...(defaults.colorMode !== undefined ? { colorMode: defaults.colorMode } : {}),
    ...(defaults.status !== undefined ? { status: defaults.status } : {}),
    ...(defaults.style !== undefined ? { style: { ...defaults.style } } : {}),
  };
}

/**
 * The style handed to `draw()` so the in-flight preview matches what the graphic will
 * look like once committed.
 *
 * It is resolved through `resolveControlMeasureStyle`, i.e. the identity/status
 * projections, and is deliberately **not** stored on the committed item: ADR-0006 keeps
 * those projections at read time and out of storage.
 */
export function draftStyleForNewControlMeasure(
  measureKind: ControlMeasure["kind"],
  defaults: NewControlMeasureDefaults = {},
): ControlMeasureStyle {
  return resolveControlMeasureStyle(newItemShell(measureKind, defaults));
}

/**
 * The generator options a new control measure is drawn with: the kind's own registry
 * defaults, verbatim.
 *
 * This is what makes an echelon glyph or a label come out sized for the zoom it was
 * drawn at rather than at a fixed ground size. Several kinds declare both a meter and a
 * pixel form of the same dimension — Boundary has `echelonSize: 750` *and*
 * `echelonSizePixels: 16` — and the pixel form wins whenever it is present. Seeding it
 * makes the in-flight preview screen-anchored, so the glyph stays 16 px while the user
 * pans and zooms mid-gesture; then `draw()`'s default `"ground"` size anchor bakes it
 * to meters against the resolution at commit and strips the pixel key, leaving an
 * ordinary ground-anchored graphic that no longer rescales. Drawing the same boundary
 * at city zoom and at theatre zoom therefore gives two glyphs that each look right
 * where they were drawn, instead of one invisible and one covering a country.
 *
 * Seeding the whole default object rather than only the pixel keys is deliberate, and
 * is what tactrace does: the pixel-size table is the library's own and is not exported,
 * so picking the keys out here would mean re-deriving per-kind knowledge that is
 * already declared. The cost is that a drawn graphic stores its kind's defaults
 * explicitly — which also pins its appearance against a future change to those
 * defaults, and gives the details panel real values to edit.
 */
export function draftOptionsForNewControlMeasure(
  measureKind: ControlMeasure["kind"],
): TacticalGraphicOptions {
  return { ...(getDefaultOptions(measureKind) as TacticalGraphicOptions) };
}

/**
 * Fold a settled `ControlMeasure` into the stored item.
 *
 * The library's fields are copied **verbatim** — the item flattens a `ControlMeasure`
 * rather than embedding one — and copied *out*, since the measure the engine handed
 * back is one it may still hold. The **measure's** `style` is dropped on purpose: it is
 * the resolved draft style above, i.e. a projection, and belongs nowhere near storage —
 * the stored `style` is the authored one off the defaults, verbatim. `id` needs no
 * reconciliation, the host injected `nanoid` as tactical-draw's `generateId`.
 */
export function toTacticalGraphicLayerItem(
  measure: ControlMeasure,
  defaults: NewControlMeasureDefaults = {},
): TacticalGraphicLayerItem {
  const item = newItemShell(measure.kind, defaults);
  item.id = measure.id;
  item.controlPoints = measure.controlPoints.map((position) => [...position] as Position);
  if (measure.options !== undefined) {
    item.options = { ...(measure.options as TacticalGraphicOptions) };
  }
  if (measure.textAmplifiers !== undefined) {
    item.textAmplifiers = { ...measure.textAmplifiers };
  }
  if (measure.amplifierPlacements !== undefined) {
    item.amplifierPlacements = { ...measure.amplifierPlacements };
  }
  return item;
}

/**
 * The layer a new control measure goes into: the first one that already holds control
 * measures, otherwise a freshly created "Control measures" layer.
 *
 * Created lazily rather than up front so a scenario that never gets one keeps the
 * stored model M1 landed untouched, and so the section only appears in the layers panel
 * once there is something in it. Returns `undefined` only when the write itself failed.
 */
function getOrCreateControlMeasureLayerId(scenario: TScenario): FeatureId | undefined {
  const existing = getControlMeasureLayerGroups(scenario.geo.layersItems.value)[0];
  if (existing) return existing.layer.id;
  return scenario.geo.addLayer({
    id: nanoid(),
    name: CONTROL_MEASURE_LAYER_NAME,
    items: [],
    _isNew: false,
  })?.id;
}

/**
 * The one store write a settled draw session performs.
 *
 * Grouped because the very first control measure also creates its layer, and ADR-0006
 * requires a whole drawn graphic to be exactly one undo step. Creation ignores
 * recording, exactly as `addScenarioDrawFeature` does — step 17's timed `controlPoints`
 * patches are an edit-path concern.
 */
export function addScenarioControlMeasure(
  scenario: TScenario,
  measure: ControlMeasure,
  defaults: NewControlMeasureDefaults = {},
): TacticalGraphicLayerItem | undefined {
  const item = toTacticalGraphicLayerItem(measure, defaults);
  let added = false;
  scenario.store.groupUpdate(
    () => {
      const layerId = getOrCreateControlMeasureLayerId(scenario);
      if (!layerId) return;
      scenario.geo.addFeature(item, layerId);
      added = true;
    },
    { label: "addFeature", value: item.id },
  );
  return added ? item : undefined;
}
