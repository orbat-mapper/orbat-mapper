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

/** A size field's readout: its typed value and unit, e.g. "80 px". */
function sizeReadouts(wrapper: { findAll: (s: string) => { element: Element }[] }) {
  return wrapper.findAll('[data-slot="size-slider-field"]').map(({ element }) => {
    const input = element.querySelector("input") as HTMLInputElement;
    const unit = element.querySelector("input + span")?.textContent?.trim();
    return `${input.value} ${unit}`;
  });
}

describe("ControlMeasureExtendedStyleSettings", () => {
  it("keeps metadata order and separates advanced appearance parameters", async () => {
    const wrapper = mountSettings("classic-arrow");
    const advanced = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Advanced"));

    expect(wrapper.text()).toContain("Arrowhead length");
    expect(wrapper.text()).toContain("Arrowhead style");
    expect(advanced).toBeDefined();
    expect(wrapper.text()).not.toContain("Arrowhead width");
    await advanced!.trigger("click");
    const expandedText = wrapper.text();
    expect(expandedText).toContain("Arrowhead width");
    expect(expandedText.indexOf("Arrowhead length")).toBeLessThan(
      expandedText.indexOf("Arrowhead style"),
    );
    expect(expandedText.indexOf("Arrowhead style")).toBeLessThan(
      expandedText.indexOf("Advanced"),
    );
    expect(expandedText.indexOf("Advanced")).toBeLessThan(
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
    expect(minefield.text()).toContain("Size");
    expect(minefield.findAll('[aria-label="Size unit"]')).toHaveLength(1);
    expect(minefield.text()).not.toContain("Mine type");
    expect(minefield.text()).not.toContain("Rotation");
  });

  it("shows only the active half of a screen/ground size pair", async () => {
    const wrapper = mountSettings("boundary", { echelonSizePixels: 20 });
    const text = () => wrapper.text().replace(/\s+/g, " ");

    expect(text()).toContain("Echelon size");
    expect(sizeReadouts(wrapper)).toEqual(["20 px"]);
    expect(wrapper.text()).not.toContain("EchelonField B");

    await wrapper.setProps({ options: { echelonSize: 900 } });
    expect(text()).toContain("Echelon size");
    expect(sizeReadouts(wrapper)).toEqual(["900 m"]);
  });

  it.each(["destroy", "defeat", "neutralize", "suppress"] as const)(
    "shows one %s size control with defaults and a working unit toggle",
    async (kind) => {
      const wrapper = mount(ControlMeasureExtendedStyleSettings, {
        props: {
          graphicKind: kind,
          getResolution: () => 2.5,
          options: { crossAngle: 60 },
        },
        global: { stubs: { ControlMeasureColorPicker: ControlMeasureColorPickerStub } },
      });
      expect(wrapper.findAll('[aria-label="Size unit"]')).toHaveLength(1);
      expect(sizeReadouts(wrapper)).toEqual(["80 px"]);
      const meters = wrapper.find('button[aria-label="Meters"]');
      await meters.trigger("click");
      expect(wrapper.emitted("update")?.at(-1)).toEqual([
        { crossAngle: 60, sizeMeters: 200 },
      ]);
      await wrapper.setProps({ options: { sizeMeters: 125, crossAngle: 60 } });
      expect(sizeReadouts(wrapper)).toEqual(["125 m"]);
      await wrapper.find('button[aria-label="Pixels"]').trigger("click");
      expect(wrapper.emitted("update")?.at(-1)).toEqual([
        { crossAngle: 60, sizePixels: 50 },
      ]);
    },
  );

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
      .find((slider) => slider.attributes("id")?.includes("label"));

    expect(wrapper.text()).toContain("Label size");
    expect(sizeReadouts(wrapper)).toContain("14 px");
    expect(labelSize).toBeDefined();
    await labelSize!.vm.$emit("value-commit", [20]);
    expect(wrapper.emitted("update")?.at(-1)).toEqual([{ labelSizePixels: 20 }]);

    await wrapper.setProps({ options: { labelSize: 500 } });
    expect(sizeReadouts(wrapper)).toContain("500 m");
  });
});
