/**
 * A custom store based on https://github.com/Korijn/vue-store
 */

import { computed, reactive, readonly, shallowReactive, toRaw } from "vue";
import type { Patch } from "immer";
import { produceWithPatches, enablePatches, setAutoFreeze } from "immer";
import { applyPatch } from "rfc6902";
enablePatches();
setAutoFreeze(false);
function applyPatchWrapper<T>(state: T, patches: Patch[]) {
  const convertedPatches = patches.map(({ value, path, op }) => {
    return { value, op, path: `/${path.join("/")}` };
  });
  applyPatch(state, convertedPatches);
}

interface UndoEntry {
  patches: Patch[];
  inversePatches: Patch[];
}

export function useImmerStore<T extends object>(baseState: T) {
  const state = reactive(baseState);

  const past = shallowReactive<UndoEntry[]>([]);
  const future = shallowReactive<UndoEntry[]>([]);

  const canUndo = computed(() => past.length > 0);
  const canRedo = computed(() => future.length > 0);
  const update = (updater: (currentState: T) => void) => {
    const [, patches, inversePatches] = produceWithPatches(toRaw(state), updater);
    applyPatchWrapper(state, patches);
    // update history
    past.push({ patches, inversePatches });
    future.splice(0);
  };

  const undo = () => {
    console.log("Undo");
    if (!canUndo.value) return false;
    const { patches, inversePatches } = past.pop()!;
    applyPatchWrapper(state, inversePatches);
    future.unshift({ patches, inversePatches });
    return true;
  };
  const redo = () => {
    if (!canRedo.value) return false;
    const { patches, inversePatches } = future.shift()!;
    applyPatchWrapper(state, patches);
    past.push({ patches, inversePatches });
    return true;
  };

  return {
    state,
    update,
    redo,
    undo,
    canRedo,
    canUndo,
  };
}
