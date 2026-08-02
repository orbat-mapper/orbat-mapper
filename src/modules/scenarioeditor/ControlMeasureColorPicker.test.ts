import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import ControlMeasureColorPicker from "@/modules/scenarioeditor/ControlMeasureColorPicker.vue";

/**
 * A stand-in for the real picker with the one property that matters here: it emits the
 * model continuously (as `<input type="color">` does while the OS picker is dragged)
 * and emits `settle` once when it closes.
 */
vi.mock("@/components/PopoverColorPicker.vue", () => ({
  default: defineComponent({
    name: "PopoverColorPicker",
    props: { modelValue: { type: String, default: "" } },
    emits: ["update:modelValue", "settle"],
    template: "<div />",
  }),
}));

function mountPicker(modelValue = "#00ff00") {
  const wrapper = mount(ControlMeasureColorPicker, { props: { modelValue } });
  return { wrapper, picker: wrapper.findComponent({ name: "PopoverColorPicker" }) };
}

describe("ControlMeasureColorPicker", () => {
  it("writes nothing while the picker is being dragged", async () => {
    const { wrapper, picker } = mountPicker();
    for (const color of ["#010101", "#020202", "#030303"]) {
      await picker.vm.$emit("update:modelValue", color);
    }
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("writes exactly once, with the final colour, on picker settle", async () => {
    const { wrapper, picker } = mountPicker();
    await picker.vm.$emit("update:modelValue", "#010101");
    await picker.vm.$emit("update:modelValue", "#123456");
    await picker.vm.$emit("settle");
    expect(wrapper.emitted("update:modelValue")).toEqual([["#123456"]]);
  });

  it("writes nothing when the gesture ended where it started", async () => {
    const { wrapper, picker } = mountPicker("#00ff00");
    await picker.vm.$emit("update:modelValue", "#010101");
    await picker.vm.$emit("update:modelValue", "#00ff00");
    await picker.vm.$emit("settle");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("commits a still-open gesture when it is unmounted", async () => {
    const { wrapper, picker } = mountPicker();
    await picker.vm.$emit("update:modelValue", "#123456");
    wrapper.unmount();
    expect(wrapper.emitted("update:modelValue")).toEqual([["#123456"]]);
  });

  it("follows the model when it changes underneath", async () => {
    const { wrapper, picker } = mountPicker("#00ff00");
    await wrapper.setProps({ modelValue: "#0000ff" });
    expect(picker.props("modelValue")).toBe("#0000ff");
    await picker.vm.$emit("settle");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});
