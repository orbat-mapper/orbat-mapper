import { NewScenarioStore } from "./newScenarioStore";
import { State } from "@/types/scenarioModels";
import { NUnit } from "@/types/internalModels";
import dayjs, { ManipulateType } from "dayjs";
import { computed } from "vue";
import turfLength from "@turf/length";
import turfAlong from "@turf/along";
import { lineString } from "@turf/helpers";
export function createInitialState(unit: NUnit): State | null {
  if (unit.location) return { t: Number.MIN_SAFE_INTEGER, location: unit.location };
  return null;
}

export function useScenarioTime(store: NewScenarioStore) {
  const { state } = store;

  function setCurrentTime(timestamp: number) {
    Object.values(state.unitMap).forEach((unit) => {
      if (!unit.state || !unit.state.length) {
        unit._state = createInitialState(unit);
        return;
      }
      let currentState = createInitialState(unit);
      for (const s of unit.state) {
        if (s.t <= timestamp) {
          currentState = s;
        } else {
          if (currentState?.location && s.location) {
            const n = lineString(
              s.via
                ? [currentState.location, ...s.via, s.location]
                : [currentState.location, s.location]
            );
            const timeDiff = s.t - currentState.t;
            const pathLength = turfLength(n);
            const averageSpeed = pathLength / timeDiff;
            const p = turfAlong(n, averageSpeed * (timestamp - currentState.t));
            currentState = { t: timestamp, location: p.geometry.coordinates };
          }
          break;
        }
      }
      unit._state = currentState;
    });
    state.currentTime = timestamp;
  }

  function add(amount: number, unit: ManipulateType) {
    const newTime = dayjs(state.currentTime).add(amount, unit);
    setCurrentTime(newTime.valueOf());
  }

  function subtract(amount: number, unit: ManipulateType) {
    const newTime = dayjs(state.currentTime).subtract(amount, unit);
    setCurrentTime(newTime.valueOf());
  }

  function jumpToNextEvent() {
    let newTime = Number.MAX_SAFE_INTEGER;
    Object.values(state.unitMap).forEach((unit) => {
      if (!unit?.state?.length) {
        return;
      }
      for (const s of unit.state) {
        if (s.t > state.currentTime) {
          if (s.t < newTime) newTime = s.t;
          break;
        }
      }
    });
    if (newTime < Number.MAX_SAFE_INTEGER) setCurrentTime(newTime);
  }

  function jumpToPrevEvent() {
    let newTime = Number.MIN_SAFE_INTEGER;
    Object.values(state.unitMap).forEach((unit) => {
      if (!unit?.state?.length) {
        return;
      }
      for (const s of unit.state) {
        if (s.t < state.currentTime) {
          if (s.t > newTime) newTime = s.t;
          break;
        }
      }
    });
    if (newTime > Number.MIN_SAFE_INTEGER) setCurrentTime(newTime);
  }

  const utcTime = computed(() => {
    return dayjs.utc(state.currentTime);
  });

  const scenarioTime = computed(() => {
    const zone = state.info.timeZone || "UTC";
    return dayjs(state.currentTime).tz(zone);
  });

  const timeZone = computed(() => {
    const zone = state.info.timeZone;
    return zone;
  });

  return {
    setCurrentTime,
    add,
    subtract,
    utcTime,
    scenarioTime,
    timeZone,
    jumpToNextEvent,
    jumpToPrevEvent,
  };
}
