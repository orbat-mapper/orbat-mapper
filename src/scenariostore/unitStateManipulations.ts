import { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { NState } from "@/types/internalModels";
import { mergeArray, nanoid } from "@/utils";
import { klona } from "klona";
import { EntityId, HistoryAction } from "@/types/base";
import { createInitialState, updateCurrentUnitState } from "@/scenariostore/time";
import { State, StateAdd } from "@/types/scenarioModels";
import { Position } from "@/types/scenarioGeoModels";

export function useUnitStateManipulations(store: NewScenarioStore) {
  const { state, update, groupUpdate } = store;

  function updateUnitState(unitId: EntityId) {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    const timestamp = state.currentTime;
    updateCurrentUnitState(unit, timestamp);
    state.unitStateCounter++;
  }

  function clearUnitState(unitId: EntityId) {
    update(
      (s) => {
        const _unit = s.getUnitById(unitId);
        if (!_unit) return;
        _unit.state = [];
        _unit._state = createInitialState(_unit);
      },
      { label: "clearUnitState", value: unitId },
    );
    updateUnitState(unitId);
  }

  function deleteUnitStateEntryByStateId(unitId: EntityId, stateId: EntityId) {
    update((s) => {
      const _unit = s.getUnitById(unitId);
      if (!_unit) return;
      const index = _unit.state?.findIndex((s) => s.id === stateId) ?? -1;
      if (index >= 0) _unit.state?.splice(index, 1);
    });

    updateUnitState(unitId);
  }

  function addUnitStateEntry(unitId: EntityId, state: StateAdd, merge = false) {
    update(
      (s) => {
        const u = s.getUnitById(unitId);

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

            return;
          }
        }
        u.state.push(newState as NState);
      },
      { label: "addUnitPosition", value: unitId },
    );
    updateUnitState(unitId);
  }

  function deleteUnitStateEntry(unitId: EntityId, index: number) {
    update((s) => {
      const _unit = s.getUnitById(unitId);
      if (!_unit) return;
      _unit.state?.splice(index, 1);
    });

    updateUnitState(unitId);
  }

  function updateUnitStateEntry(unitId: EntityId, index: number, data: Partial<State>) {
    update((s) => {
      const unit = s.getUnitById(unitId);
      if (!unit?.state) return;
      Object.assign(unit.state[index], data);
      unit.state.sort(({ t: a }, { t: b }) => (a < b ? -1 : a > b ? 1 : 0));
    });
    state.unitStateCounter++;

    updateUnitState(unitId);
  }

  function setUnitState(unitId: EntityId, state: NState[]) {
    update((s) => {
      const unit = s.getUnitById(unitId);
      if (!unit) return;
      unit.state = state;
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
        const unit = s.getUnitById(unitId);
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

  return {
    clearUnitState,
    updateUnitState,
    deleteUnitStateEntryByStateId,
    addUnitStateEntry,
    deleteUnitStateEntry,
    updateUnitStateEntry,
    setUnitState,
    updateUnitStateVia,
  };
}
