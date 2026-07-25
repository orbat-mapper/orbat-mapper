import type { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import type { NState, NUnit } from "@/types/internalModels";
import { mergeArray, nanoid } from "@/utils";
import { klona } from "klona";
import type { EntityId, HistoryAction } from "@/types/base";
import { createInitialState, updateCurrentUnitState } from "@/scenariostore/time";
import type { State, StateAdd } from "@/types/scenarioModels";
import { type Position } from "@/types/scenarioGeoModels";
import {
  refreshHierarchyTimelineMetadata,
  syncTimedHierarchyProjection,
} from "@/scenariostore/hierarchy";
import {
  canConvertViaPointToWaypoint as canConvertViaPoint,
  canConvertWaypointToViaPoint as canConvertWaypoint,
  computeViaPointTime,
  findFollowingLocationState,
  findPrecedingTrackPoint,
  getUnitSpeedMps,
} from "@/scenariostore/unitTrackConversions";

export function removeUnusedUnitStateEntries(unit: NUnit) {
  if (!unit || !unit.state) return;
  const usedEquipmentIds = new Set(unit.equipment?.map((e) => e.id) ?? []);
  const usedPersonnelIds = new Set(unit.personnel?.map((e) => e.id) ?? []);
  const usedSupplyIds = new Set(unit.supplies?.map((e) => e.id) ?? []);

  const filteredState = unit.state.map((state) => {
    const update = state.update;
    const diff = state.diff;
    if (update) {
      update.equipment = update.equipment?.filter((e) => usedEquipmentIds.has(e.id));
      if (update.equipment?.length === 0) delete update.equipment;
      update.personnel = update.personnel?.filter((e) => usedPersonnelIds.has(e.id));
      if (update.personnel?.length === 0) delete update.personnel;
      update.supplies = update.supplies?.filter((e) => usedSupplyIds.has(e.id));
      if (update.supplies?.length === 0) delete update.supplies;
      if (!update.equipment && !update.personnel && !update.supplies) {
        delete state.update;
      }
    }

    if (diff) {
      diff.equipment = diff.equipment?.filter((e) => usedEquipmentIds.has(e.id));
      if (diff.equipment?.length === 0) delete diff.equipment;
      diff.personnel = diff.personnel?.filter((e) => usedPersonnelIds.has(e.id));
      if (diff.personnel?.length === 0) delete diff.personnel;
      diff.supplies = diff.supplies?.filter((e) => usedSupplyIds.has(e.id));
      if (diff.supplies?.length === 0) delete diff.supplies;
      if (!diff.equipment && !diff.personnel && !diff.supplies) {
        delete state.diff;
      }
    }
    return state;
  });

  return filteredState.filter(isNotEmptyState);
}

function isNotEmptyState(state: NState) {
  return (
    state.update ||
    state.diff ||
    state.location ||
    state.sidc ||
    state.symbolRotation !== undefined ||
    state.symbolOptions ||
    state.textAmplifiers ||
    state.status ||
    state.reinforcedStatus ||
    state.hierarchy
  );
}

export function useUnitStateManipulations(store: NewScenarioStore) {
  const { state, update } = store;

  function updateUnitState(unitId: EntityId) {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    const timestamp = state.currentTime;
    updateCurrentUnitState(unit, timestamp);
    syncTimedHierarchyProjection(state, timestamp);
    state.unitStateCounter++;
  }

  function clearUnitState(unitId: EntityId) {
    update(
      (s) => {
        const _unit = s.unitMap[unitId];
        if (!_unit) return;
        _unit.state = [];
        _unit._state = createInitialState(_unit);
        refreshHierarchyTimelineMetadata(s);
      },
      { label: "clearUnitState", value: unitId },
    );
    updateUnitState(unitId);
  }

  function deleteUnitStateEntryByStateId(unitId: EntityId, stateId: EntityId) {
    update((s) => {
      const _unit = s.unitMap[unitId];
      if (!_unit) return;
      const index = _unit.state?.findIndex((s) => s.id === stateId) ?? -1;
      if (index >= 0) _unit.state?.splice(index, 1);
      refreshHierarchyTimelineMetadata(s);
    });

    updateUnitState(unitId);
  }

  function addUnitStateEntry(unitId: EntityId, state: StateAdd, merge = false) {
    update(
      (s) => {
        const u = s.unitMap[unitId];

        const newState = klona(state);
        newState.id = nanoid();
        if (!u.state) u.state = [];
        const t = state.t;
        for (let i = 0, len = u.state.length; i < len; i++) {
          if (t <= u.state[i].t) {
            if (merge && u.state[i].t === t) {
              const { id, t, update, diff, ...rest } = newState;
              Object.assign(u.state[i], rest);
              if (update) {
                const source = u.state[i]?.update || {};
                const dest = {
                  equipment:
                    source.equipment || update.equipment
                      ? mergeArray(source.equipment ?? [], update.equipment ?? [], "id")
                      : undefined,
                  personnel:
                    source.personnel || update.personnel
                      ? mergeArray(source.personnel ?? [], update.personnel ?? [], "id")
                      : undefined,
                  supplies:
                    source.supplies || update.supplies
                      ? mergeArray(source.supplies ?? [], update.supplies ?? [], "id")
                      : undefined,
                };
                Object.assign(u.state[i], { update: dest });
              }
              if (diff) {
                const source = u.state[i]?.diff || {};
                const dest = {
                  equipment:
                    source.equipment || diff.equipment
                      ? mergeArray(source.equipment ?? [], diff.equipment ?? [], "id")
                      : undefined,
                  personnel:
                    source.personnel || diff.personnel
                      ? mergeArray(source.personnel ?? [], diff.personnel ?? [], "id")
                      : undefined,
                  supplies:
                    source.supplies || diff.supplies
                      ? mergeArray(source.supplies ?? [], diff.supplies ?? [], "id")
                      : undefined,
                };
                Object.assign(u.state[i], { diff: dest });
              }
            } else {
              u.state.splice(i, 0, newState as NState);
            }

            refreshHierarchyTimelineMetadata(s);
            return;
          }
        }
        u.state.push(newState as NState);
        refreshHierarchyTimelineMetadata(s);
      },
      { label: "addUnitPosition", value: unitId },
    );
    updateUnitState(unitId);
  }

  function deleteUnitStateEntry(unitId: EntityId, index: number) {
    update((s) => {
      const _unit = s.unitMap[unitId];
      if (!_unit) return;
      _unit.state?.splice(index, 1);
      refreshHierarchyTimelineMetadata(s);
    });

    updateUnitState(unitId);
  }

  function updateUnitStateEntry(unitId: EntityId, index: number, data: Partial<State>) {
    update((s) => {
      const unit = s.unitMap[unitId];
      if (!unit?.state) return;
      Object.assign(unit.state[index], data);
      unit.state.sort(({ t: a }, { t: b }) => (a < b ? -1 : a > b ? 1 : 0));
      refreshHierarchyTimelineMetadata(s);
    });
    state.unitStateCounter++;

    updateUnitState(unitId);
  }

  function setUnitState(unitId: EntityId, state: NState[]) {
    update((s) => {
      const unit = s.unitMap[unitId];
      if (!unit) return;
      unit.state = state;
      refreshHierarchyTimelineMetadata(s);
    });
    updateUnitState(unitId);
  }

  function updateUnitStateVia(
    unitId: EntityId,
    action: HistoryAction,
    stateIndex: number,
    elementIndex: number,
    data: Position,
  ) {
    update(
      (s) => {
        const unit = s.unitMap[unitId];
        if (!unit || !unit.state) return;
        const stateElement = unit.state[stateIndex];
        if (!stateElement) return;
        if (!stateElement.via) stateElement.via = [];
        if (action === "add") {
          stateElement.via.splice(elementIndex, 0, data);
        } else if (action === "modify") {
          stateElement.via[elementIndex] = data;
        } else if (action === "remove") {
          stateElement.via.splice(elementIndex, 1);
        }
      },
      { label: "addUnitPosition", value: unitId },
    );
  }

  /** True when the via point can be turned into a waypoint of its own. */
  function canConvertViaPointToWaypoint(
    unitId: EntityId,
    stateIndex: number,
    viaIndex: number,
  ) {
    const unit = state.unitMap[unitId];
    return !!unit && canConvertViaPoint(unit, stateIndex, viaIndex);
  }

  /** True when the waypoint can be turned into a via point on the merged leg. */
  function canConvertWaypointToViaPoint(unitId: EntityId, stateIndex: number) {
    const unit = state.unitMap[unitId];
    return !!unit && canConvertWaypoint(unit, stateIndex);
  }

  /**
   * Turns a via point into a waypoint of its own. The new waypoint is timed
   * from the average speed of the leg it sits on, so the unit keeps following
   * the same path at the same pace.
   */
  function convertViaPointToWaypoint(
    unitId: EntityId,
    stateIndex: number,
    viaIndex: number,
  ) {
    const unit = state.unitMap[unitId];
    if (!unit || !canConvertViaPoint(unit, stateIndex, viaIndex)) return;
    const stateEntry = unit.state![stateIndex]!;
    const prev = findPrecedingTrackPoint(unit, stateIndex)!;
    const t = computeViaPointTime(prev, stateEntry, viaIndex, getUnitSpeedMps(unit));

    const newEntry: NState = {
      id: nanoid(),
      t,
      location: klona(stateEntry.via![viaIndex]!),
    };
    const leadingVia = klona(stateEntry.via!.slice(0, viaIndex));
    if (leadingVia.length) newEntry.via = leadingVia;
    // The first half of the split leg keeps the original start time.
    if (stateEntry.viaStartTime !== undefined) {
      newEntry.viaStartTime = stateEntry.viaStartTime;
    }

    update(
      (s) => {
        const u = s.unitMap[unitId];
        const entry = u?.state?.[stateIndex];
        if (!u?.state || !entry) return;
        const trailingVia = entry.via?.slice(viaIndex + 1) ?? [];
        if (trailingVia.length) {
          entry.via = trailingVia;
        } else {
          delete entry.via;
        }
        // The second half now starts at the new waypoint.
        delete entry.viaStartTime;
        // Rounding can place the new time before entries without a location,
        // so walk back to where it keeps the state list sorted.
        let insertIndex = stateIndex;
        while (insertIndex > 0 && u.state[insertIndex - 1]!.t > t) insertIndex--;
        u.state.splice(insertIndex, 0, newEntry);
        refreshHierarchyTimelineMetadata(s);
      },
      { label: "addUnitPosition", value: unitId },
    );
    updateUnitState(unitId);
  }

  /**
   * Turns a waypoint into a via point by merging the legs on either side of it.
   * The waypoint's own timestamp is dropped, so the unit passes the point
   * wherever the merged leg's average speed puts it.
   */
  function convertWaypointToViaPoint(unitId: EntityId, stateIndex: number) {
    const unit = state.unitMap[unitId];
    if (!unit || !canConvertWaypoint(unit, stateIndex)) return;
    const stateEntry = unit.state![stateIndex]!;
    const following = findFollowingLocationState(unit, stateIndex)!;
    const mergedVia = klona([
      ...(stateEntry.via ?? []),
      stateEntry.location!,
      ...(following.state.via ?? []),
    ]);
    const viaStartTime = stateEntry.viaStartTime;

    update(
      (s) => {
        const u = s.unitMap[unitId];
        const entry = u?.state?.[stateIndex];
        const followingEntry = u?.state?.[following.index];
        if (!u?.state || !entry || !followingEntry) return;
        followingEntry.via = mergedVia;
        // The merged leg starts where the removed waypoint's leg did.
        if (viaStartTime !== undefined) {
          followingEntry.viaStartTime = viaStartTime;
        } else {
          delete followingEntry.viaStartTime;
        }
        delete entry.location;
        delete entry.via;
        delete entry.viaStartTime;
        // Keep the entry around if it still carries something other than the
        // position it just gave up.
        if (!isNotEmptyState(entry) && !entry.title && !entry.description) {
          u.state.splice(stateIndex, 1);
        }
        refreshHierarchyTimelineMetadata(s);
      },
      { label: "addUnitPosition", value: unitId },
    );
    updateUnitState(unitId);
  }

  return {
    clearUnitState,
    updateUnitState,
    deleteUnitStateEntryByStateId,
    addUnitStateEntry,
    deleteUnitStateEntry,
    updateUnitStateEntry,
    setUnitState,
    updateUnitStateVia,
    canConvertViaPointToWaypoint,
    canConvertWaypointToViaPoint,
    convertViaPointToWaypoint,
    convertWaypointToViaPoint,
  };
}
