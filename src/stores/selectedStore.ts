import { FeatureId } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";
import { computed, ref, watch } from "vue";

export type SelectedScenarioFeatures = Set<FeatureId>;

const selectedUnitIds = ref<Set<EntityId>>(new Set());
const activeUnitIdRef = ref<EntityId | undefined | null>();
const selectedFeatureIds = ref<SelectedScenarioFeatures>(new Set());
const activeFeatureIdRef = ref<FeatureId | undefined | null>();
const activeImageLayerIdRef = ref<FeatureId | undefined | null>();
const selectedImageLayerIds = ref<SelectedScenarioFeatures>(new Set());

const selectedScenarioEventIds = ref<Set<EntityId>>(new Set());
const activeScenarioEventIdRef = ref<EntityId | undefined | null>(null);

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
  { deep: true, flush: "sync" }
);

watch(selectedScenarioEventIds, (v) => {
  if (
    v.size === 1 &&
    !(activeScenarioEventIdRef.value && v.has(activeScenarioEventIdRef.value))
  )
    activeScenarioEventId.value = [...selectedScenarioEventIds.value.values()].pop();
  if (v.size === 0) activeScenarioEventId.value = null;
});

watch(
  selectedImageLayerIds,
  (v) => {
    if (
      v.size === 1 &&
      !(activeImageLayerIdRef.value && v.has(activeImageLayerIdRef.value))
    )
      activeImageLayerId.value = [...selectedImageLayerIds.value.values()].pop();
    if (v.size === 0) activeImageLayerId.value = null;
  },
  { deep: true }
);

const activeUnitId = computed({
  get: () => activeUnitIdRef.value,
  set: (v) => {
    activeUnitIdRef.value = v;
    clear();
    if (v) selectedUnitIds.value.add(v);
  },
});

const activeFeatureId = computed({
  get: () => activeFeatureIdRef.value,
  set: (v) => {
    activeFeatureIdRef.value = v;
    clear();
    if (v) selectedFeatureIds.value.add(v);
  },
});

const activeScenarioEventId = computed({
  get: () => activeScenarioEventIdRef.value,
  set: (v) => {
    activeScenarioEventIdRef.value = v;
    clear();
    if (v) selectedScenarioEventIds.value.add(v);
  },
});

const activeImageLayerId = computed({
  get: () => activeImageLayerIdRef.value,
  set: (v) => {
    activeImageLayerIdRef.value = v;
    clear();
    if (v) selectedImageLayerIds.value.add(v);
  },
});

function clear() {
  if (selectedUnitIds.value.size > 0) selectedUnitIds.value.clear();
  if (selectedFeatureIds.value.size > 0) selectedFeatureIds.value.clear();
  if (selectedScenarioEventIds.value.size > 0) selectedScenarioEventIds.value.clear();
  if (selectedImageLayerIds.value.size > 0) selectedImageLayerIds.value.clear();
}

export function useSelectedItems() {
  return {
    selectedUnitIds,
    activeUnitId,
    selectedFeatureIds,
    activeFeatureId,
    activeScenarioEventId,
    selectedScenarioEventIds,
    selectedImageLayerIds,
    activeImageLayerId,
    clear,
  };
}
