import { EntityId, HistoryAction } from "@/types/base";
import { NewScenarioStore, ScenarioState } from "./newScenarioStore";
import { moveElement, nanoid, removeElement } from "@/utils";
import {
  EquipmentDataUpdate,
  NEquipmentData,
  NPersonnelData,
  NSide,
  NSideGroup,
  NUnit,
  NUnitAdd,
  PersonnelDataUpdate,
  SideGroupUpdate,
  SideUpdate,
  UnitStatusUpdate,
  UnitUpdate,
} from "@/types/internalModels";
import { CloneTarget, DropTarget } from "@/components/types";
import { SID_INDEX, Sidc } from "@/symbology/sidc";
import { setCharAt } from "@/components/helpers";
import { SID } from "@/symbology/values";
import { klona } from "klona";
import { createInitialState } from "@/scenariostore/time";
import { computed } from "vue";
import type {
  State,
  StateAdd,
  Unit,
  UnitProperties,
  UnitSymbolOptions,
} from "@/types/scenarioModels";
import { Position, RangeRing, RangeRingGroup } from "@/types/scenarioGeoModels";
import { getNextEchelonBelow } from "@/symbology/helpers";
import { clearUnitStyleCache, invalidateUnitStyle } from "@/geo/unitStyles";

export type NWalkSubUnitCallback = (unit: NUnit) => void;

export type NWalkSideCallback = (
  unit: NUnit,
  level: number,
  parent: NUnit | NSideGroup,
  sideGroup: NSideGroup,
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
}

let counter = 1;

