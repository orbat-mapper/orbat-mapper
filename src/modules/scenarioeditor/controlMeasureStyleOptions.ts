/**
 * What the styling UI is allowed to offer, per control-measure kind.
 *
 * ADR-0006 gates authored colours and fill patterns to the **7 Generic Graphics
 * kinds, in the UI only**: a doctrinal kind carries its colour from its standard
 * identity, and offering a colour picker on a Phase Line invites the user to break
 * the very symbology they picked it for. The model and the resolver stay uniform —
 * `toControlMeasure` resolves `style.color` for every kind alike — so an imported
 * control measure with an authored colour on a doctrinal kind still renders with it.
 * Nothing here may ever be consulted by the store or by `toControlMeasure`.
 *
 * Everything is derived from the library's own metadata (`entity` and `paints`), so
 * there is no parallel list of kinds or of fill patterns to drift out of step with
 * the registry.
 */
import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import type {
  ControlMeasureId,
  ControlMeasureKind,
  ControlMeasureStyle,
} from "@orbat-mapper/control-measures";
import { PREVIEW_FILL_PATTERNS } from "@orbat-mapper/control-measures/preview";
import type { TacticalGraphicLayerItemUpdate } from "@/types/scenarioLayerItems";
import type { NewControlMeasureDefaults } from "@/modules/scenarioeditor/controlMeasureDrawHelpers";

export type ControlMeasureFillPattern = NonNullable<ControlMeasureStyle["fillPattern"]>;

/**
 * What the styling UI emits: the item's own authoring fields, never anything derived.
 * `style` is the library's `ControlMeasureStyle` verbatim, whole — the writer replaces
 * the field rather than merging into it.
 */
export type ControlMeasureStyleUpdate = Pick<
  TacticalGraphicLayerItemUpdate,
  "style" | "standardIdentity" | "colorMode" | "status"
>;

/** The registry entity holding the kinds that carry no doctrinal colour of their own. */
export const GENERIC_GRAPHICS_ENTITY = "Generic Graphics";

function metadataFor(kind: ControlMeasureKind | undefined) {
  if (kind === undefined) return undefined;
  return CONTROL_MEASURE_METADATA[kind as ControlMeasureId];
}

/** True for exactly the 7 Generic Graphics kinds — the ones the UI lets you colour. */
export function isStyleableControlMeasureKind(
  kind: ControlMeasureKind | undefined,
): boolean {
  return metadataFor(kind)?.entity === GENERIC_GRAPHICS_ENTITY;
}

/**
 * Whether a fill-pattern control is meaningful.
 *
 * `paints.fill` is the library's own answer: `"user"` marks the kinds whose generator
 * leaves the pattern unset so `style.fillPattern` actually reaches the output. On
 * `"none"` and `"fixed"` the control would be inert.
 */
export function canAuthorFillPattern(kind: ControlMeasureKind | undefined): boolean {
  return isStyleableControlMeasureKind(kind) && metadataFor(kind)?.paints.fill === "user";
}

/** `"solid"` has no preview tile — it is the absence of a pattern, not one of them. */
export const CONTROL_MEASURE_FILL_PATTERNS: ControlMeasureFillPattern[] = [
  "solid",
  ...PREVIEW_FILL_PATTERNS.map((pattern) => pattern.id as ControlMeasureFillPattern),
];

/** `"reverse-hatch"` → `"Reverse hatch"`. Derived so a new library pattern needs no edit. */
export function fillPatternLabel(pattern: ControlMeasureFillPattern): string {
  const words = pattern.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The session-sticky authoring defaults, narrowed to what `graphicKind` may be born
 * with.
 *
 * The gate lives here — in the authoring path — rather than in
 * `controlMeasureDrawHelpers`, which stays uniform over kinds like the rest of the
 * model. A sticky red kept for polygons must not silently repaint every phase line
 * drawn after it.
 */
export function newControlMeasureDefaults(
  defaults: NewControlMeasureDefaults,
  graphicKind: ControlMeasureKind,
): NewControlMeasureDefaults {
  const { style, ...hostOwned } = defaults;
  if (!style || !isStyleableControlMeasureKind(graphicKind)) return { ...hostOwned };
  const authored: ControlMeasureStyle = {};
  if (style.color !== undefined) authored.color = style.color;
  if (style.fillPattern !== undefined && canAuthorFillPattern(graphicKind)) {
    authored.fillPattern = style.fillPattern;
  }
  if (Object.keys(authored).length === 0) return { ...hostOwned };
  return { ...hostOwned, style: authored };
}
