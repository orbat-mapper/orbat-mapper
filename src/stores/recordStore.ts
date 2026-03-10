import { ref } from "vue";
import { defineStore } from "pinia";

export const timeRecordStore = defineStore("timeRecordStore", () => {
  const recordHierarchyChanges = ref(false);

  return { recordHierarchyChanges };
});
