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

function mountToolbar({
  canControlMeasures = true,
  armed = { kind: "none" } as ArmedTool,
} = {}) {
  // The control-measure pins and last-used kind live in localStorage.
  localStorage.clear();
  const pinia = createPinia();
  setActivePinia(pinia);
  const scenarioDraw = {
    startDrawing: vi.fn(),
    currentDrawType: computed(() => null),
    startModify: vi.fn(),
    isModifying: computed(() => false),
    cancel: vi.fn(),
    duplicateSelected: vi.fn(),
    deleteSelected: vi.fn(),
    snap: ref(true),
    translate: ref(false),
    freehand: ref(false),
    armed: shallowRef(armed),
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

  it("duplicates the current selection from the draw toolbar", async () => {
    const { wrapper, scenarioDraw } = mountToolbar();
    useSelectedItems().selectedFeatureIds.value.add("feature-1");
    await wrapper.vm.$nextTick();

    await buttonByTitle(wrapper, "Duplicate selected")[0]!.trigger("click");

    expect(scenarioDraw.duplicateSelected).toHaveBeenCalledOnce();
  });

  it("renders the control-measure buttons disabled, not hidden, without a surface", () => {
    const { wrapper } = mountToolbar({ canControlMeasures: false });

    // Both halves of the control-measure split button and the defaults popover trigger.
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

  // Both split buttons only emit; the toolbar arms and remembers what it armed, so the
  // pill re-arms the same tool next time — one convention for both tool families.
  it("arms and remembers the shape the draw split button picks", async () => {
    const { wrapper, scenarioDraw, mainToolbarStore } = mountToolbar();

    await wrapper.findComponent(DrawToolSplitButton).vm.$emit("select", "Circle");

    expect(scenarioDraw.startDrawing).toHaveBeenCalledWith("Circle");
    expect(mainToolbarStore.lastDrawType).toBe("Circle");
  });

  it("places Freehand with the plain drawing tools", () => {
    const { wrapper } = mountToolbar();
    const buttons = wrapper.findAll("button");
    const freehandIndex = buttons.findIndex(
      (button) => button.attributes("title") === "Freehand",
    );
    const controlMeasureIndex = buttons.findIndex(
      (button) => button.attributes("title") === "Main Attack",
    );

    expect(freehandIndex).toBeGreaterThan(-1);
    expect(freehandIndex).toBeLessThan(controlMeasureIndex);
  });

  it("hides freehand and disables translate while a control measure is armed", () => {
    const armed = { kind: "cmDraw", graphicKind: "phase-line" } as ArmedTool;
    const { wrapper } = mountToolbar({ armed });

    // Freehand has no counterpart in the library at all, so it goes away rather than
    // suggesting the concept exists; translate is stage-two work, so it is disabled.
    expect(buttonByTitle(wrapper, "Freehand")).toHaveLength(0);
    const translate = buttonByTitle(
      wrapper,
      "Translate is not available for control measures yet",
    );
    expect(translate).toHaveLength(1);
    expect(translate[0]!.attributes("disabled")).toBeDefined();

    // Snap does mean something for a control measure and stays available.
    expect(
      buttonByTitle(wrapper, "Snap to grid")[0]!.attributes("disabled"),
    ).toBeUndefined();
  });
});
