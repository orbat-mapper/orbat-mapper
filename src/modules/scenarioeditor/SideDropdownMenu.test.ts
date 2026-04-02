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

  const DropdownMenuCheckboxItem = defineComponent({
    name: "DropdownMenuCheckboxItem",
    props: {
      checked: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
    },
    emits: ["select"],
    template:
      "<button class='dropdown-checkbox-item' :data-disabled='disabled || undefined' @click='!disabled && $emit(\"select\")'><slot /></button>",
  });

  const DropdownMenuSubTrigger = defineComponent({
    name: "DropdownMenuSubTrigger",
    props: { disabled: { type: Boolean, default: false } },
    template:
      "<button class='dropdown-sub-trigger' :data-disabled='disabled || undefined'><slot /></button>",
  });

  return {
    DropdownMenu: passthrough("DropdownMenu"),
    DropdownMenuCheckboxItem,
    DropdownMenuContent: passthrough("DropdownMenuContent"),
    DropdownMenuItem,
    DropdownMenuLabel: passthrough("DropdownMenuLabel"),
    DropdownMenuSeparator: passthrough("DropdownMenuSeparator"),
    DropdownMenuSub: passthrough("DropdownMenuSub"),
    DropdownMenuSubContent: passthrough("DropdownMenuSubContent"),
    DropdownMenuSubTrigger,
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

  it("groups add actions under an Add submenu", () => {
    const wrapper = mount(SideDropdownMenu, {
      props: { isLocked: false, isHidden: false },
      global: { stubs: { Button: true, EllipsisVertical: true } },
    });

    expect(wrapper.find("button.dropdown-sub-trigger").text()).toContain("Add");
    expect(wrapper.text()).toContain("Add side");
    expect(wrapper.text()).toContain("Add group");
    expect(wrapper.text()).toContain("Add root unit");
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

  it("emits add group when selected from the Add submenu", async () => {
    const wrapper = mount(SideDropdownMenu, {
      props: { isLocked: false, isHidden: false },
      global: { stubs: { Button: true, EllipsisVertical: true } },
    });

    const addGroup = wrapper
      .findAll("button.dropdown-item")
      .find((item) => item.text().includes("Add group"));
    expect(addGroup).toBeDefined();

    await addGroup!.trigger("click");

    expect(wrapper.emitted("action")?.[0]).toEqual([SideActions.AddGroup]);
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

  it("disables the Add submenu trigger when side is locked", () => {
    const wrapper = mount(SideDropdownMenu, {
      props: { isLocked: true, isHidden: false },
      global: { stubs: { Button: true, EllipsisVertical: true } },
    });

    expect(
      wrapper.find("button.dropdown-sub-trigger").attributes("data-disabled"),
    ).toBeDefined();
  });
});
