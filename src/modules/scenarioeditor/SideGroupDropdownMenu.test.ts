// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import SideGroupDropdownMenu from "@/modules/scenarioeditor/SideGroupDropdownMenu.vue";
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

describe("SideGroupDropdownMenu", () => {
  it("renders expand and collapse unit actions", () => {
    const wrapper = mount(SideGroupDropdownMenu, {
      props: {
        isLocked: false,
        isSideLocked: false,
        isSideHidden: false,
        isSideGroupLocked: false,
        isSideGroupHidden: false,
      },
      global: { stubs: { Button: true, EllipsisVertical: true } },
    });

    expect(wrapper.text()).toContain("Expand units");
    expect(wrapper.text()).toContain("Collapse units");
  });

  it("emits collapse action when collapse units is selected", async () => {
    const wrapper = mount(SideGroupDropdownMenu, {
      props: {
        isLocked: false,
        isSideLocked: false,
        isSideHidden: false,
        isSideGroupLocked: false,
        isSideGroupHidden: false,
      },
      global: { stubs: { Button: true, EllipsisVertical: true } },
    });

    const collapse = wrapper
      .findAll("button.dropdown-item")
      .find((item) => item.text().includes("Collapse units"));
    expect(collapse).toBeDefined();
    await collapse!.trigger("click");

    expect(wrapper.emitted("action")?.[0]).toEqual([SideActions.Collapse]);
  });

  it("disables expand and collapse actions when group is locked", async () => {
    const wrapper = mount(SideGroupDropdownMenu, {
      props: {
        isLocked: true,
        isSideLocked: false,
        isSideHidden: false,
        isSideGroupLocked: false,
        isSideGroupHidden: false,
      },
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
