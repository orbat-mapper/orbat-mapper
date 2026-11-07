import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ControlMeasureFieldLabel from "@/modules/scenarioeditor/ControlMeasureFieldLabel.vue";

describe("ControlMeasureFieldLabel", () => {
  it("keeps the description behind a labelled info button until opened", async () => {
    const wrapper = mount(ControlMeasureFieldLabel, {
      props: {
        for: "width",
        label: "Width",
        description: "Corridor width on the ground.",
      },
      attachTo: document.body,
    });

    expect(wrapper.get("label").attributes("for")).toBe("width");
    expect(document.body.textContent).not.toContain("Corridor width on the ground.");

    await wrapper.get("button[aria-label='About Width']").trigger("click");

    expect(document.body.textContent).toContain("Corridor width on the ground.");
    wrapper.unmount();
  });

  it("shows no info button without a description", () => {
    const wrapper = mount(ControlMeasureFieldLabel, {
      props: { for: "width", label: "Width" },
    });

    expect(wrapper.find("[data-test=field-hint]").exists()).toBe(false);
  });
});
