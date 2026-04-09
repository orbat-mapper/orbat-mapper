import type { Position } from "geojson";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { ScenarioMapLayerUpdate } from "@/types/internalModels";
import type { TScenario } from "@/scenariostore";

export interface ScenarioLayerCapabilities {
  zoomToFeature: boolean;
  zoomToFeatureSet: boolean;
  panToFeature: boolean;
  zoomToScenarioLayer: boolean;
  zoomToMapLayer: boolean;
  featureTransform: boolean;
  mapLayerTransform: boolean;
  mapLayerExtent: boolean;
}

export type ScenarioLayerControllerEvent =
  | {
      type: "scenario-layer-visibility-changed";
      layerId: FeatureId;
      isHidden: boolean;
    }
  | {
      type: "map-layer-transform";
      layerId: FeatureId;
      rotation: number;
      center: Position;
      scale: number[];
      active: boolean;
    }
  | {
      type: "map-layer-updated";
      layerId: FeatureId;
      data: ScenarioMapLayerUpdate;
    };

export interface RefreshScenarioFeatureLayersOptions {
  doClearCache?: boolean;
  filterVisible?: boolean;
}

export interface ScenarioLayerController {
  capabilities: ScenarioLayerCapabilities;
  bindScenario(activeScenario: TScenario): () => void;
  refreshScenarioFeatureLayers(options?: RefreshScenarioFeatureLayersOptions): void;
  zoomToFeature(featureId: FeatureId): void;
  zoomToFeatures(featureIds: FeatureId[]): void;
  panToFeature(featureId: FeatureId): void;
  zoomToScenarioLayer(layerId: FeatureId): void;
  zoomToMapLayer(layerId: FeatureId): void;
  startMapLayerTransform(layerId: FeatureId): void;
  endMapLayerTransform(): void;
  onLayerEvent(handler: (event: ScenarioLayerControllerEvent) => void): () => void;
}
