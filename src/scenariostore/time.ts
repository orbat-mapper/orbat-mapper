import { NewScenarioStore } from "./newScenarioStore";
import { CurrentState, ScenarioEvent } from "@/types/scenarioModels";
import {
  NScenarioEvent,
  NScenarioFeature,
  NUnit,
  ScenarioEventUpdate,
} from "@/types/internalModels";
import dayjs, { ManipulateType } from "dayjs";
import { computed } from "vue";
import turfLength from "@turf/length";
import turfAlong from "@turf/along";
import { lineString } from "@turf/helpers";
import { EntityId } from "@/types/base";
import { klona } from "klona";
import { createEventHook } from "@vueuse/core";
import { invalidateUnitStyle } from "@/geo/unitStyles";
import { CurrentScenarioFeatureState } from "@/types/scenarioGeoModels";
import { nanoid } from "@/utils";

export type GoToScenarioEventOptions = {
  silent?: boolean;
};

export type GoToScenarioEventEvent = {
  event: NScenarioEvent;
};

export function createInitialState(unit: NUnit): CurrentState | null {
  if (unit.location || unit.equipment?.length || unit.personnel?.length)
    return {
      t: Number.MIN_SAFE_INTEGER,
      location: unit.location,
      type: "initial",
      sidc: unit.sidc,
      equipment: klona(unit.equipment),
      personnel: klona(unit.personnel),
    };
  return null;
}

