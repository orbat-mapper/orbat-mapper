import { isEqual } from "es-toolkit";
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
  deleteLayer(layerId: FeatureId): void;
  moveLayer(layerId: FeatureId, toIndex: number): void;
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
  target: Pick<ScenarioState, "layerStack" | "layerStackMap" | "layerItemMap">,
  geo: LayerImportGeo,
  selectedLayerIds: readonly FeatureId[],
  generateId: () => string = nanoid,
  replaceLayerIds: readonly FeatureId[] = [],
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

    const existing = target.layerStackMap[sourceLayer.id];
    const replace =
      replaceLayerIds.includes(sourceLayer.id) && existing?.kind === "overlay";
    const previousIndex = replace ? target.layerStack.indexOf(sourceLayer.id) : -1;
    if (replace) {
      for (const id of existing.items) occupiedItemIds.delete(id);
      geo.deleteLayer(sourceLayer.id);
      occupiedLayerIds.delete(sourceLayer.id);
    }
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
    if (previousIndex >= 0) geo.moveLayer(layerId, previousIndex);
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

/** Read-only replacement preview; authored fields include geometry, styling and history. */
export function previewScenarioOverlayReplacement(
  source: ScenarioState,
  target: ScenarioState,
  layerId: string,
) {
  const incoming = source.layerStackMap[layerId];
  const existing = target.layerStackMap[layerId];
  if (incoming?.kind !== "overlay" || existing?.kind !== "overlay") return undefined;
  const oldIds = new Set(existing.items);
  const newIds = new Set(incoming.items);
  const added = incoming.items.filter((id) => !oldIds.has(id));
  const removed = existing.items.filter((id) => !newIds.has(id));
  const changed = incoming.items.filter(
    (id) =>
      oldIds.has(id) &&
      !isEqual(
        withoutInternalFields(source.layerItemMap[id]),
        withoutInternalFields(target.layerItemMap[id]),
      ),
  );
  const unchanged = incoming.items.filter(
    (id) => oldIds.has(id) && !changed.includes(id),
  );
  return { layerId, name: existing.name, added, removed, changed, unchanged };
}
