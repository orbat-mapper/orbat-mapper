import { isEqual, omit } from "es-toolkit";
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

export interface ImportScenarioLayersOptions {
  /** Id generator used when an incoming layer or item id is already taken. */
  generateId?: () => string;
  /** Selected layers whose same-id target layer is replaced instead of copied. */
  replaceLayerIds?: readonly FeatureId[];
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
 * ids are retained when possible and remapped on collision; a remapped item also gets
 * new state entry ids. Derived `_` fields are never
 * copied; the target store recreates them for its own current time and ownership graph.
 */
export function importScenarioOverlayLayers(
  source: ScenarioState,
  target: Pick<ScenarioState, "layerStack" | "layerStackMap" | "layerItemMap">,
  geo: LayerImportGeo,
  selectedLayerIds: readonly FeatureId[],
  { generateId = nanoid, replaceLayerIds = [] }: ImportScenarioLayersOptions = {},
): ImportScenarioLayersResult {
  const selected = new Set(selectedLayerIds);
  const replaceIds = new Set(replaceLayerIds);
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
    const replace = replaceIds.has(sourceLayer.id) && existing?.kind === "overlay";
    const previousIndex = replace ? target.layerStack.indexOf(sourceLayer.id) : -1;
    if (replace) {
      for (const id of existing.items) occupiedItemIds.delete(id);
      geo.deleteLayer(sourceLayer.id);
      occupiedLayerIds.delete(sourceLayer.id);
    }
    const layerId = availableId(sourceLayer.id, occupiedLayerIds, generateId);
    const { items, ...layerFields } = withoutInternalFields(sourceLayer);
    const { locked } = layerFields;
    const addedLayer = geo.addLayer({
      ...layerFields,
      id: layerId,
      kind: "overlay",
      items: [],
      // A locked source layer must be writable while its items are restored. Other
      // layers keep their `locked` field as is, so a re-import compares equal.
      ...(locked ? { locked: false } : {}),
    });
    if (!addedLayer) continue;
    if (previousIndex >= 0) geo.moveLayer(layerId, previousIndex);
    result.importedLayerIds.push(layerId);

    for (const sourceItemId of items) {
      const sourceItem = source.layerItemMap[sourceItemId];
      if (!sourceItem) continue;
      const itemId = availableId(sourceItem.id, occupiedItemIds, generateId);
      const fields = withoutInternalFields(sourceItem);
      const item = {
        ...fields,
        id: itemId,
        // A remapped item is a copy that lives beside its original, so its timed state
        // entries need their own ids too.
        ...(itemId !== sourceItem.id && fields.state
          ? { state: fields.state.map((entry) => ({ ...entry, id: generateId() })) }
          : {}),
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

/**
 * An item's authored fields for comparison. State entry ids are left out: loading a
 * file without them generates random ids, which would make every timed item differ.
 */
function authoredItemFields(item: ScenarioState["layerItemMap"][FeatureId]) {
  const fields = withoutInternalFields(item);
  return fields.state
    ? { ...fields, state: fields.state.map((entry) => omit(entry, ["id"])) }
    : fields;
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
  const added: FeatureId[] = [];
  const changed: FeatureId[] = [];
  const unchanged: FeatureId[] = [];
  for (const id of incoming.items) {
    if (!oldIds.has(id)) added.push(id);
    else if (
      isEqual(
        authoredItemFields(source.layerItemMap[id]),
        authoredItemFields(target.layerItemMap[id]),
      )
    )
      unchanged.push(id);
    else changed.push(id);
  }
  const removed = existing.items.filter((id) => !newIds.has(id));
  const layerFields = (layer: typeof incoming) =>
    omit(withoutInternalFields(layer), ["items"]);
  const propertiesChanged = !isEqual(layerFields(incoming), layerFields(existing));
  return {
    layerId,
    name: existing.name,
    added,
    removed,
    changed,
    unchanged,
    propertiesChanged,
  };
}

export type OverlayReplacementPreview = NonNullable<
  ReturnType<typeof previewScenarioOverlayReplacement>
>;

export type LayerImportAction = "copy" | "replace";

/** The choices for a file layer whose ID matches a layer in the scenario. */
export const layerImportActionItems: { value: LayerImportAction; label: string }[] = [
  { value: "copy", label: "Import as a separate copy" },
  { value: "replace", label: "Replace existing layer" },
];

export interface FileLayerOption {
  layerId: string;
  name: string;
  itemCount: number;
  /** `new` has no same-id overlay layer in the target; the others are matched by ID. */
  status: "new" | "changed" | "unchanged";
  preview?: OverlayReplacementPreview;
}

function hasReplacementChanges(preview: OverlayReplacementPreview) {
  return (
    preview.added.length > 0 ||
    preview.changed.length > 0 ||
    preview.removed.length > 0 ||
    preview.propertiesChanged
  );
}

/** One summary line for a selected file layer, e.g. "Blue graphics: 3 added, 1 changed". */
export function describeFileLayerImport(
  layer: FileLayerOption,
  action: LayerImportAction,
): string {
  const { preview } = layer;
  if (action === "copy" || !preview)
    return `${layer.name}: ${layer.itemCount} added as a new layer`;
  const counts = `${preview.added.length} added, ${preview.changed.length} changed, ${preview.removed.length} removed`;
  return `${layer.name}: ${counts}${preview.propertiesChanged ? ", layer properties changed" : ""}`;
}

/**
 * Describe a file's overlay layers against the target and pick the default selection.
 *
 * Only a single changed matched layer is pre-selected. A file saved from the whole
 * scenario carries copies of every layer, so several changed layers suggest stale
 * copies of other players' layers rather than intended updates.
 */
export function planFileLayers(source: ScenarioState, target: ScenarioState) {
  const layers: FileLayerOption[] = [];
  for (const id of source.layerStack) {
    const layer = source.layerStackMap[id];
    if (layer?.kind !== "overlay") continue;
    const preview = previewScenarioOverlayReplacement(source, target, layer.id);
    layers.push({
      layerId: layer.id,
      name: layer.name,
      itemCount: layer.items.length,
      status: !preview ? "new" : hasReplacementChanges(preview) ? "changed" : "unchanged",
      preview,
    });
  }
  const changedMatched = layers.filter((l) => l.status === "changed");
  return {
    layers,
    changedMatchedCount: changedMatched.length,
    defaultSelectedIds: changedMatched.length === 1 ? [changedMatched[0].layerId] : [],
  };
}
