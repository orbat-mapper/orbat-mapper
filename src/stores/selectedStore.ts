import { Ref } from "vue/dist/vue";
import { injectStrict } from "@/utils";
import { selectedFeatureIdsKey, selectedUnitIdsKey } from "@/components/injects";
import { FeatureId } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";

export type SelectedScenarioFeatures = Set<FeatureId>;

export function useSelectedUnits(selectedUnitIdsRef?: Ref<Set<EntityId>>) {
  const selectedUnitIds = selectedUnitIdsRef || injectStrict(selectedUnitIdsKey);

  return {
    selectedUnitIds,
    clear() {
      if (selectedUnitIds.value.size > 0) selectedUnitIds.value.clear();
    },
  };
}

export function useSelectedFeatures(
  selectedFeaturesIdsRef?: Ref<SelectedScenarioFeatures>
) {
  const selectedFeatureIds =
    selectedFeaturesIdsRef || injectStrict(selectedFeatureIdsKey);

  return {
    selectedFeatureIds,
    clear() {
      if (selectedFeatureIds.value.size > 0) selectedFeatureIds.value.clear();
    },
  };
}
