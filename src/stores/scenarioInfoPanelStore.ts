import { defineStore } from "pinia";
import { ref } from "vue";
import { useToggle } from "@vueuse/core";

export const useScenarioInfoPanelStore = defineStore("scenarioInfoPanel", () => {
  const tabIndex = ref(0);
  const showAddEquipment = ref(false);
  const toggleAddEquipment = useToggle(showAddEquipment);

  const showAddPersonnel = ref(false);
  const toggleAddPersonnel = useToggle(showAddPersonnel);
  const showAddGroup = ref(false);
  const toggleAddGroup = useToggle(showAddGroup);

  return {
    tabIndex,
    showAddEquipment,
    toggleAddEquipment,
    showAddPersonnel,
    toggleAddPersonnel,
    showAddGroup,
    toggleAddGroup,
  };
});
