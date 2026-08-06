// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import ControlMeasureDefaultsPopover from "@/modules/scenarioeditor/ControlMeasureDefaultsPopover.vue";
import ControlMeasureStyleSettings from "@/modules/scenarioeditor/ControlMeasureStyleSettings.vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { activeScenarioKey, scenarioDrawKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import type { NTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";

vi.mock("@/components/ui/popover", () => ({
  Popover: defineComponent({ template: "<div><slot /></div>" }),
  PopoverTrigger: defineComponent({ template: "<div><slot /></div>" }),
  PopoverContent: defineComponent({ template: "<div><slot /></div>" }),
}));

vi.mock("@/modules/scenarioeditor/ControlMeasureColorPicker.vue", () => ({
  default: defineComponent({
    name: "ControlMeasureColorPicker",
    props: { modelValue: { type: String, default: "" } },
    emits: ["update:modelValue"],
    template: "<div />",
  }),
}));

function item(
  id: string,
  graphicKind: NTacticalGraphicLayerItem["graphicKind"],
  style: NTacticalGraphicLayerItem["style"] = {},
): NTacticalGraphicLayerItem {
  return {
    kind: "tacticalGraphic",
    id,
    _pid: "layer-1",
    graphicKind,
    controlPoints: [],
    style,
  };
}

function mountPopover(items: NTacticalGraphicLayerItem[]) {
  const byId = new Map(items.map((value) => [value.id, value]));
  const updateControlMeasure = vi.fn();
  const groupUpdate = vi.fn((action: () => void) => action());
  const wrapper = mount(ControlMeasureDefaultsPopover, {
    global: {
      plugins: [createPinia()],
      provide: {
        [activeScenarioKey as symbol]: {
          geo: {
            getLayerItemById: (id: string) => ({ layerItem: byId.get(id) }),
          },
          store: { groupUpdate },
        },
        [scenarioDrawKey as symbol]: { updateControlMeasure },
      },
    },
  });
  return { wrapper, updateControlMeasure, groupUpdate };
}

describe("ControlMeasureDefaultsPopover", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    useSelectedItems().clear();
  });

  it("edits defaults for the currently chosen kind without a selection", async () => {
    const { wrapper, updateControlMeasure } = mountPopover([]);
    const store = useControlMeasureToolStore();
    store.lastKind = "phase-line";
    await nextTick();

    const settings = wrapper.findComponent(ControlMeasureStyleSettings);
    expect(settings.props("graphicKind")).toBe("phase-line");
    expect(settings.props("editingDefaults")).toBe(true);

    settings.vm.$emit("update", { status: "planned" });
    await nextTick();
    expect(store.defaults.status).toBe("planned");
    expect(updateControlMeasure).not.toHaveBeenCalled();

    settings.vm.$emit("update", { options: { smooth: true } });
    await nextTick();
    expect(store.defaults.options).toEqual({ smooth: true });
  });

  it("applies settings to the selected control measure instead of defaults", async () => {
    const selected = item("cm-1", "polygon", { color: "#112233" });
    const { wrapper, updateControlMeasure } = mountPopover([selected]);
    useSelectedItems().selectedFeatureIds.value = new Set([selected.id]);
    await nextTick();

    const settings = wrapper.findComponent(ControlMeasureStyleSettings);
    expect(settings.props("graphicKind")).toBe("polygon");
    expect(settings.props("editingDefaults")).toBe(false);
    expect(wrapper.text()).toContain("Selected control measure");

    settings.vm.$emit("update", { style: { color: "#ff0000" } });
    expect(updateControlMeasure).toHaveBeenCalledWith("cm-1", {
      style: { color: "#ff0000" },
    });
    expect(useControlMeasureToolStore().defaults.style).toEqual({ color: "#ff0000" });
  });

  it("shows the echelon selector in the palette for echelon-bearing measures", async () => {
    const selected = item("cm-1", "boundary", undefined);
    const { wrapper, updateControlMeasure } = mountPopover([selected]);
    useSelectedItems().selectedFeatureIds.value = new Set([selected.id]);
    await nextTick();

    const select = wrapper.findComponent(SymbolCodeSelect);
    expect(select.props("label")).toBe("Echelon");
    expect(select.classes()).toContain("col-span-2");
    expect(
      (select.props("items") as { code: string; sidc: string }[]).find(
        (item) => item.code === "brigade",
      )?.sidc,
    ).toBe("10031000180000000000");
    select.vm.$emit("update:modelValue", "brigade");
    await nextTick();

    expect(updateControlMeasure).toHaveBeenCalledWith("cm-1", {
      options: { echelon: "brigade" },
    });
  });

  it("preserves unrelated styling when changing a multi-selection", async () => {
    const first = item("cm-1", "polygon", {
      color: "#112233",
      strokeWidth: 2,
    });
    const second = item("cm-2", "polygon", {
      color: "#445566",
      strokeWidth: 5,
    });
    const { wrapper, updateControlMeasure, groupUpdate } = mountPopover([first, second]);
    useSelectedItems().selectedFeatureIds.value = new Set([first.id, second.id]);
    await nextTick();

    wrapper.findComponent(ControlMeasureStyleSettings).vm.$emit("update", {
      style: { color: "#ff0000", strokeWidth: 2 },
    });

    expect(groupUpdate).toHaveBeenCalledOnce();
    expect(updateControlMeasure).toHaveBeenNthCalledWith(1, "cm-1", {
      style: { color: "#ff0000", strokeWidth: 2 },
    });
    expect(updateControlMeasure).toHaveBeenNthCalledWith(2, "cm-2", {
      style: { color: "#ff0000", strokeWidth: 5 },
    });
  });
});
