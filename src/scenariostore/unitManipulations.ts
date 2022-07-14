import { EntityId } from "@/types/base";
import { NewScenarioStore, ScenarioState } from "./newScenarioStore";
import { moveElement, nanoid, removeElement } from "@/utils";
import {
  NSide,
  NSideGroup,
  NUnit,
  SideGroupUpdate,
  SideUpdate,
  UnitUpdate,
} from "@/types/internalModels";
import { DropTarget } from "@/components/types";
import { SID_INDEX, Sidc } from "@/symbology/sidc";
import { setCharAt } from "@/components/helpers";
import { SID } from "@/symbology/values";
import { klona } from "klona";
import { createInitialState } from "@/scenariostore/time";
import { computed } from "vue";
import { Unit } from "@/types/scenarioModels";

export type NWalkSubUnitCallback = (unit: NUnit) => void;

export type NWalkSideCallback = (
  unit: NUnit,
  level: number,
  parent: NUnit | NSideGroup,
  sideGroup: NSideGroup,
  side: NSide
) => void;

export interface WalkSubUnitsOptions {
  includeParent: boolean;
  state: ScenarioState;
}

let counter = 1;

export function useUnitManipulations(store: NewScenarioStore) {
  const { state, update, groupUpdate } = store;

  function addSide(sideDate: Partial<SideUpdate> = {}) {
    const newSide: NSide = {
      id: nanoid(),
      name: sideDate.name || "New side",
      standardIdentity: sideDate.standardIdentity || SID.Friend,
      groups: [],
      _isNew: true,
    };
    groupUpdate(
      () => {
        update((s) => {
          s.sideMap[newSide.id] = newSide;
          s.sides.push(newSide.id);
        });
        addSideGroup(newSide.id, { name: "Units", _isNew: false });
      },
      { label: "addSide", value: newSide.id }
    );
  }

  function addSideGroup(sideId: EntityId, data: Partial<NSideGroup> = {}) {
    update((s) => {
      const side = s.sideMap[sideId];
      if (!side) return;
      const newSideGroup: NSideGroup = {
        id: nanoid(),
        name: data.name || "New group",
        subUnits: [],
        _pid: sideId,
        _isNew: data._isNew ?? true,
      };
      s.sideGroupMap[newSideGroup.id] = newSideGroup;
      side.groups.push(newSideGroup.id);
    });
  }

  function updateSide(sideId: EntityId, sideData: Partial<SideUpdate>) {
    update((s) => {
      let side = s.sideMap[sideId!];
      if (!side) return;
      const updateSid =
        sideData.standardIdentity ?? side.standardIdentity !== sideData.standardIdentity;
      Object.assign(side, sideData);
      if (updateSid) {
        const sid = side.standardIdentity;
        walkSide(
          side.id,
          (unit) => {
            if (unit.sidc[SID_INDEX] !== sid) {
              unit.sidc = setCharAt(unit.sidc, SID_INDEX, sid);
            }
          },
          s
        );
      }
    });
  }

  function deleteSide(sideId: EntityId) {
    const side = state.sideMap[sideId];
    if (!side) return;
    const sideGroups = [...side.groups];
    groupUpdate(() => {
      sideGroups.forEach((id) => deleteSideGroup(id));
      update((s) => {
        delete s.sideMap[sideId];
        removeElement(sideId, s.sides);
      });
    });
  }

  function deleteSideGroup(sideGroupId: EntityId) {
    const sideGroup = state.sideGroupMap[sideGroupId];
    if (!sideGroup) return;
    const subUnits = [...sideGroup.subUnits];
    groupUpdate(() => {
      subUnits.forEach((unitId) => deleteUnit(unitId));
      update((s) => {
        delete s.sideGroupMap[sideGroupId];
        if (!sideGroup._pid) return;
        const parentSide = s.sideMap[sideGroup._pid];
        removeElement(sideGroupId, parentSide.groups);
      });
    });
  }

  function updateSideGroup(sideGroupId: EntityId, sideGroupData: SideGroupUpdate) {
    update((s) => {
      let sideGroup = s.sideGroupMap[sideGroupId];
      if (sideGroup) Object.assign(sideGroup, { ...sideGroupData, _isNew: false });
    });
  }

  function updateUnit(unitId: EntityId, data: UnitUpdate) {
    update((s) => {
      let unit = s.unitMap[unitId];
      if (!unit) return;
      Object.assign(unit, { ...data });
      s.unitMap[unitId] = klona(unit);
    });
  }

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
        removeElement(id, parentUnit.subUnits);
      } else {
        const sideGroup = s.sideGroupMap[u._pid];
        if (!sideGroup) return;
        removeElement(id, sideGroup.subUnits);
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
      const { side, parents } = getUnitHierarchy(newParent.id, s);
      if (parents.includes(unit)) {
        console.error("Not allowed");
        return;
      }
      const originalParent = getUnitOrSideGroup(unit._pid, s);
      unit._pid = parentId;

      if (originalParent) {
        removeElement(unitId, originalParent.subUnits);
      }

      if (target === "on") {
        newParent.subUnits.push(unitId);
      } else {
        const idx = newParent.subUnits.findIndex((id) => id === targetId);
        if (idx < 0) return;
        if (target === "below") newParent.subUnits.splice(idx + 1, 0, unitId);
        if (target === "above") newParent.subUnits.splice(idx, 0, unitId);
      }

      //update SID if necessary
      if (side) {
        walkSubUnits(
          unitId,
          (u) => {
            if (u.sidc[SID_INDEX] !== side.standardIdentity) {
              u.sidc = setCharAt(u.sidc, SID_INDEX, side.standardIdentity);
            }
          },
          { state: s, includeParent: true }
        );
      }
    });
  }

  function walkSubUnits(
    parentUnitId: EntityId,
    callback: NWalkSubUnitCallback,
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

  function walkSide(sideId: EntityId, callback: NWalkSideCallback, s = state) {
    let level = 0;
    const side = s.sideMap[sideId];
    if (!side) return;

    function helper(
      currentUnitId: EntityId,
      parent: NUnit | NSideGroup,
      sideGroup: NSideGroup
    ) {
      const currentUnit = s.unitMap[currentUnitId]!;
      callback(currentUnit, level, parent, sideGroup, side);
      if (currentUnit.subUnits) {
        level += 1;
        for (const subUnitId of currentUnit.subUnits) {
          helper(subUnitId, currentUnit, sideGroup);
        }
        level -= 1;
      }
    }

    for (const sideGroupId of side.groups) {
      const sideGroup = s.sideGroupMap[sideGroupId]!;
      sideGroup.subUnits.forEach((unitId) => helper(unitId, sideGroup, sideGroup));
    }
  }

  function getUnitHierarchy(entityId: EntityId, s = state) {
    const parents: NUnit[] = [];
    const unit = getUnitOrSideGroup(entityId, s);

    const helper = (uId: EntityId) => {
      const u = s.unitMap[uId];
      const parent = u?._pid && s.unitMap[u._pid];
      if (parent) {
        parents.push(parent);
        helper(parent.id);
      }
    };

    helper(entityId);
    parents.reverse();
    const sideGroup =
      s.sideGroupMap[parents[0]?._pid || unit?._pid!] || s.sideGroupMap[unit?.id!];
    const side = sideGroup && s.sideMap[sideGroup._pid!];
    return { side, sideGroup, parents };
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

  function createSubordinateUnit(parentId: EntityId) {
    const parent = getUnitOrSideGroup(parentId);
    if (!parent) return;
    let sidc: Sidc;
    if ("sidc" in parent) {
      sidc = new Sidc(parent.sidc);
      const echelon = +sidc.amplifierDescriptor;
      if (echelon > 0) {
        // Todo: Fix hard coded values
        if (echelon === 8) {
          // brigade
          sidc.amplifierDescriptor = "6";
        } else {
          sidc.amplifierDescriptor = (echelon - 1).toString();
        }
      }
    } else {
      sidc = new Sidc("10031000000000000000");
      const side = state.sideMap[parent._pid!];
      sidc.standardIdentity = side?.standardIdentity || "0";
    }
    const newUnit: NUnit = {
      name: parent.name + counter++,
      sidc: sidc.toString(),
      id: nanoid(),
      state: [],
      _state: null,
      _pid: parent.id,
      subUnits: [],
    };
    addUnit(newUnit, parentId);
    parent._isOpen = true;
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

  function deleteUnitStateEntry(unitId: EntityId, index: number) {
    update((s) => {
      const _unit = s.getUnitById(unitId);
      if (!_unit) return;
      _unit.state?.splice(index, 1);
    });

    updateUnitState(unitId);
  }

  function updateUnitState(unitId: EntityId, undoable = false) {
    const unit = state.unitMap[unitId];
    const timestamp = state.currentTime;
    if (!unit.state || !unit.state.length) {
      unit._state = createInitialState(unit);
      return;
    }
    let tmpstate = createInitialState(unit);
    for (const s of unit.state) {
      if (s.t <= timestamp) {
        tmpstate = s;
      } else {
        break;
      }
    }
    unit._state = tmpstate;
  }

  function expandUnit(unit: NUnit): Unit {
    return {
      ...unit,
      subUnits: unit.subUnits.map((subUnitId) => expandUnit(state.unitMap[subUnitId])),
    };
  }

  return {
    deleteUnit,
    changeUnitParent,
    walkSubUnits,
    cloneUnit,
    reorderUnit,
    getUnitHierarchy,
    updateSide,
    updateSideGroup,
    addSide,
    addSideGroup,
    deleteSide,
    deleteSideGroup,
    createSubordinateUnit,
    updateUnit,
    deleteUnitStateEntry,
    units: computed(() => Object.values(state.unitMap)),
    getUnitById: (id: EntityId) => state.unitMap[id],
    getUnitByName: (name: string) => {
      for (const unit of Object.values(state.unitMap)) {
        if (unit.name === name) return expandUnit(unit);
      }
      return null;
    },
    expandUnit,
  };
}
