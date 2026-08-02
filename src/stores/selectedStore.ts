import type { FeatureId } from "@/types/scenarioGeoModels";
import type { EntityId } from "@/types/base";
import { computed, ref, shallowRef, watch } from "vue";
import { type DetailsPanel } from "@/modules/scenarioeditor/types";
import type { ReferenceFeatureSelection } from "@/types/referenceFeature";

export type SelectedScenarioFeatures = Set<FeatureId>;

const selectedUnitIds = ref<Set<EntityId>>(new Set());
const activeUnitIdRef = ref<EntityId | undefined | null>();
const orbatRevealUnitId = ref<EntityId | null>(null);
const selectedFeatureIds = ref<SelectedScenarioFeatures>(new Set());
const activeFeatureIdRef = ref<FeatureId | undefined | null>();
const activeMapLayerIdRef = ref<FeatureId | undefined | null>();
const selectedMapLayerIds = ref<SelectedScenarioFeatures>(new Set());
const activeReferenceFeatureRef = ref<ReferenceFeatureSelection | null>(null);

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

const activeReferenceFeature = computed({
  get: () => activeReferenceFeatureRef.value,
  set: (v: ReferenceFeatureSelection | null) => {
    if (v) clear();
    activeReferenceFeatureRef.value = v;
  },
});

function clear() {
  if (selectedUnitIds.value.size > 0) selectedUnitIds.value.clear();
  if (selectedFeatureIds.value.size > 0) selectedFeatureIds.value.clear();
  if (selectedScenarioEventIds.value.size > 0) selectedScenarioEventIds.value.clear();
  if (selectedMapLayerIds.value.size > 0) selectedMapLayerIds.value.clear();
  activeReferenceFeatureRef.value = null;
  orbatRevealUnitId.value = null;
  showScenarioInfo.value = false;
}

/**
 * "Is this selected id a control measure?"
 *
 * Control measures share the one flat `selectedFeatureIds` set with plain geometry
 * items — deliberately, since selection has only ever needed the id — but the details
 * panel has to tell the two apart. This module is a bare singleton with no scenario
 * access (it imports nothing but types), so it cannot look the kind up itself; the
 * scenario owner registers the lookup instead, exactly once, for the scenario's life.
 *
 * Unregistered — which is every non-scenario context and every test that does not opt
 * in — the panel behaves as it did before control measures existed.
 */
export type TacticalGraphicPredicate = (id: FeatureId) => boolean;

const isTacticalGraphicId = shallowRef<TacticalGraphicPredicate | null>(null);

/** Register the lookup. Returns an idempotent unregister. */
export function setTacticalGraphicPredicate(predicate: TacticalGraphicPredicate) {
  isTacticalGraphicId.value = predicate;
  return () => {
    if (isTacticalGraphicId.value === predicate) isTacticalGraphicId.value = null;
  };
}

const activeDetailsPanel = computed((): DetailsPanel | null | undefined => {
  if (selectedFeatureIds.value.size) {
    // Only when *every* selected id is a control measure. A mixed selection falls
    // through to the feature panel, which hides the sections that cannot describe a
    // control measure rather than splitting the selection across two panels.
    const isTacticalGraphic = isTacticalGraphicId.value;
    if (isTacticalGraphic && [...selectedFeatureIds.value].every(isTacticalGraphic)) {
      return "tacticalGraphic";
    }
    return "feature";
  }
  if (activeUnitId.value || selectedUnitIds.value.size) {
    return "unit";
  }

  if (activeScenarioEventId.value) {
    return "event";
  }
  if (activeReferenceFeature.value) {
    return "referenceFeature";
  }
  if (activeMapLayerId.value) {
    return "mapLayer";
  }
  if (showScenarioInfo.value) {
    return "scenario";
  }
  return;
});

export function useSelectedItems() {
  return {
    selectedUnitIds,
    activeUnitId,
    orbatRevealUnitId,
    selectedFeatureIds,
    activeFeatureId,
    activeScenarioEventId,
    selectedScenarioEventIds,
    selectedMapLayerIds,
    activeMapLayerId,
    activeReferenceFeature,
    showScenarioInfo,
    activeDetailsPanel,
    clear,
  };
}
