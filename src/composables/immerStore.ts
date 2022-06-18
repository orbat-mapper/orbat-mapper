/**
 * A custom store based on https://github.com/Korijn/vue-store
 */

import { computed, reactive, shallowReactive, toRaw } from "vue";
import type { Patch } from "immer";
import { enablePatches, produceWithPatches, setAutoFreeze } from "immer";
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
    if (patches.length === 0) return;
    applyPatchWrapper(state, patches);
    past.push({ patches, inversePatches });
    future.splice(0);
  };

  function groupUpdate(updates: () => void) {
    const preLength = past.length;
    updates();
    const diff = past.length - preLength;
    if (diff <= 0) return;
    let elems: UndoEntry[] = [];
    for (let i = 0; i < diff; i++) elems.push(past.pop()!);
    elems.reverse();
    let mergedPatches: Patch[] = [];
    let mergedInversePatches: Patch[] = [];
    elems.forEach(({ patches, inversePatches }) => {
      mergedPatches.push(...patches);
      mergedInversePatches.push(...inversePatches);
    });
    past.push({ patches: mergedPatches, inversePatches: mergedInversePatches });
  }

  const undo = () => {
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
    groupUpdate,
  };
}
