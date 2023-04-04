import { EntityId, HistoryAction } from "@/types/base";
import { NewScenarioStore, ScenarioState } from "./newScenarioStore";
import { moveElement, nanoid, removeElement } from "@/utils";
import {
  NSide,
  NSideGroup,
  NUnit,
  NUnitAdd,
  SideGroupUpdate,
  SideUpdate,
  UnitUpdate,
} from "@/types/internalModels";
import { CloneTarget, DropTarget } from "@/components/types";
import { SID_INDEX, Sidc } from "@/symbology/sidc";
import { setCharAt } from "@/components/helpers";
import { SID } from "@/symbology/values";
import { klona } from "klona";
import { createInitialState } from "@/scenariostore/time";
import { computed } from "vue";
import type { State, StateAdd, Unit, UnitSymbolOptions } from "@/types/scenarioModels";
import { Position } from "@/types/scenarioGeoModels";
import { getNextEchelonBelow } from "@/symbology/helpers";

export type NWalkSubUnitCallback = (unit: NUnit) => void;

export type NWalkSideCallback = (
  unit: NUnit,
  level: number,
  parent: NUnit | NSideGroup,
  sideGroup: NSideGroup,
  side: NSide
) => void | false | true;

export type NWalkSideGroupCallback = (
  unit: NUnit,
  level: number,
  parent: NUnit | NSideGroup,
  sideGroup: NSideGroup,
  side?: NSide
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
    { markAsNew } = { markAsNew: true }
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
      { label: "addSide", value: newSide.id }
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

  function reorderSideGroup(sideGroupId: EntityId, direction: "up" | "down") {
    const sideGroup = state.sideGroupMap[sideGroupId];
    const sideId = sideGroup?._pid;
    if (!sideGroup || !sideId) return;

    update((s) => {
      const parent = s.sideMap[sideId];
      if (parent) moveElement(parent.groups, sideGroupId, direction === "up" ? -1 : 1);
    });
  }

  function reorderSide(sideIdId: EntityId, direction: "up" | "down") {
    update((s) => {
      moveElement(s.sides, sideIdId, direction === "up" ? -1 : 1);
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

  function addUnit(newUnit: NUnitAdd, parentId: EntityId, index?: number): EntityId {
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
    const newUnitId = addUnit(newUnit, parentId);
    parent._isOpen = true;
    return newUnitId;
  }

  function cloneUnit(
    unitId: EntityId,
    { target = "below", includeSubordinates = false }: Partial<CloneUnitOptions> = {}
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
      { label: "addUnitPosition", value: unitId }
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
      { label: "addUnitPosition", value: unitId }
    );
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
    data: Position
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
      { label: "addUnitPosition", value: unitId }
    );
  }

  function expandUnit(unit: NUnit): Unit {
    return {
      ...unit,
      subUnits: unit.subUnits.map((subUnitId) => expandUnit(state.unitMap[subUnitId])),
    };
  }

  function expandUnitWithSymbolOptions(unit: NUnit): Unit {
    return {
      ...unit,
      symbolOptions: getCombinedSymbolOptions(unit),
      subUnits: unit.subUnits.map((subUnitId) =>
        expandUnitWithSymbolOptions(state.unitMap[subUnitId])
      ),
    };
  }

  function getCombinedSymbolOptions(unit: NUnit, ignoreUnit = false): UnitSymbolOptions {
    const { _sid, _gid } = unit;

    return {
      ...(state.sideMap[_sid!].symbolOptions || {}),
      ...(state.sideGroupMap[_gid!].symbolOptions || {}),
      ...(ignoreUnit ? {} : unit.symbolOptions || {}),
    };
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
    units: computed(() => Object.values(state.unitMap)),
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
    reorderSideGroup,
    getCombinedSymbolOptions,
    expandUnitWithSymbolOptions,
  };
}
