// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";

function amplifierPlaceholders(kind: "no-fire-area-irregular" | "boundary") {
  return Object.fromEntries(
    (CONTROL_MEASURE_METADATA[kind]?.textAmplifiers ?? []).map(({ key }) => [
      key,
      `<${key}>`,
    ]),
  );
}

describe("ControlMeasurePreview", () => {
  it("keeps amplifier labels readable over a patterned area", () => {
    const wrapper = mount(ControlMeasurePreview, {
      props: {
        kind: "no-fire-area-irregular",
        textAmplifiers: amplifierPlaceholders("no-fire-area-irregular"),
        width: 232,
        height: 116,
        pad: 14,
        strokeWidth: 1,
        nonScalingStroke: true,
      },
    });

    const labels = wrapper.findAll("text");
    expect(labels.map((text) => text.text())).toContain("NFA");
    expect(wrapper.findAll("g rect")).toHaveLength(5);
    expect(
      wrapper
        .findAll("g rect")
        .every((rect) => rect.attributes("fill") === "var(--background)"),
    ).toBe(true);
    const geometryPaths = wrapper
      .findAll("path[d]")
      .filter((path) => !path.element.closest("defs"));
    expect(
      geometryPaths.every(
        (path) => path.attributes("vector-effect") === "non-scaling-stroke",
      ),
    ).toBe(true);
  });

  it("caps ground-sized labels in the wide amplifier preview", () => {
    const wrapper = mount(ControlMeasurePreview, {
      props: {
        kind: "boundary",
        textAmplifiers: amplifierPlaceholders("boundary"),
        width: 232,
        height: 116,
        pad: 14,
        fallbackFontSize: 10,
        maxFontSize: 16,
      },
    });

    const fontSizes = wrapper
      .findAll("text")
      .map((text) => Number(text.attributes("font-size")));
    expect(Math.max(...fontSizes)).toBe(16);
  });
});
