// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import ControlMeasureExtendedStyleSettings from "@/modules/scenarioeditor/ControlMeasureExtendedStyleSettings.vue";

const ControlMeasureColorPickerStub = defineComponent({
  name: "ControlMeasureColorPicker",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template: "<button data-test='color-picker' />",
});

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => vi.unstubAllGlobals());

function mountSettings(
  graphicKind: InstanceType<
    typeof ControlMeasureExtendedStyleSettings
  >["$props"]["graphicKind"],
  options: Record<string, unknown> = {},
) {
  return mount(ControlMeasureExtendedStyleSettings, {
    props: { graphicKind, options },
    global: { stubs: { ControlMeasureColorPicker: ControlMeasureColorPickerStub } },
  });
}

describe("ControlMeasureExtendedStyleSettings", () => {
  it("keeps metadata order and separates advanced appearance parameters", async () => {
    const wrapper = mountSettings("classic-arrow");
    const advanced = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Advanced"));

    expect(wrapper.text()).toContain("Arrowhead style");
    expect(advanced).toBeDefined();
    expect(wrapper.text()).not.toContain("Arrowhead length");
    await advanced!.trigger("click");
    const expandedText = wrapper.text();
    expect(expandedText).toContain("Arrowhead length");
    expect(expandedText).toContain("Arrowhead width");
    expect(expandedText.indexOf("Arrowhead style")).toBeLessThan(
      expandedText.indexOf("Advanced"),
    );
    expect(expandedText.indexOf("Arrowhead length")).toBeLessThan(
      expandedText.indexOf("Arrowhead width"),
    );
    expect(expandedText).not.toContain("Smooth");
    expect(expandedText).not.toContain("Smooth resolution");
  });

  it("does not duplicate doctrinal, amplifier, or transform-box parameters", () => {
    const textSettings = mountSettings("text");
    const text = textSettings.text();

    expect(text).toContain("Alignment");
    expect(text).toContain("Style");
    expect(text).toContain("Max size");
    expect(text).not.toContain("The text to render");
    expect(text).not.toContain("Rotation");
    expect(text).not.toMatch(/\bSize \(px\)/);

    const minefield = mountSettings("minefield");
    expect(minefield.text()).toContain(
      "This control measure has no extended styling settings.",
    );
    expect(minefield.text()).not.toContain("Mine type");
    expect(minefield.text()).not.toContain("Rotation");
  });

  it("shows only the active half of a screen/ground size pair", async () => {
    const wrapper = mountSettings("boundary", { echelonSizePixels: 20 });
    const text = () => wrapper.text().replace(/\s+/g, " ");

    expect(text()).toContain("Echelon size");
    expect(text()).toContain("20 px");
    expect(text()).not.toContain("900 m");
    expect(wrapper.text()).not.toContain("EchelonField B");

    await wrapper.setProps({ options: { echelonSize: 900 } });
    expect(text()).toContain("Echelon size");
    expect(text()).toContain("900 m");
    expect(text()).not.toContain("20 px");
  });

  it("preserves existing options and restores the enum value type", async () => {
    const wrapper = mountSettings("block-arrow", {
      arrowheadStyle: "triangle",
      custom: "kept",
    });
    const barbed = wrapper.findAll("button").find((button) => button.text() === "Barbed");

    expect(barbed).toBeDefined();
    await barbed!.trigger("click");

    expect(wrapper.emitted("update")?.at(-1)).toEqual([
      { arrowheadStyle: "barbed", custom: "kept" },
    ]);
  });

  it("reevaluates metadata visibility from the live options", async () => {
    const wrapper = mountSettings("boundary", { labelRepetitions: 1 });
    const advanced = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Advanced"));
    await advanced!.trigger("click");

    expect(wrapper.text()).toContain("Label position");
    expect(wrapper.text()).not.toContain("Label spacing");

    await wrapper.setProps({ options: { labelRepetitions: 3 } });
    expect(wrapper.text()).not.toContain("Label position");
    expect(wrapper.text()).toContain("Label spacing");
  });

  it("uses capturesLabelSize to add the shared label-size control", async () => {
    const wrapper = mountSettings("phase-line");
    const labelSize = wrapper
      .findAllComponents({ name: "Slider" })
      .find((slider) => slider.attributes("id")?.includes("labelSizePixels"));

    expect(wrapper.text()).toContain("Label size");
    expect(wrapper.text()).toContain("14 px");
    expect(labelSize).toBeDefined();
    await labelSize!.vm.$emit("value-commit", [20]);
    expect(wrapper.emitted("update")?.at(-1)).toEqual([{ labelSizePixels: 20 }]);

    await wrapper.setProps({ options: { labelSize: 500 } });
    expect(wrapper.text()).toContain("500 m");
  });
});
