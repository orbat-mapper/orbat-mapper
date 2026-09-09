// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import ControlMeasureSizeSettings from "@/modules/scenarioeditor/ControlMeasureSizeSettings.vue";
import ControlMeasureParameterField from "@/modules/scenarioeditor/ControlMeasureParameterField.vue";

beforeAll(() =>
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterAll(() => vi.unstubAllGlobals());

describe("batch size controls", () => {
  it("shows one shared size control, converts at the live zoom, and edits all selected sizes", async () => {
    let resolution = 10;
    const wrapper = mount(ControlMeasureSizeSettings, {
      props: {
        targets: [
          {
            id: "one",
            graphicKind: "destroy",
            options: { sizePixels: 80, crossAngle: 60 },
          },
          {
            id: "two",
            graphicKind: "defeat",
            options: { sizeMeters: 700, crossAngle: 80 },
          },
        ],
        getResolution: () => resolution,
      },
    });
    expect(wrapper.findAllComponents(ControlMeasureParameterField)).toHaveLength(1);
    expect(wrapper.text()).toContain("Mixed sizes");
    resolution = 2.5;
    await wrapper.find('button[aria-label="Meters"]').trigger("click");
    expect(wrapper.emitted("update")?.at(-1)).toEqual([
      [
        { id: "one", options: { sizeMeters: 200, crossAngle: 60 } },
        { id: "two", options: { sizeMeters: 700, crossAngle: 80 } },
      ],
    ]);
    await wrapper
      .findComponent(ControlMeasureParameterField)
      .vm.$emit("update:modelValue", 50);
    expect(wrapper.emitted("update")?.at(-1)).toEqual([
      [
        { id: "one", options: { sizePixels: 50, crossAngle: 60 } },
        { id: "two", options: { sizePixels: 50, crossAngle: 80 } },
      ],
    ]);
  });

  it("can normalize a mixed selection to the first graphic's unit", async () => {
    const wrapper = mount(ControlMeasureSizeSettings, {
      props: {
        targets: [
          { id: 1, graphicKind: "destroy", options: { sizePixels: 80 } },
          { id: 2, graphicKind: "defeat", options: { sizeMeters: 700 } },
        ],
        getResolution: () => 10,
      },
    });
    await wrapper.find('button[aria-label="Pixels"]').trigger("click");
    expect(wrapper.emitted("update")?.at(-1)).toEqual([
      [
        { id: 1, options: { sizePixels: 80 } },
        { id: 2, options: { sizePixels: 70 } },
      ],
    ]);
  });

  it("offers only dimensions shared by the selection", () => {
    const wrapper = mount(ControlMeasureSizeSettings, {
      props: {
        targets: [
          { id: 1, graphicKind: "destroy" },
          { id: 2, graphicKind: "boundary" },
        ],
      },
    });
    expect(wrapper.findAllComponents(ControlMeasureParameterField)).toHaveLength(0);
  });

  it("keeps the authored unit and emits no update when conversion is unavailable", async () => {
    const wrapper = mount(ControlMeasureSizeSettings, {
      props: {
        targets: [{ id: 1, graphicKind: "destroy", options: { sizeMeters: 500 } }],
      },
    });
    await wrapper.find('button[aria-label="Pixels"]').trigger("click");
    expect(wrapper.emitted("update")).toBeUndefined();
    expect(wrapper.find('[role="alert"]').text()).toContain("map resolution");
    expect(wrapper.find('button[aria-label="Meters"]').attributes("data-state")).toBe(
      "on",
    );
  });
});
