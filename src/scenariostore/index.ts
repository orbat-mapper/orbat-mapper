import { computed, ref, shallowRef, UnwrapRef } from "vue";
import { NewScenarioStore } from "./newScenarioStore";
import { useUnitManipulations } from "./unitManipulations";
import { useScenarioIO } from "./io";
import { useScenarioTime } from "./time";
import { useGeo } from "@/scenariostore/geo";

const globalStoreRef = shallowRef<NewScenarioStore>({} as any);

export const isLoading = ref(false);

// Todo: add store ref as parameter in case we want to load multiple scenarios.
export function useScenario() {
  return {
    scenario: computed(() => {
      return {
        store: globalStoreRef.value,
        unitActions: useUnitManipulations(globalStoreRef.value),
        time: useScenarioTime(globalStoreRef.value),
        io: useScenarioIO(globalStoreRef),
        geo: useGeo(globalStoreRef.value),
      };
    }),
    isLoading,
    isReady: computed(() => !!globalStoreRef.value.state),
  };
}

export type TScenario = UnwrapRef<ReturnType<typeof useScenario>>["scenario"];
export type TGeo = ReturnType<typeof useGeo>;
