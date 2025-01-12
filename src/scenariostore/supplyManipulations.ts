import { NewScenarioStore, ScenarioState } from "@/scenariostore/newScenarioStore";
import {
  NSupplyCategory,
  SupplyCategoryUpdate,
  SupplyClassUpdate,
  SupplyUomUpdate,
} from "@/types/internalModels";
import { nanoid } from "@/utils";
import { klona } from "klona";
import { EntityId } from "@/types/base";
import { updateCurrentUnitState } from "@/scenariostore/time";
import { removeUnusedUnitStateEntries } from "@/scenariostore/unitStateManipulations";

export function useSupplyManipulations(store: NewScenarioStore) {
  const { state, update } = store;

  function updateUnitState(unitId: EntityId) {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    const timestamp = state.currentTime;
    updateCurrentUnitState(unit, timestamp);
    state.unitStateCounter++;
  }

  function addSupplyClass(data: Partial<SupplyClassUpdate>) {
    const newSupplyClass = { id: nanoid(), name: "Supply Class", ...klona(data) };
    if (newSupplyClass.id === undefined) {
      newSupplyClass.id = nanoid();
    }
    const newId = newSupplyClass.id;
    update((s) => {
      s.supplyClassMap[newId] = newSupplyClass;
    });
    return newId;
  }

  function updateSupplyClass(id: string, data: SupplyClassUpdate) {
    update((s) => {
      const supplyClass = s.supplyClassMap[id];
      if (!supplyClass) return;
      Object.assign(supplyClass, data);
    });
    state.settingsStateCounter++;
  }

  function addSupplyCategory(
    data: Partial<NSupplyCategory>,
    { noUndo = false, s = state } = {},
  ) {
    const newSupplyCategory = { id: nanoid(), name: "Supply", ...klona(data) };
    if (newSupplyCategory.id === undefined) {
      newSupplyCategory.id = nanoid();
    }
    const newId = newSupplyCategory.id;
    if (noUndo) {
      s.supplyCategoryMap[newId] = newSupplyCategory;
    } else {
      update((s) => {
        s.supplyCategoryMap[newId] = newSupplyCategory;
      });
    }
    return newSupplyCategory;
  }

  function updateSupplyCategory(id: string, data: SupplyCategoryUpdate) {
    update((s) => {
      const supplyCategory = s.supplyCategoryMap[id];
      if (!supplyCategory) return;
      Object.assign(supplyCategory, data);
    });
    state.settingsStateCounter++;
  }

  function deleteSupplyClass(id: string): boolean {
    // check if supply class is used
    const isUsed = Object.values(state.supplyCategoryMap).some(
      (sc) => sc.supplyClass === id,
    );
    if (isUsed) return false;
    update((s) => {
      delete s.supplyClassMap[id];
    });
    return true;
  }

  function deleteSupplyCategory(id: string): boolean {
    // check if supply category is used
    const isUsed = Object.values(state.unitMap).some((unit) =>
      unit.supplies?.some((e) => e.id === id),
    );

    if (isUsed) return false;
    update((s) => {
      delete s.supplyCategoryMap[id];
    });
    return true;
  }

  function updateUnitSupply(
    unitId: EntityId,
    supplyId: string,
    { count, onHand }: { count: number; onHand?: number },
  ) {
    update((s) => {
      const unit = s.unitMap[unitId];
      if (!unit) return;
      if (count === -1) {
        unit.supplies = unit.supplies?.filter((e) => e.id !== supplyId);
        unit.state = removeUnusedUnitStateEntries(unit);
      } else {
        const supply = unit.supplies?.find((e) => e.id === supplyId);
        if (!supply) {
          if (unit.supplies === undefined) unit.supplies = [];
          unit.supplies.push({ id: supplyId, count, onHand });
        } else {
          Object.assign(supply, { count, onHand });
        }
      }
    });
    updateUnitState(unitId);
  }

  function addSupplyUom(data: Partial<SupplyUomUpdate>) {
    const newSupplyUom = { id: nanoid(), name: "Supply UoM", ...klona(data) };
    if (newSupplyUom.id === undefined) {
      newSupplyUom.id = nanoid();
    }
    const newId = newSupplyUom.id;
    update((s) => {
      s.supplyUomMap[newId] = newSupplyUom;
    });
    return newId;
  }

  function updateSupplyUom(id: string, data: SupplyUomUpdate) {
    update((s) => {
      const supplyUom = s.supplyUomMap[id];
      if (!supplyUom) return;
      Object.assign(supplyUom, data);
    });
    state.settingsStateCounter++;
  }

  function deleteSupplyUom(id: string): boolean {
    // check if supply uom is used
    const isUsed = Object.values(state.supplyCategoryMap).some((sc) => sc.uom === id);
    if (isUsed) return false;
    update((s) => {
      delete s.supplyUomMap[id];
    });
    return true;
  }

  return {
    addSupplyCategory,
    deleteSupplyCategory,
    updateSupplyCategory,

    addSupplyClass,
    deleteSupplyClass,
    updateSupplyClass,

    addSupplyUom,
    updateSupplyUom,
    deleteSupplyUom,

    updateUnitSupply,
  };
}

export function getUom(supply: NSupplyCategory, state: ScenarioState) {
  const uomId = supply.uom ?? "";
  if (!uomId) return "";
  const uom = state.supplyUomMap[uomId];
  return uom?.code ?? uom?.name ?? "";
}

export function getSupplyClass(supply: NSupplyCategory, state: ScenarioState) {
  const classId = supply.supplyClass ?? "";
  if (!classId) return "";
  const supplyClass = state.supplyClassMap[classId];
  return supplyClass?.name ?? "";
}
