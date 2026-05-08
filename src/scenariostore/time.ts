import type { NewScenarioStore } from "./newScenarioStore";
import type { CurrentState, ScenarioEvent } from "@/types/scenarioModels";
import type { NScenarioEvent, ScenarioEventUpdate } from "@/types/internalModels";
import dayjs, { type ManipulateType } from "dayjs";
import { computed } from "vue";
import type { EntityId } from "@/types/base";
import { klona } from "klona";
import { createEventHook } from "@vueuse/core";
import { nanoid } from "@/utils";
import { resolveTimeZone } from "@/utils/militaryTimeZones";
import { projectScenarioToTime } from "@/scenariostore/scenarioProjection";

export type GoToScenarioEventOptions = {
  silent?: boolean;
};

export type GoToScenarioEventEvent = {
  event: NScenarioEvent;
};

export function useScenarioTime(store: NewScenarioStore) {
  const { state, update } = store;

  const goToScenarioEventHook = createEventHook<GoToScenarioEventEvent>();

  function setCurrentTime(timestamp: number) {
    projectScenarioToTime(state, timestamp);
  }

  function add(amount: number, unit: ManipulateType, normalize = false) {
    const newTime = normalize
      ? dayjs(state.currentTime)
          .add(amount, unit)
          .tz(resolveTimeZone(timeZone.value || "UTC"))
          .hour(12)
      : dayjs(state.currentTime).add(amount, unit);
    setCurrentTime(newTime.valueOf());
  }

  function subtract(amount: number, unit: ManipulateType, normalize = false) {
    const newTime = normalize
      ? dayjs(state.currentTime)
          .subtract(amount, unit)
          .tz(resolveTimeZone(timeZone.value || "UTC"))
          .hour(12)
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

    Object.values(state.layerItemMap)
      .filter((f) => f && f.kind === "geometry")
      .forEach((feature) => {
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
    return dayjs(state.currentTime).tz(resolveTimeZone(state.info.timeZone || "UTC"));
  });

  const timeZone = computed(() => {
    return state.info.timeZone;
  });

  function getEventById(id: EntityId) {
    return state.eventMap[id];
  }

  function addScenarioEvent(event: NScenarioEvent | ScenarioEvent) {
    const newEvent = klona(event) as NScenarioEvent;
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
