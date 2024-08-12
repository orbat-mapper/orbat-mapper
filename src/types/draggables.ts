import { NScenarioFeature } from "@/types/internalModels";

const privateKey = Symbol("scenarioFeature");

export type ScenarioFeatureDragItem = {
  [privateKey]: boolean;
  feature: NScenarioFeature;
};

export type ScenarioFeatureDropItem = {
  [privateKey]: boolean;
  feature: NScenarioFeature;
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
