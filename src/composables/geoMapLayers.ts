import { ScenarioMapLayer, ScenarioMapLayerType } from "@/types/scenarioGeoModels";
import { computed } from "vue";

export type LayerUpdateOptions = {
  debounce?: boolean;
  undoable?: boolean;
};

const layerTypeLabelMap: Record<ScenarioMapLayerType, string> = {
  XYZLayer: "XYZ layer",
  ImageLayer: "Image layer",
  TileJSONLayer: "TileJSON layer",
};

export function useMapLayerInfo(layer: ScenarioMapLayer) {
  const isInitialized = computed(() => layer._status === "initialized");
  const status = computed(() => layer._status);
  const layerTypeLabel = computed(() => layerTypeLabelMap[layer.type] || layer.type);

  return { isInitialized, status, layerTypeLabel };
}
