import { computed, nextTick, toRaw } from "vue";
import type { Position } from "geojson";
import { storeToRefs } from "pinia";
import { formatDateString } from "@/geo/utils";
import { haveSameItems, injectStrict } from "@/utils";
import { searchActionsKey } from "@/components/injects";
import { useActiveScenario } from "@/composables/scenarioUtils";
import { useMapViewStore } from "@/stores/mapViewStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useTimelineChangesStore } from "@/stores/timelineChangesStore";
import type { EntityId } from "@/types/base";
import type { NScenarioEvent } from "@/types/internalModels";
import { getHistogramBinRange, MS_PER_HOUR } from "@/utils/time";
import { formatChangeDetails } from "./timelineChangeFormat";
import {
  buildChangeIndex,
  findChangeIndex,
  findNextChange,
  findPreviousChange,
  getLayerItemPositions,
  isChangeInView,
  isSameChangeList,
  mergeDepartures,
  queryChangeIndex,
  type ChangeMove,
  type ChangeTarget,
  type TimelineChange,
} from "./timelineChanges";

/** The changes the timeline changes panel shows, in a window around the current time or
 * the time it is centred on. */
export function useTimelineChanges() {
  const { store } = useActiveScenario();
  const { state } = store;
  const mapView = useMapViewStore();
  const { centerT, windowHours, includeMoving, onlyInView } = storeToRefs(
    useTimelineChangesStore(),
  );

  // The raw time, since the zoned `scenarioTime` is converted on every time step.
  const now = computed(() => state.currentTime);

  /** The timeline bin the window is centred on, if any. */
  const binRange = computed(() =>
    centerT.value === null ? null : getHistogramBinRange(centerT.value),
  );

  /** The range the panel lists, which is also the lanes' time axis. */
  const range = computed<[number, number]>(() => {
    const center = centerT.value ?? now.value;
    const half = windowHours.value * MS_PER_HOUR;
    return [center - half, center + half];
  });

  // Changes only move with edits, not with time, so the index is rebuilt when the store
  // revision moves (undo and redo included) or an import bumps the unit state counter.
  // Building from the raw state keeps it from tracking every field it reads.
  const index = computed(() => {
    void store.revision.value;
    void state.unitStateCounter;
    return buildChangeIndex(toRaw(state));
  });

  /** Whether changes pass "Only in map view", or null when it is off. */
  function inViewTest(): ((change: TimelineChange) => boolean) | null {
    const bbox = onlyInView.value ? mapView.viewBbox : null;
    if (!bbox) return null;
    const currentPositions = new Map<EntityId, Position[]>();
    function getCurrentPositions({ entityType, entityId }: TimelineChange) {
      let positions = currentPositions.get(entityId);
      if (!positions) {
        if (entityType === "unit") {
          const location = state.unitMap[entityId]?._state?.location;
          positions = location ? [location] : [];
        } else {
          const item = state.layerItemMap[entityId];
          positions = item ? getLayerItemPositions(item) : [];
        }
        currentPositions.set(entityId, positions);
      }
      return positions;
    }
    return (change) => isChangeInView(change, bbox, getCurrentPositions(change));
  }

  /** Filters to the map view in a separate step, so panning doesn't re-collect. */
  function filterInView(changes: TimelineChange[]) {
    const inView = inViewTest();
    return inView ? changes.filter(inView) : changes;
  }

  /** The time of the first timed state at or after `t`. It only moves when the window
   * crosses a state, so lookups from it don't rerun on every time step. */
  function stateTimeFrom(t: number) {
    const { states } = index.value;
    return states[findChangeIndex(states, t)]?.t ?? Infinity;
  }
  const rangeStartState = computed(() => stateTimeFrom(range.value[0]));
  const rangeEndState = computed(() => stateTimeFrom(range.value[1]));

  /** `accept`, also requiring changes to be in view when that is asked for. */
  function withInView(accept: (change: TimelineChange) => boolean) {
    const inView = inViewTest();
    return inView ? (c: TimelineChange) => inView(c) && accept(c) : accept;
  }

  /** The last change before the range that passes `accept` and the in-view filter. */
  function findBeforeRange(accept: (change: TimelineChange) => boolean) {
    return findPreviousChange(index.value, rangeStartState.value, withInView(accept));
  }

  /** The first change after the range that passes `accept` and the in-view filter. */
  function findAfterRange(accept: (change: TimelineChange) => boolean) {
    return findNextChange(index.value, rangeEndState.value, withInView(accept));
  }

  /** Changes in range, including every leg so the lanes can draw whole trips. */
  const laneChanges = stableComputed(() =>
    filterInView(
      queryChangeIndex(index.value, range.value, {
        includeMoving: includeMoving.value,
        skipArrivals: false,
      }),
    ),
  );

  /** Changes in range for the list. A leg that arrives in range is left out: the arrival
   * is listed. A leg that sets off at a listed change is shown on that change, merged
   * only when the filtered list changes rather than on every time step. */
  const listedChanges = stableComputed(() => {
    const to = range.value[1];
    return laneChanges.value.filter((c) => !c.leg || c.leg.end >= to);
  });
  const changes = computed(() => mergeDepartures(listedChanges.value));

  /** Scenario events in range, oldest first, as the store keeps them. Kept like the
   * changes while the window moves without changing what is in it. */
  const events = computed<NScenarioEvent[]>((previous) => {
    const [from, to] = range.value;
    const next = state.events
      .map((id) => state.eventMap[id])
      .filter((e) => e && e.startTime >= from && e.startTime < to);
    return previous && haveSameItems(previous, next) ? previous : next;
  });

  return {
    now,
    range,
    binRange,
    changes,
    laneChanges,
    events,
    findBeforeRange,
    findAfterRange,
  };
}

