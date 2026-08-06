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
  options?: Record<string, unknown>;
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

  it("gates defaults using the kind they will create", () => {
    const wrapper = mount(ControlMeasureStyleSettings, {
      props: { graphicKind: "phase-line", editingDefaults: true },
    });
    expect(labels(wrapper)).not.toContain("Color");
    expect(labels(wrapper)).not.toContain("Fill");
  });

  it("offers supported styling for defaults of a generic kind", () => {
    const wrapper = mount(ControlMeasureStyleSettings, {
      props: { graphicKind: "polygon", editingDefaults: true },
    });
    expect(labels(wrapper)).toContain("Color");
    expect(labels(wrapper)).toContain("Fill");
  });

  it("offers a capability only when every selected kind supports it", () => {
    const wrapper = mount(ControlMeasureStyleSettings, {
      props: {
        graphicKind: "polygon",
        graphicKinds: ["polygon", "phase-line"],
      },
    });
    expect(labels(wrapper)).not.toContain("Color");
    expect(labels(wrapper)).not.toContain("Fill");
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

/**
 * Smoothing is a generator option rather than a style, so it is gated by the registry's
 * own `params` and not by the Generic Graphics rule that gates colour and fill.
 */
describe("the smoothing toggle", () => {
  function smoothSwitch(wrapper: ReturnType<typeof mountSettings>) {
    return wrapper.find("#cm-smooth");
  }

  it("is offered on a doctrinal kind that declares a smooth param", () => {
    const wrapper = mountSettings({ graphicKind: "phase-line" });
    expect(smoothSwitch(wrapper).exists()).toBe(true);
    // ...even though that same kind is offered neither colour nor fill.
    expect(labels(wrapper)).not.toContain("Color");
  });

  it("is not offered on a kind that declares no smooth param", () => {
    const wrapper = mountSettings({ graphicKind: "text" });
    expect(smoothSwitch(wrapper).exists()).toBe(false);
  });

  it("is not offered for defaults without a chosen kind", () => {
    expect(smoothSwitch(mountSettings({})).exists()).toBe(false);
  });

  it("is offered for defaults of a kind that supports smoothing", () => {
    const wrapper = mount(ControlMeasureStyleSettings, {
      props: { graphicKind: "phase-line", editingDefaults: true },
    });
    expect(smoothSwitch(wrapper).exists()).toBe(true);
  });

  it("reflects an authored option over the library default", () => {
    const off = mountSettings({ graphicKind: "phase-line" });
    expect(off.findComponent({ name: "Switch" }).props("modelValue")).toBe(false);
    const on = mountSettings({ graphicKind: "phase-line", options: { smooth: true } });
    expect(on.findComponent({ name: "Switch" }).props("modelValue")).toBe(true);
  });

  it("emits the whole options object, merged, so nothing authored is lost", async () => {
    const wrapper = mountSettings({
      graphicKind: "phase-line",
      options: { smoothResolution: 24, smooth: false },
    });
    await wrapper.findComponent({ name: "Switch" }).vm.$emit("update:modelValue", true);
    expect(wrapper.emitted("update")).toEqual([
      [{ options: { smoothResolution: 24, smooth: true } }],
    ]);
  });
});
