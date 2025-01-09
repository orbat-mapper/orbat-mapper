import { defineStore } from "pinia";
import { ref } from "vue";
import { useLocalStorage, useToggle } from "@vueuse/core";
export type ToeEditMode = "assigned" | "onHand";
export type ToeChangeMode = "absolute" | "diff";

export const useToeEditStore = defineStore("toeStore", () => {
  const isToeEditMode = ref(false);
  const toeEditMode = useLocalStorage<ToeEditMode>("toeStoreEditMode", "assigned");
  const toggleEditToeMode = useToggle(isToeEditMode);
  const showAssigned = useLocalStorage("toeStoreShowAssigned", true);
  const showOnHand = useLocalStorage("toeStoreShowOnHand", true);
  const showPercentage = useLocalStorage("toeStoreShowPercentage", true);
  const changeMode = useLocalStorage<ToeChangeMode>("toeStoreChangeMode", "absolute");

  return {
    isToeEditMode,
    toggleEditToeMode,
    toeEditMode,
    showAssigned,
    showOnHand,
    showPercentage,
    changeMode,
  };
});

export const useSuppliesEditStore = defineStore("suppliesStore", () => {
  const isSuppliesEditMode = ref(false);
  const isOnHandMode = useLocalStorage("suppliesStoreIsOnHandMode", false);
  const isDiffMode = useLocalStorage("suppliesStoreIsDiffMode", false);
  const diffValue = ref(1);

  return {
    isSuppliesEditMode,
    isDiffMode,
    isOnHandMode,
    diffValue,
  };
});

export const useEquipmentEditStore = defineStore("equipmentStore", () => {
  const isEditMode = ref(false);
  const isOnHandMode = useLocalStorage("equipmentStoreIsOnHandMode", false);
  const isDiffMode = useLocalStorage("equipmentStoreIsDiffMode", false);
  const showAddForm = useLocalStorage("equipmentStoreShowAddForm", false);
  const diffValue = ref(1);
  const includeSubordinates = useLocalStorage("equipmentStoreIncludeSubordinates", true);

  return {
    isEditMode,
    isDiffMode,
    isOnHandMode,
    diffValue,
    showAddForm,
    includeSubordinates,
  };
});

export const usePersonnelEditStore = defineStore("personnelStore", () => {
  const isEditMode = ref(false);
  const isOnHandMode = useLocalStorage("personnelStoreIsOnHandMode", false);
  const isDiffMode = useLocalStorage("personnelStoreIsDiffMode", false);
  const showAddForm = useLocalStorage("personnelStoreShowAddForm", false);
  const diffValue = ref(1);
  const includeSubordinates = useLocalStorage("personnelStoreIncludeSubordinates", true);

  return {
    isEditMode,
    isDiffMode,
    isOnHandMode,
    diffValue,
    showAddForm,
    includeSubordinates,
  };
});
