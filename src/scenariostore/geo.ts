import { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { computed } from "vue";
import { State, Unit } from "@/types/scenarioModels";
import { Position } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";

export function useGeo(store: NewScenarioStore) {
  const { state, update } = store;

  const everyVisibleUnit = computed(() => {
    return Object.values(state.unitMap).filter((unit) => unit._state?.location);
  });

  function addUnitPosition(unitId: EntityId, coordinates: Position) {
    let newState: State | null = null;
    update((s) => {
      const u = s.getUnitById(unitId);
      const t = s.currentTime;
      newState = { t, location: coordinates };
      u._state = newState;
      if (!u.state) u.state = [];
      for (let i = 0, len = u.state.length; i < len; i++) {
        if (t < u.state[i].t) {
          u.state.splice(i, 0, newState);
          return;
        } else if (t === u.state[i].t) {
          u.state[i] = newState;
          return;
        }
      }
      u.state.push(newState);
    });
    // if (newState) unit._state = newState;
  }

  return { everyVisibleUnit, addUnitPosition };
}
