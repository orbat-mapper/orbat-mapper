// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";

import ScenarioLinkCard from "@/components/ScenarioLinkCard.vue";

const scenario = {
  id: "scenario-1",
  name: "Scenario 1",
  description: "Description",
  image: "",
  modified: new Date("2024-01-02T00:00:00.000Z"),
  created: new Date("2024-01-01T00:00:00.000Z"),
};

const CardStub = defineComponent({
  name: "Card",
  props: ["class", "tabindex", "role", "ariaPressed"],
  emits: ["click", "keydown"],
  template: `
    <div
      data-testid="card"
      :class="$props.class"
      :tabindex="tabindex"
      :role="role"
      :aria-pressed="ariaPressed"
      @click="$emit('click', $event)"
      @keydown="$emit('keydown', $event)"
    >
      <slot />
    </div>
  `,
});

const CardContentStub = defineComponent({
  name: "CardContent",
  props: ["class"],
  template: `<div :class="$props.class"><slot /></div>`,
});

const CardFooterStub = defineComponent({
  name: "CardFooter",
  props: ["class"],
  template: `<div :class="$props.class"><slot /></div>`,
});

const CheckboxStub = defineComponent({
  name: "Checkbox",
  props: ["id", "modelValue", "ariaLabel"],
  emits: ["update:modelValue"],
  template: `
    <button
      :id="id"
      data-testid="select-checkbox"
      :aria-label="ariaLabel"
      @click="$emit('update:modelValue', !modelValue)"
    ></button>
  `,
});

const DotsMenuStub = defineComponent({
  name: "DotsMenu",
  template: `<div data-testid="dots-menu" />`,
});

function mountCard(props: Record<string, unknown> = {}) {
  return mount(ScenarioLinkCard, {
    props: {
      data: scenario,
      ...props,
    },
    global: {
      stubs: {
        Card: CardStub,
        CardContent: CardContentStub,
        CardFooter: CardFooterStub,
        Checkbox: CheckboxStub,
        DotsMenu: DotsMenuStub,
        RouterLink: defineComponent({
          name: "RouterLink",
          props: ["to"],
          template: `<a data-testid="router-link"><slot /></a>`,
        }),
      },
    },
  });
}

describe("ScenarioLinkCard", () => {
  it("keeps single-item open behavior in normal mode", async () => {
    const wrapper = mountCard({ noLink: true });

    expect(wrapper.find('[data-testid="dots-menu"]').exists()).toBe(true);
    await wrapper.get("button.absolute").trigger("click");

    expect(wrapper.emitted("action")).toEqual([["open"]]);
    expect(wrapper.emitted("toggle-select")).toBeUndefined();
  });

  it("hides the overflow menu in selection mode", () => {
    const wrapper = mountCard({ selectionMode: true });

    expect(wrapper.find('[data-testid="dots-menu"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="select-checkbox"]').attributes("aria-label")).toBe(
      "Select scenario Scenario 1",
    );
  });

  it("emits toggle-select when the card is clicked in selection mode", async () => {
    const wrapper = mountCard({ selectionMode: true });

    await wrapper.get('[data-testid="card"]').trigger("click");

    expect(wrapper.emitted("toggle-select")).toEqual([[]]);
  });

  it("applies selected styling in selection mode", () => {
    const wrapper = mountCard({ selectionMode: true, selected: true });

    expect(wrapper.get('[data-testid="card"]').classes()).toContain("border-primary");
  });
});
