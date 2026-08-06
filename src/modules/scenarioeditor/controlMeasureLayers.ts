import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import type {
  NScenarioLayerItem,
  NTacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";

/**
 * The name a lazily created control-measures layer is given.
 *
 * Only M2's authoring path creates one; M1 renders whatever a loaded scenario
 * already carries.
 */
export const CONTROL_MEASURE_LAYER_NAME = "Control measures";

/**
 * One control-measures section, backed by a real overlay layer.
 *
 * The section *is* a layer rather than bespoke chrome, which is what lets its header
 * carry the visibility and lock controls the user already knows from the layer tree,
 * and what keeps its items' `_pid` meaningful.
 */
export interface ControlMeasureLayerGroup {
  layer: NScenarioOverlayLayer;
  items: NTacticalGraphicLayerItem[];
}

/**
 * Resolve the control-measures section(s) from the store's layer/items pairs.
 *
 * Lazy by construction: a layer only appears here once it actually holds a
 * `tacticalGraphic` item, so a scenario without control measures renders no section
 * at all and the stored model from steps 1–2 stays untouched.
 *
 * Normally this returns exactly one group — control measures live in one host-created
 * layer. It returns several rather than one when a hand-authored or imported scenario
 * scattered them across layers: listing only the first would silently hide the rest,
 * and each group's header then owns the visibility and lock of the layer that actually
 * contains its items.
 *
 * The `layer` handed back is the store's own reactive object, not a copy, so the
 * section's open/closed state (`_isOpen`) survives the same way the layer tree's does.
 */
export function getControlMeasureLayerGroups(
  layersItems: readonly { layer: NScenarioOverlayLayer; items: NScenarioLayerItem[] }[],
): ControlMeasureLayerGroup[] {
  const groups: ControlMeasureLayerGroup[] = [];
  for (const { layer, items } of layersItems) {
    const controlMeasures = items.filter(
      (item): item is NTacticalGraphicLayerItem =>
        !!item && isNTacticalGraphicLayerItem(item),
    );
    if (!controlMeasures.length) continue;
    groups.push({ layer, items: controlMeasures });
  }
  return groups;
}

/**
 * The label a control measure shows in the layer tree.
 *
 * Falls back to the library's doctrinal name for the kind, and then to the raw
 * `graphicKind` — which is all an unsupported kind has to offer.
 */
export function getControlMeasureLabel(item: NTacticalGraphicLayerItem): string {
  if (item.name) return item.name;
  const kind = item.graphicKind;
  if (isSupportedGraphicKind(kind)) {
    return CONTROL_MEASURE_METADATA[kind as ControlMeasureId]?.name || String(kind);
  }
  return String(kind ?? "");
}
