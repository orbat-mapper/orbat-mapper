import type { FeatureId } from "@/types/scenarioGeoModels";

export interface ObstacleHighlightState {
  active: boolean;
  layerIds: ReadonlySet<FeatureId>;
  featureIds: ReadonlySet<FeatureId>;
}

export const EMPTY_OBSTACLE_HIGHLIGHT: ObstacleHighlightState = {
  active: false,
  layerIds: new Set(),
  featureIds: new Set(),
};

export function isObstacleHighlighted(
  state: ObstacleHighlightState,
  featureId: FeatureId,
  layerId: FeatureId,
): boolean {
  if (!state.active) return false;
  return state.featureIds.has(featureId) || state.layerIds.has(layerId);
}
