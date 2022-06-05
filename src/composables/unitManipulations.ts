import { EntityId } from "../types/base";
import { NUnit, useNewScenarioStore } from "../stores/newScenarioStore";

export type WalkSubUnitIdCallback = (unit: NUnit) => void;

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

      const newParent = s.unitMap[parentId];
      if (!(unit && newParent)) return;
      const originalParent = unit._pid && s.unitMap[unit._pid];
      unit._pid = parentId;
      newParent.subUnits.push(unitId);
      if (originalParent) {
        const idx = originalParent.subUnits.findIndex((id) => id === unitId);
        if (idx >= 0) originalParent.subUnits.splice(idx, 1);
      }
    });
  }

  function walkSubUnits(
    parentUnitId: EntityId,
    callback: WalkSubUnitIdCallback,
    includeParent = false
  ) {
    function helper(currentUnitId: EntityId) {
      const currentUnit = state.unitMap[currentUnitId];
      callback(currentUnit);
      currentUnit.subUnits.forEach((id) => helper(id));
    }

    const parentUnit = state.unitMap[parentUnitId];
    if (includeParent) callback(parentUnit);
    parentUnit.subUnits.forEach((unitId) => helper(unitId));
  }

  return { deleteUnit, changeUnitParent, walkSubUnits };
}
