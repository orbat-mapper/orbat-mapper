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
