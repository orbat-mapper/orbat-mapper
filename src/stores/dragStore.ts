import { defineStore } from "pinia";

import { Unit } from "@/types/scenarioModels";
import { NUnit } from "@/types/internalModels";
import { computed } from "vue";
import { injectStrict } from "@/utils";
import { activeParentKey, activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";

export const useDragStore = defineStore("drag", {
  state: () => ({
    draggedUnit: null as Unit | null,
    draggedFiles: null as File[] | null,
  }),
});

export function useActiveUnitStore() {
  const { unitActions, store } = injectStrict(activeScenarioKey);
  const { activeUnitId } = useSelectedItems();
  const activeParentId = injectStrict(activeParentKey);

  const activeUnit = computed(
    () => (activeUnitId.value && store.state.getUnitById(activeUnitId.value)) || null,
  );

  const activeParent = computed(
    () =>
      (activeParentId.value && unitActions.getUnitOrSideGroup(activeParentId.value)) ||
      null,
  );

  const activeUnitParentIds = computed(() => {
    if (!activeUnitId.value) return [];
    const { parents } = unitActions.getUnitHierarchy(activeUnitId.value);
    return parents.map((p) => p.id);
  });

  function resetActiveParent() {
    const firstSideId = store.state.sides[0];
    const firstGroup = store.state.getSideById(firstSideId)?.groups[0];
    activeParentId.value = store.state.getSideGroupById(firstGroup)?.subUnits[0];
  }

  return {
    activeUnitId,
    activeUnit,
    activeParent,
    activeParentId,
    resetActiveParent,
    activeUnitParentIds,
    clearActiveUnit() {
      activeUnitId.value = null;
    },

    setActiveUnit(unit: NUnit | Unit) {
      activeUnitId.value = unit.id;
    },

    toggleActiveUnit(unit: NUnit | Unit) {
      if (activeUnitId.value === unit.id) {
        this.clearActiveUnit();
      } else {
        activeUnitId.value = unit.id;
      }
    },
  };
}
