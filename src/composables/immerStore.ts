/**
 * A custom store based on https://github.com/Korijn/vue-store
 */
import { createEventHook } from "@vueuse/core";
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

export interface MetaEntry<T = string> {
  label: T;
  value: string | number;
}

interface UndoEntry<T = string> {
  patches: Patch[];
  inversePatches: Patch[];
  meta?: MetaEntry<T>;
  beforeRevision: number;
  afterRevision: number;
}

export function useImmerStore<T extends object, M>(baseState: T) {
  const state = reactive(baseState);

  const past = shallowReactive<UndoEntry<M>[]>([]);
  const future = shallowReactive<UndoEntry<M>[]>([]);
  const revision = shallowReactive({ value: 0 });
  let nextRevision = 1;

  const canUndo = computed(() => past.length > 0);
  const canRedo = computed(() => future.length > 0);

  const undoRedoHook = createEventHook<{
    patch: Patch[];
    meta?: MetaEntry<M>;
    action: "undo" | "redo";
  }>();
  const mutationHook = createEventHook<void>();

  const update = (
    updater: (currentState: T) => void,
    meta?: MetaEntry<M>,
    force = false,
  ) => {
    const [, patches, inversePatches] = produceWithPatches(toRaw(state), updater);
    if (patches.length === 0 && !force) return;
    applyPatchWrapper(state, patches);
    const beforeRevision = revision.value;
    const afterRevision = nextRevision++;
    revision.value = afterRevision;
    past.push({ patches, inversePatches, meta, beforeRevision, afterRevision });
    future.splice(0);
    mutationHook.trigger();
  };

  function groupUpdate(updates: () => void, meta?: MetaEntry<M>) {
    const preLength = past.length;
    updates();
    const diff = past.length - preLength;
    if (diff <= 0) return;
    const elems: UndoEntry<M>[] = [];
    for (let i = 0; i < diff; i++) elems.push(past.pop()!);
    elems.reverse();
    const mergedPatches: Patch[] = [];
    const mergedInversePatches: Patch[] = [];
    elems.forEach(({ patches, inversePatches }) => {
      mergedPatches.push(...patches);
    });
    for (let i = elems.length - 1; i >= 0; i--) {
      mergedInversePatches.push(...elems[i].inversePatches);
    }
    past.push({
      patches: mergedPatches,
      inversePatches: mergedInversePatches,
      meta,
      beforeRevision: elems[0].beforeRevision,
      afterRevision: elems[elems.length - 1].afterRevision,
    });
  }

  const undo = () => {
    if (!canUndo.value) return false;
    const { patches, inversePatches, meta, beforeRevision, afterRevision } = past.pop()!;
    applyPatchWrapper(state, inversePatches);
    revision.value = beforeRevision;
    future.unshift({ patches, inversePatches, meta, beforeRevision, afterRevision });
    undoRedoHook.trigger({ patch: inversePatches, meta, action: "undo" });
    mutationHook.trigger();
    return true;
  };

  const redo = () => {
    if (!canRedo.value) return false;
    const { patches, inversePatches, meta, beforeRevision, afterRevision } =
      future.shift()!;
    applyPatchWrapper(state, patches);
    revision.value = afterRevision;
    past.push({ patches, inversePatches, meta, beforeRevision, afterRevision });
    undoRedoHook.trigger({ patch: patches, meta, action: "redo" });
    mutationHook.trigger();
    return true;
  };

  const clearUndoRedoStack = () => {
    past.splice(0);
    future.splice(0);
  };

  const setRevision = (value: number) => {
    revision.value = value;
    nextRevision = Math.max(nextRevision, value + 1);
  };

  return {
    state,
    update,
    redo,
    undo,
    clearUndoRedoStack,
    canRedo,
    canUndo,
    revision,
    setRevision,
    groupUpdate,
    onUndoRedo: undoRedoHook.on,
    onMutation: mutationHook.on,
  };
}
