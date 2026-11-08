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

  describe("with several flows selected", () => {
    // A trunk and two flows: 1/A and 1/B have different labels and head sizes.
    const points = [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    const threeFlows = {
      flows: [
        { count: 3 },
        { count: 2, splitFrom: { flow: 0, vertex: 1 }, designation: "1/A" },
        {
          count: 2,
          splitFrom: { flow: 0, vertex: 0 },
          designation: "1/B",
          arrowheadScale: 2,
        },
      ],
    };

    function mountSeveral(selectedPart: number, selectedParts: number[]) {
      return mount(ControlMeasureFlows, {
        props: {
          graphicKind: "split-arrow",
          controlPoints: points,
          options: threeFlows,
          selectedPart,
          selectedParts,
          editing: true,
          canAddFlow: true,
          addFlowArmed: false,
          trunkLabel: "MAIN",
        },
        global: { stubs: { Slider: true } },
      });
    }
    type Wrapper = ReturnType<typeof mountSeveral>;
    const choices = (wrapper: Wrapper) => wrapper.findAll("[data-test=flow-choice]");
    const field = (wrapper: Wrapper, label: string) =>
      wrapper
        .findAllComponents(ControlMeasureParameterField)
        .find((candidate) => candidate.props("parameter").label === label)!;

    it("tells a plain click from one that extends the selection", async () => {
      const wrapper = mountSeveral(0, [0]);
      await choices(wrapper)[1]!.trigger("click");
      await choices(wrapper)[2]!.trigger("click", { shiftKey: true });
      await choices(wrapper)[2]!.trigger("click", { ctrlKey: true });
      await choices(wrapper)[2]!.trigger("click", { metaKey: true });
      expect(wrapper.emitted("select")).toEqual([
        [1, false],
        [2, true],
        [2, true],
        [2, true],
      ]);
    });

    it("selects every flow with All, and goes back to the primary alone", async () => {
      const some = mountSeveral(1, [0, 1]);
      await some.find("[data-test=flow-choice-all]").trigger("click");
      expect(some.emitted("selectParts")).toEqual([[[0, 1, 2], 1]]);

      const every = mountSeveral(1, [0, 1, 2]);
      await every.find("[data-test=flow-choice-all]").trigger("click");
      expect(every.emitted("select")).toEqual([[1, false]]);
    });

    it("shows every selected flow as pressed", () => {
      const wrapper = mountSeveral(1, [0, 1]);
      expect(choices(wrapper).map((choice) => choice.attributes("data-state"))).toEqual([
        "on",
        "on",
        "off",
      ]);
    });

    it("heads the fields with what they edit", () => {
      const heading = (wrapper: Wrapper) =>
        wrapper.find("[data-test=flow-heading]").text();
      expect(heading(mountSeveral(1, [1]))).toBe("Flow 1");
      expect(heading(mountSeveral(1, [0, 1]))).toBe("2 flows");
      expect(heading(mountSeveral(1, [0, 1, 2]))).toBe("All flows");
    });

    it("writes one change to every selected flow in one patch", () => {
      const wrapper = mountSeveral(1, [1, 2]);
      field(wrapper, "Arrowhead size").vm.$emit("update:modelValue", 3);

      expect(wrapper.emitted("patch")).toHaveLength(1);
      const { flows } = wrapper.emitted("patch")![0]![0] as {
        flows: { arrowheadScale?: number }[];
      };
      expect(flows.map((flow) => flow.arrowheadScale)).toEqual([undefined, 3, 3]);
    });

    it("reads a field that differs as Mixed, and one that doesn't as its value", () => {
      const wrapper = mountSeveral(1, [1, 2]);

      const label = field(wrapper, "Label");
      expect(label.props("mixed")).toBe(true);
      expect(label.find("input").element.value).toBe("");
      expect(label.find("input").attributes("placeholder")).toBe("Mixed");

      expect(field(wrapper, "Arrowhead size").text()).toContain("Mixed");
      expect(field(wrapper, "Label position").props("mixed")).toBe(false);
    });

    it("shows a mixed slider's value only while it is being dragged", async () => {
      const size = field(mountSeveral(1, [1, 2]), "Arrowhead size");
      const slider = size.find("slider-stub");
      expect(size.text()).toContain("Mixed");

      await slider.trigger("pointerdown");
      expect(size.text()).not.toContain("Mixed");

      // Released where it started: nothing is committed, so the flows still differ.
      await slider.trigger("pointerup");
      expect(size.text()).toContain("Mixed");
    });

    it("keeps a Label typed on several flows off the trunk's Field T", () => {
      const wrapper = mountSeveral(1, [0, 1]);
      field(wrapper, "Label").vm.$emit("update:modelValue", "2/C");

      expect(wrapper.emitted("update:trunkLabel")).toBeUndefined();
      const { flows } = wrapper.emitted("patch")![0]![0] as {
        flows: { designation?: string }[];
      };
      expect(flows.map((flow) => flow.designation)).toEqual([undefined, "2/C", "1/B"]);
    });

    it("keeps the single-flow edits to one flow, and Add flow for any", () => {
      const has = (wrapper: Wrapper, test: string) =>
        wrapper.find(`[data-test=${test}]`).exists();

      const one = mountSeveral(1, [1]);
      expect(has(one, "flow-reverse")).toBe(true);
      expect(has(one, "flow-remove")).toBe(true);

      const several = mountSeveral(1, [1, 2]);
      expect(has(several, "flow-reverse")).toBe(false);
      expect(has(several, "flow-detach")).toBe(false);
      expect(has(several, "flow-remove")).toBe(false);
      expect(has(several, "flow-add")).toBe(true);
    });

    it("resets the head size of any selected flow that has its own", async () => {
      const wrapper = mountSeveral(1, [1, 2]);
      await wrapper.find("[data-test=flow-reset-head-size]").trigger("click");
      const { flows } = wrapper.emitted("patch")![0]![0] as {
        flows: { arrowheadScale?: number }[];
      };
      expect(flows[2]!.arrowheadScale).toBeUndefined();
      // No flow outside the selection sizes its own head.
      expect(wrapper.find("[data-test=flow-same-head-size]").exists()).toBe(false);
    });
  });
});
