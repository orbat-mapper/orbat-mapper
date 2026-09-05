import { shallowRef } from "vue";
import { klona } from "klona";
import type { NewScenarioStore, ScenarioState } from "@/scenariostore/newScenarioStore";

// Scoped to the active store, so closing and reopening the importer retains recovery.
const checkpoints = new WeakMap<NewScenarioStore, ReturnType<typeof createCheckpoint>>();

function createCheckpoint(store: NewScenarioStore) {
  const snapshot = shallowRef<ScenarioState>();
  return {
    snapshot,
    capture() {
      snapshot.value = klona(store.state);
    },
    restore() {
      if (!snapshot.value) return false;
      const restored = klona(snapshot.value);
      store.restoreState(restored);
      snapshot.value = undefined;
      return true;
    },
  };
}

export function useImportCheckpoint(store: NewScenarioStore) {
  let checkpoint = checkpoints.get(store);
  if (!checkpoint) {
    checkpoint = createCheckpoint(store);
    checkpoints.set(store, checkpoint);
  }
  return checkpoint;
}
