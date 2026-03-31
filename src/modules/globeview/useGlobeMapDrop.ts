import type { Map as MlMap } from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import { useMapDropTarget } from "@/composables/useMapDropTarget";

export function useGlobeMapDrop(
  mlMap: MlMap,
  activeScenario: TScenario,
  onUnitsDropped?: () => void,
) {
  const container = mlMap.getContainer();

  return useMapDropTarget({
    activeScenario,
    getElement: () => container,
    getPosition: (input) => {
      const rect = container.getBoundingClientRect();
      const lngLat = mlMap.unproject([input.clientX - rect.left, input.clientY - rect.top]);
      return [lngLat.lng, lngLat.lat];
    },
    onUnitsDropped: () => onUnitsDropped?.(),
  });
}
