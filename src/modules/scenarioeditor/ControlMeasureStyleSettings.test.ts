import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import type {
  ControlMeasureKind,
  ControlMeasureStyle,
} from "@orbat-mapper/control-measures";
import ControlMeasureStyleSettings from "@/modules/scenarioeditor/ControlMeasureStyleSettings.vue";

vi.mock("@/modules/scenarioeditor/ControlMeasureColorPicker.vue", () => ({
  default: defineComponent({
    name: "ControlMeasureColorPicker",
    props: { modelValue: { type: String, default: "" } },
    emits: ["update:modelValue"],
    template: "<div />",
  }),
}));

function mountSettings(props: {
  graphicKind?: ControlMeasureKind;
  measureStyle?: ControlMeasureStyle;
}) {
  return mount(ControlMeasureStyleSettings, { props });
}

function labels(wrapper: ReturnType<typeof mountSettings>): string[] {
  return wrapper.findAll("label, div").map((element) => element.text());
}

describe("the UI-only styling gate", () => {
  it("offers colour and fill on a Generic Graphics kind that can be filled", () => {
    const wrapper = mountSettings({ graphicKind: "polygon" });
    expect(labels(wrapper)).toContain("Color");
    expect(labels(wrapper)).toContain("Fill");
  });

  it("offers colour but no fill where a pattern would be inert", () => {
    const wrapper = mountSettings({ graphicKind: "line" });
    expect(labels(wrapper)).toContain("Color");
    expect(labels(wrapper)).not.toContain("Fill");
  });

  it("offers neither on a doctrinal kind", () => {
    const wrapper = mountSettings({ graphicKind: "phase-line" });
    expect(labels(wrapper)).not.toContain("Color");
    expect(labels(wrapper)).not.toContain("Fill");
  });

  it("offers everything for the defaults, which belong to no kind yet", () => {
    const wrapper = mountSettings({});
    expect(labels(wrapper)).toContain("Color");
    expect(labels(wrapper)).toContain("Fill");
  });

  it("still shows a doctrinal kind's imported colour, because it renders", () => {
    // The gate is about authoring, not about the model — nothing strips the colour.
    const wrapper = mountSettings({
      graphicKind: "phase-line",
      measureStyle: { color: "#ff00ff" },
    });
    expect(wrapper.props("measureStyle")).toEqual({ color: "#ff00ff" });
  });
});

describe("what it emits", () => {
  it("emits the host-owned field on its own", async () => {
    const wrapper = mountSettings({ graphicKind: "phase-line" });
    await wrapper.findAll("select")[2]!.setValue("planned");
    expect(wrapper.emitted("update")).toEqual([[{ status: "planned" }]]);
  });

  it("emits the whole style, merged, so nothing authored is lost", async () => {
    const wrapper = mountSettings({
      graphicKind: "polygon",
      measureStyle: { strokeWidth: 3, color: "#000000" },
    });
    await wrapper
      .findComponent({ name: "ControlMeasureColorPicker" })
      .vm.$emit("update:modelValue", "#ff0000");
    expect(wrapper.emitted("update")).toEqual([
      [{ style: { strokeWidth: 3, color: "#ff0000" } }],
    ]);
  });

  it("drops the key rather than storing a colour when reset to Auto", async () => {
    const wrapper = mountSettings({
      graphicKind: "polygon",
      measureStyle: { strokeWidth: 3, color: "#ff0000" },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update")).toEqual([[{ style: { strokeWidth: 3 } }]]);
  });

  it("clears an authored fill pattern back to the library's default", async () => {
    const wrapper = mountSettings({
      graphicKind: "polygon",
      measureStyle: { fillPattern: "hatch" },
    });
    await wrapper.findAll("select")[3]!.setValue("");
    expect(wrapper.emitted("update")).toEqual([[{ style: {} }]]);
  });
});
