// @vitest-environment jsdom
/**
 * The split button collapses the five plain draw shapes into one pill: the main half
 * re-arms the last-used shape, the chevron menu picks a new one. Arming stays with the
 * toolbar (which also records the last-used shape); this component only emits. The
 * remembered shape lives in the main toolbar store so it survives the v-if'd toolbar
 * unmounting.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import DrawToolSplitButton from "@/modules/scenarioeditor/DrawToolSplitButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

vi.mock("@/components/ui/button", () => ({
  // Listeners fall through to the native button; re-emitting would double-fire.
  Button: { name: "Button", template: "<button><slot /></button>" },
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: { name: "DropdownMenu", template: "<div><slot /></div>" },
  DropdownMenuContent: { name: "DropdownMenuContent", template: "<div><slot /></div>" },
  DropdownMenuItem: {
    name: "DropdownMenuItem",
    emits: ["select"],
    template: "<button @click=\"$emit('select', $event)\"><slot /></button>",
  },
  DropdownMenuTrigger: { name: "DropdownMenuTrigger", template: "<div><slot /></div>" },
}));

vi.mock("@lucide/vue", () => ({
  ChevronDown: { name: "ChevronDown", template: "<span />" },
}));

function mountButton(currentDrawType: string | null = null) {
  setActivePinia(createPinia());
  const wrapper = mount(DrawToolSplitButton, {
    props: { currentDrawType: currentDrawType as never },
  });
  return { wrapper, store: useMainToolbarStore() };
}

function buttonByTitle(
  wrapper: ReturnType<typeof mountButton>["wrapper"],
  title: string,
) {
  const hits = wrapper
    .findAll("button")
    .filter((button) => button.attributes("title") === title);
  expect(hits).toHaveLength(1);
  return hits[0]!;
}

describe("DrawToolSplitButton", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("arms the remembered shape from the main half", async () => {
    const { wrapper } = mountButton();

    await buttonByTitle(wrapper, "Line").trigger("click");

    expect(wrapper.emitted("select")).toEqual([["LineString"]]);
  });

  it("picks a shape from the menu", async () => {
    const { wrapper } = mountButton();

    const circleItem = wrapper
      .findAllComponents({ name: "DropdownMenuItem" })
      .find((item) => item.text().includes("Circle"))!;
    await circleItem.trigger("click");

    expect(wrapper.emitted("select")).toEqual([["Circle"]]);
  });

  it("previews and re-arms the shape the toolbar remembered", async () => {
    const { wrapper, store } = mountButton();
    store.lastDrawType = "Circle";
    await wrapper.vm.$nextTick();

    await buttonByTitle(wrapper, "Circle").trigger("click");

    expect(wrapper.emitted("select")).toEqual([["Circle"]]);
  });

  it("mirrors the armed shape even when armed elsewhere", async () => {
    const { wrapper } = mountButton("Rectangle");

    await buttonByTitle(wrapper, "Rectangle").trigger("click");

    expect(wrapper.emitted("select")).toEqual([["Rectangle"]]);
  });
});
