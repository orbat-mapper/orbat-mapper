import { FeatureId } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";
import { computed, ref, watch } from "vue";

export type SelectedScenarioFeatures = Set<FeatureId>;

const selectedUnitIds = ref<Set<EntityId>>(new Set());
const activeUnitIdRef = ref<EntityId | undefined | null>();
const selectedFeatureIds = ref<SelectedScenarioFeatures>(new Set());
const activeFeatureIdRef = ref<FeatureId | undefined | null>();
const activeMapLayerIdRef = ref<FeatureId | undefined | null>();
const selectedMapLayerIds = ref<SelectedScenarioFeatures>(new Set());

const selectedScenarioEventIds = ref<Set<EntityId>>(new Set());
const activeScenarioEventIdRef = ref<EntityId | undefined | null>(null);
const showScenarioInfo = ref(false);
watch(
  selectedUnitIds.value,
  (v) => {
    if (v.size === 1 && !(activeUnitIdRef.value && v.has(activeUnitIdRef.value)))
      activeUnitIdRef.value = [...selectedUnitIds.value.values()].pop();
    if (v.size === 0) activeUnitIdRef.value = null;
  },
  { deep: true },
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
  { deep: true, flush: "sync" },
);

watch(
  selectedScenarioEventIds,
  (v) => {
    if (
      v.size === 1 &&
      !(activeScenarioEventIdRef.value && v.has(activeScenarioEventIdRef.value))
    )
      activeScenarioEventId.value = [...selectedScenarioEventIds.value.values()].pop();
    if (v.size === 0) activeScenarioEventId.value = null;
  },
  { deep: true },
);

watch(
  selectedMapLayerIds,
  (v) => {
    if (v.size === 1 && !(activeMapLayerIdRef.value && v.has(activeMapLayerIdRef.value)))
      activeMapLayerId.value = [...selectedMapLayerIds.value.values()].pop();
    if (v.size === 0) activeMapLayerId.value = null;
  },
  { deep: true },
);

const activeUnitId = computed({
  get: () => activeUnitIdRef.value,
  set: (v) => {
    activeUnitIdRef.value = v;
    v && clear();
    if (v) selectedUnitIds.value.add(v);
  },
});

const activeFeatureId = computed({
  get: () => activeFeatureIdRef.value,
  set: (v) => {
    activeFeatureIdRef.value = v;
    v && clear();
    if (v) selectedFeatureIds.value.add(v);
  },
});

const activeScenarioEventId = computed({
  get: () => activeScenarioEventIdRef.value,
  set: (v) => {
    activeScenarioEventIdRef.value = v;
    v && clear();
    if (v) selectedScenarioEventIds.value.add(v);
  },
});

const activeMapLayerId = computed({
  get: () => activeMapLayerIdRef.value,
  set: (v) => {
    activeMapLayerIdRef.value = v;
    v && clear();
    if (v) selectedMapLayerIds.value.add(v);
  },
});

function clear() {
  if (selectedUnitIds.value.size > 0) selectedUnitIds.value.clear();
  if (selectedFeatureIds.value.size > 0) selectedFeatureIds.value.clear();
  if (selectedScenarioEventIds.value.size > 0) selectedScenarioEventIds.value.clear();
  if (selectedMapLayerIds.value.size > 0) selectedMapLayerIds.value.clear();
  showScenarioInfo.value = false;
}

export function useSelectedItems() {
  return {
    selectedUnitIds,
    activeUnitId,
    selectedFeatureIds,
    activeFeatureId,
    activeScenarioEventId,
    selectedScenarioEventIds,
    selectedMapLayerIds,
    activeMapLayerId,
    showScenarioInfo,
    clear,
  };
}
