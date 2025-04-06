import type { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { computed } from "vue";
import type { CurrentState } from "@/types/scenarioModels";
import type {
  CurrentScenarioFeatureState,
  FeatureId,
  LayerFeatureItem,
  Position,
  ScenarioLayer,
  ScenarioMapLayer,
} from "@/types/scenarioGeoModels";
import type { EntityId } from "@/types/base";
import type {
  NScenarioFeature,
  NScenarioLayer,
  ScenarioFeatureUpdate,
  ScenarioLayerUpdate,
  ScenarioMapLayerUpdate,
} from "@/types/internalModels";
import { klona } from "klona";
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
  | { type: "updateFeature"; id: FeatureId; data: ScenarioFeatureUpdate }
  | { type: "addFeature"; id: FeatureId; data: NScenarioFeature }
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

function createInitialFeatureState(
  feature: NScenarioFeature,
): CurrentScenarioFeatureState | null {
  return {
    t: Number.MIN_SAFE_INTEGER,
    geometry: feature.geometry,
  };
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
  const everyVisibleUnit = computed(() => {
    return Object.values(state.unitMap).filter(
      (unit) => !hiddenGroups.value.has(unit._gid) && unit._state?.location,
    );
  });

  function addUnitPosition(
    unitId: EntityId,
    coordinates: Position | null,
    atTime?: number,
  ) {
    let newState: CurrentState | null = null;
    update(
      (s) => {
        const u = s.unitMap[unitId];
        const t = atTime ?? s.currentTime;
        newState = { t, location: coordinates };
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
    store.state.unitStateCounter++;
  }

  function addFeatureStateGeometry(
    featureId: FeatureId,
    geometry: Geometry,
    atTime?: number,
  ) {
    let newState: CurrentScenarioFeatureState | null = null;
    update(
      (s) => {
        const u = s.featureMap[featureId];
        const t = atTime ?? s.currentTime;
        newState = { t, geometry };
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
      { label: "updateFeatureState", value: featureId },
    );

    updateFeatureState(featureId);
  }

  function addLayer(data: NScenarioLayer) {
    const newLayer = klona({ ...data, _isNew: true });
    if (!newLayer.id) newLayer.id = nanoid();
    newLayer._isNew = true;
    newLayer._isOpen = true;
    update(
      (s) => {
        s.layers.push(newLayer.id);
        s.layerMap[newLayer.id] = newLayer;
      },
      { label: "addLayer", value: newLayer.id },
    );
    featureLayerEvent
      .trigger({ type: "addLayer", id: newLayer.id, data: newLayer })
      .then();

    return state.layerMap[newLayer.id];
  }

  function addMapLayer(data: ScenarioMapLayer) {
    const newLayer = klona({
      opacity: 0.7,
      ...data,
      _isNew: true,
      _isTemporary: data.url.startsWith("blob:"),
    });
    if (!newLayer.id) newLayer.id = nanoid();
    update(
      (s) => {
        s.mapLayers.push(newLayer.id);
        s.mapLayerMap[newLayer.id] = newLayer;
      },
      { label: "addMapLayer", value: newLayer.id },
    );
    mapLayerEvent.trigger({ type: "add", id: newLayer.id, data: newLayer }).then();
    return state.mapLayerMap[newLayer.id];
  }

  function moveLayer(layerId: FeatureId, toIndex: number) {
    const fromIndex = state.layers.indexOf(layerId);
    update(
      (s) => {
        moveItemMutable(s.layers, fromIndex, toIndex);
      },
      { label: "moveLayer", value: layerId },
    );
    featureLayerEvent.trigger({ type: "moveLayer", id: layerId }).then();
  }

  function moveMapLayer(layerId: FeatureId, options: MoveLayerOptions) {
    const fromIndex = state.mapLayers.indexOf(layerId);
    const toIndex =
      options.toIndex ?? (options.direction === "up" ? fromIndex - 1 : fromIndex + 1);
    update(
      (s) => {
        moveItemMutable(s.mapLayers, fromIndex, toIndex);
      },
      { label: "moveMapLayer", value: layerId },
    );
    mapLayerEvent.trigger({ type: "move", id: layerId, index: toIndex }).then();
  }

  function moveFeature(featureId: FeatureId, toIndex: number) {
    const feature = state.featureMap[featureId];

    update(
      (s) => {
        const layer = s.layerMap[feature._pid];
        const fromIndex = layer.features.indexOf(featureId);
        moveItemMutable(layer.features, fromIndex, toIndex);
        layer.features.forEach((fid, i) => {
          const feature = s.featureMap[fid];
          if (feature.meta._zIndex !== i) feature.meta._zIndex = i;
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
    const feature = state.featureMap[featureId];
    const destinationFeature = state.featureMap[destinationFeatureOrLayerId];
    const destinationLayerId = destinationFeature?._pid ?? destinationFeatureOrLayerId;
    if (!feature) return;
    const layer = state.layerMap[feature._pid];
    const destinationLayer = state.layerMap[destinationLayerId];
    if (!layer || !destinationLayer) return;

    const toIndex = destinationLayer.features.indexOf(destinationFeatureOrLayerId);
    if (layer.id === destinationLayer.id) {
      const fromIndex = layer.features.indexOf(featureId);
      let newIndex = toIndex;
      if (target === "above") newIndex = toIndex;
      else if (target === "below") newIndex = toIndex + 1;
      if (fromIndex < toIndex) newIndex--;
      moveFeature(featureId, newIndex);
    } else {
      update(
        (s) => {
          const fromLayer = s.layerMap[feature._pid];
          const toLayer = s.layerMap[destinationLayerId];
          const f = s.featureMap[featureId];

          removeElement(featureId, fromLayer.features);
          let newIndex = toIndex;
          if (target === "above") newIndex = toIndex;
          else if (target === "below") newIndex = toIndex + 1;
          if (toIndex >= 0) {
            toLayer.features.splice(newIndex, 0, featureId);
          } else {
            toLayer.features.push(featureId);
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

  function getFullLayer(layerId: FeatureId): ScenarioLayer | undefined {
    const layer = state.layerMap[layerId];
    if (!layer) return;
    return { ...layer, features: layer.features.map((f) => klona(state.featureMap[f])) };
  }

  const layers = computed(() => {
    return state.layers
      .map((layerId) => state.layerMap[layerId])
      .map((layer) => ({
        ...layer,
        features: layer.features.map((featureId) => state.featureMap[featureId]),
      }));
  });

  const mapLayers = computed(() => {
    return state.mapLayers.map((layerId) => state.mapLayerMap[layerId]);
  });

  const layersFeatures = computed(() => {
    return state.layers
      .map((layerId) => state.layerMap[layerId])
      .map((layer) => ({
        layer,
        features: layer.features.map((featureId) => state.featureMap[featureId]),
      }));
  });

  function updateLayer(
    layerId: FeatureId,
    data: ScenarioLayerUpdate,
    options: UpdateOptions = {},
  ) {
    const undoable = options.undoable ?? true;
    const noEmit = options.noEmit ?? false;
    const emitOnly = options.emitOnly ?? false;

    if (undoable) {
      update(
        (s) => {
          const layer = s.layerMap[layerId];
          Object.assign(layer, data);
        },
        { label: "updateLayer", value: layerId },
      );
    } else {
      const layer = state.layerMap[layerId];
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
          const layer = s.mapLayerMap[layerId];
          Object.assign(layer, data);
        },
        { label: "updateMapLayer", value: layerId },
      );
    } else if (!emitOnly) {
      const layer = state.mapLayerMap[layerId];
      Object.assign(layer, data);
    }
    if (noEmit) return;
    mapLayerEvent.trigger({ type: "update", id: layerId, data });
  }

  function deleteLayer(layerId: FeatureId, options: UpdateOptions = {}) {
    const noEmit = options.noEmit ?? false;
    update(
      (s) => {
        const layer = s.layerMap[layerId];
        if (!layer) return;
        layer.features.forEach((featureId) => delete s.featureMap[featureId]);
        delete s.layerMap[layerId];
        removeElement(layerId, s.layers);
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
        const layer = s.mapLayerMap[layerId];
        if (!layer) return;
        delete s.mapLayerMap[layerId];
        removeElement(layerId, s.mapLayers);
      },
      { label: "deleteMapLayer", value: layerId },
    );
    if (noEmit) return;
    mapLayerEvent.trigger({ type: "remove", id: layerId, data: {} });
  }

  function addFeature(
    data: NScenarioFeature,
    layerId: FeatureId,
    options: UpdateOptions = {},
  ) {
    const noEmit = options.noEmit ?? false;
    const newFeature = klona(data);
    if (!newFeature.id) newFeature.id = nanoid();
    newFeature._pid = layerId;
    update(
      (s) => {
        const layer = s.layerMap[layerId];
        if (!layer) return;
        s.featureMap[newFeature.id!] = newFeature;
        layer.features.push(newFeature.id!);
      },
      { label: "addFeature", value: newFeature.id },
    );
    store.state.featureStateCounter++;
    if (!noEmit) {
      featureLayerEvent
        .trigger({ type: "addFeature", id: newFeature.id, data: newFeature })
        .then();
    }
    return newFeature.id;
  }

  function deleteFeature(featureId: FeatureId, options: UpdateOptions = {}) {
    const noEmit = options.noEmit ?? false;
    const feature = state.featureMap[featureId];
    if (!feature) return;
    update(
      (s) => {
        const layer = s.layerMap[feature._pid];
        delete s.featureMap[featureId];
        removeElement(featureId, layer.features);
      },
      { label: "deleteFeature", value: featureId },
    );
    if (noEmit) return;
    featureLayerEvent.trigger({ type: "deleteFeature", id: featureId }).then();
  }

  function duplicateFeature(featureId: FeatureId) {
    const feature = state.featureMap[featureId];
    if (!feature) return;
    const shallowCopy = { ...feature };
    shallowCopy.id = nanoid();
    return addFeature(shallowCopy, feature._pid);
  }

  function updateFeature(
    featureId: FeatureId,
    data: ScenarioFeatureUpdate,
    options: UpdateOptions = {},
  ) {
    const undoable = options.undoable ?? true;
    const noEmit = options.noEmit ?? false;
    const isGeometry = data.geometry !== undefined;
    if (undoable) {
      update(
        (s) => {
          const feature = s.featureMap[featureId];
          if (!feature) return;
          const { properties = {}, geometry, media, style = {}, meta = {}, state } = data;
          Object.assign(feature.style, style);
          Object.assign(feature.meta, meta);
          feature.properties
            ? Object.assign(feature.properties, properties)
            : (feature.properties = properties);
          Object.assign(feature.geometry, geometry);

          if (state) feature.state = state;
          if (media) feature.media = media;
        },
        {
          label: isGeometry ? "updateFeatureGeometry" : "updateFeature",
          value: featureId,
        },
      );
    } else {
      const layer = state.featureMap[featureId];
      Object.assign(layer, data);
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

  function deleteFeatureStateEntry(featureId: FeatureId, index: number) {
    update((s) => {
      const _feature = s.featureMap[featureId];
      if (!_feature) return;
      _feature.state?.splice(index, 1);
    });

    updateFeatureState(featureId);
  }

  function updateFeatureState(featureId: FeatureId, undoable = false) {
    const feature = state.featureMap[featureId];
    if (!feature) return;
    const timestamp = state.currentTime;
    if (!feature.state || !feature.state.length) {
      store.state.featureStateCounter++;
      feature._state = undefined;
      return;
    }
    let currentState = createInitialFeatureState(feature);
    for (const s of feature.state) {
      if (s.t <= timestamp) {
        currentState = { ...currentState, ...s };
      } else {
        break;
      }
    }
    feature._state = currentState;
    store.state.featureStateCounter++;
  }

  const itemsInfo = computed<LayerFeatureItem[]>(() => {
    let items: LayerFeatureItem[] = [];
    layers.value.forEach((layer) => {
      items.push({ id: layer.id, type: "layer", name: layer.name });
      const mappedFeatures: LayerFeatureItem[] = layer.features.map((feature) => {
        const { meta, id } = feature;
        return {
          id,
          type: meta.type,
          name: meta.name || "",
          description: meta.description,
          _pid: layer.id,
        };
      });
      items.push(...mappedFeatures);
    });
    return items;
  });

  return {
    everyVisibleUnit,
    addUnitPosition,
    addLayer,
    getLayerById: (id: FeatureId) => state.layerMap[id],
    getFullLayer,
    getFeatureById: (id: FeatureId) => {
      const feature = state.featureMap[id];
      if (!feature) return { feature, layer: undefined };
      return { feature, layer: state.layerMap[feature._pid] };
    },
    moveFeature,
    updateLayer,
    deleteLayer,
    getLayerIndex: (id: FeatureId) => state.layers.indexOf(id),
    moveLayer,
    addFeature,
    duplicateFeature,
    deleteFeature,
    updateFeature,
    deleteFeatureStateEntry,
    itemsInfo,
    layers,
    layersFeatures,
    mapLayers,
    addMapLayer,
    deleteMapLayer,
    updateMapLayer,
    getMapLayerById: (id: FeatureId) => state.mapLayerMap[id],
    getMapLayerIndex: (id: FeatureId) => state.mapLayers.indexOf(id),
    onMapLayerEvent: mapLayerEvent.on,
    onFeatureLayerEvent: featureLayerEvent.on,
    moveMapLayer,
    reorderFeature,
    addFeatureStateGeometry,
  };
}
