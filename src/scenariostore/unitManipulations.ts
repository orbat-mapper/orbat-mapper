import type { EntityId } from "@/types/base";
import type { NewScenarioStore, ScenarioState } from "./newScenarioStore";
import { moveElement, nanoid, removeElement } from "@/utils";
import type {
  NSide,
  NSideGroup,
  NState,
  NUnit,
  NUnitAdd,
  SideGroupUpdate,
  SideUpdate,
  UnitStatusUpdate,
  UnitUpdate,
} from "@/types/internalModels";
import type { CloneTarget, DropTarget } from "@/components/types";
import { CUSTOM_SYMBOL_SID_INDEX, SID_INDEX, Sidc } from "@/symbology/sidc";
import { setCharAt } from "@/components/helpers";
import { SID } from "@/symbology/values";
import { klona } from "klona";
import { createInitialState } from "@/scenariostore/time";
import { computed } from "vue";
import type {
  Unit,
  UnitProperties,
  UnitStyle,
  UnitSymbolOptions,
} from "@/types/scenarioModels";
import { mapReinforcedStatus2Field } from "@/types/scenarioModels";
import { getNextEchelonBelow } from "@/symbology/helpers";
import { clearUnitStyleCache, invalidateUnitStyle } from "@/geo/unitStyles";
import { useSupplyManipulations } from "@/scenariostore/supplyManipulations";
import { useToeManipulations } from "@/scenariostore/toeManipulations";
import { useRangeRingManipulations } from "@/scenariostore/rangeRingManipulations";
import { useUnitStateManipulations } from "@/scenariostore/unitStateManipulations";
import { CUSTOM_SYMBOL_PREFIX } from "@/config/constants.ts";

export type NWalkSubUnitCallback = (unit: NUnit) => void;

export type NWalkSideCallback = (
  unit: NUnit,
  level: number,
  parent: NUnit | NSideGroup | NSide,
  sideGroup: NSideGroup | undefined | null,
  side: NSide,
) => void | false | true;

export type NWalkSideGroupCallback = (
  unit: NUnit,
  level: number,
  parent: NUnit | NSideGroup,
  sideGroup: NSideGroup,
  side?: NSide,
) => void | false | true;

export interface WalkSubUnitsOptions {
  includeParent: boolean;
  state: ScenarioState;
}

export interface CloneUnitOptions {
  target: CloneTarget;
  includeSubordinates: boolean;
  includeState: boolean;
  modifyName: boolean;
}

let counter = 1;

function cloneUnitState(state: NState[]) {
  const stateCopy = klona(state);
  return stateCopy.map((s) => ({ ...s, id: nanoid() }));
}

function updateSidIfNecessary(u: NUnit, side: NSide) {
  if (u.sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) {
    if (u.sidc[CUSTOM_SYMBOL_SID_INDEX] !== side.standardIdentity) {
      u.sidc = setCharAt(u.sidc, CUSTOM_SYMBOL_SID_INDEX, side.standardIdentity);
    }
  } else {
    if (u.sidc[SID_INDEX] !== side.standardIdentity) {
      u.sidc = setCharAt(u.sidc, SID_INDEX, side.standardIdentity);
    }
  }
}

