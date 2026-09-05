// @vitest-environment jsdom
import { defineComponent, reactive } from "vue";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import ExportSettingsOrbatMapper from "@/components/ExportSettingsOrbatMapper.vue";
import { activeScenarioKey } from "@/components/injects";
import type { OrbatMapperExportSettings } from "@/types/importExport";

const InputCheckboxStub = defineComponent({
  name: "InputCheckbox",
  props: ["label", "description", "value", "modelValue"],
  template: "<div />",
});

function mountSettings(form: OrbatMapperExportSettings, scenarioId = "scenario-a") {
  const state = {
    id: scenarioId,
    info: { name: "Source scenario" },
    sides: ["empty"],
    sideMap: { empty: { id: "empty", name: "Empty side", groups: [] } },
    sideGroupMap: {},
    layerStack: ["features", "control-measures"],
    layerStackMap: {
      features: { id: "features", kind: "overlay", name: "Features", items: [] },
      "control-measures": {
        id: "control-measures",
        kind: "overlay",
        name: "Control measures",
        specialization: "controlMeasure",
        items: [],
      },
    },
  };

  return mount(ExportSettingsOrbatMapper, {
    props: {
      modelValue: form,
      "onUpdate:modelValue": (value) => Object.assign(form, value),
    },
    global: {
      provide: {
        [activeScenarioKey as symbol]: {
          store: { state },
          io: {
            toObject: () => ({
              id: scenarioId,
              name: "Source scenario",
              sides: Object.values(state.sideMap),
              layerStack: Object.values(state.layerStackMap),
              description: "Controller briefing",
              events: [],
            }),
          },
        },
      },
      stubs: {
        InputCheckbox: InputCheckboxStub,
        FieldSelect: defineComponent({
          props: ["items", "modelValue"],
          emits: ["update:modelValue"],
          template: `<select :value="modelValue" @change="$emit('update:modelValue', $event.target.value || null)">
            <option v-for="item in items" :key="item.value" :value="item.value ?? ''">{{ item.label }}</option>
          </select>`,
        }),
        InputGroupTemplate: { template: "<section><slot /></section>" },
        InputGroup: true,
      },
    },
  });
}

function form(layerIds?: string[]): OrbatMapperExportSettings {
  return reactive({
    sideGroups: [],
    layerIds,
    customColors: true,
    fileName: "scenario.json",
  });
}

