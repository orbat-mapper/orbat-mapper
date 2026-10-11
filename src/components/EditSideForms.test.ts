// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { type Component, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import EditSideForm from "@/components/EditSideForm.vue";
import EditSideGroupForm from "@/components/EditSideGroupForm.vue";
import { activeScenarioKey } from "@/components/injects";

const FillColorPicker = defineComponent({
  emits: ["update:fillColor", "update:modelValue"],
  setup(_, { emit }) {
    return () =>
      h("button", {
        type: "button",
        class: "pick-color",
        onClick: () => {
          emit("update:fillColor", "#123456");
          emit("update:modelValue", "#123456");
        },
      });
  },
});

function makeScenario() {
  const side = { id: "s1", name: "Blue", standardIdentity: "3", groups: ["g1"] };
  const group = { id: "g1", _pid: "s1", name: "Group 1", subUnits: [] };
  return {
    store: { state: { sideMap: { s1: side }, sideGroupMap: { g1: group } } },
    unitActions: { updateSide: vi.fn(), updateSideGroup: vi.fn() },
    helpers: { getSideById: () => side },
    settings: { addColorIfAbsent: vi.fn() },
  };
}

async function pickColorAndSave(component: Component, props: Record<string, string>) {
  const scenario = makeScenario();
  const wrapper = mount(component, {
    props,
    global: {
      provide: { [activeScenarioKey as symbol]: scenario },
      stubs: {
        InlineFormPanel: { template: "<div><slot /></div>" },
        StandardIdentitySelect: FillColorPicker,
        SymbolFillColorSelect: FillColorPicker,
      },
    },
  });
  await wrapper.find(".pick-color").trigger("click");
  await wrapper.find("form").trigger("submit");
  return scenario;
}

describe("side and group edit forms", () => {
  it("adds a new side fill color to the scenario's color list", async () => {
    const scenario = await pickColorAndSave(EditSideForm, { sideId: "s1" });

    expect(scenario.unitActions.updateSide).toHaveBeenCalledWith(
      "s1",
      expect.objectContaining({ symbolOptions: { fillColor: "#123456" } }),
    );
    expect(scenario.settings.addColorIfAbsent).toHaveBeenCalledWith("#123456");
  });

  it("adds a new group fill color to the scenario's color list", async () => {
    const scenario = await pickColorAndSave(EditSideGroupForm, { sideGroupId: "g1" });

    expect(scenario.unitActions.updateSideGroup).toHaveBeenCalledWith(
      "g1",
      expect.objectContaining({ symbolOptions: { fillColor: "#123456" } }),
    );
    expect(scenario.settings.addColorIfAbsent).toHaveBeenCalledWith("#123456");
  });
});
