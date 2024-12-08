import { defineStore } from "pinia";
import { ref } from "vue";
import { useToggle } from "@vueuse/core";
export type ToeEditMode = "assigned" | "onHand";

export const useToeEditStore = defineStore("toeStore", () => {
  const isToeEditMode = ref(false);
  const toeEditMode = ref<ToeEditMode>("assigned");
  const toggleEditToeMode = useToggle(isToeEditMode);

  return {
    isToeEditMode,
    toggleEditToeMode,
    toeEditMode,
  };
});
