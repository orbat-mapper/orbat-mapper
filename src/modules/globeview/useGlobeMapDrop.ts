import type { TScenario } from "@/scenariostore";
import type { MapAdapter } from "@/geo/mapAdapter";
import { useMapDropTarget } from "@/composables/useMapDropTarget";

export function useGlobeMapDrop(
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
