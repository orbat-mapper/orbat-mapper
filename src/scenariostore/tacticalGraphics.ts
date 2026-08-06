import { CONTROL_MEASURE_IDS } from "@orbat-mapper/control-measures";
import type { ControlMeasureKind } from "@orbat-mapper/control-measures";
import type { TacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import { isTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";

/**
 * Which `graphicKind` values the pinned `@orbat-mapper/control-measures` can render.
 *
 * An unknown kind is a real possibility: the package pin is exact, so a scenario
 * authored against a newer library round-trips through this build with kinds this
 * build has never heard of. Such an item is stored verbatim and simply left out of
 * the render batch — `render()` is a batch call and an unknown kind reaching the
 * library's definition registry throws, which would blank the whole layer.
 *
 * No placeholder graphic is substituted. A stand-in would have to carry the real id,
 * so editing it would commit the wrong kind over the unknown one.
 */
const SUPPORTED_GRAPHIC_KINDS: ReadonlySet<string> = new Set<string>(CONTROL_MEASURE_IDS);

export function isSupportedGraphicKind(
  graphicKind: string | undefined | null,
): graphicKind is ControlMeasureKind {
  return typeof graphicKind === "string" && SUPPORTED_GRAPHIC_KINDS.has(graphicKind);
}

/**
 * The render-batch predicate. Step 5's `buildTacticalGraphicRenderPlan` filters on
 * this rather than re-deriving the rule.
 */
export function isSupportedTacticalGraphic(
  item: unknown,
): item is TacticalGraphicLayerItem {
  return isTacticalGraphicLayerItem(item) && isSupportedGraphicKind(item.graphicKind);
}

/**
 * Count unsupported `graphicKind`s across a set of layer items.
 *
 * Returns an empty record when everything is renderable, so callers can aggregate
 * across the whole scenario and warn exactly once.
 */
export function countUnsupportedGraphicKinds(
  items: Iterable<unknown>,
  into: Record<string, number> = {},
): Record<string, number> {
  for (const item of items) {
    if (!isTacticalGraphicLayerItem(item)) continue;
    if (isSupportedGraphicKind(item.graphicKind)) continue;
    const kind = String(item.graphicKind ?? "unknown");
    into[kind] = (into[kind] ?? 0) + 1;
  }
  return into;
}

/**
 * One message for the whole scenario, or `undefined` when there is nothing to say.
 */
export function formatUnsupportedGraphicKindWarning(
  counts: Record<string, number>,
  scenarioId?: string,
): string | undefined {
  const entries = Object.entries(counts);
  if (entries.length === 0) return undefined;
  const summary = entries.map(([kind, count]) => `${kind}=${count}`).join(", ");
  return (
    `Unsupported control measure kinds` +
    `${scenarioId ? ` in scenario "${scenarioId}"` : ""}: ${summary}. ` +
    `They are kept in the scenario but will not be drawn.`
  );
}
