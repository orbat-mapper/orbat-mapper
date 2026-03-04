// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import FormFooter from "@/modules/scenarioeditor/FormFooter.vue";

describe("FormFooter", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("uses explicit button types for cancel and submit actions", async () => {
    const wrapper = mount(FormFooter);
    const buttons = wrapper.findAll("button");

    expect(buttons).toHaveLength(2);
    expect(buttons[0].attributes("type")).toBe("button");
    expect(buttons[1].attributes("type")).toBe("submit");

    await buttons[0].trigger("click");
    expect(wrapper.emitted("cancel")).toHaveLength(1);
  });
});
