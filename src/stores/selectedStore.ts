import { Ref } from "vue/dist/vue";
import { injectStrict } from "@/utils";
import { selectedFeatureIdsKey } from "@/components/injects";
import { FeatureId } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";
import { computed, ref, watch } from "vue";

export type SelectedScenarioFeatures = Set<FeatureId>;
export interface SelectedItemsOptions {
  selectedFeaturesIdsRef?: Ref<SelectedScenarioFeatures>;
  activeUnitIdRef?: Ref<EntityId | undefined>;
}

const selectedUnitIds = ref<Set<EntityId>>(new Set());
const activeUnitIdRef = ref<EntityId | undefined | null>();

watch(
  () => selectedUnitIds.value,
  (v) => {
    if (v.size === 1 && !(activeUnitIdRef.value && v.has(activeUnitIdRef.value)))
      activeUnitIdRef.value = [...selectedUnitIds.value.values()].pop();
    if (v.size === 0) activeUnitIdRef.value = null;
  },
  { deep: true }
);

const activeUnitId = computed({
  get: () => activeUnitIdRef.value,
  set: (v) => {
    activeUnitIdRef.value = v;
    selectedUnitIds.value.clear();
    if (v) selectedUnitIds.value.add(v);
  },
});

export function useSelectedItems(options: SelectedItemsOptions = {}) {
  const selectedFeatureIds =
    options.selectedFeaturesIdsRef ?? injectStrict(selectedFeatureIdsKey);

  const activeFeatureId = computed((): FeatureId | undefined => {
    return selectedFeatureIds.value.values().next().value;
  });

  return {
    selectedUnitIds,
    activeUnitId,
    selectedFeatureIds,
    activeFeatureId,
    clear() {
      if (selectedUnitIds.value.size > 0) selectedUnitIds.value.clear();
      if (selectedFeatureIds.value.size > 0) selectedFeatureIds.value.clear();
    },
  };
}
