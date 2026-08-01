import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { ScenarioLayerController } from "@/geo/contracts/scenarioLayerController";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";

export interface ScenarioMapEngine {
  map: MapAdapter;
  layers: ScenarioLayerController;
  /**
   * The tactical-draw seam, present only on engines that have one. MapLibre is the
   * only such engine; the OpenLayers engine leaves this undefined.
   */
  draw?: TacticalDrawSurface;
  suspendFeatureSelection(): void;
  resumeFeatureSelection(): void;
}
