import { NewScenarioStore } from "./newScenarioStore";
import { CurrentState } from "@/types/scenarioModels";
import { NUnit, ScenarioEventUpdate } from "@/types/internalModels";
import dayjs, { ManipulateType } from "dayjs";
import { computed } from "vue";
import turfLength from "@turf/length";
import turfAlong from "@turf/along";
import { lineString } from "@turf/helpers";
import { EntityId } from "@/types/base";
import { klona } from "klona";

export function createInitialState(unit: NUnit): CurrentState | null {
  if (unit.location)
    return {
      t: Number.MIN_SAFE_INTEGER,
      location: unit.location,
      type: "initial",
      sidc: unit.sidc,
    };
  return null;
}

export function useScenarioTime(store: NewScenarioStore) {
  const { state, update } = store;

  function setCurrentTime(timestamp: number) {
    Object.values(state.unitMap).forEach((unit) => {
      if (!unit.state || !unit.state.length) {
        unit._state = createInitialState(unit);
        return;
      }
      let currentState = createInitialState(unit);
      for (const s of unit.state) {
        if (s.t <= timestamp) {
          currentState = { ...currentState, ...s };
        } else {
          if (currentState?.location && s.location) {
            const n = lineString(
              s.via
                ? [currentState.location, ...s.via, s.location]
                : [currentState.location, s.location],
            );
            const timeDiff = s.t - currentState.t;
            const pathLength = turfLength(n);
            const averageSpeed = pathLength / timeDiff;
            const p = turfAlong(n, averageSpeed * (timestamp - currentState.t));
            currentState = {
              ...currentState,
              t: timestamp,
              location: p.geometry.coordinates,
              type: "interpolated",
            };
          }
          break;
        }
      }
      unit._state = currentState;
    });
    Object.values(state.layerMap).forEach((layer) => {
      const visibleFromT = layer.visibleFromT || Number.MIN_SAFE_INTEGER;
      const visibleUntilT = layer.visibleUntilT || Number.MAX_SAFE_INTEGER;
      layer._hidden = timestamp <= visibleFromT || timestamp >= visibleUntilT;
      layer.features.forEach((featureId) => {
        const feature = state.featureMap[featureId];
        const visibleFromT = feature.properties.visibleFromT || Number.MIN_SAFE_INTEGER;
        const visibleUntilT = feature.properties.visibleUntilT || Number.MAX_SAFE_INTEGER;

        if (feature)
          feature._hidden = timestamp <= visibleFromT || timestamp >= visibleUntilT;
      });
    });
    state.currentTime = timestamp;
  }

  function add(amount: number, unit: ManipulateType, normalize = false) {
    const newTime = normalize
      ? dayjs(state.currentTime).add(amount, unit).tz(timeZone.value).hour(12)
      : dayjs(state.currentTime).add(amount, unit);
    setCurrentTime(newTime.valueOf());
  }

  function subtract(amount: number, unit: ManipulateType, normalize = false) {
    const newTime = normalize
      ? dayjs(state.currentTime).subtract(amount, unit).tz(timeZone.value).hour(12)
      : dayjs(state.currentTime).subtract(amount, unit);
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

  function computeTimeHistogram() {
    const histogram: Record<number, number> = {};
    let max = 1;
    Object.values(state.unitMap).forEach((unit) => {
      if (!unit?.state?.length) {
        return;
      }
      for (const s of unit.state) {
        // round to nearest hour
        const t = Math.round(s.t / 3600000) * 3600000;
        if (histogram[t]) {
          histogram[t] += 1;
        } else {
          histogram[t] = 1;
        }
        max = Math.max(max, histogram[t]);
      }
    });
    return {
      histogram: Object.entries(histogram).map(([k, v]) => ({ t: +k, count: v })),
      max,
    };
  }

  function goToNextScenarioEvent() {
    const nextEventId = state.events.find(
      (event) => state.eventMap[event].startTime > state.currentTime,
    );
    const nextEvent = nextEventId && state.eventMap[nextEventId];
    const newTime = nextEvent ? nextEvent.startTime : Number.MAX_SAFE_INTEGER;
    if (newTime < Number.MAX_SAFE_INTEGER) setCurrentTime(newTime);
  }

  function goToPrevScenarioEvent() {
    const prevEventId = state.events
      .slice()
      .reverse()
      .find((event) => state.eventMap[event].startTime < state.currentTime);
    const prevEvent = prevEventId && state.eventMap[prevEventId];
    const newTime = prevEvent ? prevEvent.startTime : Number.MIN_SAFE_INTEGER;
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

  function getEventById(id: EntityId) {
    return state.eventMap[id];
  }

  function updateScenarioEvent(id: EntityId, data: ScenarioEventUpdate) {
    const event = getEventById(id);
    if (!event) return;
    if (event._type === "scenario") {
      update((s) => {
        const e = s.eventMap[id];
        if (!e) return;
        s.eventMap[e.id] = klona(Object.assign(e, { ...data }));
      });
    } else {
      console.warn("Cannot update non-scenario event yet");
    }
  }

  return {
    setCurrentTime,
    add,
    subtract,
    utcTime,
    scenarioTime,
    timeZone,
    jumpToNextEvent,
    jumpToPrevEvent,
    goToNextScenarioEvent,
    goToPrevScenarioEvent,
    getEventById,
    updateScenarioEvent,
    computeTimeHistogram,
  };
}
