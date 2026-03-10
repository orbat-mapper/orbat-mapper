import { useToggle } from "@vueuse/core";
import { defineStore } from "pinia";

export const timeRecordStore = defineStore("timeRecordStore", () => {
  const [recordHierarchyChanges, toggleRecordHierarchyChanges] = useToggle(false);
  const [recordFeatureGeometry, toggleRecordFeatureGeometry] = useToggle(false);

  return {
    recordHierarchyChanges,
    toggleRecordHierarchyChanges,
    recordFeatureGeometry,
    toggleRecordFeatureGeometry,
  };
});
