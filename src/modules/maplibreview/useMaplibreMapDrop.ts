import type { Position } from "geojson";
import type { CataloguePlacement } from "@/types/draggables";
import type { TScenario } from "@/scenariostore";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import { useMapDropTarget } from "@/composables/useMapDropTarget";

export function useMaplibreMapDrop(
  mapAdapter: MapAdapter,
  activeScenario: TScenario,
  onUnitsDropped?: () => void,
  onControlMeasureDropped?: (placement: CataloguePlacement, position: Position) => void,
) {
  return useMapDropTarget({
    activeScenario,
    mapAdapter,
    onUnitsDropped: () => onUnitsDropped?.(),
    onControlMeasureDropped,
  });
}
