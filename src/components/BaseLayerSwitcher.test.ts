// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BaseLayerSwitcher from "@/components/BaseLayerSwitcher.vue";
import type { LayerInfo } from "@/components/LayersPanel.vue";

function baseRow(overrides: Partial<LayerInfo> = {}): LayerInfo {
  return {
    id: "world",
    name: "world",
    title: "World (local)",
    visible: true,
    zIndex: 0,
    opacity: 1,
    layerType: "baselayer",
    rowKind: "basemap",
    ...overrides,
  };
}

function pendingRow(overrides: Partial<LayerInfo> = {}): LayerInfo {
  return baseRow({
    id: "pending:world",
    name: "world",
    title: "world.pmtiles",
    visible: false,
    supportsOpacity: false,
    rowKind: "pending-archive",
    actionLabel: "Restore PMTiles archive",
    removable: true,
    ...overrides,
  });
}

function mountSwitcher(settings: LayerInfo[], modelValue?: LayerInfo) {
  return mount(BaseLayerSwitcher, {
    props: { settings, modelValue },
  });
}

describe("BaseLayerSwitcher", () => {
  it("renders no radio for a pending-archive row", () => {
    const wrapper = mountSwitcher([baseRow(), pendingRow()]);

    // One radio for the normal row, none for the pending row.
    expect(wrapper.findAll("button[role='radio']")).toHaveLength(1);
  });

  it("renders the action button of a pending row and emits activateLayer", async () => {
    const pending = pendingRow();
    const wrapper = mountSwitcher([baseRow(), pending]);

    const action = wrapper.get("[data-test='basemap-archive-activate']");
    expect(action.text()).toBe("Restore PMTiles archive");

    await action.trigger("click");

    expect(wrapper.emitted("activateLayer")?.[0]?.[0]).toMatchObject({
      id: "pending:world",
    });
  });

  it("renders no action button on a normal row", () => {
    const wrapper = mountSwitcher([baseRow()]);

    expect(wrapper.find("[data-test='basemap-archive-activate']").exists()).toBe(false);
  });

  it("emits removeLayer from the trash button of a removable row", async () => {
    const wrapper = mountSwitcher([baseRow({ removable: true })]);

    await wrapper.get("[data-test='basemap-archive-remove']").trigger("click");

    expect(wrapper.emitted("removeLayer")?.[0]?.[0]).toMatchObject({ id: "world" });
  });

  it("renders no trash button for a row that is not removable", () => {
    const wrapper = mountSwitcher([baseRow()]);

    expect(wrapper.find("[data-test='basemap-archive-remove']").exists()).toBe(false);
  });

  it("does not change the selected layer when the trash button is clicked", async () => {
    const rows = [baseRow(), baseRow({ id: "bright", name: "bright", title: "Bright" })];
    const wrapper = mountSwitcher([rows[0]!, { ...rows[1]!, removable: true }], rows[0]!);

    await wrapper.get("[data-test='basemap-archive-remove']").trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("hides the opacity control for 'None' and for rows that do not support it", () => {
    const none = mountSwitcher([baseRow({ id: "none", title: "None" })]);
    expect(none.findAll("button[title='Opacity']")).toHaveLength(0);

    const unsupported = mountSwitcher([baseRow({ supportsOpacity: false })]);
    expect(unsupported.findAll("button[title='Opacity']")).toHaveLength(0);

    const supported = mountSwitcher([baseRow({ supportsOpacity: true })]);
    expect(supported.findAll("button[title='Opacity']")).toHaveLength(1);
  });

  it("renders the flavour select for a row with a flavour", () => {
    const wrapper = mountSwitcher([baseRow({ flavor: "dark" })]);

    expect(wrapper.find("[data-test='basemap-flavor-select']").exists()).toBe(true);
  });

  it("renders two rows that share a title but not an id", () => {
    const wrapper = mountSwitcher([
      baseRow({ id: "a", name: "a" }),
      baseRow({ id: "b", name: "b" }),
    ]);

    expect(wrapper.findAll("button[role='radio']")).toHaveLength(2);
  });
});
