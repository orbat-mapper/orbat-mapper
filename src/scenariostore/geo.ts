import { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { computed } from "vue";
import { CurrentState } from "@/types/scenarioModels";
import {
  FeatureId,
  LayerFeatureItem,
  Position,
  ScenarioLayer,
  ScenarioMapLayer,
} from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";
import {
  NScenarioFeature,
  NScenarioLayer,
  ScenarioFeatureUpdate,
  ScenarioLayerUpdate,
  ScenarioMapLayerUpdate,
} from "@/types/internalModels";
import { klona } from "klona";
import { moveItemMutable, nanoid, removeElement } from "@/utils";
import { createEventHook } from "@vueuse/core";
import { DropTarget } from "@/components/types";

export type ScenarioMapLayerEvent =
  | {
      type: "add" | "remove" | "update";
      id: FeatureId;
      data: ScenarioMapLayer | ScenarioMapLayerUpdate;
    }
  | { type: "move"; id: FeatureId; index: number };

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

export function useGeo(store: NewScenarioStore) {
  const { state, update } = store;
  const mapLayerEvent = createEventHook<ScenarioMapLayerEvent>();

  const everyVisibleUnit = computed(() => {
    return Object.values(state.unitMap).filter((unit) => unit._state?.location);
  });

  function addUnitPosition(
    unitId: EntityId,
    coordinates: Position | null,
    atTime?: number,
  ) {
    let newState: CurrentState | null = null;
    update(
      (s) => {
        const u = s.getUnitById(unitId);
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
    mapLayerEvent.trigger({ type: "add", id: newLayer.id, data: newLayer });
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
    mapLayerEvent.trigger({ type: "move", id: layerId, index: toIndex });
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
      let newIndex = toIndex;
      if (target === "above") newIndex = toIndex;
      else if (target === "below") newIndex = toIndex + 1;
      moveFeature(featureId, newIndex);
    } else {
      update(
        (s) => {
          const fromLayer = s.layerMap[feature._pid];
          const toLayer = s.layerMap[destinationLayerId];
          const f = s.featureMap[featureId];

          removeElement(featureId, fromLayer.features);
          if (toIndex >= 0) {
            toLayer.features.splice(toIndex, 0, featureId);
          } else {
            toLayer.features.push(featureId);
          }
          f._pid = toLayer.id;
        },
        { label: "moveFeature", value: featureId },
      );
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

  function updateLayer(layerId: FeatureId, data: ScenarioLayerUpdate, undoable = true) {
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

  function deleteLayer(layerId: FeatureId) {
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

  function addFeature(data: NScenarioFeature, layerId: FeatureId) {
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
    return newFeature.id;
  }

  function deleteFeature(featureId: FeatureId) {
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
    undoable = true,
    isGeometry = false,
  ) {
    if (undoable) {
      update(
        (s) => {
          const layer = s.featureMap[featureId];
          const { properties = {}, geometry, media, style = {}, meta = {} } = data;
          Object.assign(layer.style, style);
          Object.assign(layer.meta, meta);
          layer.properties
            ? Object.assign(layer.properties, properties)
            : (layer.properties = properties);
          Object.assign(layer.geometry, geometry);

          if (media) layer.media = media;
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
    moveMapLayer,
    reorderFeature,
  };
}
