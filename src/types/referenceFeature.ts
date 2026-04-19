import type { FeatureId } from "@/types/scenarioGeoModels";

export interface ReferenceFeatureSelection {
  layerId?: FeatureId;
  layerName: string;
  featureId?: FeatureId;
  name?: string;
  properties: Record<string, unknown>;
}
