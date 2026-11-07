// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import LayerItemTreeSelect, {
  type LayerItemTreeLayer,
} from "@/modules/scenarioeditor/LayerItemTreeSelect.vue";

const layers = [
  {
    id: "land",
    name: "Land control measures",
    items: [
      { id: "flot", kind: "tacticalGraphic", name: "FLOT NORTHAG" },
      { id: "boundary", kind: "tacticalGraphic", name: "Boundary NORTHAG / CENTAG" },
    ],
  },
  {
    id: "border",
    name: "Inner German border",
    items: [
      {
        id: "igb",
        kind: "geometry",
        name: "",
        geometryMeta: { geometryKind: "LineString" },
      },
    ],
  },
] as unknown as LayerItemTreeLayer[];

function mountSelect(modelValue: string | null = null) {
  return mount(LayerItemTreeSelect, {
    props: { layers, modelValue, placeholder: "Add feature…" },
    global: {
      stubs: {
        Popover: { template: "<div><slot /></div>" },
        PopoverTrigger: { template: "<div><slot /></div>" },
        PopoverContent: { template: "<div><slot /></div>" },
      },
    },
  });
}

const itemRows = (wrapper: ReturnType<typeof mountSelect>) =>
  wrapper
    .findAll("button")
    .filter((b) => b.classes().includes("min-h-8"))
    .map((b) => b.text());

describe("LayerItemTreeSelect", () => {
  it("lists items under their layers, labelling unnamed ones by kind", () => {
    const wrapper = mountSelect();
    expect(wrapper.text()).toContain("Land control measures");
    expect(itemRows(wrapper)).toEqual([
      "FLOT NORTHAG",
      "Boundary NORTHAG / CENTAG",
      "LineString",
    ]);
  });

  it("filters by item name, or by layer name for the whole layer", async () => {
    const wrapper = mountSelect();
    const filter = wrapper.find("input[type='search']");

    await filter.setValue("flot");
    expect(itemRows(wrapper)).toEqual(["FLOT NORTHAG"]);
    expect(wrapper.text()).not.toContain("Inner German border");

    await filter.setValue("inner german");
    expect(itemRows(wrapper)).toEqual(["LineString"]);

    await filter.setValue("nothing like this");
    expect(wrapper.text()).toContain("No features found.");
  });

  it("collapses a layer", async () => {
    const wrapper = mountSelect();
    const header = wrapper
      .findAll("button")
      .find((b) => b.text() === "Land control measures");
    await header!.trigger("click");
    expect(itemRows(wrapper)).toEqual(["LineString"]);
  });

  it("selects an item and shows it on the button", async () => {
    const wrapper = mountSelect();
    const row = wrapper.findAll("button").find((b) => b.text() === "FLOT NORTHAG");
    await row!.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([["flot"]]);

    const selected = mountSelect("boundary");
    expect(selected.find("button").text()).toBe("Boundary NORTHAG / CENTAG");
    expect(mountSelect().find("button").text()).toBe("Add feature…");
  });
});
