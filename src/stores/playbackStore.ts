import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToggle } from "@vueuse/core";
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from "@/utils/time";

const MS_PER_SECOND = 1000;

// A frame longer than this, such as the first one after a hidden tab, advances
// playback only this far, so the scenario does not jump ahead.
const MAX_PLAYBACK_FRAME_MS = 250;

/** The scenario time a playback frame of `frameMs` real milliseconds advances. */
export function getPlaybackStep(speed: number, frameMs: number) {
  return (speed * Math.min(frameMs, MAX_PLAYBACK_FRAME_MS)) / MS_PER_SECOND;
}

// Unit size, the speed from which it is used, and its label. Days start at two, so
// the default speed reads "30 h/s" rather than "1.25 d/s".
const SPEED_UNITS: [number, number, string][] = [
  [MS_PER_DAY, 2 * MS_PER_DAY, "d"],
  [MS_PER_HOUR, MS_PER_HOUR, "h"],
  [MS_PER_MINUTE, MS_PER_MINUTE, "min"],
  [MS_PER_SECOND, 0, "s"],
];

/** A playback speed as scenario time per real second, such as "30 h/s". */
export function formatPlaybackSpeed(speed: number) {
  const [size, , unit] = SPEED_UNITS.find(([, from]) => speed >= from)!;
  return `${Number((speed / size).toPrecision(3))} ${unit}/s`;
}

export const usePlaybackStore = defineStore("playbackStore", () => {
  // Scenario milliseconds per real second.
  const playbackSpeed = ref(30 * MS_PER_HOUR);

  const startMarker = ref<number>();
  const endMarker = ref<number>();

  const [playbackRunning, togglePlayback] = useToggle(false);
  const [playbackLooping, toggleLooping] = useToggle(false);
  // True while the user drags the timeline.
  const timeScrubbing = ref(false);
  // True while the time changes continuously, by playback or by scrubbing.
  const timeAnimating = computed(() => playbackRunning.value || timeScrubbing.value);

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
    timeScrubbing,
    timeAnimating,
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
