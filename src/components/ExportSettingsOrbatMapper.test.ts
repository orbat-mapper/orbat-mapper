// @vitest-environment jsdom
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ExportSettingsOrbatMapper from "@/components/ExportSettingsOrbatMapper.vue";
import { activeScenarioKey } from "@/components/injects";
import type { OrbatMapperExportSettings } from "@/types/importExport";

const InputCheckboxStub = defineComponent({
  name: "InputCheckbox",
  props: ["label", "description", "value", "modelValue"],
  template: "<div />",
});

function mountSettings(form: OrbatMapperExportSettings) {
  const state = {
    info: { name: "Source scenario" },
    sides: [],
    sideMap: {},
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
    props: { modelValue: form },
    global: {
      provide: {
        [activeScenarioKey as symbol]: { store: { state } },
      },
      stubs: {
        InputCheckbox: InputCheckboxStub,
        InputGroupTemplate: { template: "<section><slot /></section>" },
        InputGroup: true,
      },
    },
  });
}

function form(layerIds?: string[]): OrbatMapperExportSettings {
  return {
    sideGroups: [],
    layerIds,
    customColors: true,
    fileName: "scenario.json",
  };
}

describe("ExportSettingsOrbatMapper", () => {
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
