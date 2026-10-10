import { defineStore } from "pinia";
import { ref } from "vue";

export const useScenarioInfoPanelStore = defineStore("scenarioInfoPanel", () => {
  const tabIndex = ref(0);
  const showAddEquipment = ref(false);

  const showAddPersonnel = ref(false);
  const showAddGroup = ref(false);
  const showAddSupplies = ref(false);

  return {
    tabIndex,
    showAddEquipment,
    showAddPersonnel,
    showAddGroup,
    showAddSupplies,
  };
});
