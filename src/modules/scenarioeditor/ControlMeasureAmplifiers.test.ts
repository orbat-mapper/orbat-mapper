// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import ControlMeasureAmplifiers from "@/modules/scenarioeditor/ControlMeasureAmplifiers.vue";

const PreviewStub = defineComponent({
  name: "ControlMeasurePreview",
  props: ["kind", "textAmplifiers"],
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

  it("explains when a measure has no amplifier fields", () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: { graphicKind: "main-attack" },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });

    expect(wrapper.text()).toContain("This control measure has no text amplifiers.");
  });
});
