import { computed, ref, shallowRef, UnwrapRef } from "vue";
import { NewScenarioStore } from "./newScenarioStore";
import { useUnitManipulations } from "./unitManipulations";
import { useScenarioIO } from "./io";
import { useScenarioTime } from "./time";

const nstore = shallowRef<NewScenarioStore>({} as any);

export const isLoaded = ref(false);
export const isLoading = ref(false);

export function useIO() {
  return useScenarioIO(nstore);
}

export function useScenario() {
  return {
    scenario: computed(() => {
      return {
        store: nstore.value,
        unitActions: useUnitManipulations(nstore.value!),
        time: useScenarioTime(nstore.value!),
        io: useIO(),
      };
    }),
    isLoading,
    isReady: computed(() => !!nstore.value.state),
  };
}

export type TScenario = UnwrapRef<ReturnType<typeof useScenario>>["scenario"];
