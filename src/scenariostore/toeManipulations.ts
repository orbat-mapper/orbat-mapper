import type { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import type {
  EquipmentDataUpdate,
  NEquipmentData,
  NPersonnelData,
  PersonnelDataUpdate,
} from "@/types/internalModels";
import { nanoid } from "@/utils";
import { klona } from "klona";
import type { EntityId } from "@/types/base";
import { updateCurrentUnitState } from "@/scenariostore/time";
import { removeUnusedUnitStateEntries } from "@/scenariostore/unitStateManipulations";

export function useToeManipulations(store: NewScenarioStore) {
  const { state, update, groupUpdate } = store;

  function updateUnitState(unitId: EntityId) {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    const timestamp = state.currentTime;
    updateCurrentUnitState(unit, timestamp, store);
    state.unitStateCounter++;
  }

  function updateEquipment(id: string, data: EquipmentDataUpdate) {
    update((s) => {
      const equipment = s.equipmentMap[id];
      if (!equipment) return;
      Object.assign(equipment, data);
    });
    state.settingsStateCounter++;
  }

  function addEquipment(
    data: Partial<NEquipmentData>,
    { noUndo = false, s = state } = {},
  ) {
    const newEquipment = { id: nanoid(), name: "Equipment", ...klona(data) };
    if (newEquipment.id === undefined) {
      newEquipment.id = nanoid();
    }
    const newId = newEquipment.id;
    if (noUndo) {
      s.equipmentMap[newId] = newEquipment;
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

  function addPersonnel(
    data: Partial<NPersonnelData>,
    { noUndo = false, s = state } = {},
  ) {
    const newPersonnel = { id: nanoid(), name: "Personnel", ...klona(data) };

    if (newPersonnel.id === undefined) {
      newPersonnel.id = nanoid();
    }
    const newId = newPersonnel.id;
    if (noUndo) {
      s.personnelMap[newId] = newPersonnel;
    } else {
      update((s) => {
        s.personnelMap[newId] = newPersonnel;
      });
    }
    return newPersonnel;
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

  function updatePersonnel(id: string, data: PersonnelDataUpdate) {
    update((s) => {
      const personnel = s.personnelMap[id];
      if (!personnel) return;
      Object.assign(personnel, data);
    });
  }

  function updateUnitEquipment(
    unitId: EntityId,
    equipmentId: string,
    { count, onHand }: { count: number; onHand?: number },
  ) {
    update((s) => {
      const unit = s.unitMap[unitId];
      if (!unit) return;
      if (count === -1) {
        unit.equipment = unit.equipment?.filter((e) => e.id !== equipmentId);
        unit.state = removeUnusedUnitStateEntries(unit);
      } else {
        const equipment = unit.equipment?.find((e) => e.id === equipmentId);
        if (!equipment) {
          if (unit.equipment === undefined) unit.equipment = [];
          unit.equipment.push({ id: equipmentId, count, onHand });
        } else {
          Object.assign(equipment, { count, onHand });
        }
      }
    });
    updateUnitState(unitId);
  }

  function updateUnitPersonnel(
    unitId: EntityId,
    personnelId: string,
    { count, onHand }: { count: number; onHand?: number },
  ) {
    update((s) => {
      const unit = s.unitMap[unitId];
      if (!unit) return;
      if (count === -1) {
        unit.personnel = unit.personnel?.filter((e) => e.id !== personnelId);
        unit.state = removeUnusedUnitStateEntries(unit);
      } else {
        const personnel = unit.personnel?.find((e) => e.id === personnelId);
        if (!personnel) {
          if (unit.personnel === undefined) unit.personnel = [];
          unit.personnel.push({ id: personnelId, count });
        } else {
          Object.assign(personnel, { count, onHand });
        }
      }
    });
    updateUnitState(unitId);
  }

  return {
    updateUnitPersonnel,
    updateEquipment,
    addEquipment,
    updatePersonnel,
    addPersonnel,
    deletePersonnel,
    deleteEquipment,
    updateUnitEquipment,
  };
}
