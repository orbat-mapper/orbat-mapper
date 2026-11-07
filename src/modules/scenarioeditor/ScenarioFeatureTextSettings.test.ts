// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defaultTextSize, type SimpleStyleSpec } from "@/geo/simplestyle";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";
import ScenarioFeatureTextSettings from "@/modules/scenarioeditor/ScenarioFeatureTextSettings.vue";

function mountSettings(style: Partial<SimpleStyleSpec>) {
  return mount(ScenarioFeatureTextSettings, {
    props: { feature: { style } as GeometryLayerItem },
    global: {
      stubs: {
        ToggleField: true,
        SimpleSelect: true,
        ZoomSelector: true,
        NumberInputGroup: {
          props: ["modelValue"],
          emits: ["update:modelValue"],
          template:
            "<input :value='modelValue' @change=\"$emit('update:modelValue', +$event.target.value)\" />",
        },
      },
    },
  });
}

describe("ScenarioFeatureTextSettings", () => {
  it("shows the default label size when none is set", () => {
    const wrapper = mountSettings({ showLabel: true });
    const input = wrapper.find("[data-test='label-size-input']");
    expect((input.element as HTMLInputElement).value).toBe(String(defaultTextSize));
  });

  it("emits a text-size style update when the label size changes", async () => {
    const wrapper = mountSettings({ showLabel: true, "text-size": 16 });
    const sizeInput = wrapper.find("[data-test='label-size-input']");
    expect((sizeInput.element as HTMLInputElement).value).toBe("16");

    await sizeInput.setValue("22");
    expect(wrapper.emitted("update")).toEqual([[{ style: { "text-size": 22 } }]]);
  });
});
