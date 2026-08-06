// @vitest-environment jsdom
/**
 * Undo/redo routed through the armed-tool owner.
 *
 * The keyboard bindings were guarded first, which left the main toolbar's Undo button
 * and the main menu's Undo item calling scenario undo straight through an open session.
 * These assert the button path lands where Ctrl+Z lands.
 */
import { mount } from "@vue/test-utils";
import { defineComponent, shallowRef } from "vue";
import { describe, expect, it, vi } from "vitest";
import { scenarioKeyboardOwnerKey } from "@/components/injects";
import type { ScenarioKeyboardOwner } from "@/modules/scenarioeditor/useScenarioDraw";
import { useOwnedUndoRedo } from "@/modules/scenarioeditor/useOwnedUndoRedo";

function setup(owner: Partial<ScenarioKeyboardOwner> | null) {
  const scenarioUndo = vi.fn();
  const scenarioRedo = vi.fn();
  const scenario = {
    store: {
      undo: scenarioUndo,
      redo: scenarioRedo,
      canUndo: shallowRef(true),
      canRedo: shallowRef(true),
    },
  } as any;

  const exposed = {} as ReturnType<typeof useOwnedUndoRedo>;
  mount(
    defineComponent({
      setup() {
        Object.assign(exposed, useOwnedUndoRedo(scenario));
        return {};
      },
      template: "<div />",
    }),
    {
      global: {
        provide: {
          [scenarioKeyboardOwnerKey as symbol]: shallowRef(
            owner
              ? ({
                  handleEscape: () => false,
                  handleEnter: () => false,
                  handleUndoKey: () => false,
                  handleRedoKey: () => false,
                  ownedUndoState: () => null,
                  ...owner,
                } as ScenarioKeyboardOwner)
              : null,
          ),
        },
      },
    },
  );
  return { ...exposed, scenarioUndo, scenarioRedo };
}

describe("useOwnedUndoRedo", () => {
  it("falls through to scenario undo when nothing is armed", () => {
    const { undo, redo, canUndo, scenarioUndo, scenarioRedo } = setup(null);

    undo();
    redo();

    expect(scenarioUndo).toHaveBeenCalledTimes(1);
    expect(scenarioRedo).toHaveBeenCalledTimes(1);
    expect(canUndo.value).toBe(true);
  });

  // The button has to be as swallowed as the key: during a draw there is only abort,
  // and a click reaching scenario undo would undo an unrelated earlier action.
  it("does not reach scenario undo while the owner claims the action", () => {
    const { undo, canUndo, canRedo, scenarioUndo } = setup({
      handleUndoKey: () => true,
      ownedUndoState: () => ({ canUndo: false, canRedo: false }),
    });

    undo();

    expect(scenarioUndo).not.toHaveBeenCalled();
    expect(canUndo.value).toBe(false);
    expect(canRedo.value).toBe(false);
  });

  // The mirror case: an edit session's own history is available even when the scenario
  // has nothing to undo, so the button must not be disabled by scenario state.
  it("reports the owner's availability rather than the scenario's", () => {
    const { canUndo, canRedo } = setup({
      ownedUndoState: () => ({ canUndo: true, canRedo: false }),
    });

    expect(canUndo.value).toBe(true);
    expect(canRedo.value).toBe(false);
  });
});
