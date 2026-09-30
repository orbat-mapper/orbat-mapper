import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { ScenarioLayerController } from "@/geo/contracts/scenarioLayerController";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";

export interface ScenarioMapEngine {
  map: MapAdapter;
  layers: ScenarioLayerController;
  /**
   * The tactical-draw surface, available once initialized.
   */
  draw?: TacticalDrawSurface;
  suspendFeatureSelection(): void;
  resumeFeatureSelection(): void;
}