export function updateCurrentUnitState(unit: NUnit, timestamp: number) {
  if (!unit.state || !unit.state.length) {
    unit._state = createInitialState(unit);
    return;
  }
  let currentState = createInitialState(unit);
  for (const s of unit.state) {
    if (s.t <= timestamp) {
      const { diff, update, ...rest } = s;
      if (update?.equipment && currentState?.equipment) {
        for (const e of update.equipment) {
          const idx = currentState.equipment.findIndex((ee) => ee.id === e.id);
          if (idx !== -1) {
            currentState.equipment[idx] = { ...currentState.equipment[idx], ...e };
          } else {
            console.warn("Equipment not found", e);
          }
        }
      }
      if (update?.personnel && currentState?.personnel) {
        for (const p of update.personnel) {
          const idx = currentState.personnel.findIndex((pp) => pp.id === p.id);
          if (idx !== -1) {
            currentState.personnel[idx] = { ...currentState.personnel[idx], ...p };
          } else {
            console.warn("Personnel not found", p);
          }
        }
      }
      if (diff?.equipment && currentState?.equipment) {
        for (const e of diff.equipment) {
          const idx = currentState.equipment.findIndex((ee) => ee.id === e.id);
          if (idx !== -1) {
            const eq = currentState.equipment[idx];
            const onHand = (eq?.onHand ?? eq.count) + (e.onHand ?? 0);
            currentState.equipment[idx] = { ...currentState.equipment[idx], onHand };
          } else {
            console.warn("Equipment not found", e);
          }
        }
      }
      if (diff?.personnel && currentState?.personnel) {
        for (const p of diff.personnel) {
          const idx = currentState.personnel.findIndex((pp) => pp.id === p.id);
          if (idx !== -1) {
            const pe = currentState.personnel[idx];
            const onHand = (pe?.onHand ?? pe.count) + (p.onHand ?? 0);
            currentState.personnel[idx] = { ...currentState.personnel[idx], onHand };
          } else {
            console.warn("Personnel not found", p);
          }
        }
      }
      currentState = { ...currentState, ...rest };
    } else {
      if (
        currentState?.location &&
        s.location &&
        !(s.interpolate === false) &&
        (s.viaStartTime ?? -Infinity) <= timestamp
      ) {
        if (s.viaStartTime) {
          console.log("yo");
        }
        const n = lineString(
          s.via
            ? [currentState.location, ...s.via, s.location]
            : [currentState.location, s.location],
        );
        const timeDiff = s.t - (s.viaStartTime ?? currentState.t);
        const pathLength = turfLength(n);
        const averageSpeed = pathLength / timeDiff;
        const p = turfAlong(
          n,
          averageSpeed * (timestamp - (s.viaStartTime ?? currentState.t)),
        );
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
  if (currentState?.sidc !== unit._state?.sidc) {
    invalidateUnitStyle(unit.id);
  }
  unit._state = currentState;
}

function createInitialFeatureState(
  feature: NScenarioFeature,
): CurrentScenarioFeatureState | null {
  return {
    t: Number.MIN_SAFE_INTEGER,
    geometry: feature.geometry,
  };
}

export function useScenarioTime(store: NewScenarioStore) {
  const { state, update } = store;

  const goToScenarioEventHook = createEventHook<GoToScenarioEventEvent>();

  function setCurrentTime(timestamp: number) {
    Object.values(state.unitMap).forEach((unit) =>
      updateCurrentUnitState(unit, timestamp),
    );
    Object.values(state.layerMap).forEach((layer) => {
      const visibleFromT = layer.visibleFromT || Number.MIN_SAFE_INTEGER;
      const visibleUntilT = layer.visibleUntilT || Number.MAX_SAFE_INTEGER;
      layer._hidden = timestamp <= visibleFromT || timestamp >= visibleUntilT;
      layer.features.forEach((featureId) => {
        const feature = state.featureMap[featureId];
        const visibleFromT = feature.meta.visibleFromT || Number.MIN_SAFE_INTEGER;
        const visibleUntilT = feature.meta.visibleUntilT || Number.MAX_SAFE_INTEGER;
        if (!feature) return;
        feature._hidden = timestamp <= visibleFromT || timestamp >= visibleUntilT;
        if (feature.state?.length) {
          let currentState = createInitialFeatureState(feature);
          for (const s of feature.state) {
            if (s.t <= timestamp) {
              currentState = { ...currentState, ...s };
            } else {
              break;
            }
          }
          feature._state = currentState;
        }
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
      (unit?.state || []).forEach((s) => {
        // round to nearest hour
        const t = Math.round(s.t / 3600000) * 3600000;
        histogram[t] = (histogram[t] || 0) + 1;
        max = Math.max(max, histogram[t]);
      });
    });

    Object.values(state.featureMap).forEach((feature) => {
      (feature?.state || []).forEach((s) => {
        // round to nearest hour
        const t = Math.round(s.t / 3600000) * 3600000;
        histogram[t] = (histogram[t] || 0) + 1;
        max = Math.max(max, histogram[t]);
      });
    });

    return {
      histogram: Object.entries(histogram).map(([k, v]) => ({ t: +k, count: v })),
      max,
    };
  }

  function goToNextScenarioEvent(options: GoToScenarioEventOptions = {}) {
    const nextEventId = state.events.find(
      (event) => state.eventMap[event].startTime > state.currentTime,
    );
    const nextEvent = nextEventId && state.eventMap[nextEventId];
    const newTime = nextEvent ? nextEvent.startTime : Number.MAX_SAFE_INTEGER;
    if (newTime < Number.MAX_SAFE_INTEGER) goToScenarioEvent(nextEvent!, options);
  }

  function goToPrevScenarioEvent(options: GoToScenarioEventOptions = {}) {
    const prevEventId = state.events
      .slice()
      .reverse()
      .find((event) => state.eventMap[event].startTime < state.currentTime);
    const prevEvent = prevEventId && state.eventMap[prevEventId];
    const newTime = prevEvent ? prevEvent.startTime : Number.MIN_SAFE_INTEGER;
    if (newTime > Number.MIN_SAFE_INTEGER) goToScenarioEvent(prevEvent!, options);
  }

  function goToScenarioEvent(
    eventOrEventId: EntityId | NScenarioEvent,
    options: GoToScenarioEventOptions = {},
  ) {
    const event =
      typeof eventOrEventId === "string"
        ? state.eventMap[eventOrEventId]
        : eventOrEventId;
    if (event) {
      setCurrentTime(event.startTime);
      if (!options.silent) {
        goToScenarioEventHook.trigger({ event }).then();
      }
    }
  }
  const utcTime = computed(() => {
    return dayjs.utc(state.currentTime);
  });

  const scenarioTime = computed(() => {
    return dayjs(state.currentTime).tz(state.info.timeZone || "UTC");
  });

  const timeZone = computed(() => {
    return state.info.timeZone;
  });

  function getEventById(id: EntityId) {
    return state.eventMap[id];
  }

  function addScenarioEvent(event: NScenarioEvent | ScenarioEvent) {
    let newEvent = klona(event) as NScenarioEvent;
    if (!newEvent.id) newEvent.id = nanoid();
    if (!newEvent._type) newEvent._type = "scenario";
    update((s) => {
      s.events.push(newEvent.id);
      s.eventMap[newEvent.id] = newEvent;
      s.events.sort((a, b) => s.eventMap[a].startTime - s.eventMap[b].startTime);
    });
    return newEvent.id;
  }

  function deleteScenarioEvent(id: EntityId) {
    update((s) => {
      s.events = s.events.filter((e) => e !== id);
      delete s.eventMap[id];
    });
  }

  function updateScenarioEvent(id: EntityId, data: ScenarioEventUpdate) {
    const event = getEventById(id);
    if (!event) return;
    if (event._type === "scenario") {
      update((s) => {
        const e = s.eventMap[id];
        if (!e) return;
        s.eventMap[e.id] = klona(Object.assign(e, { ...data }));
        if ("startTime" in data) {
          s.events.sort((a, b) => s.eventMap[a].startTime - s.eventMap[b].startTime);
        }
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
    goToScenarioEvent,
    goToNextScenarioEvent,
    goToPrevScenarioEvent,
    getEventById,
    addScenarioEvent,
    updateScenarioEvent,
    deleteScenarioEvent,
    computeTimeHistogram,
    onGoToScenarioEventEvent: goToScenarioEventHook.on,
  };
}
