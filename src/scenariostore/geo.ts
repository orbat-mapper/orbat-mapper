import type { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { computed } from "vue";
import type { CurrentState } from "@/types/scenarioModels";
import type {
  FeatureId,
  LayerFeatureItem,
  Position,
  ScenarioMapLayer,
} from "@/types/scenarioGeoModels";
import type { EntityId } from "@/types/base";
import type {
  NScenarioLayerItem,
  NScenarioLayer,
  NScenarioMapStackLayer,
  ScenarioLayerUpdate,
  ScenarioMapLayerUpdate,
  NGeometryLayerItem,
  GeometryLayerItemUpdate,
} from "@/types/internalModels";
import type {
  CurrentGeometryLayerItemState,
  CurrentScenarioLayerItemState,
  FullScenarioLayerItemsLayer,
  GeometryLayerItem,
  ScenarioLayerItem,
  ScenarioLayerItemUpdate,
  TacticalGraphicLayerItemUpdate,
} from "@/types/scenarioLayerItems";
import {
  computeScenarioLayerItemHidden,
  isNGeometryLayerItem,
  isNTacticalGraphicLayerItem,
  projectScenarioLayerItemStateAt,
  TACTICAL_GRAPHIC_UPDATE_FIELDS,
} from "@/types/scenarioLayerItems";
import type {
  NScenarioOverlayLayer,
  NScenarioReferenceLayer,
  NScenarioStackLayer,
} from "@/types/scenarioStackLayers";
import {
  isScenarioOverlayLayer,
  isScenarioReferenceLayer,
} from "@/types/scenarioStackLayers";
import { klona } from "klona";
import * as fileHandling from "@/importexport/fileHandling";
import { moveItemMutable, nanoid, removeElement } from "@/utils";
import { createEventHook } from "@vueuse/core";
import type { DropTarget } from "@/components/types";
import type { Geometry } from "geojson";

export type ScenarioMapLayerEvent =
  | {
      type: "add" | "remove" | "update";
      id: FeatureId;
      data: ScenarioMapLayer | ScenarioMapLayerUpdate;
    }
  | { type: "move"; id: FeatureId; index: number };

export type ScenarioFeatureLayerEvent =
  | {
      type: "addLayer";
      id: FeatureId;
      data: NScenarioLayer;
    }
  | { type: "removeLayer" | "moveLayer"; id: FeatureId }
  | { type: "updateLayer"; id: FeatureId; data: ScenarioLayerUpdate }
  | { type: "deleteFeature"; id: FeatureId }
  | {
      type: "updateFeature";
      id: FeatureId;
      data:
        | GeometryLayerItemUpdate
        | ScenarioLayerItemUpdate
        | TacticalGraphicLayerItemUpdate;
    }
  | { type: "addFeature"; id: FeatureId; data: NScenarioLayerItem }
  | { type: "moveFeature"; id: FeatureId; fromLayer?: FeatureId; toLayer?: FeatureId };

export type UpdateOptions = {
  undoable?: boolean;
  noEmit?: boolean;
  force?: boolean;
  emitOnly?: boolean;
};

export interface MoveLayerOptions {
  toIndex?: number;
  direction?: "up" | "down";
}

export interface AddUnitPositionOptions {
  via?: Position[];
  viaStartTime?: number;
}

function assignReferenceLayerSharedFields(
  layer: NScenarioReferenceLayer,
  data: ScenarioMapLayerUpdate,
) {
  const {
    name,
    description,
    attributions,
    externalUrl,
    visibleFromT,
    visibleUntilT,
    isHidden,
    opacity,
  } = data;

  if (name !== undefined) layer.name = name;
  if (description !== undefined) layer.description = description;
  if (attributions !== undefined) layer.attributions = attributions;
  if (externalUrl !== undefined) layer.externalUrl = externalUrl;
  if (visibleFromT !== undefined) layer.visibleFromT = visibleFromT;
  if (visibleUntilT !== undefined) layer.visibleUntilT = visibleUntilT;
  if (isHidden !== undefined) layer.isHidden = isHidden;
  if (opacity !== undefined) layer.opacity = opacity;
}

function getGeometryLayerItemFromMap(
  itemMap: Record<FeatureId, NScenarioLayerItem>,
  featureId: FeatureId,
): NGeometryLayerItem | undefined {
  const layerItem = itemMap[featureId];
  return layerItem?.kind === "geometry" ? (layerItem as NGeometryLayerItem) : undefined;
}

function getOverlayLayerFromMap(
  layerStackMap: Record<FeatureId, NScenarioStackLayer>,
  layerId: FeatureId,
): NScenarioOverlayLayer | undefined {
  const layer = layerStackMap[layerId];
  return isScenarioOverlayLayer(layer) ? (layer as NScenarioOverlayLayer) : undefined;
}

function getReferenceLayerFromMap(
  layerStackMap: Record<FeatureId, NScenarioStackLayer>,
  layerId: FeatureId,
): NScenarioReferenceLayer | undefined {
  const layer = layerStackMap[layerId];
  return isScenarioReferenceLayer(layer) ? (layer as NScenarioReferenceLayer) : undefined;
}

/**
 * Kind-agnostic base pass. `_hidden` lives on `ScenarioLayerItemBase`, so this
 * applies to every layer-item kind, not just geometry.
 */
function updateLayerItemHidden(item: NScenarioLayerItem, currentTime: number) {
  item._hidden = computeScenarioLayerItemHidden(item, currentTime);
}

/**
 * Each kind narrows `_state` to its own current-state interface, so writing the
 * shared base-pass result needs one deliberate widening here rather than a cast at
 * every call site. The fold itself is kind-correct: it only ever merges patches
 * that came off this item's own `state[]`.
 */
function setProjectedLayerItemState(
  item: NScenarioLayerItem,
  projected: CurrentScenarioLayerItemState,
) {
  (item as { _state?: CurrentScenarioLayerItemState | null })._state = projected;
}

function mergeGeometryUserData(
  current: Record<string, unknown> | undefined,
  next: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  const merged = {
    ...(current ?? {}),
    ...(next ?? {}),
  };
  Object.keys(merged).forEach((key) => {
    if (merged[key] === undefined) delete merged[key];
  });
  return Object.keys(merged).length ? merged : undefined;
}

export function useGeo(store: NewScenarioStore) {
  const { state, update } = store;
  const mapLayerEvent = createEventHook<ScenarioMapLayerEvent>();
  const featureLayerEvent = createEventHook<ScenarioFeatureLayerEvent>();

  const hiddenGroups = computed(() => {
    return new Set(
      Object.values(state.sideGroupMap)
        .filter((group) => !!(group.isHidden || state.sideMap[group._pid]?.isHidden))
        .map((group) => group.id),
    );
  });

  const hiddenSides = computed(() => {
    return new Set(
      Object.values(state.sideMap)
        .filter((side) => !!side.isHidden)
        .map((side) => side.id),
    );
  });

  const everyVisibleUnit = computed(() => {
    return Object.values(state.unitMap).filter(
      (unit) =>
        !(unit._gid
          ? hiddenGroups.value.has(unit._gid)
          : hiddenSides.value.has(unit._sid)) && unit._state?.location,
    );
  });

  function addUnitPosition(
    unitId: EntityId,
    coordinates: Position | null,
    atTime?: number,
    options: AddUnitPositionOptions = {},
  ) {
    let newState: CurrentState | null = null;
    update(
      (s) => {
        const u = s.unitMap[unitId];
        const t = atTime ?? s.currentTime;
        newState = {
          t,
          location: coordinates,
          ...(options.via?.length ? { via: options.via } : {}),
          ...(options.viaStartTime !== undefined
            ? { viaStartTime: options.viaStartTime }
            : {}),
        };
        // Bump before the loop so every code path (insert/replace/append) records
        // the change and keeps the bump inside the patch for undo/redo.
        s.unitStateCounter++;
        if (t === s.currentTime) u._state = newState;
        if (!u.state) u.state = [];
        for (let i = 0, len = u.state.length; i < len; i++) {
          if (t < u.state[i].t) {
            u.state.splice(i, 0, { id: nanoid(), ...newState });
            return;
          } else if (t === u.state[i].t) {
            u.state[i] = { ...u.state[i], ...newState };
            return;
          }
        }
        u.state.push({ id: nanoid(), ...newState });
      },
      { label: "addUnitPosition", value: unitId },
    );
  }

  function addFeatureStateGeometry(
    featureId: FeatureId,
    geometry: Geometry,
    atTime?: number,
  ) {
    let newState: CurrentGeometryLayerItemState | null = null;
    update(
      (s) => {
        const u = getGeometryLayerItemFromMap(s.layerItemMap, featureId);
        if (!u) return;
        const t = atTime ?? s.currentTime;
        newState = { t, geometry };
        const nextState = [...(u.state ?? [])];
        for (let i = 0, len = nextState.length; i < len; i++) {
          if (t < nextState[i].t) {
            nextState.splice(i, 0, {
              id: nanoid(),
              t,
              patch: { geometry },
            });
            s.layerItemMap[featureId] = {
              ...u,
              ...(t === s.currentTime ? { _state: newState } : {}),
              state: nextState,
            };
            return;
          } else if (t === nextState[i].t) {
            nextState[i] = {
              ...nextState[i],
              patch: { ...nextState[i].patch, geometry },
            };
            s.layerItemMap[featureId] = {
              ...u,
              ...(t === s.currentTime ? { _state: newState } : {}),
              state: nextState,
            };
            return;
          }
        }
        nextState.push({ id: nanoid(), t, patch: { geometry } });
        s.layerItemMap[featureId] = {
          ...u,
          ...(t === s.currentTime ? { _state: newState } : {}),
          state: nextState,
        };
      },
      { label: "updateFeatureState", value: featureId },
    );

    updateFeatureState(featureId);
  }

  function addLayer(data: NScenarioLayer) {
    const itemIds = data.items ?? [];
    const newLayer = klona({
      ...data,
      items: itemIds,
      _isNew: true,
    });
    if (!newLayer.id) newLayer.id = nanoid();
    newLayer._isNew = true;
    newLayer._isOpen = true;
    update(
      (s) => {
        s.layerStack.push(newLayer.id);
        s.layerStackMap[newLayer.id] = {
          ...newLayer,
          kind: "overlay",
        } as NScenarioOverlayLayer;
      },
      { label: "addLayer", value: newLayer.id },
    );
    featureLayerEvent
      .trigger({ type: "addLayer", id: newLayer.id, data: newLayer })
      .then();

    return getOverlayLayerFromMap(state.layerStackMap, newLayer.id);
  }

  function addMapLayer(data: ScenarioMapLayer) {
    const newLayer = klona({
      opacity: 0.7,
      ...data,
      _isNew: true,
      _isTemporary: data.url.startsWith("blob:"),
    });
    if (!newLayer.id) newLayer.id = nanoid();
    // Blob-backed KML layers are temporary import artifacts, so cache ownership is
    // established when the layer is added and released when the layer is removed.
    if (newLayer.type === "KMLLayer" && newLayer.url.startsWith("blob:")) {
      fileHandling.retainImageCache();
    }
    update(
      (s) => {
        s.layerStack.push(newLayer.id);
        s.layerStackMap[newLayer.id] = {
          id: newLayer.id,
          kind: "reference",
          name: newLayer.name,
          description: newLayer.description,
          attributions: newLayer.attributions,
          externalUrl: newLayer.externalUrl,
          visibleFromT: newLayer.visibleFromT,
          visibleUntilT: newLayer.visibleUntilT,
          isHidden: newLayer.isHidden,
          opacity: newLayer.opacity,
          _isNew: newLayer._isNew,
          _hidden: undefined,
          source: newLayer,
        } as NScenarioReferenceLayer;
      },
      { label: "addMapLayer", value: newLayer.id },
    );
    mapLayerEvent.trigger({ type: "add", id: newLayer.id, data: newLayer }).then();
    return getReferenceLayerFromMap(state.layerStackMap, newLayer.id)!
      .source as ScenarioMapLayer;
  }

  function moveLayer(layerId: FeatureId, toIndex: number) {
    const fromIndex = state.layerStack.indexOf(layerId);
    update(
      (s) => {
        moveItemMutable(s.layerStack, fromIndex, toIndex);
      },
      { label: "moveLayer", value: layerId },
    );
    featureLayerEvent.trigger({ type: "moveLayer", id: layerId }).then();
  }

  function moveMapLayer(layerId: FeatureId, options: MoveLayerOptions) {
    const fromIndex = state.layerStack.indexOf(layerId);
    const toIndex =
      options.toIndex ?? (options.direction === "up" ? fromIndex - 1 : fromIndex + 1);
    update(
      (s) => {
        moveItemMutable(s.layerStack, fromIndex, toIndex);
      },
      { label: "moveMapLayer", value: layerId },
    );
    mapLayerEvent.trigger({ type: "move", id: layerId, index: toIndex }).then();
  }

  function moveFeature(featureId: FeatureId, toIndex: number) {
    const feature = state.layerItemMap[featureId];
    if (!feature) return;
    const owner = getOverlayLayerFromMap(state.layerStackMap, feature._pid);
    if (!owner || owner.locked || feature.locked) return;

    update(
      (s) => {
        const layer = getOverlayLayerFromMap(s.layerStackMap, feature._pid);
        if (!layer) return;
        const fromIndex = layer.items.indexOf(String(featureId));
        moveItemMutable(layer.items, fromIndex, toIndex);
        layer.items.forEach((fid, i) => {
          const item = s.layerItemMap[fid];
          if (item?.kind === "geometry" && item._zIndex !== i) item._zIndex = i;
        });
      },
      { label: "moveFeature", value: featureId },
    );
    featureLayerEvent.trigger({ type: "moveFeature", id: featureId }).then();
  }

  function reorderFeature(
    featureId: FeatureId,
    destinationFeatureOrLayerId: FeatureId,
    target: DropTarget,
  ) {
    const feature = state.layerItemMap[featureId];
    const destinationFeature = state.layerItemMap[destinationFeatureOrLayerId];
    const destinationLayerId = destinationFeature?._pid ?? destinationFeatureOrLayerId;
    if (!feature) return;
    const layer = getOverlayLayerFromMap(state.layerStackMap, feature._pid);
    const destinationLayer = getOverlayLayerFromMap(
      state.layerStackMap,
      destinationLayerId,
    );
    if (!layer || !destinationLayer) return;
    if (layer.locked || destinationLayer.locked || feature.locked) return;
    const itemNeedsControlMeasureLayer = feature.kind === "tacticalGraphic";
    const destinationIsControlMeasureLayer =
      destinationLayer.specialization === "controlMeasure";
    if (itemNeedsControlMeasureLayer !== destinationIsControlMeasureLayer) return;

    const toIndex = destinationLayer.items.indexOf(String(destinationFeatureOrLayerId));
    if (layer.id === destinationLayer.id) {
      const fromIndex = layer.items.indexOf(String(featureId));
      let newIndex = toIndex;
      if (target === "above") newIndex = toIndex;
      else if (target === "below") newIndex = toIndex + 1;
      if (fromIndex < toIndex) newIndex--;
      moveFeature(featureId, newIndex);
    } else {
      update(
        (s) => {
          const fromLayer = getOverlayLayerFromMap(s.layerStackMap, feature._pid);
          const toLayer = getOverlayLayerFromMap(s.layerStackMap, destinationLayerId);
          if (!(fromLayer && toLayer)) return;
          const f = s.layerItemMap[featureId];

          removeElement(String(featureId), fromLayer.items);
          let newIndex = toIndex;
          if (target === "above") newIndex = toIndex;
          else if (target === "below") newIndex = toIndex + 1;
          if (toIndex >= 0) {
            toLayer.items.splice(newIndex, 0, String(featureId));
          } else {
            toLayer.items.push(String(featureId));
          }
          f._pid = toLayer.id;
        },
        { label: "moveFeature", value: featureId },
      );
      featureLayerEvent
        .trigger({
          type: "moveFeature",
          id: featureId,
          fromLayer: layer.id,
          toLayer: destinationLayerId,
        })
        .then();
    }
  }

  function getFullLayerItemsLayer(
    layerId: FeatureId,
  ): FullScenarioLayerItemsLayer | undefined {
    const layer = getOverlayLayerFromMap(state.layerStackMap, layerId);
    if (!layer) return;
    return {
      ...layer,
      items: layer.items.map((f) => klona(state.layerItemMap[f])),
    };
  }

  const layerItemsLayers = computed<FullScenarioLayerItemsLayer[]>(() => {
    return state.layerStack
      .map((layerId) => getOverlayLayerFromMap(state.layerStackMap, layerId))
      .filter((layer): layer is NScenarioOverlayLayer => !!layer)
      .map((layer) => ({
        ...layer,
        items: layer.items.map((featureId) => state.layerItemMap[featureId]),
      }));
  });

  const stackLayers = computed(() =>
    state.layerStack.map((layerId) => state.layerStackMap[layerId]).filter(Boolean),
  );
  const referenceLayers = computed(() =>
    stackLayers.value.filter(isScenarioReferenceLayer).map((layer) => layer.source),
  );
  const mapLayers = referenceLayers;
  const overlayLayers = computed(
    () => stackLayers.value.filter(isScenarioOverlayLayer) as NScenarioOverlayLayer[],
  );

  const layersItems = computed(() => {
    return overlayLayers.value.map((layer) => ({
      layer,
      items: layer.items.map((featureId) => state.layerItemMap[featureId]),
    }));
  });

  function updateLayer(
    layerId: FeatureId,
    data: ScenarioLayerUpdate,
    options: UpdateOptions = {},
  ) {
    const undoable = options.undoable ?? true;
    const noEmit = options.noEmit ?? false;

    if (undoable) {
      update(
        (s) => {
          const layer = getOverlayLayerFromMap(s.layerStackMap, layerId);
          if (!layer) return;
          Object.assign(layer, data);
        },
        { label: "updateLayer", value: layerId },
      );
    } else {
      const layer = getOverlayLayerFromMap(state.layerStackMap, layerId);
      if (!layer) return;
      Object.assign(layer, data);
    }
    if (noEmit) return;
    featureLayerEvent.trigger({ type: "updateLayer", id: layerId, data }).then();
  }

  function updateMapLayer(
    layerId: FeatureId,
    data: ScenarioMapLayerUpdate,
    options: UpdateOptions = {},
  ) {
    const undoable = options.undoable ?? true;
    const noEmit = options.noEmit ?? false;
    const emitOnly = options.emitOnly ?? false;
    if (undoable) {
      update(
        (s) => {
          const layer = getReferenceLayerFromMap(s.layerStackMap, layerId);
          if (!layer) return;
          Object.assign(layer.source, data);
          assignReferenceLayerSharedFields(layer, data);
        },
        { label: "updateMapLayer", value: layerId },
      );
    } else if (!emitOnly) {
      const layer = getReferenceLayerFromMap(state.layerStackMap, layerId);
      if (!layer) return;
      Object.assign(layer.source, data);
      assignReferenceLayerSharedFields(layer, data);
    }
    if (noEmit) return;
    mapLayerEvent.trigger({ type: "update", id: layerId, data });
  }

  function deleteLayer(layerId: FeatureId, options: UpdateOptions = {}) {
    const noEmit = options.noEmit ?? false;
    update(
      (s) => {
        const layer = getOverlayLayerFromMap(s.layerStackMap, layerId);
        if (!layer) return;
        layer.items.forEach((featureId) => delete s.layerItemMap[featureId]);
        delete s.layerStackMap[layerId];
        removeElement(layerId, s.layerStack);
      },
      { label: "deleteLayer", value: layerId },
    );
    if (noEmit) return;
    featureLayerEvent.trigger({ type: "removeLayer", id: layerId });
  }

  function deleteMapLayer(layerId: FeatureId, options: UpdateOptions = {}) {
    const noEmit = options.noEmit ?? false;
    update(
      (s) => {
        const layer = getReferenceLayerFromMap(s.layerStackMap, layerId);
        if (!layer) return;
        if (layer.source.type === "KMLLayer" && layer.source.url.startsWith("blob:")) {
          fileHandling.releaseImageCache();
        }
        delete s.layerStackMap[layerId];
        removeElement(layerId, s.layerStack);
      },
      { label: "deleteMapLayer", value: layerId },
    );
    if (noEmit) return;
    mapLayerEvent.trigger({ type: "remove", id: layerId, data: {} });
  }

  // Kind-agnostic: `tacticalGraphic` items are added through this same path, so a
  // control measure is one `layerItemMap` entry and one undo step like any other layer
  // item. `kind` still defaults to `"geometry"`, which is what every pre-existing
  // caller relies on.
  function addFeature(
    data: ScenarioLayerItem,
    layerId: FeatureId,
    options: UpdateOptions = {},
  ) {
    const noEmit = options.noEmit ?? false;
    const newFeature = klona(data) as NScenarioLayerItem;
    if (!newFeature.id) newFeature.id = nanoid();
    if (!newFeature.kind) (newFeature as NGeometryLayerItem).kind = "geometry";
    newFeature._pid = layerId;
    const destination = getOverlayLayerFromMap(state.layerStackMap, layerId);
    if (!destination || destination.locked) return;
    const requiresControlMeasureLayer = newFeature.kind === "tacticalGraphic";
    if (
      requiresControlMeasureLayer !==
      (destination.specialization === "controlMeasure")
    ) {
      return;
    }
    update(
      (s) => {
        const layer = getOverlayLayerFromMap(s.layerStackMap, layerId);
        if (!layer) return;
        s.layerItemMap[newFeature.id!] = newFeature;
        layer.items.push(newFeature.id!);
      },
      { label: "addFeature", value: newFeature.id },
    );
    store.state.featureStateCounter++;
    if (!noEmit) {
      featureLayerEvent
        .trigger({
          type: "addFeature",
          id: newFeature.id,
          data: newFeature,
        })
        .then();
    }
    return newFeature.id;
  }

  function deleteFeature(featureId: FeatureId, options: UpdateOptions = {}) {
    const noEmit = options.noEmit ?? false;
    const feature = state.layerItemMap[featureId];
    if (!feature) return;
    const owner = getOverlayLayerFromMap(state.layerStackMap, feature._pid);
    if (owner?.locked || feature.locked) return;
    update(
      (s) => {
        const layer = getOverlayLayerFromMap(s.layerStackMap, feature._pid);
        if (!layer) return;
        delete s.layerItemMap[featureId];
        removeElement(featureId, layer.items);
      },
      { label: "deleteFeature", value: featureId },
    );
    if (noEmit) return;
    featureLayerEvent.trigger({ type: "deleteFeature", id: featureId }).then();
  }

  function duplicateFeature(featureId: FeatureId) {
    const feature = state.layerItemMap[featureId];
    if (!feature) return;
    const owner = getOverlayLayerFromMap(state.layerStackMap, feature._pid);
    if (!owner || owner.locked || feature.locked) return;
    const copy = klona(feature);
    copy.id = nanoid();
    return addFeature(copy, feature._pid);
  }

  function updateFeature(
    featureId: FeatureId,
    data: GeometryLayerItemUpdate,
    options: UpdateOptions = {},
  ) {
    const undoable = options.undoable ?? true;
    const noEmit = options.noEmit ?? false;
    const isGeometry = data.geometry !== undefined;
    const currentFeature = getGeometryLayerItemFromMap(state.layerItemMap, featureId);
    const currentOwner = currentFeature
      ? getOverlayLayerFromMap(state.layerStackMap, currentFeature._pid)
      : undefined;
    if (!currentFeature || currentFeature.locked || currentOwner?.locked) return;
    if (undoable) {
      update(
        (s) => {
          const feature = getGeometryLayerItemFromMap(s.layerItemMap, featureId);
          if (!feature) return;
          const {
            geometry,
            media,
            style = {},
            state,
            userData,
            name,
            description,
            externalUrl,
            locked,
            isHidden,
            visibleFromT,
            visibleUntilT,
            _zIndex,
            _hidden,
            _state,
          } = data;
          Object.assign(feature.style, style);
          // Replace, don't merge: each geometryKind is a discriminated union
          // member with its own valid extra fields, so merging could leave a
          // stale field behind (e.g. a transformed rectangle keeping
          // shape:"rectangle", or radius surviving onto a non-circle). Callers
          // that touch geometryMeta pass a complete, coherent meta.
          if (data.geometryMeta !== undefined) {
            feature.geometryMeta = data.geometryMeta as GeometryLayerItem["geometryMeta"];
          }
          if (geometry) Object.assign(feature.geometry, geometry);

          if (state) feature.state = state;
          if (media) feature.media = media;
          if (userData) {
            feature.userData = mergeGeometryUserData(feature.userData, userData);
          }
          if (name !== undefined) feature.name = name;
          if (description !== undefined) feature.description = description;
          if (externalUrl !== undefined) feature.externalUrl = externalUrl;
          if (locked !== undefined) feature.locked = locked;
          if (isHidden !== undefined) feature.isHidden = isHidden;
          if (visibleFromT !== undefined) feature.visibleFromT = visibleFromT;
          if (visibleUntilT !== undefined) feature.visibleUntilT = visibleUntilT;
          if (_zIndex !== undefined) feature._zIndex = _zIndex;
          if (_hidden !== undefined) feature._hidden = _hidden;
          if (_state !== undefined) feature._state = _state;

          updateLayerItemHidden(feature, s.currentTime);
        },
        {
          label: isGeometry ? "updateFeatureGeometry" : "updateFeature",
          value: featureId,
        },
      );
    } else {
      const layerItem = getGeometryLayerItemFromMap(state.layerItemMap, featureId);
      if (!layerItem) return;
      Object.assign(layerItem.style, data.style ?? {});
      // Replace, not merge (see undoable branch above).
      if (data.geometryMeta !== undefined) {
        layerItem.geometryMeta = data.geometryMeta as GeometryLayerItem["geometryMeta"];
      }
      if (data.geometry) Object.assign(layerItem.geometry, data.geometry);
      if (data.userData) {
        layerItem.userData = mergeGeometryUserData(layerItem.userData, data.userData);
      }
      const { geometry, geometryMeta, style, userData, ...topLevelData } = data;
      Object.assign(layerItem, topLevelData);
      updateLayerItemHidden(layerItem, state.currentTime);
    }
    if (data.state) {
      updateFeatureState(featureId);
    }
    if (noEmit) return;
    featureLayerEvent.trigger({ type: "updateFeature", id: featureId, data }).then();
    if (isGeometry) {
      featureLayerEvent.trigger({ type: "moveFeature", id: featureId }).then();
    }
  }

  /**
   * Kind-agnostic counterpart to `updateFeature` for the shared base fields.
   *
   * `updateFeature` narrows to geometry before it reaches `style`/`geometry`/
   * `geometryMeta`, so it silently no-ops on a `tacticalGraphic`. The layers panel's
   * visibility and lock toggles are shared chrome over every kind, so they go through
   * here instead. Geometry callers keep using `updateFeature` — this is deliberately
   * the smaller door, not a replacement.
   */
  function updateLayerItem(
    itemId: FeatureId,
    data: ScenarioLayerItemUpdate,
    options: UpdateOptions = {},
  ) {
    const undoable = options.undoable ?? true;
    const noEmit = options.noEmit ?? false;

    // No return value: the immer producer treats a returned value as a replacement
    // for the whole draft.
    const apply = (item: NScenarioLayerItem | undefined, currentTime: number) => {
      if (!item) return;
      const owner = getOverlayLayerFromMap(state.layerStackMap, item._pid);
      if (owner?.locked || item.locked) return;
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) return;
        (item as unknown as Record<string, unknown>)[key] = value;
      });
      updateLayerItemHidden(item, currentTime);
    };

    if (undoable) {
      update(
        (s) => {
          apply(s.layerItemMap[itemId], s.currentTime);
        },
        { label: "updateFeature", value: itemId },
      );
    } else {
      if (!state.layerItemMap[itemId]) return;
      apply(state.layerItemMap[itemId], state.currentTime);
    }
    if (noEmit) return;
    featureLayerEvent.trigger({ type: "updateFeature", id: itemId, data }).then();
  }

  /**
   * The `tacticalGraphic` counterpart to `updateFeature`.
   *
   * `updateFeature` narrows to geometry and silently no-ops on a control measure, and
   * `updateLayerItem` only carries the shared base fields — neither can persist what a
   * settled edit session produced. This is the third, deliberately narrow door: it
   * copies only `TACTICAL_GRAPHIC_UPDATE_FIELDS`, so `state`/`_state`/`_pid`/`kind`
   * stay unreachable and the timed projection cannot be corrupted through it.
   *
   * One `update()` is one undo step, which is what ADR-0006's "exactly one store write
   * per settled session" asks for. Recording — writing shape into `state[]` instead of
   * top-level — is step 17's; this always writes top-level.
   */
  function updateTacticalGraphic(
    itemId: FeatureId,
    data: TacticalGraphicLayerItemUpdate,
    options: UpdateOptions = {},
  ) {
    const undoable = options.undoable ?? true;
    const noEmit = options.noEmit ?? false;

    // No return value: the immer producer treats a returned value as a replacement
    // for the whole draft.
    const apply = (item: NScenarioLayerItem | undefined) => {
      if (!item || !isNTacticalGraphicLayerItem(item)) return;
      const owner = getOverlayLayerFromMap(state.layerStackMap, item._pid);
      if (owner?.locked || item.locked) return;
      TACTICAL_GRAPHIC_UPDATE_FIELDS.forEach((field) => {
        const value = data[field];
        if (value === undefined) return;
        (item as unknown as Record<string, unknown>)[field] = value;
      });
    };

    if (undoable) {
      update(
        (s) => {
          apply(s.layerItemMap[itemId]);
        },
        { label: "updateFeature", value: itemId },
      );
    } else {
      apply(state.layerItemMap[itemId]);
    }
    if (noEmit) return;
    featureLayerEvent.trigger({ type: "updateFeature", id: itemId, data }).then();
  }

  /**
   * The `tacticalGraphic` counterpart to `addFeatureStateGeometry`: record **shape**
   * into `state[]` at `atTime` rather than writing it top-level.
   *
   * Shape is the only recordable thing on a control measure — option, style and
   * amplifier edits are timeless and go through `updateTacticalGraphic`. The patch type
   * is deliberately wider than this writer, so an imported scenario carrying a richer
   * patch still projects (`TacticalGraphicLayerItemState`).
   */
  function addTacticalGraphicStateControlPoints(
    itemId: FeatureId,
    controlPoints: Position[],
    atTime?: number,
  ) {
    update(
      (s) => {
        const item = s.layerItemMap[itemId];
        if (!item || !isNTacticalGraphicLayerItem(item)) return;
        const owner = getOverlayLayerFromMap(s.layerStackMap, item._pid);
        if (owner?.locked || item.locked) return;
        const t = atTime ?? s.currentTime;
        const nextState = [...(item.state ?? [])];
        for (let i = 0, len = nextState.length; i < len; i++) {
          if (t < nextState[i].t) {
            nextState.splice(i, 0, { id: nanoid(), t, patch: { controlPoints } });
            item.state = nextState;
            return;
          } else if (t === nextState[i].t) {
            nextState[i] = {
              ...nextState[i],
              patch: { ...nextState[i].patch, controlPoints },
            };
            item.state = nextState;
            return;
          }
        }
        nextState.push({ id: nanoid(), t, patch: { controlPoints } });
        item.state = nextState;
      },
      { label: "updateFeatureState", value: itemId },
    );

    // `_state` is recomputed from the whole projection rather than assigned inline:
    // an earlier patch may carry fields this writer never touches.
    updateFeatureState(itemId);
  }

  function deleteFeatureStateEntry(featureId: FeatureId, index: number) {
    update((s) => {
      const _feature = s.layerItemMap[featureId];
      if (!_feature) return;
      _feature.state?.splice(index, 1);
    });

    updateFeatureState(featureId);
  }

  /**
   * Kind-agnostic base pass: fold `state[]` onto `_state` at the current time.
   *
   * Geometry layers its own seed on top (`createInitialScenarioLayerItemState`), so
   * the geometry projection is byte-identical to what this used to compute; every
   * other kind now projects at all, which it never did before.
   */
  function updateFeatureState(featureId: FeatureId) {
    const feature = state.layerItemMap[featureId];
    if (!feature) return;
    if (!feature.state || !feature.state.length) {
      store.state.featureStateCounter++;
      feature._state = undefined;
      // The projection just went away, so a patched visibility went with it.
      updateLayerItemHidden(feature, state.currentTime);
      return;
    }
    setProjectedLayerItemState(
      feature,
      projectScenarioLayerItemStateAt(feature, state.currentTime),
    );
    // After the projection, never before: `_hidden` resolves the visibility fields
    // through `_state`, so a timed patch of `isHidden` only lands if it is computed
    // from the fresh projection.
    updateLayerItemHidden(feature, state.currentTime);
    store.state.featureStateCounter++;
  }

  function getLayerItemById(id: FeatureId) {
    const layerItem = state.layerItemMap[id];
    if (!layerItem) return { layerItem, layer: undefined };
    return {
      layerItem,
      layer: getOverlayLayerFromMap(state.layerStackMap, layerItem._pid),
    };
  }

  function getGeometryLayerItemById(id: FeatureId) {
    const { layerItem, layer } = getLayerItemById(id);
    if (!layerItem || !isNGeometryLayerItem(layerItem)) {
      return { layerItem: undefined, layer };
    }
    return { layerItem, layer };
  }

  const itemsInfo = computed<LayerFeatureItem[]>(() => {
    const items: LayerFeatureItem[] = [];
    layerItemsLayers.value.forEach((layer) => {
      items.push({ id: layer.id, type: "layer", name: layer.name });
      const mappedFeatures: LayerFeatureItem[] = layer.items.map((layerItem) => {
        if (!isNGeometryLayerItem(layerItem)) {
          // Non-geometry kinds have no `geometryKind`, so the item kind itself is the
          // discriminator search results and icons key off. It used to be a flat
          // `"Point"` placeholder, which made every control measure look like a marker.
          return {
            id: layerItem.id,
            type: layerItem.kind,
            name: layerItem.name || "",
            description: layerItem.description,
            _pid: layer.id,
          };
        }
        const feature = layerItem;
        const { id } = feature;
        return {
          id,
          type: feature.geometryMeta.geometryKind,
          name: feature.name || "",
          description: feature.description,
          _pid: layer.id,
        };
      });
      items.push(...mappedFeatures);
    });
    return items;
  });

  function getStackLayerById(id: FeatureId) {
    return state.layerStackMap[id];
  }

  return {
    everyVisibleUnit,
    addUnitPosition,
    addLayer,
    getLayerById: (id: FeatureId) =>
      getOverlayLayerFromMap(state.layerStackMap, id) as NScenarioLayer | undefined,
    getFullLayerItemsLayer,
    getLayerItemById,
    getGeometryLayerItemById,
    moveFeature,
    updateLayer,
    deleteLayer,
    getLayerIndex: (id: FeatureId) => state.layerStack.indexOf(id),
    moveLayer,
    addFeature,
    duplicateFeature,
    deleteFeature,
    updateFeature,
    updateLayerItem,
    updateTacticalGraphic,
    addTacticalGraphicStateControlPoints,
    deleteFeatureStateEntry,
    itemsInfo,
    layerItemsLayers,
    overlayLayers,
    layersItems,
    stackLayers,
    referenceLayers,
    mapLayers,
    addMapLayer,
    deleteMapLayer,
    updateMapLayer,
    getMapLayerById: (id: FeatureId) =>
      getReferenceLayerFromMap(state.layerStackMap, id)?.source,
    getMapLayerIndex: (id: FeatureId) => state.layerStack.indexOf(id),
    getStackLayerById,
    onMapLayerEvent: mapLayerEvent.on,
    onFeatureLayerEvent: featureLayerEvent.on,
    onLayerItemEvent: featureLayerEvent.on,
    moveMapLayer,
    reorderFeature,
    addFeatureStateGeometry,
  };
}
