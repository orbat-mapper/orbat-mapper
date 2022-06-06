import { EntityId } from "../types/base";
import { useNewScenarioStore } from "../stores/newScenarioStore";
import { nanoid } from "../utils";
import { NSideGroup, NUnit } from "../types/internalModels";

export type WalkSubUnitIdCallback = (unit: NUnit) => void;

let counter = 1;

export function useUnitManipulations({ store }: ReturnType<typeof useNewScenarioStore>) {
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
        const idx = sideGroup.units.findIndex((e) => e === id);
        if (idx !== -1) sideGroup.units.splice(idx, 1);
      }
    });
  }

  function changeUnitParent(unitId: EntityId, parentId: EntityId) {
    update((s) => {
      const unit = s.unitMap[unitId];
      const newParent = getUnitOrSideGroup(parentId, s);

      if (!(unit && newParent)) return;
      const originalParent = getUnitOrSideGroup(unit._pid, s);
      unit._pid = parentId;

      if ("sidc" in newParent) {
        newParent.subUnits.push(unitId);
      } else {
        newParent.units.push(unitId);
      }
      if (originalParent) {
        if ("sidc" in originalParent) {
          const idx = originalParent.subUnits.findIndex((id) => id === unitId);
          if (idx >= 0) originalParent.subUnits.splice(idx, 1);
        } else {
          const idx = originalParent.units.findIndex((id) => id === unitId);
          if (idx >= 0) originalParent.units.splice(idx, 1);
        }
      }
    });
  }

  function walkSubUnits(
    parentUnitId: EntityId,
    callback: WalkSubUnitIdCallback,
    includeParent = false
  ) {
    function helper(currentUnitId: EntityId) {
      const currentUnit = state.unitMap[currentUnitId]!;
      callback(currentUnit);
      currentUnit.subUnits.forEach((id) => helper(id));
    }

    const parentUnit = state.unitMap[parentUnitId]!;
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

      if ("sidc" in parent) {
        parent.subUnits.push(unit.id);
      } else {
        parent.units.push(unit.id);
      }
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

  return { deleteUnit, changeUnitParent, walkSubUnits, cloneUnit };
}
