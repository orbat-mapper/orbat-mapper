import { defineStore } from "pinia";

import { Unit } from "@/types/scenarioModels";
import { NUnit } from "@/types/internalModels";
import { computed, Ref, ref } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";

export const useDragStore = defineStore("drag", {
  state: () => ({
    draggedUnit: null as Unit | null,
  }),
});

export function useActiveUnitStore2({
  activeScenario,
  activeUnitId,
}: { activeScenario?: TScenario; activeUnitId?: Ref<EntityId | undefined | null> } = {}) {
  const { unitActions } = activeScenario || injectStrict(activeScenarioKey);
  const activeUnitIdRef = activeUnitId || injectStrict(activeUnitKey);

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
