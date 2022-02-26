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
      const scenarioStore = useScenarioStore();
      const { parents } = scenarioStore.getUnitHierarchy(state.activeUnit);
      return parents.map((p) => p.id);
    },
  },
  actions: {
    clearActiveUnit() {
      this.activeUnit = null;
    },

    setActiveUnit(unit: Unit) {
      this.activeUnit = unit;
    },

    toggleActiveUnit(unit: Unit) {
      if (this.activeUnit && this.activeUnit.id === unit.id) {
        this.clearActiveUnit();
      } else {
        this.activeUnit = unit;
      }
    },
  },
});
