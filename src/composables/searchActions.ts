import { injectStrict } from "@/utils";
import { searchActionsKey } from "@/components/injects";

export function useSearchActions() {
  const { onUnitSelectHook, onFeatureSelectHook, onLayerSelectHook } =
    injectStrict(searchActionsKey);
  return {
    onUnitSelect: onUnitSelectHook.on,
    onFeatureSelect: onFeatureSelectHook.on,
    onLayerSelect: onLayerSelectHook.on,
  };
}
