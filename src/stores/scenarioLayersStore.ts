import { defineStore } from "pinia";
import { useScenarioStore } from "./scenarioStore";
import { ScenarioFeature, ScenarioLayer } from "../types/scenarioGeoModels";

export const useScenarioLayersStore = defineStore("scenarioLayers", {
  actions: {
    add(layer: ScenarioLayer) {
      this.layers.push(layer);
    },
    addFeature(feature: ScenarioFeature, layer: ScenarioLayer) {
      layer.features.push(feature);
    },
    getLayerById(id: string) {
      return this.layers.find((l) => l.id === id);
    },
    removeFeature(feature: ScenarioFeature, layer: ScenarioLayer) {
      layer.features = layer.features.filter((l) => l.id !== feature.id);
    },
  },
  getters: {
    layers(state) {
      const scenario = useScenarioStore();
      return scenario.scenario.layers;
    },
  },
});
