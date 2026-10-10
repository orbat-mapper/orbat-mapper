// @vitest-environment jsdom
/**
 * The draw toolbar's selection actions. The toolbar decides when the group shows; the
 * group decides which actions apply: all of them with a selection, and only the mode
 * that is still on without one.
 */
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DrawSelectionTools from "@/modules/scenarioeditor/DrawSelectionTools.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import { scenarioDrawKey } from "@/components/injects";
import type { ArmedTool } from "@/modules/scenarioeditor/useScenarioDraw";

vi.mock("@/components/ui/button", () => ({
  // Listeners fall through to the native button; re-emitting would double-fire.
  Button: {
    name: "Button",
    props: ["disabled"],
    template: '<button :disabled="disabled"><slot /></button>',
  },
}));

function mountTools({
  selected = [] as string[],
  modifying = false,
  translate = false,
  armed = { kind: "none" } as ArmedTool,
} = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  useSelectedItems().selectedFeatureIds.value = new Set(selected);
  const scenarioDraw = {
    startModify: vi.fn(),
    isModifying: computed(() => modifying),
    translate: ref(translate),
    armed: shallowRef(armed),
    controlMeasureArmed: computed(
      () => armed.kind === "cmDraw" || armed.kind === "cmEdit",
    ),
    duplicateSelected: vi.fn(),
    deleteSelected: vi.fn(),
    canControlMeasures: computed(() => true),
  };
  const wrapper = mount(DrawSelectionTools, {
    global: {
      plugins: [pinia],
      provide: { [scenarioDrawKey as symbol]: scenarioDraw },
    },
  });
  return { wrapper, scenarioDraw };
}

function titles(wrapper: ReturnType<typeof mountTools>["wrapper"]) {
  return wrapper.findAll("button").map((button) => button.attributes("title"));
}

function buttonByTitle(wrapper: ReturnType<typeof mountTools>["wrapper"], title: string) {
  const hits = wrapper
    .findAll("button")
    .filter((button) => button.attributes("title") === title);
  expect(hits).toHaveLength(1);
  return hits[0]!;
}

describe("DrawSelectionTools", () => {
  beforeEach(() => vi.clearAllMocks());

  it("offers every action on a selection, under a Selection caption", () => {
    const { wrapper } = mountTools({ selected: ["line-1"] });

    expect(wrapper.find('[role="group"]').attributes("aria-label")).toBe("Selection");
    expect(titles(wrapper)).toEqual([
      "Edit the selected item",
      "Move selected items",
      "Duplicate selected",
      "Delete selected",
    ]);
  });

  it("runs the actions on the selection", async () => {
    const { wrapper, scenarioDraw } = mountTools({ selected: ["line-1"] });

    await buttonByTitle(wrapper, "Edit the selected item").trigger("click");
    await buttonByTitle(wrapper, "Move selected items").trigger("click");
    await buttonByTitle(wrapper, "Duplicate selected").trigger("click");
    await buttonByTitle(wrapper, "Delete selected").trigger("click");

    expect(scenarioDraw.startModify).toHaveBeenCalledOnce();
    expect(scenarioDraw.translate.value).toBe(true);
    expect(scenarioDraw.duplicateSelected).toHaveBeenCalledOnce();
    expect(scenarioDraw.deleteSelected).toHaveBeenCalledOnce();
  });

  it("keeps only the mode that is still on without a selection", () => {
    expect(titles(mountTools({ modifying: true }).wrapper)).toEqual([
      "Edit: select an item to edit",
    ]);
    expect(titles(mountTools({ translate: true }).wrapper)).toEqual([
      "Move: select items to drag",
    ]);
  });

  it("disables Move while a control measure session is open", () => {
    const armed = { kind: "cmEdit", featureId: "cm-1" } as ArmedTool;
    const { wrapper } = mountTools({ selected: ["cm-1"], armed });

    const move = buttonByTitle(
      wrapper,
      "Moving is not available for control measures yet",
    );
    expect(move.attributes("disabled")).toBeDefined();
  });
});