export function useUnitManipulations(store: NewScenarioStore) {
  const { state, update, groupUpdate } = store;

  const {
    addSupplyClass,
    updateSupplyClass,
    deleteSupplyClass,
    addSupplyCategory,
    deleteSupplyCategory,
    updateSupplyCategory,
    updateUnitSupply,
    addSupplyUom,
    updateSupplyUom,
    deleteSupplyUom,
  } = useSupplyManipulations(store);

  const {
    updateEquipment,
    addEquipment,
    updatePersonnel,
    addPersonnel,
    deletePersonnel,
    deleteEquipment,
    updateUnitEquipment,
    updateUnitPersonnel,
  } = useToeManipulations(store);

  const {
    addRangeRing,
    deleteRangeRing,
    deleteRangeRingByName,
    updateRangeRing,
    updateRangeRingByName,
    updateRangeRingGroup,
    addRangeRingGroup,
    deleteRangeRingGroup,
  } = useRangeRingManipulations(store);

  const {
    clearUnitState,
    updateUnitState,
    deleteUnitStateEntryByStateId,
    addUnitStateEntry,
    deleteUnitStateEntry,
    updateUnitStateEntry,
    setUnitState,
    updateUnitStateVia,
  } = useUnitStateManipulations(store);

  function addSide(
    sideData: Partial<NSide> = {},
    { markAsNew = true, addDefaultGroup = true, newId = true } = {},
  ): EntityId {
    const newSide: NSide = {
      ...sideData,
      id: newId || sideData.id === undefined ? nanoid() : sideData.id,
      name: sideData.name || "New side",
      standardIdentity: sideData.standardIdentity || SID.Friend,
      symbolOptions: sideData.symbolOptions || {},
      groups: [],
      subUnits: [],
      _isNew: markAsNew ?? true,
    };
    groupUpdate(
      () => {
        update((s) => {
          s.sideMap[newSide.id] = newSide;
          s.sides.push(newSide.id);
        });
        if (addDefaultGroup) {
          addSideGroup(newSide.id, { name: "Units", _isNew: false });
        }
      },
      { label: "addSide", value: newSide.id },
    );
    return newSide.id;
  }

  function addSideGroup(
    sideId: EntityId,
    data: Partial<NSideGroup> = {},
    { newId = true } = {},
  ): EntityId | undefined {
    let newSideGroupId: EntityId | undefined = undefined;
    update((s) => {
      const side = s.sideMap[sideId];
      if (!side) return;
      const newSideGroup: NSideGroup = {
        ...data,
        id: newId || data.id === undefined ? nanoid() : data.id,
        name: data.name || "New group",
        subUnits: [],
        _pid: sideId,
        _isNew: data._isNew ?? true,
      };
      s.sideGroupMap[newSideGroup.id] = newSideGroup;
      side.groups.push(newSideGroup.id);
      newSideGroupId = newSideGroup.id;
    });
    return newSideGroupId;
  }

  function updateSide(
    sideId: EntityId,
    sideData: Partial<SideUpdate>,
    { noUndo = false } = {},
  ) {
    if (noUndo) {
      let side = state.sideMap[sideId!];
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
            invalidateUnitStyle(unit.id);
          },
          state,
        );
      }
      return;
    }
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
            invalidateUnitStyle(unit.id);
          },
          s,
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

  function updateSideGroup(
    sideGroupId: EntityId,
    sideGroupData: SideGroupUpdate,
    { noUndo = false } = {},
  ) {
    if (noUndo) {
      const sideGroup = state.sideGroupMap[sideGroupId];
      if (sideGroup) Object.assign(sideGroup, { ...sideGroupData, _isNew: false });
    } else {
      update((s) => {
        let sideGroup = s.sideGroupMap[sideGroupId];
        if (sideGroup) Object.assign(sideGroup, { ...sideGroupData, _isNew: false });
      });
    }
    clearUnitStyleCache();
  }

  function reorderSideGroup(sideGroupId: EntityId, direction: "up" | "down") {
    const sideGroup = state.sideGroupMap[sideGroupId];
    const sideId = sideGroup?._pid;
    if (!sideGroup || !sideId) return;

    update((s) => {
      const parent = s.sideMap[sideId];
      if (parent) moveElement(parent.groups, sideGroupId, direction === "up" ? -1 : 1);
    });
  }

  function changeSideGroupParent(
    sideGroupId: EntityId,
    targetSideOrSideGroup: EntityId,
    target: DropTarget,
  ) {
    update((s) => {
      const sideGroup = s.sideGroupMap[sideGroupId];
      const targetSideGroup = s.sideGroupMap[targetSideOrSideGroup];
      if (!sideGroup) return;
      const originalParent = s.sideMap[sideGroup._pid];
      const targetParent = targetSideGroup
        ? s.sideMap[targetSideGroup._pid]
        : s.sideMap[targetSideOrSideGroup];
      if (!originalParent || !targetParent) return;
      removeElement(sideGroupId, originalParent.groups);
      // insert item
      if (target === "on") {
        targetParent.groups.push(sideGroupId);
      } else {
        const idx = targetParent.groups.findIndex((id) => id === targetSideOrSideGroup);
        if (idx < 0) return;
        if (target === "below") targetParent.groups.splice(idx + 1, 0, sideGroupId);
        if (target === "above") targetParent.groups.splice(idx, 0, sideGroupId);
      }
      sideGroup._pid = targetParent.id;
      // update SID if necessary
      const side = s.sideMap[targetParent.id];
      if (!side) return;
      walkSide(
        side.id,
        (unit) => {
          updateSidIfNecessary(unit, side);
          unit._sid = side.id;
          invalidateUnitStyle(unit.id);
        },
        s,
      );
    });
  }

  function reorderSide(sideIdId: EntityId, direction: "up" | "down") {
    update((s) => {
      moveElement(s.sides, sideIdId, direction === "up" ? -1 : 1);
    });
  }

  function moveSide(sideId: EntityId, toSideId: EntityId, target: DropTarget) {
    update((s) => {
      const side = s.sideMap[sideId];
      if (!side) return;
      const idx = s.sides.indexOf(sideId);
      if (idx < 0) return;
      s.sides.splice(idx, 1);
      const targetIdx = s.sides.indexOf(toSideId);
      if (target === "above") {
        s.sides.splice(targetIdx, 0, sideId);
      } else {
        s.sides.splice(targetIdx + 1, 0, sideId);
      }
    });
  }

  function updateUnit(
    unitId: EntityId,
    data: UnitUpdate,
    { doUpdateUnitState = false, ignoreLocked = false, s = state, noUndo = false } = {},
  ) {
    let unit = s.unitMap[unitId];
    if (!unit) return;
    if (!ignoreLocked && isUnitLocked(unitId)) return;
    invalidateUnitStyle(unitId);
    if (unit._ikey) {
      invalidateUnitStyle(unit._ikey);
      unit._ikey = undefined;
    }

    if (noUndo) {
      if (!unit) return;
      Object.assign(unit, { ...data });
      s.unitMap[unitId] = klona(unit);
    } else {
      update((s) => {
        let unit = s.unitMap[unitId];
        if (!unit) return;
        Object.assign(unit, { ...data });
        s.unitMap[unitId] = klona(unit);
      });
    }
    if (doUpdateUnitState) updateUnitState(unitId);
  }

  function batchUpdateUnit(
    unitIds: EntityId[],
    data: UnitUpdate,
    { doUpdateUnitState = false, ignoreLocked = false } = {},
  ) {
    const filteredUnitIds = ignoreLocked
      ? unitIds
      : unitIds.filter((id) => !isUnitLocked(id));
    update((s) => {
      filteredUnitIds.forEach((unitId) => {
        const unit = s.unitMap[unitId];
        if (!unit) return;
        Object.assign(unit, { ...data });
        s.unitMap[unitId] = klona(unit);
        invalidateUnitStyle(unitId);
      });
    });
    if (doUpdateUnitState) {
      unitIds.forEach((id) => updateUnitState(id));
    }
  }

  function batchUpdateUnitStyle(
    unitIds: EntityId[],
    data: Partial<UnitStyle>,
    { doUpdateUnitState = false, ignoreLocked = false } = {},
  ) {
    const filteredUnitIds = ignoreLocked
      ? unitIds
      : unitIds.filter((id) => !isUnitLocked(id));
    update((s) => {
      filteredUnitIds.forEach((unitId) => {
        const unit = s.unitMap[unitId];
        if (!unit) return;
        const unitStyle = unit.style ?? {};
        const newStyle = { ...unitStyle, ...data };
        Object.assign(unit, { style: newStyle });
        // s.unitMap[unitId] = klona(unit);
        invalidateUnitStyle(unitId);
      });
    });
    if (doUpdateUnitState) {
      unitIds.forEach((id) => updateUnitState(id));
    }
  }

  function updateUnitLocked(unitId: EntityId, locked: boolean) {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    unit.locked = locked;
  }

  function updateUnitProperties(
    unitId: EntityId,
    propertyUpdate: Partial<UnitProperties>,
  ) {
    update((s) => {
      let unit = s.unitMap[unitId];
      if (!unit) return;
      const properties = klona(unit.properties || {});
      unit.properties = { ...properties, ...propertyUpdate };
    });
  }

  function deleteUnit(id: string) {
    const unitIds: EntityId[] = [];
    walkSubUnits(
      id,
      (unit1) => {
        unitIds.push(unit1.id);
      },
      { includeParent: true },
    );
    unitIds.reverse();
    update((s) => {
      for (const id of unitIds) {
        const u = s.unitMap[id];
        if (!u) {
          continue;
        }
        delete s.unitMap[id];
        if (!u._pid) {
          continue;
        }
        const parentUnit = getUnitOrSideGroupOrSide(u._pid, s);

        if (parentUnit) {
          removeElement(id, parentUnit.subUnits);
        } else {
          return;
        }
      }
    });
  }

  function changeUnitParent(
    unitId: EntityId,
    targetId: EntityId,
    target: DropTarget = "on",
  ) {
    update((s) => {
      const unit = s.unitMap[unitId];
      let parentId = targetId;

      if (target === "above" || target === "below") {
        parentId = getUnitOrSideGroup(targetId)?._pid!;
      }
      const newParent = getUnitOrSideGroupOrSide(parentId, s);
      if (!(unit && newParent)) return;
      const { side, sideGroup, parents } = getUnitHierarchy(newParent.id, s);
      if (parents.includes(unit)) {
        console.error("Not allowed");
        return;
      }
      const originalParent = getUnitOrSideGroupOrSide(unit._pid, s);
      unit._pid = parentId;
      unit._sid = side.id;
      unit._gid = sideGroup?.id;

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
            updateSidIfNecessary(u, side);
            u._sid = side.id;
            u._gid = sideGroup?.id;
            invalidateUnitStyle(u.id);
          },
          { state: s, includeParent: true },
        );
      }
    });
  }

  function walkSubUnits(
    parentUnitId: EntityId,
    callback: NWalkSubUnitCallback,
    options: Partial<WalkSubUnitsOptions>,
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
      parent: NUnit | NSideGroup | NSide,
      sideGroup?: NSideGroup,
    ) {
      const currentUnit = s.unitMap[currentUnitId]!;
      const r = callback(currentUnit, level, parent, sideGroup, side);
      if (r !== undefined) return r;
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
      for (const unitId of sideGroup.subUnits) {
        const r = helper(unitId, sideGroup, sideGroup);
        if (r === true) break;
      }
    }

    for (const unitId of side.subUnits ?? []) {
      const r = helper(unitId, side);
      if (r === true) break;
    }
  }

  function walkItem(itemId: EntityId, callback: NWalkSideCallback, s = state) {
    let level = 0;

    function helper(
      currentUnitId: EntityId,
      parent: NUnit | NSideGroup | NSide,
      sideGroup?: NSideGroup,
      side?: NSide,
    ) {
      const currentUnit = s.unitMap[currentUnitId]!;
      const r = callback(currentUnit, level, parent, sideGroup, side!);
      if (r !== undefined) return r;
      if (currentUnit.subUnits) {
        level += 1;
        for (const subUnitId of currentUnit.subUnits) {
          helper(subUnitId, currentUnit, sideGroup, side);
        }
        level -= 1;
      }
    }

    if (itemId in s.sideMap) {
      // item is a side
      const side = s.sideMap[itemId];
      if (!side) return;
      for (const sideGroupId of side.groups) {
        const sideGroup = s.sideGroupMap[sideGroupId]!;
        for (const unitId of sideGroup.subUnits) {
          const r = helper(unitId, sideGroup, sideGroup, side);
          if (r === true) break;
        }
      }
      for (const unitId of side.subUnits ?? []) {
        const r = helper(unitId, side, undefined, side);
        if (r === true) break;
      }
    } else if (itemId in s.sideGroupMap) {
      // item is a side group
      const sideGroup = s.sideGroupMap[itemId];
      if (!sideGroup) return;
      const side = s.sideMap[sideGroup._pid];
      for (const unitId of sideGroup.subUnits) {
        const r = helper(unitId, sideGroup, sideGroup, side);
        if (r === true) break;
      }
    } else if (itemId in s.unitMap) {
      // item is a unit
      const unit = s.unitMap[itemId];
      if (!unit) return;
      const sideGroup = unit._gid ? s.sideGroupMap[unit._gid] : undefined;
      const side = unit._sid ? s.sideMap[unit._sid] : undefined;
      helper(unit.id, unit, sideGroup, side);
    }
  }

  function getUnitHierarchy(
    entityId: EntityId,
    s = state,
  ): { side: NSide; sideGroup: NSideGroup | undefined; parents: NUnit[] } {
    const parents: NUnit[] = [];
    const unit = getUnitOrSideGroupOrSide(entityId, s);

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
    let sideGroupId, sideId;
    if (parents.length) {
      sideGroupId = parents[0]._pid;
    } else if (unit && "_gid" in unit) {
      sideGroupId = unit._gid;
    } else {
      sideGroupId = unit && "_pid" in unit ? unit.id : undefined;
    }

    const sideGroup = sideGroupId ? s.sideGroupMap[sideGroupId] : undefined;
    if (sideGroup) {
      sideId = sideGroup._pid;
    } else if (unit && "_sid" in unit) {
      sideId = unit._sid;
    } else if (unit && "_pid" in unit) {
      sideId = unit._pid;
    } else if (unit) {
      sideId = unit.id;
    }
    const side = s.sideMap[sideId!];
    return { side, sideGroup, parents };
  }

  function getUnitOrSideGroup(id: EntityId, s = state): NUnit | NSideGroup | undefined {
    if (id in s.unitMap) return s.unitMap[id];
    return s.sideGroupMap[id] || undefined;
  }

  function getUnitOrSideGroupOrSide(
    id: EntityId,
    s = state,
  ): NUnit | NSideGroup | NSide | undefined {
    if (id in s.unitMap) return s.unitMap[id];
    if (id in s.sideGroupMap) return s.sideGroupMap[id];
    return s.sideMap[id];
  }

  function addUnit(
    newUnit: NUnitAdd,
    parentId: EntityId,
    index?: number,
    { noUndo = false, updateState = false, s = state } = {},
  ): EntityId {
    const unit = { ...newUnit } as NUnit;
    if (!unit.id) {
      unit.id = nanoid();
    }
    const { side, sideGroup } = getUnitHierarchy(parentId, s);
    unit._pid = parentId;
    unit._gid = sideGroup?.id;
    unit._sid = side.id;
    unit._isOpen = false;
    if (!unit.state || !unit.state.length) {
      unit._state = createInitialState(unit);
    }
    if (noUndo) {
      s.unitMap[unit.id] = unit;
      let parent = getUnitOrSideGroupOrSide(unit._pid!, s);
      if (!parent) return unit.id;
      if (index === undefined) {
        parent.subUnits.push(unit.id);
      } else {
        parent.subUnits.splice(index, 0, unit.id);
      }
    } else {
      update((s) => {
        s.unitMap[unit.id] = unit;
        let parent = getUnitOrSideGroupOrSide(unit._pid!, s);
        if (!parent) return;
        if (index === undefined) {
          parent.subUnits.push(unit.id);
        } else {
          parent.subUnits.splice(index, 0, unit.id);
        }
      });
    }
    if (updateState) updateUnitState(unit.id);

    return unit.id;
  }

  function createSubordinateUnit(parentId: EntityId, data: Partial<NUnit> = {}) {
    const parent = getUnitOrSideGroupOrSide(parentId);
    if (!parent) return;
    let sidc: Sidc;
    if (data.sidc) {
      sidc = new Sidc(data.sidc);
    } else if ("sidc" in parent) {
      const parentSidc = new Sidc(parent.sidc);
      sidc = new Sidc(data.sidc || parent.sidc);
      sidc.emt = getNextEchelonBelow(parentSidc.emt);
    } else {
      sidc = new Sidc("10031000000000000000");
      const side = "_pid" in parent ? state.sideMap[parent._pid] : parent;
      sidc.standardIdentity = side?.standardIdentity || "0";
    }
    const newUnit: NUnit = {
      name: data.name || parent.name + counter++,
      sidc: sidc.toString(),
      id: nanoid(),
      state: [],
      _state: null,
      _pid: parent.id,
      _gid: "",
      _sid: "",
      subUnits: [],
    };
    if (parent.symbolOptions) {
      newUnit.symbolOptions = klona(parent.symbolOptions);
    }
    const newUnitId = addUnit(newUnit, parentId);
    parent._isOpen = true;
    return newUnitId;
  }

  function cloneUnit(
    unitId: EntityId,
    {
      target = "below",
      includeSubordinates = false,
      includeState = false,
      modifyName = false,
    }: Partial<CloneUnitOptions> = {},
  ) {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    let newUnit = {
      ...unit,
      name: modifyName ? unit.name + counter++ : unit.name,
      id: nanoid(),
      state: includeState ? cloneUnitState(unit.state ?? []) : [],
      _state: null,
      subUnits: [],
    };

    let parent = getUnitOrSideGroup(unit._pid);
    let idx: number | undefined;
    if (target !== "end" && parent) {
      idx = parent.subUnits.findIndex((id) => id === unitId);
      if (target === "below") idx = idx + 1;

      if (idx < 0) idx = undefined;
    }
    groupUpdate(() => {
      const rootUnitId = addUnit(newUnit, unit._pid, idx, { updateState: includeState });
      const addedUnit = state.unitMap[rootUnitId];
      const { _gid, _sid } = addedUnit;
      if (includeSubordinates) {
        const clonedUnitIds: EntityId[] = [];
        update((s) => {
          function helper(currentUnitId: EntityId, parentId: EntityId) {
            const currentUnit = state.unitMap[currentUnitId]!;
            const newUnit = {
              ...currentUnit,
              id: nanoid(),
              state: includeState ? cloneUnitState(currentUnit.state ?? []) : [],
              subUnits: [],
              _state: null,
              _pid: parentId,
              _gid,
              _sid,
              _isOpen: false,
            };
            if (!newUnit.state || !newUnit.state.length) {
              unit._state = createInitialState(unit);
            }
            s.unitMap[newUnit.id] = newUnit;
            clonedUnitIds.push(newUnit.id);
            const parent = getUnitOrSideGroup(parentId, s);
            if (!parent) return;
            parent.subUnits.push(newUnit.id);
            currentUnit.subUnits.forEach((id) => helper(id, newUnit.id));
          }

          unit.subUnits.forEach((e) => helper(e, newUnit.id));
        });
        if (includeState) {
          clonedUnitIds.forEach((id) => updateUnitState(id));
        }
      }
    });

    return newUnit.id;
  }

  function cloneSideGroup(
    sideGroupId: EntityId,
    { includeState = false, modifyName = true } = {},
  ) {
    const sideGroup = state.sideGroupMap[sideGroupId];
    if (!sideGroup) return;
    const newSideGroup = {
      ...sideGroup,
      id: nanoid(),
      name: modifyName ? `${sideGroup.name} (copy)` : sideGroup.name,
      subUnits: [],
      _isNew: false,
    };
    let newSideGroupId: EntityId | undefined;
    groupUpdate(() => {
      newSideGroupId = addSideGroup(sideGroup._pid, newSideGroup);
      sideGroup.subUnits.forEach((unitId) => {
        const newUnitId = cloneUnit(unitId, {
          target: "end",
          includeSubordinates: true,
          includeState,
          modifyName: false,
        });
        newUnitId && newSideGroupId && changeUnitParent(newUnitId, newSideGroupId);
      });
    });
    return newSideGroupId;
  }

  function cloneSide(sideId: EntityId, { includeState = false } = {}) {
    const side = state.sideMap[sideId];
    if (!side) return;
    const newSide = {
      ...side,
      id: nanoid(),
      name: `${side.name} (copy)`,
      groups: [],
      _isNew: false,
    };
    let newSideId: EntityId | undefined;
    groupUpdate(() => {
      newSideId = addSide(newSide, { markAsNew: false, addDefaultGroup: false });
      side.groups.forEach((groupId) => {
        const newGroupId = cloneSideGroup(groupId, { includeState, modifyName: false });
        newGroupId && newSideId && changeSideGroupParent(newGroupId, newSideId, "on");
      });
    });
    return newSideId;
  }

  function reorderUnit(unitId: EntityId, direction: "up" | "down") {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    update((s) => {
      const parent = getUnitOrSideGroup(unit._pid, s);
      if (parent) moveElement(parent.subUnits, unitId, direction === "up" ? -1 : 1);
    });
  }

  function expandUnit(unit: NUnit): Unit {
    return {
      ...unit,
      state: [],
      subUnits: unit.subUnits.map((subUnitId) => expandUnit(state.unitMap[subUnitId])),
      equipment: unit.equipment?.map(({ id, count, onHand }) => ({
        name: state.equipmentMap[id].name || "",
        count,
        onHand,
      })),
      personnel: unit.personnel?.map(({ id, count, onHand }) => ({
        name: state.personnelMap[id].name || "",
        count,
        onHand,
      })),
      supplies: unit.supplies?.map(({ id, count, onHand }) => ({
        name: state.supplyCategoryMap[id].name || "",
        count,
        onHand,
      })),
    };
  }

  function expandUnitWithSymbolOptions(unit: NUnit): Unit {
    return {
      ...unit,
      state: [],
      symbolOptions: getCombinedSymbolOptions(unit),
      subUnits: unit.subUnits.map((subUnitId) =>
        expandUnitWithSymbolOptions(state.unitMap[subUnitId]),
      ),
      equipment: unit.equipment?.map(({ id, count }) => ({
        name: state.equipmentMap[id].name || "",
        count,
      })),
      personnel: unit.personnel?.map(({ id, count }) => ({
        name: state.personnelMap[id].name || "",
        count,
      })),
      supplies: unit.supplies?.map(({ id, count }) => ({
        name: state.supplyCategoryMap[id].name || "",
        count,
      })),
    };
  }

  function getCombinedSymbolOptions(
    unitOrSideGroup: NUnit | NSideGroup,
    ignoreUnit = false,
  ): UnitSymbolOptions {
    if (!unitOrSideGroup) return {};
    let _sid, _gid, reinforcedReduced;
    if ("sidc" in unitOrSideGroup) {
      _sid = unitOrSideGroup._sid;
      _gid = unitOrSideGroup._gid;
      reinforcedReduced = mapReinforcedStatus2Field(unitOrSideGroup.reinforcedStatus);
    } else {
      _sid = unitOrSideGroup._pid;
      _gid = unitOrSideGroup.id;
      ignoreUnit = true;
    }
    return {
      ...(state.sideMap[_sid!]?.symbolOptions || {}),
      ...(state.sideGroupMap[_gid!]?.symbolOptions || {}),
      ...(ignoreUnit ? {} : unitOrSideGroup.symbolOptions || {}),
      ...(ignoreUnit ? {} : { reinforcedReduced: reinforcedReduced ?? "" }),
    };
  }

  function updateUnitStatus(id: string, data: UnitStatusUpdate) {
    update((s) => {
      const status = s.unitStatusMap[id];
      if (!status) return;
      Object.assign(status, data);
    });
  }

  function addUnitStatus(data: Partial<UnitStatusUpdate>) {
    const newStatus = { id: nanoid(), name: "Status", ...klona(data) };
    if (newStatus.id === undefined) {
      newStatus.id = nanoid();
    }
    const newId = newStatus.id;
    update((s) => {
      s.unitStatusMap[newId] = newStatus;
    });
  }

  function deleteUnitStatus(id: string): boolean {
    // check if status is used
    const isUsed = Object.values(state.unitMap).some((unit) => {
      if (unit.status && unit.status === id) {
        return true;
      }

      return unit.state?.some((state) => state.status === id);
    });

    if (isUsed) return false;
    update((s) => {
      delete s.unitStatusMap[id];
    });
    return true;
  }

  function isUnitLocked(unitId: EntityId, { excludeUnit = false } = {}): boolean {
    const unit = state.unitMap[unitId];
    if (!unit) return false;
    if (excludeUnit) {
      return !!(
        state.sideMap[unit._sid]?.locked ||
        (unit._gid && state.sideGroupMap[unit._gid]?.locked)
      );
    }
    return !!(
      state.sideMap[unit._sid]?.locked ||
      (unit._gid && state.sideGroupMap[unit._gid]?.locked) ||
      unit.locked
    );
  }

  function isUnitHidden(unitId: EntityId): boolean {
    const unit = state.unitMap[unitId];
    if (!unit) return false;

    return !!(
      state.sideMap[unit._sid]?.isHidden ||
      (unit._gid && state.sideGroupMap[unit._gid]?.isHidden)
    );
  }

  function convertStateEntryToInitialLocation(unitId: EntityId, index: number) {
    const u = state.unitMap[unitId];
    const stateEntry = u?.state?.[index];
    if (!stateEntry?.location) return;
    const location = [...stateEntry.location];
    groupUpdate(
      () => {
        deleteUnitStateEntry(unitId, index);
        updateUnit(unitId, { location });
      },
      { label: "addUnitPosition", value: unitId },
    );
    updateUnitState(unitId);
  }

  return {
    addUnit,
    deleteUnit,
    changeUnitParent,
    walkSubUnits,
    walkSide,
    walkItem,
    cloneUnit,
    cloneSide,
    cloneSideGroup,
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
    updateUnitLocked,
    deleteUnitStateEntry,
    deleteUnitStateEntryByStateId,
    clearUnitState,
    setUnitState,
    units: computed(() => Object.values(state.unitMap)),
    getUnitOrSideGroup,
    getUnitById: (id: EntityId) => state.unitMap[id],
    getUnitByName: (name: string) => {
      for (const unit of Object.values(state.unitMap)) {
        if (unit.name === name) return expandUnit(unit);
      }
      return null;
    },

    expandUnit,
    updateUnitStateVia,
    updateUnitStateEntry,
    addUnitStateEntry,
    convertStateEntryToInitialLocation,
    reorderSide,
    moveSide,
    reorderSideGroup,
    changeSideGroupParent,
    getCombinedSymbolOptions,
    expandUnitWithSymbolOptions,
    addRangeRing,
    deleteRangeRing,
    deleteRangeRingByName,
    updateRangeRing,
    updateRangeRingByName,
    updateRangeRingGroup,
    addRangeRingGroup,
    deleteRangeRingGroup,
    updateEquipment,
    addEquipment,
    updatePersonnel,
    addPersonnel,
    deletePersonnel,
    deleteEquipment,
    updateUnitEquipment,
    updateUnitPersonnel,
    addUnitStatus,
    updateUnitStatus,
    deleteUnitStatus,
    addSupplyClass,
    updateSupplyClass,
    deleteSupplyClass,
    addSupplyCategory,
    deleteSupplyCategory,
    updateSupplyCategory,
    addSupplyUom,
    updateSupplyUom,
    deleteSupplyUom,

    updateUnitSupply,
    updateUnitProperties,
    isUnitLocked,
    isUnitHidden,
    updateUnitState,
    batchUpdateUnit,
    batchUpdateUnitStyle,
  };
}
