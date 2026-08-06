/**
 * The outbound store → `Graphic[]` direction for control measures.
 *
 * This mirrors `buildScenarioFeatureRenderPlan` in intent — a pure function from
 * scenario state to a renderer's input, so the whole outbound path is testable
 * without a map — but deliberately lives *beside* `maplibreScenarioFeatures.ts`
 * rather than inside it. Control measures are not geometry layer items and never
 * enter the flat scenario feature source; they render through tactical-draw, stacked
 * above it (see docs/adr/0006-control-measures-on-tactical-draw.md).
 *
 * The shape differs from its sibling in one way that matters: the plain-feature plan
 * is **per layer**, because each layer owns its own MapLibre sources. `render()` is a
 * single batch call over the whole stack, so this builds **one flat, ordered array
 * across every layer**.
 */
import type { Graphic } from "@orbat-mapper/tactical-draw";
import { toControlMeasure } from "@/geo/controlMeasures";
import { isSupportedTacticalGraphic } from "@/scenariostore/tacticalGraphics";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { FullScenarioLayerItemsLayer } from "@/types/scenarioLayerItems";

export interface TacticalGraphicRenderPlanOptions {
  /**
   * Whether time-window hiding applies. Mirrors the plain-feature path: a manually
   * hidden item (eye toggle) is always dropped, while `_hidden` (outside its time
   * window) is only honoured when this is true, so the Layers panel can reveal
   * time-hidden items for editing.
   */
  filterVisible: boolean;
}

export interface TacticalGraphicRenderPlan {
  /**
   * The complete batch, bottom-first (tactical-draw's render order), ready to hand
   * to `TacticalDrawSurface.render()` unmodified.
   */
  graphics: Graphic[];
  /**
   * Items dropped because the pinned library does not know their `graphicKind`.
   * Reported rather than swallowed so the layer tree can flag them as unsupported.
   */
  unsupportedIds: FeatureId[];
  /**
   * Items dropped because an earlier item in the batch already claimed their id.
   * `render()` throws synchronously on a duplicate id *before* mutating any layer,
   * which would blank the entire control-measure stack, so the batch is deduped here.
   */
  duplicateIds: FeatureId[];
}

/**
 * Build the control-measure batch for the whole scenario.
 *
 * Ordering is bottom-first because tactical-draw treats the render array as
 * bottom-to-top. `layers` arrives in layer-stack order, where index 0 is the
 * *topmost* layer (the same convention `reorderScenarioStackLayers` encodes), so the
 * layers are walked in reverse while items keep their stored order within a layer.
 *
 * Purity note: the `Graphic` objects are the memoised ones `toControlMeasure` hands
 * back and are returned **untouched**. Nothing here may clone or decorate them —
 * tactical-draw caches rendered output on `Graphic` object identity, so a per-render
 * copy would defeat the cache on every call. That is also why layer `opacity` is not
 * folded in here; see the module note in the issue thread.
 */
export function buildTacticalGraphicRenderPlan(
  layers: readonly FullScenarioLayerItemsLayer[],
  options: TacticalGraphicRenderPlanOptions,
): TacticalGraphicRenderPlan {
  const { filterVisible } = options;
  const graphics: Graphic[] = [];
  const unsupportedIds: FeatureId[] = [];
  const duplicateIds: FeatureId[] = [];
  const seenIds = new Set<FeatureId>();

  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    // Unlike the plain-feature path there is no per-layer MapLibre layer to set
    // `visibility: "none"` on, so a hidden layer is filtered out right here.
    if (layer.isHidden) continue;
    if (filterVisible && layer._hidden) continue;

    for (const item of layer.items) {
      if (item.kind !== "tacticalGraphic") continue;
      if (item.isHidden || (filterVisible && item._hidden)) continue;
      // Captured before the predicate: its negative branch narrows `item` to `never`,
      // since the kind check above already made it a tactical graphic.
      const itemId = item.id;
      if (!isSupportedTacticalGraphic(item)) {
        unsupportedIds.push(itemId);
        continue;
      }
      if (seenIds.has(itemId)) {
        duplicateIds.push(itemId);
        continue;
      }
      seenIds.add(itemId);
      graphics.push(toControlMeasure(item));
    }
  }

  return { graphics, unsupportedIds, duplicateIds };
}
