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
 * Stroke width follows `paints.stroke`; colour and fill remain restricted by entity
 * and fill capability. Everything is derived from the library's own metadata, so
 * there is no parallel list of kinds or patterns to drift out of step with the
 * registry.
 */
import {
  CONTROL_MEASURE_METADATA,
  getDefaultOptions,
  resolveParameterSemanticRole,
} from "@orbat-mapper/control-measures";
import type {
  ControlMeasureId,
  ControlMeasureKind,
  ControlMeasureStyle,
  ParamDescriptor,
} from "@orbat-mapper/control-measures";
import { PREVIEW_FILL_PATTERNS } from "@orbat-mapper/control-measures/preview";
import type {
  TacticalGraphicLayerItemUpdate,
  TacticalGraphicOptions,
} from "@/types/scenarioLayerItems";
import type { NewControlMeasureDefaults } from "@/modules/scenarioeditor/controlMeasureDrawHelpers";

export type ControlMeasureFillPattern = NonNullable<ControlMeasureStyle["fillPattern"]>;

/**
 * What the styling UI emits: the item's own authoring fields, never anything derived.
 * `style` is the library's `ControlMeasureStyle` verbatim, whole — the writer replaces
 * the field rather than merging into it.
 */
export type ControlMeasureStyleUpdate = Pick<
  TacticalGraphicLayerItemUpdate,
  "style" | "standardIdentity" | "colorMode" | "status" | "options"
>;

/** The registry entity holding the kinds that carry no doctrinal colour of their own. */
export const GENERIC_GRAPHICS_ENTITY = "Generic Graphics";

export const CONTROL_MEASURE_STROKE_WIDTH_DEFAULT = 2;
export const CONTROL_MEASURE_STROKE_WIDTH_PRESETS = [
  { label: "Thin", value: 1 },
  { label: "Medium", value: CONTROL_MEASURE_STROKE_WIDTH_DEFAULT },
  { label: "Heavy", value: 4 },
] as const;

/** The registry entry for a kind, with the single `ControlMeasureId` cast in one place. */
export function metadataFor(kind: ControlMeasureKind | undefined) {
  if (kind === undefined) return undefined;
  return CONTROL_MEASURE_METADATA[kind as ControlMeasureId];
}

/**
 * What the generator actually runs with: the library's defaults for the kind, with the
 * item's authored options on top. Every surface that has to show "what the map is
 * drawing" — visibility predicates, field values, smoothing state — resolves it here.
 */
export function effectiveControlMeasureOptions(
  kind: ControlMeasureKind | undefined,
  options: TacticalGraphicOptions | undefined,
): Record<string, unknown> {
  return {
    ...(kind === undefined
      ? undefined
      : (getDefaultOptions(kind as ControlMeasureId) as Record<string, unknown>)),
    ...(options as Record<string, unknown> | undefined),
  };
}

/**
 * The doctrinal generator parameters a kind offers, already narrowed by the descriptor's
 * own `visibleWhen`. Both the amplifier panel and its empty-state check read this, so the
 * section and its "nothing here" message can never disagree.
 */
export function doctrinalControlMeasureParams(
  kind: ControlMeasureKind | undefined,
  options: TacticalGraphicOptions | undefined,
  { includeText = false }: { includeText?: boolean } = {},
): readonly ParamDescriptor[] {
  const effective = effectiveControlMeasureOptions(kind, options);
  return (metadataFor(kind)?.params ?? []).filter(
    (parameter) =>
      (includeText || parameter.type !== "text") &&
      resolveParameterSemanticRole(parameter) === "doctrinal" &&
      (parameter.visibleWhen?.(effective) ?? true),
  );
}

/**
 * Option keys the Style tab already owns, so the extended-styling tab knows to leave them
 * alone. One list rather than a hard-coded copy on each side.
 */
export const CONTROL_MEASURE_STYLE_OWNED_OPTION_KEYS: readonly string[] = [
  "smooth",
  "smoothResolution",
];

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

/** Stroke width is meaningful for every kind whose registry output paints a stroke. */
export function canAuthorStrokeWidth(kind: ControlMeasureKind | undefined): boolean {
  return metadataFor(kind)?.paints.stroke === true;
}

/**
 * Whether a smoothing toggle is meaningful for this kind.
 *
 * Derived from the registry's own `params`, like everything else here: the 50 kinds
 * that accept a `smooth` boolean declare it, and a kind that gains or loses one needs
 * no edit on this side. `graphicKind === undefined` (the authoring defaults) is false —
 * smoothing is a per-kind generator option, not a style, so there is nothing sensible
 * to make sticky across kinds that do not all accept it.
 */
export function canSmoothControlMeasureKind(
  kind: ControlMeasureKind | undefined,
): boolean {
  return (
    metadataFor(kind)?.params?.some(
      (param) => param.key === "smooth" && param.type === "boolean",
    ) ?? false
  );
}

/** The numeric sampling control paired with the kind's smoothing toggle. */
export function getSmoothResolutionParam(
  kind: ControlMeasureKind | undefined,
): Extract<ParamDescriptor, { type: "number" }> | undefined {
  return metadataFor(kind)?.params?.find(
    (param): param is Extract<ParamDescriptor, { type: "number" }> =>
      param.key === "smoothResolution" && param.type === "number",
  );
}

/** The authored sampling resolution, falling back to the registry's minimum. */
export function getControlMeasureSmoothResolution(
  kind: ControlMeasureKind | undefined,
  options: TacticalGraphicOptions | undefined,
): number {
  const authored = (options as Record<string, unknown> | undefined)?.smoothResolution;
  if (typeof authored === "number") return authored;
  return getSmoothResolutionParam(kind)?.min ?? 2;
}

