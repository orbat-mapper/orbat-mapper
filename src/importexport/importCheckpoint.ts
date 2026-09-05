import { shallowRef, toRaw } from "vue";
import { klona } from "klona";
import type { NewScenarioStore, ScenarioState } from "@/scenariostore/newScenarioStore";

// Scoped to the active store, so closing and reopening the importer retains recovery.
const checkpoints = new WeakMap<NewScenarioStore, ReturnType<typeof createCheckpoint>>();

function createCheckpoint(store: NewScenarioStore) {
  const snapshot = shallowRef<ScenarioState>();
  return {
    snapshot,
    capture() {
      // Clone the raw state: going through the reactive proxy would instantiate
      // proxies for the whole scenario tree just to read it.
      snapshot.value = klona(toRaw(store.state));
    },
    restore() {
      const snapshotted = snapshot.value;
      if (!snapshotted) return false;
      // The snapshot is dropped here, so the restored state cannot alias it.
      snapshot.value = undefined;
      store.restoreState(snapshotted);
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