/** Keeps the previous list while the time window moves without changing what is in it,
 * so the panel doesn't redo its filtering and rendering on every time step. A kept leg
 * under way keeps the range start it was clamped to when it was listed. */
function stableComputed(getter: () => TimelineChange[]) {
  return computed<TimelineChange[]>((previous) => {
    const next = getter();
    return previous && isSameChangeList(previous, next) ? previous : next;
  });
}

/** The dayjs pattern for times the panel shows with their date. */
export const DATE_TIME_PATTERN = "DD MMM HH:mm";

/** Names and detail notes for changes, resolved against the active scenario. */
export function useTimelineChangeNames() {
  const {
    store: { state },
    time,
  } = useActiveScenario();

  /** Formats a timestamp in the scenario's time zone with a dayjs pattern. */
  function formatTime(t: number, pattern = "HH:mm") {
    return formatDateString(t, time.timeZone.value || "UTC", pattern);
  }

  /** The name of a unit, side group or side, for hierarchy targets. */
  function unitName(id: EntityId) {
    return (
      state.unitMap[id]?.name ??
      state.sideGroupMap[id]?.name ??
      state.sideMap[id]?.name ??
      id
    );
  }

  function entityName(change: ChangeTarget) {
    return change.entityType === "unit"
      ? (state.unitMap[change.entityId]?.name ?? "")
      : (state.layerItemMap[change.entityId]?.name ?? "");
  }

  /** The side a unit belongs to. Map items have none. */
  function sideName(change: ChangeTarget) {
    return change.entityType === "unit"
      ? (state.sideMap[state.unitMap[change.entityId]?._sid]?.name ?? "")
      : "";
  }

  function statusName(id: string) {
    return state.unitStatusMap[id]?.name ?? id;
  }

  function details(change: TimelineChange, pattern?: string) {
    return formatChangeDetails(change, {
      unitName,
      statusName,
      formatTime: (t) => formatTime(t, pattern),
    });
  }

  return { entityName, sideName, details, formatTime };
}

