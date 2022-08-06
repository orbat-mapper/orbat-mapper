import { defineStore } from "pinia";

import { Unit } from "@/types/scenarioModels";
import { NUnit } from "@/types/internalModels";
import { computed, Ref, ref } from "vue";
import { injectStrict } from "@/utils";
import {
  activeScenarioKey,
  activeUnitKey,
  selectedFeatureIdsKey,
  selectedUnitIdsKey,
} from "@/components/injects";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";
import { FeatureId } from "@/types/scenarioGeoModels";

export type SelectedScenarioFeatures = Set<FeatureId>;

export const useDragStore = defineStore("drag", {
  state: () => ({
    draggedUnit: null as Unit | null,
  }),
});

export function useActiveUnitStore(
  options: Partial<{
    activeScenario: TScenario;
    activeUnitId: Ref<EntityId | undefined | null>;
  }> = {}
) {
  const { unitActions } = options.activeScenario || injectStrict(activeScenarioKey);
  const activeUnitIdRef = options.activeUnitId || injectStrict(activeUnitKey);

  const activeUnit = ref<NUnit | null>(null);

  const activeUnitParentIds = computed(() => {
    if (!activeUnitIdRef.value) return [];
    const { parents } = unitActions.getUnitHierarchy(activeUnitIdRef.value);
    return parents.map((p) => p.id);
  });

  return {
    activeUnit,
    activeUnitParentIds,
    clearActiveUnit() {
      activeUnitIdRef.value = null;
    },

    setActiveUnit(unit: NUnit | Unit) {
      activeUnitIdRef.value = unit.id;
    },

    toggleActiveUnit(unit: NUnit | Unit) {
      if (activeUnitIdRef.value === unit.id) {
        this.clearActiveUnit();
      } else {
        activeUnitIdRef.value = unit.id;
      }
    },
  };
}

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
