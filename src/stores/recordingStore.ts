import { useToggle } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useRecordingStore = defineStore("timeRecordStore", () => {
  const isRecordingHierarchy = ref(false);
  const toggleRecordingHierarchy = useToggle(isRecordingHierarchy);

  const isRecordingGeometry = ref(false);
  const toggleRecordingGeometry = useToggle(isRecordingGeometry);

  const isRecordingLocation = ref(true);
  const toggleRecordingLocation = useToggle(isRecordingLocation);
  return {
    isRecordingHierarchy,
    toggleRecordingHierarchy,
    isRecordingGeometry,
    toggleRecordingGeometry,
    isRecordingLocation,
    toggleRecordingLocation,
  };
});
