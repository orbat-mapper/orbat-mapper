import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import type {
  NScenarioLayerItem,
  NTacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";
import { nanoid } from "@/utils";

/**
 * The name a lazily created control-measures layer is given.
 *
 * Used by implicit authoring creation; explicit panel creation uses the distinct
 * "New control-measure layer" label.
 */
export const CONTROL_MEASURE_LAYER_NAME = "Control measures";
export const NEW_CONTROL_MEASURE_LAYER_NAME = "New control-measure layer";

/**
 * Add a new, explicitly specialized control-measure layer.
 *
 * The specialization — not the contents — is what makes a layer a control-measure
 * layer, so every creation path goes through here and none can forget to set it.
 */
export function createControlMeasureLayer(
  geo: {
    addLayer: (layer: NScenarioOverlayLayer) => NScenarioOverlayLayer | undefined;
  },
  name: string = CONTROL_MEASURE_LAYER_NAME,
): NScenarioOverlayLayer | undefined {
  return geo.addLayer({
    id: nanoid(),
    name,
    specialization: "controlMeasure",
    items: [],
    _isNew: false,
  } as NScenarioOverlayLayer);
}

export function isControlMeasureLayer(
  layer: Pick<NScenarioOverlayLayer, "specialization">,
): boolean {
  return layer.specialization === "controlMeasure";
}

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
 * Resolve every explicitly specialized control-measure layer from the store's
 * layer/items pairs. Contents never determine identity, so empty layers remain visible
 * and unspecialized layers stay feature layers even when malformed data contains a
 * tactical graphic.
 *
 * The `layer` handed back is the store's own reactive object, not a copy, so the
 * section's open/closed state (`_isOpen`) survives the same way the layer tree's does.
 */
export function getControlMeasureLayerGroups(
  layersItems: readonly { layer: NScenarioOverlayLayer; items: NScenarioLayerItem[] }[],
): ControlMeasureLayerGroup[] {
  const groups: ControlMeasureLayerGroup[] = [];
  for (const { layer, items } of layersItems) {
    if (!isControlMeasureLayer(layer)) continue;
    const controlMeasures = items.filter(
      (item): item is NTacticalGraphicLayerItem =>
        !!item && isNTacticalGraphicLayerItem(item),
    );
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