export function useUnitManipulations(store: NewScenarioStore) {
  const { state, update, groupUpdate } = store;

  function addSide(
    sideData: Partial<SideUpdate> = {},
    { markAsNew } = { markAsNew: true },
  ): EntityId {
    const newSide: NSide = {
      id: nanoid(),
      name: sideData.name || "New side",
      standardIdentity: sideData.standardIdentity || SID.Friend,
      symbolOptions: sideData.symbolOptions || {},
      groups: [],
      _isNew: markAsNew ?? true,
    };
    groupUpdate(
      () => {
        update((s) => {
          s.sideMap[newSide.id] = newSide;
          s.sides.push(newSide.id);
        });
        addSideGroup(newSide.id, { name: "Units", _isNew: false });
      },
      { label: "addSide", value: newSide.id },
    );
    return newSide.id;
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

  function updateSideGroup(sideGroupId: EntityId, sideGroupData: SideGroupUpdate) {
    update((s) => {
      let sideGroup = s.sideGroupMap[sideGroupId];
      if (sideGroup) Object.assign(sideGroup, { ...sideGroupData, _isNew: false });
    });
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
          if (unit.sidc[SID_INDEX] !== side.standardIdentity) {
            unit.sidc = setCharAt(unit.sidc, SID_INDEX, side.standardIdentity);
          }
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
    { doUpdateUnitState = false } = {},
  ) {
    invalidateUnitStyle(unitId);
    update((s) => {
      let unit = s.unitMap[unitId];
      if (!unit) return;
      Object.assign(unit, { ...data });
      s.unitMap[unitId] = klona(unit);
    });
    if (doUpdateUnitState) updateUnitState(unitId);
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
    groupUpdate(() => {
      walkSubUnits(
        id,
        (unit1) => {
          deleteSingleUnit(unit1.id);
        },
        { includeParent: true },
      );
    });
  }

  function deleteSingleUnit(id: string) {
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
    target: DropTarget = "on",
  ) {
    update((s) => {
      const unit = s.unitMap[unitId];
      let parentId = targetId;

      if (target === "above" || target === "below") {
        parentId = getUnitOrSideGroup(targetId)?._pid!;
      }
      const newParent = getUnitOrSideGroup(parentId, s);
      if (!(unit && newParent)) return;
      const { side, sideGroup, parents } = getUnitHierarchy(newParent.id, s);
      if (parents.includes(unit)) {
        console.error("Not allowed");
        return;
      }
      const originalParent = getUnitOrSideGroup(unit._pid, s);
      unit._pid = parentId;
      unit._sid = side.id;
      unit._gid = sideGroup.id;

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
            u._sid = side.id;
            u._gid = sideGroup.id;
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
      parent: NUnit | NSideGroup,
      sideGroup: NSideGroup,
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

  function addUnit(
    newUnit: NUnitAdd,
    parentId: EntityId,
    index?: number,
    { noUndo = false } = {},
  ): EntityId {
    const unit = { ...newUnit } as NUnit;
    if (!unit.id) {
      unit.id = nanoid();
    }
    const { side, sideGroup } = getUnitHierarchy(parentId);
    unit._pid = parentId;
    unit._gid = sideGroup.id;
    unit._sid = side.id;
    unit._isOpen = false;
    if (!unit.state || !unit.state.length) {
      unit._state = createInitialState(unit);
    }
    if (noUndo) {
      state.unitMap[unit.id] = unit;
      let parent = getUnitOrSideGroup(unit._pid!);
      if (!parent) return unit.id;
      if (index === undefined) {
        parent.subUnits.push(unit.id);
      } else {
        parent.subUnits.splice(index, 0, unit.id);
      }
    } else {
      update((s) => {
        s.unitMap[unit.id] = unit;
        let parent = getUnitOrSideGroup(unit._pid!, s);
        if (!parent) return;
        if (index === undefined) {
          parent.subUnits.push(unit.id);
        } else {
          parent.subUnits.splice(index, 0, unit.id);
        }
      });
    }

    return unit.id;
  }

  function createSubordinateUnit(parentId: EntityId, data: Partial<NUnit> = {}) {
    const parent = getUnitOrSideGroup(parentId);
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
      const side = state.sideMap[parent._pid!];
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
    { target = "below", includeSubordinates = false }: Partial<CloneUnitOptions> = {},
  ) {
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

    let parent = getUnitOrSideGroup(unit._pid);
    let idx: number | undefined;
    if (target !== "end" && parent) {
      idx = parent.subUnits.findIndex((id) => id === unitId);
      if (target === "below") idx = idx + 1;

      if (idx < 0) idx = undefined;
    }
    groupUpdate(() => {
      addUnit(newUnit, unit._pid, idx);
      if (includeSubordinates) {
        function helper(currentUnitId: EntityId, parentId: EntityId) {
          const currentUnit = state.unitMap[currentUnitId]!;
          const newUnit = {
            ...currentUnit,
            name: currentUnit.name,
            id: nanoid(),
            state: [],
            _state: null,
            subUnits: [],
          };
          addUnit(newUnit, parentId);
          currentUnit.subUnits.forEach((id) => helper(id, newUnit.id));
        }
        unit.subUnits.forEach((e) => helper(e, newUnit.id));
      }
    });
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
              const { id, t, ...rest } = newState;
              Object.assign(u.state[i], rest);
            } else {
              u.state.splice(i, 0, newState as State);
            }

            return;
          }
        }
        u.state.push(newState as State);
      },
      { label: "addUnitPosition", value: unitId },
    );
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

  function convertStateEntryToInitialLocation(unitId: EntityId, index: number) {
    const u = state.getUnitById(unitId);
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

  function updateUnitState(unitId: EntityId, undoable = false) {
    const unit = state.unitMap[unitId];
    const timestamp = state.currentTime;
    if (!unit.state || !unit.state.length) {
      unit._state = createInitialState(unit);
      return;
    }
    let currentState = createInitialState(unit);
    for (const s of unit.state) {
      if (s.t <= timestamp) {
        currentState = { ...currentState, ...s };
      } else {
        break;
      }
    }
    unit._state = currentState;
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

  function expandUnit(unit: NUnit): Unit {
    return {
      ...unit,
      subUnits: unit.subUnits.map((subUnitId) => expandUnit(state.unitMap[subUnitId])),
      equipment: unit.equipment?.map(({ id, count }) => ({
        name: state.equipmentMap[id].name || "",
        count,
      })),
      personnel: unit.personnel?.map(({ id, count }) => ({
        name: state.personnelMap[id].name || "",
        count,
      })),
    };
  }

  function expandUnitWithSymbolOptions(unit: NUnit): Unit {
    return {
      ...unit,
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
    };
  }

  function getCombinedSymbolOptions(
    unitOrSideGroup: NUnit | NSideGroup,
    ignoreUnit = false,
  ): UnitSymbolOptions {
    let _sid, _gid;
    if ("sidc" in unitOrSideGroup) {
      _sid = unitOrSideGroup._sid;
      _gid = unitOrSideGroup._gid;
    } else {
      _sid = unitOrSideGroup._pid;
      _gid = unitOrSideGroup.id;
      ignoreUnit = true;
    }
    return {
      ...(state.sideMap[_sid!]?.symbolOptions || {}),
      ...(state.sideGroupMap[_gid!]?.symbolOptions || {}),
      ...(ignoreUnit ? {} : unitOrSideGroup.symbolOptions || {}),
    };
  }

  function addRangeRing(unitId: EntityId, rangeRing: RangeRing) {
    update((s) => {
      const unit = s.getUnitById(unitId);
      if (!unit) return;
      if (!unit.rangeRings) unit.rangeRings = [];
      unit.rangeRings.push(rangeRing);
    });
  }

  function deleteRangeRing(unitId: EntityId, index: number) {
    update((s) => {
      const unit = s.getUnitById(unitId);
      if (!unit) return;
      if (!unit.rangeRings) return;
      unit.rangeRings.splice(index, 1);
    });
  }

  function updateRangeRing(unitId: EntityId, index: number, data: Partial<RangeRing>) {
    update((s) => {
      const unit = s.getUnitById(unitId);
      if (!unit) return;
      if (!unit.rangeRings) return;
      const { style, ...rest } = data;
      Object.assign(unit.rangeRings[index], rest);

      if (style) {
        if (unit.rangeRings[index].style) {
          Object.assign(unit.rangeRings[index].style!, style);
        } else {
          unit.rangeRings[index].style = style;
        }
      }
    });
  }

  function updateRangeRingGroup(groupId: string, data: Partial<RangeRingGroup>) {
    update((s) => {
      const group = s.rangeRingGroupMap[groupId];
      if (!group) return;
      const { style, ...rest } = data;
      Object.assign(group, rest);
      if (style) {
        if (group.style) {
          Object.assign(group.style!, style);
        } else {
          group.style = style;
        }
      }
    });
  }

  function addRangeRingGroup(data: Partial<RangeRingGroup>) {
    const newGroup = { id: nanoid(), name: "Group", ...klona(data) };
    if (newGroup.id === undefined) {
      newGroup.id = nanoid();
    }
    const newId = newGroup.id;
    update((s) => {
      s.rangeRingGroupMap[newId] = newGroup;
    });
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

  function updateEquipment(id: string, data: EquipmentDataUpdate) {
    update((s) => {
      const equipment = s.equipmentMap[id];
      if (!equipment) return;
      Object.assign(equipment, data);
    });
  }

  function addEquipment(data: Partial<NEquipmentData>, { noUndo = false } = {}) {
    const newEquipment = { id: nanoid(), name: "Equipment", ...klona(data) };
    if (newEquipment.id === undefined) {
      newEquipment.id = nanoid();
    }
    const newId = newEquipment.id;
    if (noUndo) {
      state.equipmentMap[newId] = newEquipment;
    } else {
      update((s) => {
        s.equipmentMap[newId] = newEquipment;
      });
    }
    return newEquipment;
  }

  function deleteEquipment(id: string): boolean {
    // check if equipment is used
    const isUsed = Object.values(state.unitMap).some((unit) => {
      if (unit.equipment) {
        return unit.equipment.some((e) => e.id === id);
      }
      return false;
    });
    if (isUsed) return false;
    update((s) => {
      delete s.equipmentMap[id];
    });
    return true;
  }

  function deletePersonnel(id: string): boolean {
    // check if personnel is used
    const isUsed = Object.values(state.unitMap).some((unit) => {
      if (unit.personnel) {
        return unit.personnel.some((e) => e.id === id);
      }
      return false;
    });
    if (isUsed) return false;
    update((s) => {
      delete s.personnelMap[id];
    });
    return true;
  }

  function deleteRangeRingGroup(id: string): boolean {
    // check if range ring group is used
    const isUsed = Object.values(state.unitMap).some((unit) => {
      if (unit.rangeRings) {
        return unit.rangeRings.some((e) => e.group === id);
      }
      return false;
    });
    if (isUsed) return false;
    update((s) => {
      delete s.rangeRingGroupMap[id];
    });
    return true;
  }

  function updatePersonnel(id: string, data: PersonnelDataUpdate) {
    update((s) => {
      const personnel = s.personnelMap[id];
      if (!personnel) return;
      Object.assign(personnel, data);
    });
  }

  function addPersonnel(data: Partial<NPersonnelData>, { noUndo = false } = {}) {
    const newPersonnel = { id: nanoid(), name: "Personnel", ...klona(data) };

    if (newPersonnel.id === undefined) {
      newPersonnel.id = nanoid();
    }
    const newId = newPersonnel.id;
    if (noUndo) {
      state.personnelMap[newId] = newPersonnel;
    } else {
      update((s) => {
        s.personnelMap[newId] = newPersonnel;
      });
    }
    return newId;
  }

  function updateUnitEquipment(
    unitId: EntityId,
    equipmentId: string,
    { count }: { count: number },
  ) {
    update((s) => {
      const unit = s.unitMap[unitId];
      if (!unit) return;
      if (count === -1) {
        unit.equipment = unit.equipment?.filter((e) => e.id !== equipmentId);
      } else {
        const equipment = unit.equipment?.find((e) => e.id === equipmentId);
        if (!equipment) {
          if (unit.equipment === undefined) unit.equipment = [];
          unit.equipment.push({ id: equipmentId, count });
        } else {
          Object.assign(equipment, { count });
        }
      }
    });
  }

  function updateUnitPersonnel(
    unitId: EntityId,
    personnelId: string,
    { count }: { count: number },
  ) {
    update((s) => {
      const unit = s.unitMap[unitId];
      if (!unit) return;
      if (count === -1) {
        unit.personnel = unit.personnel?.filter((e) => e.id !== personnelId);
      } else {
        const personnel = unit.personnel?.find((e) => e.id === personnelId);
        if (!personnel) {
          if (unit.personnel === undefined) unit.personnel = [];
          unit.personnel.push({ id: personnelId, count });
        } else {
          Object.assign(personnel, { count });
        }
      }
    });
  }

  return {
    addUnit,
    deleteUnit,
    changeUnitParent,
    walkSubUnits,
    walkSide,
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
    deleteUnitStateEntryByStateId,
    clearUnitState,
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
    updateRangeRing,
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
    updateUnitProperties,
  };
}