describe("ExportSettingsOrbatMapper", () => {
  beforeEach(() => localStorage.clear());

  it("updates suggested names until each field is edited", async () => {
    const settings = form(["features"]);
    const wrapper = mountSettings(settings);
    expect(settings.scenarioName).toBe("Source scenario — Layers");
    expect(settings.fileName).toBe("source-scenario-layers.json");
    const input = (label: string) =>
      wrapper
        .findAllComponents({ name: "InputGroup" })
        .find((c) => c.attributes("label") === label)!;
    input("Scenario name").vm.$emit("update:modelValue", "Custom briefing");
    settings.emptySideIds = ["empty"];
    await wrapper.vm.$nextTick();
    expect(settings.scenarioName).toBe("Custom briefing");
    expect(settings.fileName).toBe("source-scenario-empty-side.json");
    input("Name of downloaded file").vm.$emit("update:modelValue", "briefing.json");
    settings.emptySideIds = [];
    await wrapper.vm.$nextTick();
    expect(settings.fileName).toBe("briefing.json");
  });

  it("preserves preset names after selections change", async () => {
    localStorage.setItem(
      "orbatmapper:export-presets:scenario-a",
      JSON.stringify([
        {
          id: "blue",
          name: "Blue",
          sideGroups: [],
          layerIds: ["features"],
          scenarioName: "Turn 3",
          fileName: "turn-3.json",
        },
      ]),
    );
    const settings = form([]);
    const wrapper = mountSettings(settings);
    await wrapper.find("select").setValue("blue");
    settings.emptySideIds = ["empty"];
    await wrapper.vm.$nextTick();
    expect(settings.scenarioName).toBe("Turn 3");
    expect(settings.fileName).toBe("turn-3.json");
  });

  it("selects an empty side, previews it, and restores it from a preset", async () => {
    const settings = form([]);
    const wrapper = mountSettings(settings);
    const checkbox = wrapper
      .findAllComponents(InputCheckboxStub)
      .find((c) => c.props("value") === "empty")!;
    expect(checkbox.props("label")).toBe("Include side");
    checkbox.vm.$emit("update:modelValue", ["empty"]);
    await wrapper.vm.$nextTick();
    expect(settings.emptySideIds).toEqual(["empty"]);
    const button = (text: string) =>
      wrapper.findAll("button").find((b) => b.text() === text)!;
    await button("Preview recipient data").trigger("click");
    expect(wrapper.find('[aria-label="Recipient preview"]').text()).toContain(
      "Empty side — no groups",
    );
    wrapper
      .findComponent({ name: "InputGroup" })
      .vm.$emit("update:modelValue", "Empty side preset");
    await wrapper.vm.$nextTick();
    await button("Save as new preset").trigger("click");
    wrapper.unmount();
    const restored = form([]);
    const reopened = mountSettings(restored);
    await reopened
      .find("select")
      .setValue(reopened.findAll("option")[1]!.attributes("value"));
    expect(restored.emptySideIds).toEqual(["empty"]);
    await reopened
      .findAll("button")
      .find((b) => b.text() === "Empty side")!
      .trigger("click");
    expect(restored.emptySideIds).toEqual([]);
    reopened.unmount();
  });

  it("saves explicit selections and reloads them only for the same scenario", async () => {
    const settings = form(["features"]);
    const wrapper = mountSettings(settings);
    wrapper
      .findComponent({ name: "InputGroup" })
      .vm.$emit("update:modelValue", "Blue contacts");
    await wrapper.vm.$nextTick();
    const button = (text: string) =>
      wrapper.findAll("button").find((b) => b.text() === text)!;
    await button("Save as new preset").trigger("click");
    expect(wrapper.findAll("option").map((o) => o.text())).toContain("Blue contacts");
    wrapper.unmount();

    const reopened = mountSettings(form([]));
    const id = reopened.findAll("option")[1]!.attributes("value");
    await reopened.find("select").setValue(id);
    expect(reopened.props("modelValue").layerIds).toEqual(["features"]);
    // The other existing layer remains excluded, as will any newly added layer.
    expect(mountSettings(form([]), "scenario-b").findAll("option")).toHaveLength(1);
    await reopened
      .findAll("button")
      .find((b) => b.text() === "Delete preset")!
      .trigger("click");
    expect(reopened.findAll("option")).toHaveLength(1);
    reopened.unmount();
  });

  it("shows selected content and retained scenario information in the preview", async () => {
    const wrapper = mountSettings(form(["features"]));
    await wrapper
      .findAll("button")
      .find((b) => b.text() === "Preview recipient data")!
      .trigger("click");
    const preview = wrapper.find('[aria-label="Recipient preview"]');
    expect(preview.text()).toContain("Controller briefing");
    expect(preview.text()).toContain("Features");
    expect(preview.text()).not.toContain("Control measures");
  });

  it("warns about missing preset content without selecting other layers", async () => {
    localStorage.setItem(
      "orbatmapper:export-presets:scenario-a",
      JSON.stringify([
        {
          id: "blue",
          name: "Blue",
          sideGroups: ["deleted"],
          layerIds: ["removed"],
          fileName: "blue.json",
        },
      ]),
    );
    const settings = form();
    const wrapper = mountSettings(settings);
    await wrapper.find("select").setValue("blue");
    expect(settings.sideGroups).toEqual([]);
    expect(settings.layerIds).toEqual([]);
    expect(wrapper.find('[role="status"]').text()).toContain("no longer exist");
  });

  it("selects every layer for settings saved before layer selection existed", () => {
    const settings = form();
    const wrapper = mountSettings(settings);

    expect(settings.layerIds).toEqual(["features", "control-measures"]);
    expect(
      wrapper
        .findAllComponents(InputCheckboxStub)
        .filter((checkbox) =>
          ["features", "control-measures"].includes(checkbox.props("value")),
        )
        .map((checkbox) => [checkbox.props("value"), checkbox.props("description")]),
    ).toEqual([
      ["features", undefined],
      ["control-measures", "Control measures"],
    ]);
  });

  it("preserves an explicitly empty layer selection", () => {
    const settings = form([]);
    mountSettings(settings);

    expect(settings.layerIds).toEqual([]);
  });
});
