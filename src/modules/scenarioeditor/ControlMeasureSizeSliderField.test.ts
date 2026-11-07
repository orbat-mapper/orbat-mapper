import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { Slider } from "@/components/ui/slider";
import ControlMeasureSizeSliderField from "@/modules/scenarioeditor/ControlMeasureSizeSliderField.vue";

function sliderBounds(value: number) {
  const wrapper = mount(ControlMeasureSizeSliderField, {
    props: {
      id: "size",
      label: "Arrowhead length",
      unit: "m",
      value,
      range: { min: 100, max: 2400, step: 50 },
    },
    global: { stubs: { Slider: true } },
  });
  const slider = wrapper.getComponent(Slider);
  return { min: slider.props("min"), max: slider.props("max") };
}

describe("ControlMeasureSizeSliderField", () => {
  it("widens the slider to keep a size set at another zoom reachable", () => {
    expect(sliderBounds(500)).toEqual({ min: 100, max: 2400 });
    expect(sliderBounds(9000)).toEqual({ min: 100, max: 9000 });
    expect(sliderBounds(20)).toEqual({ min: 0, max: 2400 });
  });
});
