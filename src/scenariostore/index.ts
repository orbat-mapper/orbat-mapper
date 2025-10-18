import { computed, ref, shallowRef, type UnwrapRef } from "vue";
import type { NewScenarioStore } from "./newScenarioStore";
import { useUnitManipulations } from "./unitManipulations";
import { useScenarioIO } from "./io";
import { useScenarioTime } from "./time";
import { useGeo } from "@/scenariostore/geo";
import { useStateHelpers } from "@/scenariostore/helpers";
import { useScenarioSettings } from "@/scenariostore/settingsManipulations.ts";

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
        helpers: useStateHelpers(globalStoreRef.value),
        settings: useScenarioSettings(globalStoreRef.value),
      };
    }),
    isLoading,
    isReady: computed(() => !!globalStoreRef.value.state),
  };
}

export type TScenario = UnwrapRef<ReturnType<typeof useScenario>>["scenario"];
export type TGeo = ReturnType<typeof useGeo>;
