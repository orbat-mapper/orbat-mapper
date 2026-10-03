import type { NewScenarioStore } from "./newScenarioStore";
import type { CurrentState, ScenarioEvent } from "@/types/scenarioModels";
import type {
  NScenarioEvent,
  NGeometryLayerItem,
  NUnit,
  ScenarioEventUpdate,
} from "@/types/internalModels";
import dayjs, { type ManipulateType } from "dayjs";
import { computed, toRaw } from "vue";
import turfLength from "@turf/length";
import turfAlong from "@turf/along";
import { lineString } from "@turf/helpers";
import type { EntityId } from "@/types/base";
import { klona } from "klona";
import { createEventHook } from "@vueuse/core";
import { invalidateUnitStyle } from "@/geo/unitStyles";
import { nanoid } from "@/utils";
import { resolveTimeZone } from "@/utils/militaryTimeZones";
import { syncTimedHierarchyProjection } from "@/scenariostore/hierarchy";
import {
  applyResourceDiff,
  applyResourceUpdate,
  RESOURCE_KINDS,
} from "@/scenariostore/unitResources";
import {
  computeScenarioLayerItemHidden,
  type CurrentGeometryLayerItemState,
  type CurrentScenarioLayerItemState,
  projectScenarioLayerItemStateAt,
} from "@/types/scenarioLayerItems";
import { isScenarioOverlayLayer } from "@/types/scenarioStackLayers";

export type GoToScenarioEventOptions = {
  silent?: boolean;
};

export type GoToScenarioEventEvent = {
  event: NScenarioEvent;
};

export function createInitialState(unit: NUnit): CurrentState | null {
  if (
    unit.location ||
    unit.reinforcedStatus !== undefined ||
    unit.equipment?.length ||
    unit.personnel?.length ||
    unit.supplies?.length
  )
    return {
      t: Number.MIN_SAFE_INTEGER,
      location: unit.location,
      type: "initial",
      sidc: unit.sidc,
      symbolRotation: 0,
      reinforcedStatus: unit.reinforcedStatus,
      equipment: klona(unit.equipment),
      personnel: klona(unit.personnel),
      supplies: klona(unit.supplies),
    };
  return null;
}

type UnitStateWindow = {
  epoch: string;
  stateEntries: NUnit["state"];
  from: number;
  until: number;
};

type UpdateUnitStateOptions = {
  markMapStylesDirty?: () => void;
  force?: boolean;
  epoch?: string;
};

// The time span over which a unit's `_state` stays the same, so time changes within it
// can keep the current `_state`. Kept outside reactivity, keyed by the raw unit.
const unitStateWindows = new WeakMap<NUnit, UnitStateWindow>();

function canKeepCurrentState(
  rawUnit: NUnit,
  timestamp: number,
  { force, epoch }: { force?: boolean; epoch?: string },
) {
  if (force) return false;
  // Without state entries `_state` only depends on the base unit, so skip the rebuild
  // on time changes. Callers that edit the base unit pass `force` so that changes such
  // as a new base symbol reach `_state`.
  if (!rawUnit.state?.length && rawUnit._state) return true;
  // A window is only recorded after a rebuild, so a matching one also covers units
  // whose `_state` is null because they have no location yet.
  const window = unitStateWindows.get(rawUnit);
  return (
    epoch !== undefined &&
    window?.epoch === epoch &&
    window.stateEntries === rawUnit.state &&
    window.from <= timestamp &&
    timestamp < window.until
  );
}

/**
 * Updates `unit._state` for `timestamp`. Returns whether `_state` was rebuilt.
 *
 * `epoch` identifies the scenario edits seen so far. When it is given and matches the
 * epoch of an earlier rebuild, a timestamp within the same unchanged span keeps the
 * current `_state`.
 */
export function updateCurrentUnitState(
  unit: NUnit,
  timestamp: number,
  options: UpdateUnitStateOptions = {},
): boolean {
  if (canKeepCurrentState(toRaw(unit), timestamp, options)) return false;
  rebuildCurrentUnitState(unit, timestamp, options);
  return true;
}

