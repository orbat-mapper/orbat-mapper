import { type NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { type EntityId } from "@/types/base";

export function useStateHelpers(store: NewScenarioStore) {
  const { state } = store;
  function getUnitById(id: EntityId) {
    return state.unitMap[id];
  }
  function getSideById(id: EntityId) {
    return state.sideMap[id];
  }

  function getSideGroupById(id: EntityId) {
    return state.sideGroupMap[id];
  }

  return {
    getUnitById,
    getSideById,
    getSideGroupById,
  };
}
