import { defineStore } from "pinia";
import { useScenarioStore } from "./scenarioStore";
import { ScenarioFeature, ScenarioLayer } from "../types/scenarioGeoModels";
import { moveItemMutable } from "../utils";

export const useScenarioLayersStore = defineStore("scenarioLayers", {
  actions: {
    add(layer: ScenarioLayer) {
      this.layers.push(layer);
    },
    addFeature(feature: ScenarioFeature, layer: ScenarioLayer) {
      layer.features.push(feature);
    },
    getLayerById(id: string | number) {
      return this.layers.find((l) => l.id === id);
    },

    removeFeature(feature: ScenarioFeature, layer: ScenarioLayer) {
      layer.features = layer.features.filter((l) => l.id !== feature.id);
    },

    getFeatureById(id: string | number, layer?: ScenarioLayer) {
      if (layer) {
        const feature = layer.features.find((e) => e.id === id);
        return feature && { feature, layer };
      }

      for (let index = 0, ii = this.layers.length; index < ii; ++index) {
        const layer = this.layers[index];
        const feature = layer.features.find((e) => e.id === id);
        if (feature) {
          return { feature, layer };
        }
      }
    },

    updateFeature(
      featureId: string | number,
      data: Partial<ScenarioFeature>,
      layer: ScenarioLayer
    ) {
      const featuresCopy = [...layer.features];
      const idx = featuresCopy.findIndex((e) => e.id === featureId);
      if (idx < 0) return;
      let existingFeature = featuresCopy[idx];
      Object.assign(existingFeature, data);
      layer.features = featuresCopy;
    },

    updateLayer(layer: ScenarioLayer, data: Partial<ScenarioLayer>) {
      const l = this.getLayerById(layer.id);
      if (!l) return;
      Object.assign(l, { ...data });
    },
    removeLayer(layer: ScenarioLayer) {
      const scenario = useScenarioStore();
      scenario.scenario.layers = this.layers.filter((l) => l.id !== layer.id);
    },

    moveLayer(layer: ScenarioLayer, toIndex: number) {
      const fromIndex = this.layers.indexOf(layer);
      const scenario = useScenarioStore();

      scenario.scenario.layers = moveItemMutable(
        [...scenario.scenario.layers],
        fromIndex,
        toIndex
      );
    },

    getLayerIndex(layer: ScenarioLayer) {
      return this.layers.indexOf(layer);
    },
  },
  getters: {
    layers(state) {
      const scenario = useScenarioStore();
      return scenario.scenario.layers;
    },
  },
});
