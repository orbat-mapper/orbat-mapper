import { ref } from "vue";
import { NewScenarioStore, useNewScenarioStore } from "./newScenarioStore";
import { useUnitManipulations } from "./unitManipulations";
import { useFetch } from "@vueuse/core";
import { Scenario } from "../types/scenarioModels";

let store: NewScenarioStore;
export const isLoaded = ref(false);
export const isLoading = ref(false);

export async function loadDemoScenario() {
  isLoading.value = true;
  const { data } = await useFetch("/scenarios/falkland82.json").get().json();
  store = useNewScenarioStore(data.value as Scenario);
  isLoading.value = false;
  isLoaded.value = true;
}

export function useScenario() {
  return {
    store,
    unitActions: useUnitManipulations(store),
  };
}
