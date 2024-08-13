import { NScenarioFeature, NScenarioLayer } from "@/types/internalModels";

const privateKey = Symbol("scenarioFeature");
const _scnFeatureLayerKey = Symbol("scenarioFeatureLayer");

export type ScenarioFeatureDragItem = {
  [privateKey]: boolean;
  feature: NScenarioFeature;
};

export type ScenarioFeatureLayerDragItem = {
  [_scnFeatureLayerKey]: boolean;
  layer: NScenarioLayer;
};

export function getScenarioFeatureDragItem(
  data: Omit<ScenarioFeatureDragItem, typeof privateKey>,
): ScenarioFeatureDragItem {
  return {
    [privateKey]: true,
    ...data,
  };
}

export function isScenarioFeatureDragItem(
  data: Record<string | symbol, unknown>,
): data is ScenarioFeatureDragItem {
  return Boolean(data[privateKey]);
}

export function getScenarioFeatureLayerDragItem(
  data: Omit<ScenarioFeatureLayerDragItem, typeof _scnFeatureLayerKey>,
): ScenarioFeatureLayerDragItem {
  return {
    [_scnFeatureLayerKey]: true,
    ...data,
  };
}

export function isScenarioFeatureLayerDragItem(
  data: Record<string | symbol, unknown>,
): data is ScenarioFeatureLayerDragItem {
  return Boolean(data[_scnFeatureLayerKey]);
}
