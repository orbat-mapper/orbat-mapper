import { mount, flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { shallowRef } from "vue";
import { klona } from "klona";
import ScenarioImportContribution from "./ScenarioImportContribution.vue";
import FieldSelect from "./FieldSelect.vue";
import DataGrid from "@/modules/grid/DataGrid.vue";
import { FlexRender } from "@tanstack/vue-table";
import ToggleField from "./ToggleField.vue";
import { activeScenarioKey } from "./injects";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioIO } from "@/scenariostore/io";
import { useScenarioTime } from "@/scenariostore/time";
import { loadControlMeasureScenarioFixture } from "@/testdata/controlMeasureScenario";
import "@/dayjs";

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({ send: vi.fn() }),
}));
vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));
vi.mock("@/stores/timeFormatStore", () => ({
  useTimeFormatStore: () => ({
    trackFormatter: { format: (t: number) => new Date(t).toISOString() },
  }),
}));
function setup(withOmittedUnit = false, withUnchangedUnit = false) {
  const data = loadControlMeasureScenarioFixture();
  data.sides = [
    {
      id: "blue",
      name: "Blue",
      standardIdentity: "3",
      groups: [
        {
          id: "own",
          name: "Own",
          subUnits: [{ id: "reserve", name: "Reserve", sidc: "10031000001211000000" }],
        },
      ],
    },
  ];
  if (withUnchangedUnit)
    data.sides[0].groups[0].subUnits.push({
      id: "same",
      name: "Unchanged",
      sidc: "10031000001211000000",
    });
  if (withOmittedUnit)
    data.sides[0].groups[0].subUnits.push({
      id: "omitted",
      name: "Other unit",
      sidc: "10031000001211000000",
    });
  const store = useNewScenarioStore(klona(data));
  if (withOmittedUnit) data.sides[0].groups[0].subUnits.pop();
  data.sides[0].groups[0].subUnits[0].location = [10, 20];
  const io = useScenarioIO(shallowRef(store));
  const wrapper = mount(ScenarioImportContribution, {
    props: { data, mode: "group" },
    global: {
      provide: {
        [activeScenarioKey as symbol]: { store, io, time: useScenarioTime(store) },
      },
    },
  });
  const select = async (label: string, value: string) => {
    wrapper
      .findAllComponents(FieldSelect)
      .find((c) => c.props("label") === label)!
      .vm.$emit("update:modelValue", value);
    await flushPromises();
  };
  return { wrapper, store, select, io };
}
describe("scenario import controls", () => {
  it("selects the first group and previews without modifying the scenario", async () => {
    const { wrapper, store } = setup();
    const original = klona(store.state);
    await flushPromises();
    expect(
      wrapper
        .findAllComponents(FieldSelect)
        .find((c) => c.props("label") === "Group")!
        .props("modelValue"),
    ).toBe("own");
    expect(wrapper.getComponent(DataGrid).props("data")[0].id).toBe("reserve");
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "Update Blue / Own",
    );
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "1 unit updated, 0 added, 0 left unchanged.",
    );
    expect(wrapper.text()).toContain("Location added.");
    expect(wrapper.get("article details").attributes("open")).toBeUndefined();
    expect(wrapper.get("article details summary").text()).toBe("Advanced details");
    expect(store.state).toEqual(original);
    wrapper.unmount();
    expect(store.state).toEqual(original);
  });
  it("defaults on import-type changes and handles files with no groups", async () => {
    const { wrapper } = setup();
    await wrapper.setProps({ mode: "side" });
    expect(
      wrapper
        .findAllComponents(FieldSelect)
        .find((c) => c.props("label") === "Side")!
        .props("modelValue"),
    ).toBe("blue");
    await wrapper.setProps({ mode: "group" });
    expect(
      wrapper
        .findAllComponents(FieldSelect)
        .find((c) => c.props("label") === "Group")!
        .props("modelValue"),
    ).toBe("own");
    const data = klona(wrapper.props("data"));
    data.sides[0].groups = [];
    await wrapper.setProps({ data });
    expect(wrapper.findComponent(DataGrid).exists()).toBe(false);
    expect(
      wrapper
        .findAll("button")
        .find((b) => b.text() === "Import")!
        .attributes("disabled"),
    ).toBeDefined();
  });
  it("distinguishes units kept by updates from replacement removals in the summary", async () => {
    const { wrapper, select } = setup(true);
    await select("Group", "own");
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "1 unit updated, 0 added, 1 left unchanged.",
    );
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "1 unit is not included",
    );
    await select("Action", "replace");
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "Replace Blue / Own",
    );
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain("1 removed");
    expect(wrapper.text()).toContain("Removed unit: Other unit");
  });
  it("selects units in the table and keeps the review collapsed", async () => {
    const { wrapper, select } = setup();
    await select("Group", "own");
    const grid = wrapper.getComponent(DataGrid);
    expect(grid.props("select")).toBe(true);
    expect(grid.props("data")[0].id).toBe("reserve");
    const review = wrapper
      .findAll("details")
      .find((d) => d.find("summary").text() === "Review changes")!;
    expect(review.attributes("open")).toBeUndefined();
    grid.vm.$emit("update:selected", []);
    await flushPromises();
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "0 units updated, 0 added, 1 left unchanged.",
    );
    expect(
      wrapper
        .findAll("button")
        .find((b) => b.text() === "Import")!
        .attributes("disabled"),
    ).toBeDefined();
    await select("Action", "replace");
    expect(grid.props("select")).toBe(false);
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "1 unit updated",
    );
  });
  it("shows live change descriptions in the table column", async () => {
    const { wrapper, select } = setup(false, true);
    await flushPromises();
    const grid = wrapper.getComponent(DataGrid);
    const column = grid.props("columns").find((c) => c && c.id === "changes");
    if (!column) throw new Error("Changes column missing");
    const changed = mount(FlexRender, {
      props: { render: column.cell, props: { row: { original: grid.props("data")[0] } } },
    });
    const unchanged = mount(FlexRender, {
      props: { render: column.cell, props: { row: { original: grid.props("data")[1] } } },
    });
    try {
      expect(changed.text()).toBe("Location added.");
      expect(changed.get("span").attributes("title")).toBe("Location added.");
      expect(unchanged.text()).toBe("No changes");
      await select("Content to import", "state-only");
      expect(changed.text()).toBe("No changes");
      await select("Content to import", "units-and-state");
      await select("Action", "copy");
      expect(changed.text()).toBe("Added as a separate copy");
      grid.vm.$emit("update:selected", []);
      await flushPromises();
      expect(changed.text()).toBe("Not selected");
    } finally {
      changed.unmount();
      unchanged.unmount();
      wrapper.unmount();
    }
  });
  it("filters changed entries without altering selections or reserializing the scenario", async () => {
    const { wrapper, select, io } = setup(false, true);
    await select("Group", "own");
    const grid = wrapper.getComponent(DataGrid);
    const originalData = grid.props("data");
    const summary = wrapper.get('[aria-label="Import summary"]').text();
    const serialize = vi.spyOn(io, "serializeToObject");
    expect(grid.props("rowFilter")).toBeUndefined();
    wrapper.getComponent(ToggleField).vm.$emit("update:modelValue", true);
    await flushPromises();
    expect(grid.props("rowFilter")!(originalData[0])).toBe(true);
    expect(grid.props("rowFilter")!(originalData[1])).toBe(false);
    expect(grid.props("data")).toBe(originalData);
    expect(wrapper.get('[aria-label="Import summary"]').text()).toBe(summary);
    wrapper.getComponent(ToggleField).vm.$emit("update:modelValue", false);
    await flushPromises();
    expect(grid.props("rowFilter")).toBeUndefined();
    expect(wrapper.get('[aria-label="Import summary"]').text()).toBe(summary);
    expect(serialize).not.toHaveBeenCalled();
  });
  it("keeps differing entries visible when they are not selected", async () => {
    const { wrapper } = setup(false, true);
    await flushPromises();
    const grid = wrapper.getComponent(DataGrid);
    await grid.get('thead input[type="checkbox"]').setValue(false);
    await flushPromises();
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "0 units updated",
    );
    await wrapper.get('[role="switch"]').trigger("click");
    await flushPromises();
    expect(wrapper.text()).not.toContain("No matching entries.");
    expect(grid.props("rowFilter")!(grid.props("data")[0])).toBe(true);
    expect(grid.props("rowFilter")!(grid.props("data")[1])).toBe(false);
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "0 units updated",
    );
    await grid.get('thead input[type="checkbox"]').setValue(true);
    await flushPromises();
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "1 unit updated",
    );
    await grid.get('thead input[type="checkbox"]').setValue(false);
    await flushPromises();
    expect(wrapper.text()).not.toContain("No matching entries.");
    expect(wrapper.get('[aria-label="Import summary"]').text()).toContain(
      "0 units updated",
    );
  });
  it("keeps actual changes visible across repeated toggles and scope changes", async () => {
    const { wrapper, select } = setup(false, true);
    await flushPromises();
    for (const mode of ["group", "side", "group"] as const) {
      await wrapper.setProps({ mode });
      for (const action of ["update", "replace", "copy"]) {
        await select("Action", action);
        for (let i = 0; i < 4; i++) {
          await wrapper.get('[role="switch"]').trigger("click");
          await flushPromises();
          expect(wrapper.get('[aria-label="Import summary"]').text()).toMatch(
            /1 unit updated|2 added/,
          );
          expect(wrapper.text()).not.toContain("No matching entries.");
        }
      }
    }
  });
  it("uses the chosen content mode and includes copies despite their new IDs", async () => {
    const { wrapper, select } = setup(false, true);
    await select("Group", "own");
    wrapper.getComponent(ToggleField).vm.$emit("update:modelValue", true);
    await select("Content to import", "state-only");
    const grid = wrapper.getComponent(DataGrid);
    expect(grid.props("data").some(grid.props("rowFilter")!)).toBe(false);
    expect(wrapper.text()).toContain("No matching entries.");
    await select("Content to import", "units-and-state");
    await select("Action", "copy");
    expect(grid.props("data").every(grid.props("rowFilter")!)).toBe(true);
  });
  it("places options in the sidebar and import actions in the header", async () => {
    const options = document.createElement("div"),
      actions = document.createElement("div");
    document.body.append(options, actions);
    const { wrapper } = setup();
    try {
      await wrapper.setProps({ optionsTarget: options, actionsTarget: actions });
      expect(options.textContent).toContain("Content to import");
      expect(actions.textContent).toContain("Import");
      expect(wrapper.text()).not.toContain("Content to import");
      expect(wrapper.findAll("button").some((b) => b.text() === "Import")).toBe(false);
    } finally {
      wrapper.unmount();
      options.remove();
      actions.remove();
    }
  });
  it("applies the reviewed update as a single undoable action", async () => {
    const { wrapper, store, select } = setup();
    const original = klona(store.state);
    await select("Group", "own");
    await wrapper
      .findAll("button")
      .find((b) => b.text() === "Import")!
      .trigger("click");
    await flushPromises();
    expect(store.state.unitMap.reserve.location).toEqual([10, 20]);
    expect(wrapper.emitted("applied")).toHaveLength(1);
    expect(wrapper.text()).toContain("No content changes.");
    expect(store.undo()).toBe(true);
    expect(store.canUndo.value).toBe(false);
    // Reprojection increments render counters; authored and hierarchy data restore.
    expect(store.state.unitMap).toEqual(original.unitMap);
    expect(store.state.sideGroupMap).toEqual(original.sideGroupMap);
    expect(store.state.layerStackMap).toEqual(original.layerStackMap);
    expect(store.state.currentTime).toBe(original.currentTime);
  });
});
