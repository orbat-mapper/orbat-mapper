/**
 * Undo/redo as the armed-tool owner sees them.
 *
 * ADR-0006 makes the owner the sole owner of Ctrl+Z, but "the owner owns undo" is a
 * statement about the *action*, not about the keyboard: the main toolbar's Undo button
 * and the main menu's Undo item invoke the same action with a click. Wiring only the
 * key bindings would leave those two calling scenario undo straight through an open
 * session — aborting a draft and undoing an unrelated scenario action, or committing an
 * edit and then undoing whatever came before it instead of driving `SessionHistory`.
 *
 * So every entry point resolves through here. The owner is reached through the holder
 * `ScenarioEditor` provides (see `scenarioKeyboardOwnerKey`), which is `null` on
 * OpenLayers and before the map view mounts — in which case this is plain scenario
 * undo/redo.
 */
import { computed, inject } from "vue";
import type { ComputedRef } from "vue";
import { scenarioKeyboardOwnerKey } from "@/components/injects";
import type { TScenario } from "@/scenariostore";

export interface OwnedUndoRedo {
  undo(): void;
  redo(): void;
  canUndo: ComputedRef<boolean>;
  canRedo: ComputedRef<boolean>;
}

export function useOwnedUndoRedo(scenario: TScenario): OwnedUndoRedo {
  const owner = inject(scenarioKeyboardOwnerKey, null);
  const {
    undo: scenarioUndo,
    redo: scenarioRedo,
    canUndo: scenarioCanUndo,
    canRedo: scenarioCanRedo,
  } = scenario.store;

  // No event to pass: `handleUndoKey` returning true means it took the action, which
  // is exactly what a click needs to know. `stopPropagation` is a no-op without one.
  return {
    undo() {
      if (owner?.value?.handleUndoKey()) return;
      scenarioUndo();
    },
    redo() {
      if (owner?.value?.handleRedoKey()) return;
      scenarioRedo();
    },
    canUndo: computed(
      () => owner?.value?.ownedUndoState()?.canUndo ?? scenarioCanUndo.value,
    ),
    canRedo: computed(
      () => owner?.value?.ownedUndoState()?.canRedo ?? scenarioCanRedo.value,
    ),
  };
}