/**
 * The effective smoothing state: the item's own option when it has authored one, and
 * otherwise the library's default for the kind — which is what the map is drawing, so
 * it is what the checkbox must show.
 */
export function isControlMeasureSmoothed(
  kind: ControlMeasureKind | undefined,
  options: TacticalGraphicOptions | undefined,
): boolean {
  return effectiveControlMeasureOptions(kind, options).smooth === true;
}

/**
 * The label-size knob for kinds that declare `capturesLabelSize`. The pair is a
 * screen/ground denomination like the other size pairs: an authored ground `labelSize`
 * (with no pixel override) keeps the metre-denominated descriptor, everything else is
 * sized in screen pixels. Kept here beside the other metadata-derived accessors so the
 * bounds are reachable and testable without mounting a component.
 */
const LABEL_SIZE_PARAMS = {
  ground: {
    key: "labelSize",
    label: "Label size",
    description: "Label text height in meters.",
    type: "number",
    min: 50,
    max: 20_000,
    step: 50,
    unit: "m",
  },
  pixels: {
    key: "labelSizePixels",
    label: "Label size",
    description: "Label text height in screen pixels.",
    type: "number",
    min: 8,
    max: 48,
    step: 1,
    unit: "px",
  },
} as const satisfies Record<string, ParamDescriptor>;

/** True when the kind sizes its label in ground metres rather than screen pixels. */
export function usesGroundLabelSize(
  options: TacticalGraphicOptions | undefined,
): boolean {
  return options?.labelSizePixels === undefined && options?.labelSize !== undefined;
}

export function getLabelSizeParam(
  kind: ControlMeasureKind | undefined,
  options: TacticalGraphicOptions | undefined,
): ParamDescriptor | undefined {
  if (!metadataFor(kind)?.capturesLabelSize) return undefined;
  return usesGroundLabelSize(options)
    ? LABEL_SIZE_PARAMS.ground
    : LABEL_SIZE_PARAMS.pixels;
}

const PIXEL_SIZE_SUFFIX = "Pixels";

/**
 * Restore every ground-anchored dimension to the library's intended on-screen size at
 * the current zoom. Drawing normally performs this conversion at commit; this is the
 * explicit way to re-anchor an existing graphic (or the sticky draw defaults) after
 * the author has moved to a different zoom level.
 */
export function resetControlMeasureSizesForResolution(
  kind: ControlMeasureKind | undefined,
  options: TacticalGraphicOptions | undefined,
  metersPerPixel: number | undefined,
): TacticalGraphicOptions | null {
  const metadata = metadataFor(kind);
  if (!metadata || !(metersPerPixel && metersPerPixel > 0)) return null;

  const defaults = getDefaultOptions(kind as ControlMeasureId) as Record<string, unknown>;
  const next = { ...options } as Record<string, unknown>;
  const parameterKeys = new Set(
    (metadata.params ?? []).map((parameter) => parameter.key),
  );
  let reset = false;

  for (const parameter of metadata.params ?? []) {
    if (!parameter.key.endsWith(PIXEL_SIZE_SUFFIX)) continue;
    const meterKey = parameter.key.slice(0, -PIXEL_SIZE_SUFFIX.length);
    if (!parameterKeys.has(meterKey)) continue;
    const defaultPixels = defaults[parameter.key];
    if (typeof defaultPixels !== "number") continue;
    delete next[parameter.key];
    next[meterKey] = defaultPixels * metersPerPixel;
    reset = true;
  }

  if (metadata.capturesLabelSize) {
    delete next.labelSizePixels;
    next.labelSize = 14 * metersPerPixel;
    reset = true;
  }

  if (!reset) return null;
  delete next.metersPerPixel;
  return next as TacticalGraphicOptions;
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
  const { style, options, ...hostOwned } = defaults;
  const narrowed: NewControlMeasureDefaults = { ...hostOwned };

  if (style) {
    const authored: ControlMeasureStyle = {};
    if (canAuthorStrokeWidth(graphicKind) && style.strokeWidth !== undefined) {
      authored.strokeWidth = style.strokeWidth;
    }
    if (isStyleableControlMeasureKind(graphicKind)) {
      if (style.color !== undefined) authored.color = style.color;
      if (style.fillPattern !== undefined && canAuthorFillPattern(graphicKind)) {
        authored.fillPattern = style.fillPattern;
      }
    }
    if (Object.keys(authored).length > 0) narrowed.style = authored;
  }

  if (options) {
    const authored = options as Record<string, unknown>;
    const narrowedOptions: Record<string, unknown> = {};
    if (canSmoothControlMeasureKind(graphicKind)) {
      if (typeof authored.smooth === "boolean") narrowedOptions.smooth = authored.smooth;
      if (
        getSmoothResolutionParam(graphicKind) &&
        typeof authored.smoothResolution === "number"
      ) {
        narrowedOptions.smoothResolution = authored.smoothResolution;
      }
    }

    // Doctrinal generator choices are kind-specific just like smoothing, but unlike
    // free text they belong in the compact draw palette. Derive the allow-list from
    // semantic metadata so future modifiers flow through without a host-side list.
    for (const parameter of metadataFor(graphicKind)?.params ?? []) {
      if (
        parameter.type !== "text" &&
        resolveParameterSemanticRole(parameter) === "doctrinal" &&
        authored[parameter.key] !== undefined
      ) {
        narrowedOptions[parameter.key] = authored[parameter.key];
      }
    }
    if (Object.keys(narrowedOptions).length > 0) {
      narrowed.options = narrowedOptions as TacticalGraphicOptions;
    }
  }

  return narrowed;
}
