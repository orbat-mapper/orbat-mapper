import { nanoid } from "@/utils";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { ScenarioState } from "@/scenariostore/newScenarioStore";
import type { ScenarioLayerItem } from "@/types/scenarioLayerItems";
import type { ScenarioLayerUpdate } from "@/types/internalModels";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";

interface LayerImportGeo {
  addLayer(layer: NScenarioOverlayLayer): NScenarioOverlayLayer | undefined;
  addFeature(
    item: ScenarioLayerItem,
    layerId: FeatureId,
    options?: { allowSpecializationMismatch?: boolean },
  ): FeatureId | undefined;
  updateLayer(layerId: FeatureId, update: ScenarioLayerUpdate): void;
}

export interface ImportScenarioLayersResult {
  importedLayerIds: string[];
  importedItemIds: FeatureId[];
}

function withoutInternalFields<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !key.startsWith("_")),
  ) as T;
}

function availableId(
  requested: string,
  occupied: Set<string>,
  generateId: () => string,
): string {
  let id = requested;
  while (occupied.has(id)) id = generateId();
  occupied.add(id);
  return id;
}

/**
 * Import selected overlay layers from a prepared scenario into another scenario.
 *
 * The source is prepared rather than raw file data so visibility and state timestamps
 * already have the runtime representation expected by the target store. Layer and item
 * ids are retained when possible and remapped on collision. Derived `_` fields are never
 * copied; the target store recreates them for its own current time and ownership graph.
 */
export function importScenarioOverlayLayers(
  source: ScenarioState,
  target: Pick<ScenarioState, "layerStackMap" | "layerItemMap">,
  geo: LayerImportGeo,
  selectedLayerIds: readonly FeatureId[],
  generateId: () => string = nanoid,
): ImportScenarioLayersResult {
  const selected = new Set(selectedLayerIds);
  const occupiedLayerIds = new Set(Object.keys(target.layerStackMap));
  const occupiedItemIds = new Set(Object.keys(target.layerItemMap));
  const result: ImportScenarioLayersResult = {
    importedLayerIds: [],
    importedItemIds: [],
  };

  for (const sourceLayerId of source.layerStack) {
    if (!selected.has(sourceLayerId)) continue;
    const sourceLayer = source.layerStackMap[sourceLayerId];
    if (!sourceLayer || sourceLayer.kind !== "overlay") continue;

    const layerId = availableId(sourceLayer.id, occupiedLayerIds, generateId);
    const { items, locked, ...layerFields } = withoutInternalFields(sourceLayer);
    const addedLayer = geo.addLayer({
      ...layerFields,
      id: layerId,
      kind: "overlay",
      items: [],
      // A locked source layer must be writable while its items are restored.
      locked: false,
    });
    if (!addedLayer) continue;
    result.importedLayerIds.push(layerId);

    for (const sourceItemId of items) {
      const sourceItem = source.layerItemMap[sourceItemId];
      if (!sourceItem) continue;
      const itemId = availableId(sourceItem.id, occupiedItemIds, generateId);
      const item = {
        ...withoutInternalFields(sourceItem),
        id: itemId,
      } as ScenarioLayerItem;
      // Full-scenario loading preserves legacy/malformed mixed layers. Partial import
      // must do the same; authoring paths retain the normal specialization guard.
      const addedItemId = geo.addFeature(item, layerId, {
        allowSpecializationMismatch: true,
      });
      if (addedItemId !== undefined) result.importedItemIds.push(addedItemId);
    }

    if (locked) geo.updateLayer(layerId, { locked: true });
  }

  return result;
}
