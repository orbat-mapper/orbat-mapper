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
  for (const { value, path, op } of patches) {
    applyPatch(state, [
      { value, op: toRfc6902Op(toRaw(state), op, path), path: `/${path.join("/")}` },
    ]);
  }
}

// rfc6902 refuses to "replace" an object key whose value is undefined, which would
// silently drop the update. "add" sets an object key the same way.
function toRfc6902Op(state: unknown, op: Patch["op"], path: Patch["path"]) {
  if (op !== "replace" || path.length === 0) return op;
  let parent = state;
  for (const key of path.slice(0, -1)) {
    parent = (parent as Record<string | number, unknown> | undefined)?.[key];
  }
  return Array.isArray(parent) ? op : "add";
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
  // Unlike `revision`, which undo moves back, this only grows with every change.
  let mutationCount = 0;

  function notifyMutation() {
    mutationCount++;
    mutationHook.trigger();
  }

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
    notifyMutation();
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
    notifyMutation();
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
    notifyMutation();
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
    getMutationCount: () => mutationCount,
    onUndoRedo: undoRedoHook.on,
    onMutation: mutationHook.on,
  };
}
