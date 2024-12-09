import { defineStore } from "pinia";
import { ref } from "vue";
import { useLocalStorage, useToggle } from "@vueuse/core";
export type ToeEditMode = "assigned" | "onHand";

export const useToeEditStore = defineStore("toeStore", () => {
  const isToeEditMode = ref(false);
  const toeEditMode = ref<ToeEditMode>("assigned");
  const toggleEditToeMode = useToggle(isToeEditMode);
  const showAssigned = useLocalStorage("toeStoreShowAssigned", true);
  const showOnHand = useLocalStorage("toeStoreShowOnHand", true);
  const showPercentage = useLocalStorage("toeStoreShowPercentage", true);

  return {
    isToeEditMode,
    toggleEditToeMode,
    toeEditMode,
    showAssigned,
    showOnHand,
    showPercentage,
  };
});
