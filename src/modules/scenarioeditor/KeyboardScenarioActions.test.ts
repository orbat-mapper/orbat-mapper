// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import {
  activeScenarioKey,
  mapOrbitKey,
  routeDetailsPanelKey,
  searchActionsKey,
} from "@/components/injects";
import KeyboardScenarioActions from "@/modules/scenarioeditor/KeyboardScenarioActions.vue";
import { useSelectedItems } from "@/stores/selectedStore";

vi.mock("@/stores/dragStore", () => ({
  useActiveUnitStore: () => ({ clearActiveUnit: vi.fn() }),
}));

vi.mock("@/composables/scenarioActions", () => ({
  useScenarioFeatureActions: () => ({ onFeatureAction: vi.fn() }),
  useUnitActions: () => ({ onUnitAction: vi.fn() }),
}));

describe("KeyboardScenarioActions", () => {
  enableAutoUnmount(afterEach);

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function mountActions(orbitHandleEscape: () => boolean) {
    const routeHandleEscape = vi.fn(() => false);
    mount(KeyboardScenarioActions, {
      global: {
        provide: {
          [activeScenarioKey as symbol]: {
            unitActions: {},
            store: { state: {} },
            helpers: { getUnitById: vi.fn() },
          },
          [searchActionsKey as symbol]: { onUnitSelectHook: { trigger: vi.fn() } },
          [mapOrbitKey as symbol]: { handleEscape: orbitHandleEscape },
          [routeDetailsPanelKey as symbol]: { handleEscape: routeHandleEscape },
        },
      },
    });
    return { routeHandleEscape };
  }

  const pressEscape = () =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );

  it("lets a running orbit take Escape before the selection is cleared", () => {
    const { selectedUnitIds } = useSelectedItems();
    selectedUnitIds.value.add("unit-1");
    const { routeHandleEscape } = mountActions(() => true);

    pressEscape();

    expect(selectedUnitIds.value.has("unit-1")).toBe(true);
    expect(routeHandleEscape).not.toHaveBeenCalled();
  });

  it("clears the selection when no orbit is running", () => {
    const { selectedUnitIds } = useSelectedItems();
    selectedUnitIds.value.add("unit-1");
    mountActions(() => false);

    pressEscape();

    expect(selectedUnitIds.value.size).toBe(0);
  });
});
