import { useToggle } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export type RecordingMix = {
  hierarchy: boolean;
  geometry: boolean;
  location: boolean;
};

export const DEFAULT_RECORDING_MIX: RecordingMix = {
  hierarchy: false,
  geometry: false,
  location: true,
};

export const useRecordingStore = defineStore("recordingStore", () => {
  const isRecordingHierarchy = ref(DEFAULT_RECORDING_MIX.hierarchy);
  const toggleRecordingHierarchy = useToggle(isRecordingHierarchy);

  const isRecordingGeometry = ref(DEFAULT_RECORDING_MIX.geometry);
  const toggleRecordingGeometry = useToggle(isRecordingGeometry);

  const isRecordingLocation = ref(DEFAULT_RECORDING_MIX.location);
  const toggleRecordingLocation = useToggle(isRecordingLocation);

  const getRecordingMix = (): RecordingMix => ({
    hierarchy: isRecordingHierarchy.value,
    geometry: isRecordingGeometry.value,
    location: isRecordingLocation.value,
  });

  const applyRecordingMix = (mix: RecordingMix) => {
    isRecordingHierarchy.value = mix.hierarchy;
    isRecordingGeometry.value = mix.geometry;
    isRecordingLocation.value = mix.location;
  };

  const stopAllRecording = () => {
    applyRecordingMix({
      hierarchy: false,
      geometry: false,
      location: false,
    });
  };

  return {
    applyRecordingMix,
    getRecordingMix,
    isRecordingHierarchy,
    toggleRecordingHierarchy,
    isRecordingGeometry,
    toggleRecordingGeometry,
    isRecordingLocation,
    toggleRecordingLocation,
    stopAllRecording,
  };
});
