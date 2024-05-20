import { defineStore } from "pinia";
import { ref } from "vue";
import { useToggle } from "@vueuse/core";

export const usePlaybackStore = defineStore("playbackStore", () => {
  const playbackSpeed = ref(1000 * 60 * 30);

  const startMarker = ref<number>();
  const endMarker = ref<number>();

  const [playbackRunning, togglePlayback] = useToggle(false);
  const [playbackLooping, toggleLooping] = useToggle(false);

  function increaseSpeed() {
    playbackSpeed.value *= 2;
  }

  function decreaseSpeed() {
    playbackSpeed.value /= 2;
  }

  function addMarker(marker: number) {
    if (startMarker.value === undefined) {
      startMarker.value = marker;
    } else if (endMarker.value === undefined) {
      endMarker.value = marker;
    } else {
      if (marker < endMarker.value) {
        startMarker.value = marker;
      } else {
        endMarker.value = marker;
      }
    }
  }

  function clearMarkers() {
    startMarker.value = undefined;
    endMarker.value = undefined;
  }

  return {
    playbackSpeed,
    playbackRunning,
    togglePlayback,
    increaseSpeed,
    decreaseSpeed,
    startMarker,
    endMarker,
    addMarker,
    playbackLooping,
    toggleLooping,
    clearMarkers,
  };
});