/** Selecting, jumping to and retiming the changes in the panel. */
export function useTimelineChangeActions() {
  const { store, time, unitActions } = useActiveScenario();
  const { onUnitSelectHook, onFeatureSelectHook } = injectStrict(searchActionsKey);
  const { selectedUnitIds, selectedFeatureIds, activeScenarioEventId } =
    useSelectedItems();

  function selectionOf({ entityType }: ChangeTarget) {
    return entityType === "unit" ? selectedUnitIds.value : selectedFeatureIds.value;
  }

  function isSelected(target: ChangeTarget) {
    return selectionOf(target).has(target.entityId);
  }

  /** Adds units and map items to the selection, or toggles them in it. */
  function selectMany(targets: ChangeTarget[], mode: "add" | "toggle") {
    for (const target of targets) {
      const ids = selectionOf(target);
      if (mode === "toggle" && ids.has(target.entityId)) ids.delete(target.entityId);
      else ids.add(target.entityId);
    }
  }

  function select(target: ChangeTarget, { zoom = false } = {}) {
    if (target.entityType === "unit") {
      onUnitSelectHook.trigger({
        unitId: target.entityId,
        options: { noZoom: !zoom, revealInOrbat: false },
      });
    } else {
      onFeatureSelectHook.trigger({
        featureId: target.entityId,
        options: { noZoom: !zoom },
      });
    }
  }

  function jumpTo(change: TimelineChange) {
    time.setCurrentTime(change.t);
  }

  /** Jumps to the change, then selects and zooms once the unit's state has updated. */
  async function goTo(change: TimelineChange) {
    jumpTo(change);
    await nextTick();
    select(change, { zoom: true });
  }

  function canRetime(change: TimelineChange) {
    return change.entityType === "unit" && !unitActions.isUnitLocked(change.entityId);
  }

  function stateIndex(change: TimelineChange) {
    const unit = store.state.unitMap[change.entityId];
    return unit?.state?.findIndex((s) => s.id === change.stateId) ?? -1;
  }

  /** Moves unit states to new times, with the same action as "Change time" in the unit
   * panel, undone as one step. */
  function retime(moves: ChangeMove[]) {
    store.groupUpdate(() => {
      for (const { change, t } of moves) {
        if (!canRetime(change) || change.leg) continue;
        // Looked up for each move, since moving a state re-sorts its unit's states.
        const index = stateIndex(change);
        if (index >= 0) unitActions.updateUnitStateEntry(change.entityId, index, { t });
      }
    });
  }

  /** Moves a leg's start and end by the same time. The leg ends at its arrival state,
   * and starts at that state's `viaStartTime`, or at the state before when there is none
   * or it would be no later. */
  function retimeLeg(change: TimelineChange, delta: number) {
    const leg = change.leg;
    const index = stateIndex(change);
    if (!leg || !canRetime(change) || index < 0) return;
    const start = leg.start + delta;
    unitActions.updateUnitStateEntry(change.entityId, index, {
      t: leg.end + delta,
      viaStartTime: start > leg.earliest ? start : undefined,
    });
  }

  /** Deletes unit states, undone as one step. */
  function deleteStates(changes: TimelineChange[]) {
    store.groupUpdate(() => {
      for (const change of changes) {
        if (canRetime(change) && !change.leg) {
          unitActions.deleteUnitStateEntryByStateId(change.entityId, change.stateId);
        }
      }
    });
  }

  /** Moves the scenario time to an event without the map following it. */
  function jumpToEvent(event: NScenarioEvent) {
    time.goToScenarioEvent(event, { silent: true });
  }

  /** Opens an event's details. */
  function selectEvent(event: NScenarioEvent) {
    activeScenarioEventId.value = event.id;
  }

  /** Goes to an event, as the timeline's event markers do, and opens its details. */
  function goToEvent(event: NScenarioEvent) {
    time.goToScenarioEvent(event);
    selectEvent(event);
  }

  return {
    select,
    selectMany,
    isSelected,
    jumpTo,
    goTo,
    canRetime,
    retime,
    retimeLeg,
    deleteStates,
    jumpToEvent,
    selectEvent,
    goToEvent,
  };
}
