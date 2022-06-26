import { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { computed } from "vue";
import { State, Unit } from "@/types/scenarioModels";
import { FeatureId, Position } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";
import { NScenarioLayer, ScenarioLayerUpdate } from "@/types/internalModels";
import { klona } from "klona";
import { nanoid } from "@/utils";

export function useGeo(store: NewScenarioStore) {
  const { state, update } = store;

  const everyVisibleUnit = computed(() => {
    return Object.values(state.unitMap).filter((unit) => unit._state?.location);
  });

  function addUnitPosition(unitId: EntityId, coordinates: Position) {
    let newState: State | null = null;
    update((s) => {
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
    });
    // if (newState) unit._state = newState;
  }

  function addLayer(data: NScenarioLayer) {
    const newLayer = klona({ ...data, _isNew: true });
    if (!newLayer.id) newLayer.id = nanoid();
    newLayer._isNew = true;
    update((s) => {
      s.layers.push(newLayer.id);
      s.layerMap[newLayer.id] = newLayer;
    });
    return state.layerMap[newLayer.id];
  }

  const layers = computed(() => {
    return state.layers
      .map((layerId) => state.layerMap[layerId])
      .map((layer) => ({
        ...layer,
        features: layer.features.map((featureId) => state.featureMap[featureId]),
      }));
  });

  function updateLayer(layerId: FeatureId, data: ScenarioLayerUpdate) {
    update((s) => {
      const layer = s.layerMap[layerId];
      Object.assign(layer, data);
    });
  }

  return {
    everyVisibleUnit,
    addUnitPosition,
    addLayer,
    getLayerById: (id: FeatureId) => state.layerMap[id],
    getFeatureById: (id: FeatureId) => {
      const feature = state.featureMap[id];
      return { feature, layer: state.layerMap[feature._pid] };
    },
    updateLayer,
    layers,
  };
}
