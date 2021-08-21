import { toRaw, toRef } from "vue";
import { defineStore } from "pinia";

import { Unit } from "../types/models";
import { useScenarioStore } from "./scenarioStore";

export const useDragStore = defineStore("drag", {
  state: () => ({
    draggedUnit: null as Unit | null,
  }),
});

export const useActiveUnitStore = defineStore("activeUnit", {
  state: () => ({
    activeUnit: null as Unit | null,
  }),
  getters: {
    activeUnitParents(state) {
      if (!state.activeUnit) return [];
      const { unitMap } = useScenarioStore();
      const parents: Unit[] = [];

      function helper(u: Unit) {
        const pid = u._pid;
        const parent = pid && unitMap.get(pid);
        if (parent) {
          parents.push(parent);
          helper(parent);
        }
      }

      helper(state.activeUnit);

      return parents.reverse().map((p) => p.id);
    },
  },
  actions: {
    clearActiveUnit() {
      this.activeUnit = null;
    },

    setActiveUnit(unit: Unit) {
      this.activeUnit = unit;
    },
  },
});
