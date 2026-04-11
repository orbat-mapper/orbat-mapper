import { nextTick } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeScenarioMapEngineKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import type { FeatureId } from "@/types/scenarioGeoModels";

interface ApplyScenarioFeatureSelectionOptions {
  featureIds: FeatureId[];
  primaryFeatureId?: FeatureId;
  layerId?: FeatureId;
  noZoom?: boolean;
}

export function useScenarioFeatureSelection() {
  const engineRef = injectStrict(activeScenarioMapEngineKey);
  const activeScenario = injectStrict(activeScenarioKey);
  const { selectedUnitIds, selectedFeatureIds } = useSelectedItems();

  function applyScenarioFeatureSelection({
    featureIds,
    primaryFeatureId,
    layerId,
    noZoom = false,
  }: ApplyScenarioFeatureSelectionOptions) {
    const resolvedPrimaryFeatureId =
      primaryFeatureId !== undefined ? primaryFeatureId : featureIds[0];

    const resolvedLayerId =
      layerId ??
      (resolvedPrimaryFeatureId
        ? activeScenario.geo.getGeometryLayerItemById(resolvedPrimaryFeatureId).layer?.id
        : undefined);
    const layer =
      resolvedLayerId !== undefined
        ? activeScenario.geo.getLayerById(resolvedLayerId)
        : undefined;
    if (layer) {
      layer._isOpen = true;
    }

    if (featureIds.length > 0 && selectedUnitIds.value.size > 0) {
      selectedUnitIds.value.clear();
    }

    selectedFeatureIds.value.clear();
    featureIds.forEach((id) => selectedFeatureIds.value.add(id));

    if (resolvedPrimaryFeatureId && !noZoom) {
      nextTick(() => engineRef.value?.layers.zoomToFeature(resolvedPrimaryFeatureId));
    }
  }

  return {
    applyScenarioFeatureSelection,
  };
}
