import { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { computed } from "vue";
import { State } from "@/types/scenarioModels";
import {
  FeatureId,
  LayerFeatureItem,
  Position,
  ScenarioLayer,
} from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";
import {
  NScenarioFeature,
  NScenarioLayer,
  ScenarioFeatureUpdate,
  ScenarioLayerUpdate,
} from "@/types/internalModels";
import { klona } from "klona";
import { moveElement, moveItemMutable, nanoid, removeElement } from "@/utils";
import { useScenarioStore } from "@/stores/scenarioStore";

export function useGeo(store: NewScenarioStore) {
  const { state, update } = store;

  const everyVisibleUnit = computed(() => {
    return Object.values(state.unitMap).filter((unit) => unit._state?.location);
  });

  function addUnitPosition(unitId: EntityId, coordinates: Position) {
    let newState: State | null = null;
    update(
      (s) => {
        const u = s.getUnitById(unitId);
        const t = s.currentTime;
        newState = { t, location: coordinates };
        u._state = newState;
        if (!u.state) u.state = [];
        for (let i = 0, len = u.state.length; i < len; i++) {
          if (t < u.state[i].t) {
            u.state.splice(i, 0, newState);
            return;
          } else if (t === u.state[i].t) {
            u.state[i] = newState;
            return;
          }
        }
        u.state.push(newState);
      },
      { label: "addUnitPosition", value: unitId }
    );
    // if (newState) unit._state = newState;
  }

  function addLayer(data: NScenarioLayer) {
    const newLayer = klona({ ...data, _isNew: true });
    if (!newLayer.id) newLayer.id = nanoid();
    newLayer._isNew = true;
    update(
      (s) => {
        s.layers.push(newLayer.id);
        s.layerMap[newLayer.id] = newLayer;
      },
      { label: "addLayer", value: newLayer.id }
    );
    return state.layerMap[newLayer.id];
  }

  function moveLayer(layerId: FeatureId, toIndex: number) {
    const fromIndex = state.layers.indexOf(layerId);
    update(
      (s) => {
        moveItemMutable(s.layers, fromIndex, toIndex);
      },
      { label: "moveLayer", value: layerId }
    );
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

  function updateLayer(layerId: FeatureId, data: ScenarioLayerUpdate, undoable = true) {
    if (undoable) {
      update(
        (s) => {
          const layer = s.layerMap[layerId];
          Object.assign(layer, data);
        },
        { label: "updateLayer", value: layerId }
      );
    } else {
      const layer = state.layerMap[layerId];
      Object.assign(layer, data);
    }
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
      { label: "deleteLayer", value: layerId }
    );
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
      { label: "addFeature", value: newFeature.id }
    );
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
      { label: "deleteFeature", value: featureId }
    );
  }

  function updateFeature(
    featureId: FeatureId,
    data: ScenarioFeatureUpdate,
    undoable = true,
    isGeometry = false
  ) {
    if (undoable) {
      update(
        (s) => {
          const layer = s.featureMap[featureId];
          const { properties = {}, geometry } = data;
          Object.assign(layer.properties, properties);
          Object.assign(layer.geometry, geometry);
        },
        {
          label: isGeometry ? "updateFeatureGeometry" : "updateFeature",
          value: featureId,
        }
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
        const { properties, id } = feature;
        return {
          id,
          type: properties.type,
          name: properties.name || "",
          description: properties.description,
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
    updateLayer,
    deleteLayer,
    getLayerIndex: (id: FeatureId) => state.layers.indexOf(id),
    moveLayer,
    addFeature,
    deleteFeature,
    updateFeature,
    itemsInfo,
    layers,
  };
}
