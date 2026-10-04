import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { nextTick, reactive } from "vue";
import RangeRingLayer from "@/modules/scenarioeditor/RangeRingLayer.vue";
import { activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";

function mountLayer() {
  const state = reactive({
    unitMap: {
      u1: {
        id: "u1",
        name: "Battery",
        rangeRings: [
          { name: "Guns", range: 20, uom: "km", group: "art" },
          { name: "Mortar", range: 5, uom: "km" },
        ],
      },
    },
    rangeRingGroupMap: { art: { id: "art", name: "Artillery" } },
    rangeRingVisibility: {},
  });
  const unitActions = {
    updateRangeRing: vi.fn(),
    updateRangeRingGroup: vi.fn(),
    updateRangeRingVisibility: vi.fn(),
    addRangeRingGroup: vi.fn(() => "new"),
  };
  const wrapper = mount(RangeRingLayer, {
    attachTo: document.body,
    global: {
      plugins: [createPinia()],
      provide: {
        [activeScenarioKey as symbol]: {
          geo: {
            rangeRingsLayer: {
              value: { id: "rangeRings", kind: "rangeRings", name: "Range rings" },
            },
          },
          store: { state },
          unitActions,
        },
      },
    },
  });
  const button = (title: string) => wrapper.findAll(`button[title="${title}"]`);
  const row = (text: string) =>
    wrapper.findAll("button").find((b) => b.text().startsWith(text))!;
  return { wrapper, state, unitActions, button, row };
}

describe("RangeRingLayer", () => {
  it("hides all rings and ungrouped rings through the scenario visibility", async () => {
    const { unitActions, button } = mountLayer();
    await button("Toggle all range rings")[0].trigger("click");
    await button("Toggle ungrouped rings")[0].trigger("click");
    expect(unitActions.updateRangeRingVisibility.mock.calls).toEqual([
      [{ hidden: true }],
      [{ ungroupedHidden: true }],
    ]);
  });

  it("hides a group through the group's own flag", async () => {
    const { unitActions, button } = mountLayer();
    await button("Toggle group visibility")[0].trigger("click");
    expect(unitActions.updateRangeRingGroup).toHaveBeenCalledWith("art", {
      hidden: true,
    });
  });

  it("lists a group's rings when opened and toggles a single ring", async () => {
    const { unitActions, button, row } = mountLayer();
    expect(button("Toggle ring visibility")).toHaveLength(0);

    await row("Artillery").trigger("click");
    await button("Toggle ring visibility")[0].trigger("click");
    expect(unitActions.updateRangeRing).toHaveBeenCalledWith("u1", 0, { hidden: true });
  });

  it("opens one shared style popover from a group row", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const { wrapper, button, unitActions } = mountLayer();
    expect(document.body.textContent).not.toContain("Set range ring style");
    await button("Change group style")[0].trigger("click");
    expect(document.body.textContent).toContain("Set range ring style");
    const input = document.body.querySelector<HTMLInputElement>("#group-name")!;
    expect(input.value).toBe("Artillery");
    input.value = "Guns";
    input.dispatchEvent(new Event("input"));
    await nextTick();
    input.dispatchEvent(new Event("change"));
    expect(unitActions.updateRangeRingGroup).toHaveBeenCalledWith("art", {
      name: "Guns",
    });
    wrapper.unmount();
    vi.unstubAllGlobals();
  });

  it("adds a group from the section header", async () => {
    const { wrapper, unitActions, button } = mountLayer();
    await button("Add range ring group")[0].trigger("click");
    await wrapper.find("input").setValue("SAM");
    await wrapper.find("form").trigger("submit");
    expect(unitActions.addRangeRingGroup).toHaveBeenCalledWith({ name: "SAM" });
  });

  it("selects the unit when a ring row is clicked", async () => {
    const { row } = mountLayer();
    await row("Ungrouped").trigger("click");
    await row("Battery").trigger("click");
    expect(useSelectedItems().activeUnitId.value).toBe("u1");
  });
});
