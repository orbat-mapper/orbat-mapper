import { injectStrict } from "@/utils";
import { searchActionsKey } from "@/components/injects";

export function useSearchActions() {
  const {
    onUnitSelectHook,
    onFeatureSelectHook,
    onLayerSelectHook,
    onImageLayerSelectHook,
    onEventSelectHook,
    onPlaceSelectHook,
    onScenarioActionHook,
  } = injectStrict(searchActionsKey);
  return {
    onUnitSelect: onUnitSelectHook.on,
    onFeatureSelect: onFeatureSelectHook.on,
    onLayerSelect: onLayerSelectHook.on,
    onImageLayerSelect: onImageLayerSelectHook.on,
    onEventSelect: onEventSelectHook.on,
    onPlaceSelect: onPlaceSelectHook.on,
    onScenarioAction: onScenarioActionHook.on,
  };
}