function rebuildCurrentUnitState(
  unit: NUnit,
  timestamp: number,
  options: UpdateUnitStateOptions,
) {
  // Reads go to the raw unit, which is much faster for a reactive unit. Writes go
  // through `unit`, so that they still trigger.
  const rawUnit = toRaw(unit);
  let from = Number.NEGATIVE_INFINITY;
  let until = Number.POSITIVE_INFINITY;
  let currentState = createInitialState(rawUnit);
  for (const s of rawUnit.state ?? []) {
    if (s.t <= timestamp) {
      from = s.t;
      const { diff, update, ...rest } = s;
      if (update || diff) {
        for (const kind of RESOURCE_KINDS) {
          applyResourceUpdate(currentState?.[kind], update?.[kind], kind);
          applyResourceDiff(currentState?.[kind], diff?.[kind], kind);
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
        // Interpolated states change with every timestamp.
        until = from;
      } else {
        until =
          s.viaStartTime !== undefined && s.viaStartTime > timestamp
            ? Math.min(s.t, s.viaStartTime)
            : s.t;
      }
      break;
    }
  }
  if (
    currentState?.sidc !== rawUnit._state?.sidc ||
    currentState?.symbolRotation !== rawUnit._state?.symbolRotation ||
    currentState?.reinforcedStatus !== rawUnit._state?.reinforcedStatus
  ) {
    if (rawUnit._ikey) {
      invalidateUnitStyle(rawUnit._ikey);
    }
    unit._ikey = undefined;
    invalidateUnitStyle(unit.id);
    options.markMapStylesDirty?.();
  }
  unit._state = currentState;
  if (options.epoch !== undefined && from < until) {
    unitStateWindows.set(rawUnit, {
      epoch: options.epoch,
      stateEntries: rawUnit.state,
      from,
      until,
    });
  } else {
    unitStateWindows.delete(rawUnit);
  }
}

export function useScenarioTime(store: NewScenarioStore) {
  const { state, update } = store;

  const goToScenarioEventHook = createEventHook<GoToScenarioEventEvent>();

  let lastSyncedEpoch: string | undefined;

  // Identifies the scenario edits seen so far, so that `setCurrentTime` can tell
  // whether a unit's `_state` may have gone stale for reasons other than the time.
  function getEditEpoch() {
    const { unitStateCounter, settingsStateCounter } = toRaw(state);
    return `${store.getMutationCount()}:${unitStateCounter}:${settingsStateCounter}`;
  }

  function setCurrentTime(timestamp: number, { force = false } = {}) {
    const epoch = getEditEpoch();
    const options = {
      force,
      epoch,
      markMapStylesDirty: () => {
        state.isMapStylesDirty = true;
      },
    };
    const rebuiltUnits: NUnit[] = [];
    // Check the raw units first: going through the reactive proxy of every unit costs
    // more than the few rebuilds a playback tick needs.
    const rawUnitMap = toRaw(state.unitMap);
    for (const unitId in rawUnitMap) {
      if (canKeepCurrentState(rawUnitMap[unitId], timestamp, options)) continue;
      const unit = state.unitMap[unitId];
      rebuildCurrentUnitState(unit, timestamp, options);
      rebuiltUnits.push(unit);
    }
    // Without edits since the last call, only the rebuilt units can need their symbol
    // synced with their side.
    syncTimedHierarchyProjection(state, timestamp, {
      units: !force && epoch === lastSyncedEpoch ? rebuiltUnits : undefined,
    });
    lastSyncedEpoch = epoch;
    (
      Object.values(state.layerStackMap).filter(
        isScenarioOverlayLayer,
      ) as import("@/types/scenarioStackLayers").NScenarioOverlayLayer[]
    ).forEach((layer) => {
      const visibleFromT = layer.visibleFromT ?? Number.MIN_SAFE_INTEGER;
      const visibleUntilT = layer.visibleUntilT ?? Number.MAX_SAFE_INTEGER;
      const oldHidden = layer._hidden;
      layer._hidden = timestamp <= visibleFromT || timestamp >= visibleUntilT;
      if (oldHidden !== layer._hidden) {
        state.featureStateCounter++;
      }
      // Kind-agnostic: this is the projection that actually fires on a time scrub.
      // It used to bail on anything but geometry, which is why annotation and
      // measurement timed state has never projected under the clock.
      layer.items.forEach((featureId) => {
        const feature = state.layerItemMap[featureId];
        if (!feature) return;
        // Projection first: `_hidden` resolves `isHidden`/`visibleFromT`/
        // `visibleUntilT` through `_state`, so computing it against the pre-scrub
        // projection would ignore any timed patch of them.
        if (feature.state?.length) {
          (feature as { _state?: CurrentScenarioLayerItemState | null })._state =
            projectScenarioLayerItemStateAt(feature, timestamp);
          state.featureStateCounter++;
        }
        const oldHidden = feature._hidden;
        feature._hidden = computeScenarioLayerItemHidden(feature, timestamp);
        if (oldHidden !== feature._hidden) {
          state.featureStateCounter++;
        }
      });
    });
    state.currentTime = timestamp;
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

    // Every layer-item kind carries timed state, so every kind contributes here.
    Object.values(state.layerItemMap).forEach((feature) => {
      ((feature?.state ?? []) as { t: number }[]).forEach((s) => {
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
