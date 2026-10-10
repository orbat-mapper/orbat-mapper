import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import SettingsItemForm from "@/modules/scenarioeditor/SettingsItemForm.vue";

vi.mock("@/components/PopoverColorPicker.vue", () => ({
  default: defineComponent({
    name: "PopoverColorPicker",
    props: { modelValue: { type: String, default: "" } },
    emits: ["update:modelValue"],
    template: "<div />",
  }),
}));

function mountForm(props: Record<string, unknown> = {}) {
  return mount(SettingsItemForm, { props, attachTo: document.body });
}

describe("SettingsItemForm", () => {
  // FormFooter reads the go-to-next toggle from the UI store
  beforeEach(() => setActivePinia(createPinia()));

  it("emits only the name when colour and description are off", async () => {
    const wrapper = mountForm({ item: { name: "Group A" } });
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")).toEqual([[{ name: "Group A" }]]);
    wrapper.unmount();
  });

  it("emits trimmed name, description and colour when enabled", async () => {
    const wrapper = mountForm({
      item: { name: " Degraded ", description: " Below strength ", color: "#f59e0b" },
      withColor: true,
      withDescription: true,
    });
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")).toEqual([
      [{ name: "Degraded", description: "Below strength", color: "#f59e0b" }],
    ]);
    wrapper.unmount();
  });

  it("emits an undefined colour after the colour is cleared", async () => {
    const wrapper = mountForm({
      item: { name: "Degraded", color: "#f59e0b" },
      withColor: true,
    });
    await wrapper
      .findComponent({ name: "PopoverColorPicker" })
      .vm.$emit("update:modelValue", null);
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")).toEqual([[{ name: "Degraded", color: undefined }]]);
    wrapper.unmount();
  });

  it("rejects an empty or taken name and shows the error inline", async () => {
    const wrapper = mountForm({ item: { name: "Taken" }, takenNames: ["Taken"] });
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")).toBeUndefined();
    expect(wrapper.text()).toContain("This name is already in use.");

    await wrapper.find("input").setValue("  ");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")).toBeUndefined();
    expect(wrapper.text()).toContain("Enter a name.");
    wrapper.unmount();
  });

  it("cancels on Escape", async () => {
    const wrapper = mountForm();
    await wrapper.find("form").trigger("keydown", { key: "Escape" });
    expect(wrapper.emitted("cancel")).toHaveLength(1);
    wrapper.unmount();
  });
});
