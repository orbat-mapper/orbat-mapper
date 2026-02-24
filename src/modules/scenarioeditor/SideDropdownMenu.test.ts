// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import SideDropdownMenu from "@/modules/scenarioeditor/SideDropdownMenu.vue";
import { SideActions } from "@/types/constants";

vi.mock("@/components/ui/dropdown-menu", () => {
  const passthrough = (name: string) =>
    defineComponent({
      name,
      template: "<div><slot /></div>",
    });

  const DropdownMenuItem = defineComponent({
    name: "DropdownMenuItem",
    props: { disabled: { type: Boolean, default: false } },
    emits: ["select"],
    template:
      "<button class='dropdown-item' :data-disabled='disabled || undefined' @click='!disabled && $emit(\"select\")'><slot /></button>",
  });

  return {
    DropdownMenu: passthrough("DropdownMenu"),
    DropdownMenuContent: passthrough("DropdownMenuContent"),
    DropdownMenuItem,
    DropdownMenuLabel: passthrough("DropdownMenuLabel"),
    DropdownMenuSeparator: passthrough("DropdownMenuSeparator"),
    DropdownMenuTrigger: passthrough("DropdownMenuTrigger"),
  };
});

describe("SideDropdownMenu", () => {
  it("renders expand and collapse unit actions", () => {
    const wrapper = mount(SideDropdownMenu, {
      props: { isLocked: false, isHidden: false },
      global: { stubs: { Button: true, EllipsisVertical: true } },
    });

    expect(wrapper.text()).toContain("Expand units");
    expect(wrapper.text()).toContain("Collapse units");
  });

  it("emits expand action when expand units is selected", async () => {
    const wrapper = mount(SideDropdownMenu, {
      props: { isLocked: false, isHidden: false },
      global: { stubs: { Button: true, EllipsisVertical: true } },
    });

    const expand = wrapper
      .findAll("button.dropdown-item")
      .find((item) => item.text().includes("Expand units"));
    expect(expand).toBeDefined();
    await expand!.trigger("click");

    expect(wrapper.emitted("action")?.[0]).toEqual([SideActions.Expand]);
  });

  it("disables expand and collapse actions when side is locked", async () => {
    const wrapper = mount(SideDropdownMenu, {
      props: { isLocked: true, isHidden: false },
      global: { stubs: { Button: true, EllipsisVertical: true } },
    });

    const expand = wrapper
      .findAll("button.dropdown-item")
      .find((item) => item.text().includes("Expand units"));
    const collapse = wrapper
      .findAll("button.dropdown-item")
      .find((item) => item.text().includes("Collapse units"));
    expect(expand?.attributes("data-disabled")).toBeDefined();
    expect(collapse?.attributes("data-disabled")).toBeDefined();

    await expand!.trigger("click");
    await collapse!.trigger("click");
    expect(wrapper.emitted("action")).toBeUndefined();
  });
});
