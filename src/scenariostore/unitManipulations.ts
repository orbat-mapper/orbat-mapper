import { EntityId } from "../types/base";
import { NewScenarioStore, ScenarioState } from "./newScenarioStore";
import { moveElement, nanoid } from "../utils";
import { NSideGroup, NUnit } from "../types/internalModels";
import { Unit } from "../types/scenarioModels";
import { useScenarioStore } from "../stores/scenarioStore";
import { DropTarget } from "../components/types";

export type WalkSubUnitIdCallback = (unit: NUnit) => void;
export interface WalkSubUnitsOptions {
  includeParent: boolean;
  state: ScenarioState;
}

let counter = 1;

export function useUnitManipulations(store: NewScenarioStore) {
  const { state, update } = store;

  function deleteUnit(id: string) {
    const u = state.unitMap[id];
    if (!u) {
      console.warn("Unit does not exists", id);
      return;
    }
    update((s) => {
      delete s.unitMap[id];
      if (!u._pid) return;
      const parentUnit = s.unitMap[u._pid];
      if (parentUnit) {
        const idx = parentUnit.subUnits.findIndex((e) => e === id);
        if (idx !== -1) parentUnit.subUnits.splice(idx, 1);
      } else {
        const sideGroup = s.sideGroupMap[u._pid];
        if (!sideGroup) return;
        const idx = sideGroup.subUnits.findIndex((e) => e === id);
        if (idx !== -1) sideGroup.subUnits.splice(idx, 1);
      }
    });
  }

  function changeUnitParent(
    unitId: EntityId,
    targetId: EntityId,
    target: DropTarget = "on"
  ) {
    update((s) => {
      const unit = s.unitMap[unitId];
      let parentId = targetId;
      if (target === "above" || target === "below") {
        parentId = getUnitOrSideGroup(targetId)?._pid!;
      }
      const newParent = getUnitOrSideGroup(parentId, s);

      if (!(unit && newParent)) return;
      const originalParent = getUnitOrSideGroup(unit._pid, s);
      unit._pid = parentId;

      if (originalParent) {
        const idx = originalParent.subUnits.findIndex((id) => id === unitId);
        if (idx >= 0) originalParent.subUnits.splice(idx, 1);
      }

      if (target === "on") {
        newParent.subUnits.push(unitId);
      } else {
        const idx = newParent.subUnits.findIndex((id) => id === targetId);
        if (idx < 0) return;
        if (target === "below") newParent.subUnits.splice(idx + 1, 0, unitId);
        if (target === "above") newParent.subUnits.splice(idx, 0, unitId);
      }
    });
  }

  function walkSubUnits(
    parentUnitId: EntityId,
    callback: WalkSubUnitIdCallback,
    options: Partial<WalkSubUnitsOptions>
  ) {
    const { state: s = state, includeParent = false } = options;
    function helper(currentUnitId: EntityId) {
      const currentUnit = s.unitMap[currentUnitId]!;
      callback(currentUnit);
      currentUnit.subUnits.forEach((id) => helper(id));
    }

    const parentUnit = s.unitMap[parentUnitId]!;
    if (includeParent) callback(parentUnit);
    parentUnit.subUnits.forEach((unitId) => helper(unitId));
  }

  function getUnitOrSideGroup(id: EntityId, s = state): NUnit | NSideGroup | undefined {
    if (id in s.unitMap) return s.unitMap[id];
    return s.sideGroupMap[id] || undefined;
  }

  function addUnit(unit: NUnit, parentId: EntityId) {
    if (!unit.id) {
      unit.id = nanoid();
    }
    unit._pid = parentId;
    unit._isOpen = false;
    update((s) => {
      s.unitMap[unit.id] = unit;
      let parent = getUnitOrSideGroup(unit._pid);
      if (!parent) return;
      parent.subUnits.push(unit.id);
    });
  }

  function cloneUnit(unitId: EntityId) {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    let newUnit = {
      ...unit,
      name: unit.name + counter++,
      id: nanoid(),
      state: [],
      _state: null,
      subUnits: [],
    };

    addUnit(newUnit, unit._pid);
  }

  function reorderUnit(unitId: EntityId, direction: "up" | "down") {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    update((s) => {
      const parent = getUnitOrSideGroup(unit._pid, s);
      if (parent) moveElement(parent.subUnits, unitId, direction === "up" ? -1 : 1);
    });
  }

  return { deleteUnit, changeUnitParent, walkSubUnits, cloneUnit, reorderUnit };
}
