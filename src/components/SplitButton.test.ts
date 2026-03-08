// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import SplitButton from "@/components/SplitButton.vue";

vi.mock("@/components/ui/button", () => ({
  Button: {
    name: "Button",
    props: ["disabled", "variant", "size", "title"],
    template:
      '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
  },
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: {
    name: "DropdownMenu",
    template: "<div><slot /></div>",
  },
  DropdownMenuContent: {
    name: "DropdownMenuContent",
    template: "<div><slot /></div>",
  },
  DropdownMenuItem: {
    name: "DropdownMenuItem",
    props: ["disabled"],
    template:
      '<button :disabled="disabled" @click="$emit(\'select\', $event)"><slot /></button>',
  },
  DropdownMenuTrigger: {
    name: "DropdownMenuTrigger",
    template: "<div><slot /></div>",
  },
}));

vi.mock("lucide-vue-next", () => ({
  ChevronDown: {
    name: "ChevronDown",
    template: "<span />",
  },
}));

describe("SplitButton", () => {
  it("uses the current item handler for the primary button when activeItem is stale", async () => {
    const staleHandler = vi.fn();
    const freshHandler = vi.fn();

    const wrapper = mount(SplitButton, {
      props: {
        activeItem: {
          label: "Reposition in ORBAT",
          onClick: staleHandler,
        },
        items: [
          {
            label: "Reposition in ORBAT",
            onClick: freshHandler,
          },
          {
            label: "Change symbol",
            onClick: vi.fn(),
          },
        ],
      },
    });

    wrapper.findComponent({ name: "Button" }).vm.$emit("click");

    expect(staleHandler).not.toHaveBeenCalled();
    expect(freshHandler).toHaveBeenCalledTimes(1);
  });
});
