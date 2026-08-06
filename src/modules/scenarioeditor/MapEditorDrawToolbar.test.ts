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
  const pinia = createPinia();
  setActivePinia(pinia);
  const scenarioDraw = {
    startDrawing: vi.fn(),
    currentDrawType: computed(() => null),
    startModify: vi.fn(),
    isModifying: computed(() => false),
    cancel: vi.fn(),
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
  return { wrapper, scenarioDraw };
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
  beforeEach(() => vi.clearAllMocks());

  it("renders the control-measure buttons disabled, not hidden, without a surface", () => {
    const { wrapper } = mountToolbar({ canControlMeasures: false });

    // Four pinned kinds, the picker button and the defaults popover trigger.
    const gated = wrapper
      .findAll("button")
      .filter((button) => button.attributes("title")?.startsWith(NO_ENGINE_SUPPORT));
    expect(gated.length).toBeGreaterThanOrEqual(6);
    for (const button of gated) expect(button.attributes("disabled")).toBeDefined();

    // The plain-shape tools are untouched by the gate.
    expect(buttonByTitle(wrapper, "Polygon")[0]!.attributes("disabled")).toBeUndefined();
  });

  it("enables them and names the kind once the engine has a surface", () => {
    const { wrapper, scenarioDraw } = mountToolbar({ canControlMeasures: true });

    const phaseLine = buttonByTitle(wrapper, "Phase line");
    expect(phaseLine).toHaveLength(1);
    expect(phaseLine[0]!.attributes("disabled")).toBeUndefined();

    phaseLine[0]!.trigger("click");
    expect(scenarioDraw.arm).toHaveBeenCalledWith({
      kind: "cmDraw",
      graphicKind: "phase-line",
    });
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
