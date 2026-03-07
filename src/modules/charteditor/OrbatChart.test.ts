// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import OrbatChart from "./OrbatChart.vue";
import { ORBAT1 } from "./orbatchart/test/testorbats";

if (!("getBBox" in SVGElement.prototype)) {
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    value: () =>
      ({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }) as DOMRect,
  });
}

describe("OrbatChart", () => {
  it("clears the rendered svg when the selected unit becomes null", async () => {
    const wrapper = mount(OrbatChart, {
      props: {
        unit: ORBAT1,
        chartId: "chart-test",
        width: 600,
        height: 400,
      },
    });

    await nextTick();
    expect(wrapper.find("#chart-test").exists()).toBe(true);

    await wrapper.setProps({ unit: null });
    await nextTick();

    expect(wrapper.find("#chart-test").exists()).toBe(false);
    expect(wrapper.html()).not.toContain("<svg");
  });
});
