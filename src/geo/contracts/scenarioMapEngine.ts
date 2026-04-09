import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { ScenarioLayerController } from "@/geo/contracts/scenarioLayerController";

export interface ScenarioMapEngine {
  map: MapAdapter;
  layers: ScenarioLayerController;
  suspendFeatureSelection(): void;
  resumeFeatureSelection(): void;
}
