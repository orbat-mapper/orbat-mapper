// @vitest-environment jsdom
/**
 * Capability gating on the draw sub-toolbar. The rule ADR-0006 asks for is *disabled,
 * not hidden*: on an engine without a tactical-draw surface the control-measure
 * affordances must still be there, because a missing button is indistinguishable from
 * a missing feature.
 */
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { computed, defineComponent, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MapEditorDrawToolbar from "@/modules/scenarioeditor/MapEditorDrawToolbar.vue";
import DrawToolSplitButton from "@/modules/scenarioeditor/DrawToolSplitButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { scenarioDrawKey } from "@/components/injects";
import type { ArmedTool } from "@/modules/scenarioeditor/useScenarioDraw";

// reka's Dialog teleports and has nothing to say about gating.
vi.mock("@/modules/scenarioeditor/ControlMeasurePickerDialog.vue", () => ({
  default: defineComponent({ name: "ControlMeasurePickerDialog", template: "<div />" }),
}));

// The selection actions have their own tests; here only when they join the row matters.
vi.mock("@/modules/scenarioeditor/DrawSelectionTools.vue", () => ({
  default: defineComponent({
    name: "DrawSelectionTools",
    template: '<div role="group" aria-label="Selection" />',
  }),
}));

function mountToolbar({
  canControlMeasures = true,
  armed = { kind: "none" } as ArmedTool,
  modifying = false,
} = {}) {
  // The control-measure pins and last-used kind live in localStorage.
  localStorage.clear();
  const pinia = createPinia();
  setActivePinia(pinia);
  const scenarioDraw = {
    startDrawing: vi.fn(),
    currentDrawType: computed(() => null),
    startModify: vi.fn(),
    isModifying: computed(() => modifying),
    cancel: vi.fn(),
    duplicateSelected: vi.fn(),
    deleteSelected: vi.fn(),
    snap: ref(true),
    translate: ref(false),
    freehand: ref(false),
    armed: shallowRef(armed),
    controlMeasureArmed: computed(
      () => armed.kind === "cmDraw" || armed.kind === "cmEdit",
    ),
    arm: vi.fn(),
    canControlMeasures: computed(() => canControlMeasures),
  };
  const wrapper = mount(MapEditorDrawToolbar, {
    global: {
      plugins: [pinia],
      provide: { [scenarioDrawKey as symbol]: scenarioDraw },
    },
  });
  return { wrapper, scenarioDraw, mainToolbarStore: useMainToolbarStore() };
}

function buttonByTitle(
  wrapper: ReturnType<typeof mountToolbar>["wrapper"],
  title: string,
) {
  return wrapper
    .findAll("button")
    .filter((button) => button.attributes("title") === title);
}

const NO_ENGINE_SUPPORT = "Control measures are not supported by this map engine";

describe("MapEditorDrawToolbar capability gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSelectedItems().clear();
  });

  it("adds the selection actions to the row only while they apply", async () => {
    const { wrapper, scenarioDraw } = mountToolbar();
    const selectionShown = () =>
      wrapper.find('[role="group"][aria-label="Selection"]').exists();
    expect(selectionShown()).toBe(false);

    useSelectedItems().selectedFeatureIds.value.add("feature-1");
    await wrapper.vm.$nextTick();
    expect(selectionShown()).toBe(true);

    // Move outlives the selection, so the group stays to turn it off.
    useSelectedItems().clear();
    scenarioDraw.translate.value = true;
    await wrapper.vm.$nextTick();
    expect(selectionShown()).toBe(true);
  });

  it("keeps the selection actions while Edit waits for a target", () => {
    const { wrapper } = mountToolbar({ modifying: true });
    expect(wrapper.find('[role="group"][aria-label="Selection"]').exists()).toBe(true);
  });

  it("renders the control-measure buttons disabled, not hidden, without a surface", () => {
    const { wrapper } = mountToolbar({ canControlMeasures: false });

    // Every pinned kind, the All button and the defaults popover trigger.
    const gated = wrapper
      .findAll("button")
      .filter((button) => button.attributes("title")?.startsWith(NO_ENGINE_SUPPORT));
    expect(gated.length).toBeGreaterThanOrEqual(3);
    for (const button of gated) expect(button.attributes("disabled")).toBeDefined();

    // The plain-shape split button is untouched by the gate ("Line" is its default).
    expect(buttonByTitle(wrapper, "Line")[0]!.attributes("disabled")).toBeUndefined();
  });

  it("enables them and names the kind once the engine has a surface", () => {
    const { wrapper, scenarioDraw } = mountToolbar({ canControlMeasures: true });

    const mainAttack = buttonByTitle(wrapper, "Main Attack");
    expect(mainAttack).toHaveLength(1);
    expect(mainAttack[0]!.attributes("disabled")).toBeUndefined();

    mainAttack[0]!.trigger("click");
    expect(scenarioDraw.arm).toHaveBeenCalledWith({
      kind: "cmDraw",
      graphicKind: "main-attack",
    });
  });

  // The split button only emits; the toolbar arms and remembers what it armed, so the
  // pill re-arms the same tool next time.
  it("arms and remembers the shape the draw split button picks", async () => {
    const { wrapper, scenarioDraw, mainToolbarStore } = mountToolbar();

    await wrapper.findComponent(DrawToolSplitButton).vm.$emit("select", "Circle");

    expect(scenarioDraw.startDrawing).toHaveBeenCalledWith("Circle");
    expect(mainToolbarStore.lastDrawType).toBe("Circle");
  });

  // Control measures lead: behind the shape tools they went unnoticed and users drew
  // plain lines instead.
  it("places the control measures before the plain drawing tools", () => {
    const { wrapper } = mountToolbar();
    const titles = wrapper.findAll("button").map((button) => button.attributes("title"));

    const controlMeasureIndex = titles.indexOf("Main Attack");
    const allIndex = titles.indexOf("Search all control measures");
    const shapeIndex = titles.indexOf("Line");
    const freehandIndex = titles.indexOf("Freehand");

    expect(controlMeasureIndex).toBeGreaterThan(-1);
    expect(allIndex).toBeGreaterThan(controlMeasureIndex);
    expect(shapeIndex).toBeGreaterThan(allIndex);
    expect(freehandIndex).toBeGreaterThan(shapeIndex);
  });

  it("captions each group of tools", () => {
    const { wrapper } = mountToolbar();
    const groups = wrapper
      .findAll('[role="group"]')
      .map((group) => group.attributes("aria-label"));

    expect(groups).toEqual(["Control measures", "Shapes", "Options"]);
  });

  it("opens the full catalog from the All button", async () => {
    const { wrapper } = mountToolbar();

    await buttonByTitle(wrapper, "Search all control measures")[0]!.trigger("click");

    expect(
      wrapper
        .findComponent({ name: "ControlMeasurePickerDialog" })
        .attributes("modelvalue"),
    ).toBe("true");
  });

  it("hides freehand while a control measure is armed", () => {
    const armed = { kind: "cmDraw", graphicKind: "phase-line" } as ArmedTool;
    const { wrapper } = mountToolbar({ armed });

    // Freehand has no counterpart in the library at all, so it goes away rather than
    // suggesting the concept exists.
    expect(buttonByTitle(wrapper, "Freehand")).toHaveLength(0);

    // Snap does mean something for a control measure and stays available.
    expect(
      buttonByTitle(wrapper, "Snap to grid")[0]!.attributes("disabled"),
    ).toBeUndefined();
  });

  it("offers one style button that follows the selection", () => {
    const { wrapper } = mountToolbar();
    // The popover switches between new and selected control measures itself.
    expect(buttonByTitle(wrapper, "Style for new control measures")).toHaveLength(1);
  });
});
