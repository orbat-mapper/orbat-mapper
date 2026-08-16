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

  it("shows and commits enum doctrinal fields from metadata", async () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: {
        graphicKind: "minefield",
        options: { mineType: "unspecified" },
      },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });

    expect(wrapper.text()).toContain("Mine type");
    expect(wrapper.text()).toContain("Modifier 1 (symbol set 25 values 13–19).");
    expect(
      wrapper.get("#cm-doctrinal-mineType").element.closest("[data-slot='field']"),
    ).not.toBeNull();
    await wrapper.get("#cm-doctrinal-mineType").setValue("antitank");

    expect(wrapper.emitted("update-options")).toEqual([[{ mineType: "antitank" }]]);
  });

  it("shows and commits text doctrinal fields from metadata", async () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: {
        graphicKind: "light-line",
        options: { phaseLineName: "ALPHA" },
      },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });
    const input = wrapper.get("#cm-doctrinal-phaseLineName");

    expect((input.element as HTMLInputElement).value).toBe("ALPHA");
    await input.setValue("BRAVO");

    expect(wrapper.emitted("update-options")).toEqual([[{ phaseLineName: "BRAVO" }]]);
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

  it("edits generic text without losing its other options", async () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: {
        graphicKind: "text",
        options: { text: "ALPHA", textAlign: "right", sizePixels: 32 },
      },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });
    const textarea = wrapper.get("textarea");

    expect((textarea.element as HTMLTextAreaElement).value).toBe("ALPHA");
    expect(wrapper.text()).not.toContain("This control measure has no text amplifiers.");

    (textarea.element as HTMLTextAreaElement).value = "BRAVO\nCHARLIE";
    await textarea.trigger("input");
    expect(wrapper.emitted("update-options")).toBeUndefined();
    expect(wrapper.getComponent(PreviewStub).props("options")).toEqual({
      text: "BRAVO\nCHARLIE",
    });

    await textarea.trigger("change");
    expect(wrapper.emitted("update-options")).toEqual([
      [{ text: "BRAVO\nCHARLIE", textAlign: "right", sizePixels: 32 }],
    ]);
  });

  it("shows the generic text default when no text option is stored", () => {
    const wrapper = mount(ControlMeasureAmplifiers, {
      props: { graphicKind: "text" },
      global: { stubs: { ControlMeasurePreview: PreviewStub } },
    });

    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe("Text");
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

    expect(wrapper.text()).toContain(
      "This control measure has no doctrinal amplifier fields.",
    );
  });
});
