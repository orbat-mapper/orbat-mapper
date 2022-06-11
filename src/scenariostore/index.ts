import { ref } from "vue";
import { NewScenarioStore } from "./newScenarioStore";
import { useUnitManipulations } from "./unitManipulations";
import { useScenarioIO } from "./io";
import { useScenarioTime } from "./time";

let storage = {
  store: null,
} as { store: NewScenarioStore | null };

export const isLoaded = ref(false);
export const isLoading = ref(false);

export function useIO() {
  return useScenarioIO(storage);
}

export async function loadDemoScenario() {
  const io = useIO();
  isLoading.value = true;
  await io.loadDemoScenario("falkland82");
  isLoading.value = false;
  isLoaded.value = true;
}

export function useScenario() {
  const { store } = storage;
  return {
    store,
    unitActions: useUnitManipulations(store!),
    time: useScenarioTime(store!),
  };
}
