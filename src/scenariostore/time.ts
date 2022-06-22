import { NewScenarioStore } from "./newScenarioStore";
import { State } from "../types/scenarioModels";
import { NUnit } from "../types/internalModels";
import dayjs, { ManipulateType } from "dayjs";
import { computed } from "vue";

function createInitialState(unit: NUnit): State | null {
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
      let tmpstate = createInitialState(unit);
      for (const s of unit.state) {
        if (s.t <= timestamp) {
          tmpstate = s;
        } else {
          break;
        }
      }
      unit._state = tmpstate;
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
    console.warn("Not implemented yet");
  }

  function jumpToPrevEvent() {
    console.warn("Not implemented yet");
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
