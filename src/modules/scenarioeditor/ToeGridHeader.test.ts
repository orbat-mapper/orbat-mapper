import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";

describe("ToeGridHeader", () => {
  it("hides the include subordinates toggle when the host does not bind it", () => {
    const wrapper = mount(ToeGridHeader);
    expect(wrapper.text()).not.toContain("Include subordinates");
  });

  it("shows the include subordinates toggle when the host binds it", () => {
    const wrapper = mount(ToeGridHeader, { props: { includeSubordinates: false } });
    expect(wrapper.text()).toContain("Include subordinates");
  });
});
