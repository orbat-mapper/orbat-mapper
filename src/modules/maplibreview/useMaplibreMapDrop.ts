import type { TScenario } from "@/scenariostore";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import { useMapDropTarget } from "@/composables/useMapDropTarget";

export function useMaplibreMapDrop(
  mapAdapter: MapAdapter,
  activeScenario: TScenario,
  onUnitsDropped?: () => void,
) {
  return useMapDropTarget({
    activeScenario,
    mapAdapter,
    onUnitsDropped: () => onUnitsDropped?.(),
  });
}
