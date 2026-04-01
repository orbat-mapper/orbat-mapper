// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";

import SortDropdown from "@/components/SortDropdown.vue";

const DropdownMenuStub = defineComponent({
  name: "DropdownMenu",
  template: `<div><slot /></div>`,
});

const DropdownMenuTriggerStub = defineComponent({
  name: "DropdownMenuTrigger",
  template: `<div><slot /></div>`,
});

const DropdownMenuContentStub = defineComponent({
  name: "DropdownMenuContent",
  props: ["align"],
  template: `<div data-testid="dropdown-content"><slot /></div>`,
});

const DropdownMenuItemStub = defineComponent({
  name: "DropdownMenuItem",
  emits: ["select"],
  template: `
    <button data-testid="direction-toggle" type="button" @click="$emit('select', $event)">
      <slot />
    </button>
  `,
});

const DropdownMenuRadioGroupStub = defineComponent({
  name: "DropdownMenuRadioGroup",
  props: ["modelValue"],
  template: `<div data-testid="radio-group" :data-model-value="modelValue"><slot /></div>`,
});

const DropdownMenuRadioItemStub = defineComponent({
  name: "DropdownMenuRadioItem",
  props: ["value", "disabled"],
  emits: ["select"],
  template: `
    <button
      :data-testid="'radio-item-' + value"
      :data-value="value"
      :data-disabled="disabled"
      :disabled="disabled"
      @click="$emit('select', $event)"
    >
      <slot />
    </button>
  `,
});

const ButtonStub = defineComponent({
  name: "Button",
  template: `<button type="button"><slot /></button>`,
});

function mountDropdown(props: {
  options: Array<{
    label: string;
    action: string | (() => void);
    active?: boolean;
    disabled?: boolean;
  }>;
  sortDirection?: "asc" | "desc";
}) {
  return mount(SortDropdown, {
    props,
    global: {
      stubs: {
        DropdownMenu: DropdownMenuStub,
        DropdownMenuTrigger: DropdownMenuTriggerStub,
        DropdownMenuContent: DropdownMenuContentStub,
        DropdownMenuItem: DropdownMenuItemStub,
        DropdownMenuRadioGroup: DropdownMenuRadioGroupStub,
        DropdownMenuRadioItem: DropdownMenuRadioItemStub,
        DropdownMenuSeparator: true,
        Button: ButtonStub,
      },
    },
  });
}

describe("SortDropdown", () => {
  it("renders the active option as the selected radio item", () => {
    const wrapper = mountDropdown({
      options: [
        { label: "Name", action: "name" },
        { label: "Last modified", action: "lastModified", active: true },
        { label: "Created", action: "created" },
      ],
      sortDirection: "desc",
    });

    expect(
      wrapper.get('[data-testid="radio-group"]').attributes("data-model-value"),
    ).toBe("Last modified");
  });

  it("shows the current sort direction in the toggle item", () => {
    const wrapper = mountDropdown({
      options: [{ label: "Name", action: "name", active: true }],
      sortDirection: "asc",
    });

    expect(wrapper.get('[data-testid="direction-toggle"]').text()).toContain(
      "Order: Ascending",
    );
    expect(wrapper.find('[data-testid="direction-toggle"] svg').exists()).toBe(true);
  });

  it("emits a toggle event when the sort direction item is selected", async () => {
    const wrapper = mountDropdown({
      options: [{ label: "Name", action: "name", active: true }],
      sortDirection: "desc",
    });

    await wrapper.get('[data-testid="direction-toggle"]').trigger("click");

    expect(wrapper.emitted("toggle-direction")).toEqual([[]]);
  });

  it("invokes function actions when a radio item is selected", async () => {
    const action = vi.fn();
    const wrapper = mountDropdown({
      options: [
        { label: "Name", action, active: true },
        { label: "Created", action: "created" },
      ],
      sortDirection: "asc",
    });

    await wrapper.get('[data-testid="radio-item-Name"]').trigger("click");

    expect(action).toHaveBeenCalledTimes(1);
  });

  it("emits string actions when a radio item is selected", async () => {
    const wrapper = mountDropdown({
      options: [
        { label: "Name", action: "name" },
        { label: "Created", action: "created", active: true },
      ],
      sortDirection: "desc",
    });

    await wrapper.get('[data-testid="radio-item-Name"]').trigger("click");

    expect(wrapper.emitted("action")).toEqual([["name"]]);
  });

  it("preserves disabled state on radio items", () => {
    const wrapper = mountDropdown({
      options: [
        { label: "Name", action: "name", disabled: true },
        { label: "Created", action: "created", active: true },
      ],
      sortDirection: "desc",
    });

    expect(
      wrapper.get('[data-testid="radio-item-Name"]').attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.get('[data-testid="radio-item-Name"]').attributes("data-disabled"),
    ).toBe("true");
  });
});
