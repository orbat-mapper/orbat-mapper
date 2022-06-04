import { useImmerStore } from "../composables/immerStore";
import { Scenario, Side, SideGroup, Unit } from "../types/scenarioModels";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { walkSide } from "./scenarioStore";
import { klona } from "klona";
import { EntityId } from "../types/base";

export interface NUnit extends Omit<Unit, "subUnits"> {
  subUnits: EntityId[];
}

export interface NSide extends Omit<Side, "groups"> {
  groups: EntityId[];
}

export interface NSideGroup extends Omit<SideGroup, "units"> {
  units: EntityId[];
}

export interface NOrbatItemData {
  unit: NUnit;
  children: NOrbatItemData[];
}

export type WalkSubUnitIdCallback = (unit: NUnit) => void;

function prepareScenario(scenario: Scenario) {
  const unitMap: Record<EntityId, NUnit> = {};
  const sideMap: Record<EntityId, NSide> = {};
  const sideGroupMap: Record<EntityId, NSideGroup> = {};

  function prepareUnit(unit1: Unit, level: number, parent: Unit | SideGroup) {
    const unit = klona(unit1);
    if (!unit.state) {
      unit.state = [];
    } else {
      unit.state = unit.state.map((e) => ({ ...e, t: +dayjs(e.t) }));
    }
    unit._state = null;
    if (!unit.id) {
      unit.id = nanoid();
    }

    unit._pid = parent.id;
    unit._isOpen = false;
    unitMap[unit1.id] = { ...unit, subUnits: unit.subUnits?.map((u) => u.id) || [] };
  }

  scenario.sides.forEach((side) => {
    sideMap[side.id] = { ...side, groups: side.groups.map((group) => group.id) };
    side.groups.forEach((group) => {
      sideGroupMap[group.id] = {
        ...group,
        _pid: side.id,
        units: group.units.map((unit) => unit.id),
      };
    });
    walkSide(side, prepareUnit);
  });

  return { scenario, unitMap, sideMap, sideGroupMap };
}

export function useNewScenarioStore(data: Scenario) {
  const { unitMap, sideMap, sideGroupMap } = prepareScenario(data);
  const store = useImmerStore({ sideMap, sideGroupMap, unitMap });

  const { state, update } = store;

  const deleteUnit = (id: string) => {
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
  };

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
  return { store, deleteUnit, walkSubUnits };
}

export interface IdUnit {
  id: EntityId;
  subUnits: IdUnit[];
}
