import { FeatureId } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";
import { computed, ref, watch } from "vue";

export type SelectedScenarioFeatures = Set<FeatureId>;

const selectedUnitIds = ref<Set<EntityId>>(new Set());
const activeUnitIdRef = ref<EntityId | undefined | null>();
const selectedFeatureIds = ref<SelectedScenarioFeatures>(new Set());
const activeFeatureIdRef = ref<FeatureId | undefined | null>();

watch(
  selectedUnitIds.value,
  (v) => {
    if (v.size === 1 && !(activeUnitIdRef.value && v.has(activeUnitIdRef.value)))
      activeUnitIdRef.value = [...selectedUnitIds.value.values()].pop();
    if (v.size === 0) activeUnitIdRef.value = null;
  },
  { deep: true }
);

watch(
  selectedFeatureIds,
  (v) => {
    if (v) {
      if (v.size === 1 && !(activeFeatureIdRef.value && v.has(activeFeatureIdRef.value)))
        activeFeatureIdRef.value = [...selectedFeatureIds.value.values()].pop();
      if (v.size === 0) activeFeatureIdRef.value = null;
    }
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

const activeFeatureId = computed({
  get: () => activeFeatureIdRef.value,
  set: (v) => {
    activeFeatureIdRef.value = v;
    selectedFeatureIds.value.clear();
    if (v) selectedFeatureIds.value.add(v);
  },
});

export function useSelectedItems() {
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
