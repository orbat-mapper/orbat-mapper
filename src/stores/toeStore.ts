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
  const suppliesEditMode = useLocalStorage<ToeEditMode>("toeStoreEditMode", "assigned");
  const toggleEditSuppliesMode = useToggle(isSuppliesEditMode);
  const isOnHandMode = useLocalStorage("suppliesStoreIsOnHandMode", false);
  const isDiffMode = useLocalStorage("suppliesStoreIsDiffMode", false);
  const showAssigned = useLocalStorage("suppliesStoreShowAssigned", true);
  const showOnHand = useLocalStorage("suppliesStoreShowOnHand", true);
  const showPercentage = useLocalStorage("suppliesStoreShowPercentage", true);
  const showClass = useLocalStorage("suppliesStoreShowClass", true);
  const changeMode = useLocalStorage<ToeChangeMode>(
    "suppliesStoreChangeMode",
    "absolute",
  );
  const showUom = useLocalStorage("suppliesStoreShowUom", true);
  const diffValue = ref(1);

  return {
    isSuppliesEditMode,
    toggleEditSuppliesMode,
    suppliesEditMode,
    showAssigned,
    showOnHand,
    showPercentage,
    changeMode,
    showClass,
    showUom,
    isDiffMode,
    isOnHandMode,
    diffValue,
  };
});
