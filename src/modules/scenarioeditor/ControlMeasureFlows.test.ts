import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ControlMeasureFlows from "@/modules/scenarioeditor/ControlMeasureFlows.vue";
import ControlMeasureParameterField from "@/modules/scenarioeditor/ControlMeasureParameterField.vue";

// A trunk of three points and a flow of two split from the trunk's middle point.
const controlPoints = [
  [0, 0],
  [1, 0],
  [2, 0],
  [1, 1],
  [2, 2],
];
const options = {
  flows: [
    { count: 3 },
    { count: 2, splitFrom: { flow: 0, vertex: 1 }, designation: "1/A" },
  ],
};

function mountFlows(selectedPart: number) {
  return mount(ControlMeasureFlows, {
    props: {
      graphicKind: "split-arrow",
      controlPoints,
      options,
      selectedPart,
      editing: false,
      canAddFlow: false,
      addFlowArmed: false,
      trunkLabel: "MAIN",
    },
    global: { stubs: { Slider: true } },
  });
}

function labelField(wrapper: ReturnType<typeof mountFlows>) {
  return wrapper
    .findAllComponents(ControlMeasureParameterField)
    .find((field) => field.props("parameter").label === "Label")!;
}

describe("ControlMeasureFlows", () => {
  it("edits the Split Arrow trunk's label as Field T", async () => {
    const wrapper = mountFlows(0);
    const field = labelField(wrapper);

    expect(field.props("modelValue")).toBe("MAIN");
    field.vm.$emit("update:modelValue", "AXIS GOLD");

    expect(wrapper.emitted("update:trunkLabel")).toEqual([["AXIS GOLD"]]);
    expect(wrapper.emitted("patch")).toBeUndefined();
  });

  it("edits another flow's label as that flow's designation", async () => {
    const wrapper = mountFlows(1);
    const field = labelField(wrapper);

    expect(field.props("modelValue")).toBe("1/A");
    field.vm.$emit("update:modelValue", "1/B");

    expect(wrapper.emitted("update:trunkLabel")).toBeUndefined();
    expect(wrapper.emitted("patch")?.[0]?.[0]).toMatchObject({
      flows: [{ count: 3 }, { designation: "1/B" }],
    });
  });
});
