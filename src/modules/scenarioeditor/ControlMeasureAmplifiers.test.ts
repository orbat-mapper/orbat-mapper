// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { createPinia } from "pinia";
import ControlMeasureAmplifiers from "@/modules/scenarioeditor/ControlMeasureAmplifiers.vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";

const PreviewStub = defineComponent({
  name: "ControlMeasurePreview",
  props: ["kind", "textAmplifiers", "options"],
  template: "<div data-test='preview' />",
});

describe("ControlMeasureAmplifiers", () => {
  it("previews doctrinal field positions and commits a text field on change", async () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: {
        graphicKind: "phase-line",
        textAmplifiers: { T: "ALPHA" },
      },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });
    const input = wrapper.get("input[type='text']");

    (input.element as HTMLInputElement).value = "BRAVO";
    expect(wrapper.getComponent(PreviewStub).props("textAmplifiers")).toEqual({
      T: "<T>",
      N: "<N>",
    });
    await input.trigger("input");
    expect(wrapper.emitted("update")).toBeUndefined();

    await input.trigger("change");
    expect(wrapper.emitted("update")).toEqual([[{ T: "BRAVO" }]]);
  });

  it("uses a toggle for the hostile marker", async () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: { graphicKind: "handover-line" },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });
    const toggle = wrapper.get("button[role='switch']");

    await toggle.trigger("click");
    await nextTick();

    expect(wrapper.emitted("update")).toEqual([[{ N: "ENY" }]]);
  });

  it("shows and commits the echelon selector for echelon-bearing measures", async () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: {
        graphicKind: "boundary",
        options: { echelon: "battalion" },
      },
      global: {
        plugins: [createPinia()],
        stubs: { ControlMeasurePreview: PreviewStub },
      },
    });
    const select = wrapper.findComponent(SymbolCodeSelect);
    expect(select.props("label")).toBe("Echelon");
    expect(
      (select.props("items") as { code: string; sidc: string }[]).find(
        (item) => item.code === "brigade",
      )?.sidc,
    ).toBe("10031000180000000000");

    select.vm.$emit("update:modelValue", "brigade");
    await nextTick();

    expect(wrapper.emitted("update-options")).toEqual([[{ echelon: "brigade" }]]);
  });

  it("keeps strong-point preview geometry representative while reflecting its echelon", () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: {
        graphicKind: "strong-point",
        options: {
          echelon: "battalion",
          echelonSize: 750,
          smooth: false,
          smoothResolution: 16,
        },
      },
      global: {
        plugins: [createPinia()],
        stubs: { ControlMeasurePreview: PreviewStub },
      },
    });

    expect(wrapper.getComponent(PreviewStub).props("options")).toEqual({
      echelon: "battalion",
    });
  });

  it("does not show an echelon selector for measures without one", () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: { graphicKind: "phase-line" },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });

    expect(wrapper.findComponent(SymbolCodeSelect).exists()).toBe(false);
  });

  it("explains when a measure has no amplifier fields", () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: { graphicKind: "main-attack" },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });

    expect(wrapper.text()).toContain("This control measure has no text amplifiers.");
  });
});
