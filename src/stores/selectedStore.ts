import { Ref } from "vue/dist/vue";
import { injectStrict } from "@/utils";
import { selectedFeatureIdsKey, selectedUnitIdsKey } from "@/components/injects";
import { FeatureId } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";

export type SelectedScenarioFeatures = Set<FeatureId>;
export interface SelectedItemsOptions {
  selectedUnitIdsRef?: Ref<Set<EntityId>>;
  selectedFeaturesIdsRef?: Ref<SelectedScenarioFeatures>;
}

export function useSelectedItems(options: SelectedItemsOptions = {}) {
  const selectedUnitIds = options.selectedUnitIdsRef ?? injectStrict(selectedUnitIdsKey);
  const selectedFeatureIds =
    options.selectedFeaturesIdsRef ?? injectStrict(selectedFeatureIdsKey);

  return {
    selectedUnitIds,
    selectedFeatureIds,
    clear() {
      if (selectedUnitIds.value.size > 0) selectedUnitIds.value.clear();
      if (selectedFeatureIds.value.size > 0) selectedFeatureIds.value.clear();
    },
  };
}
