// @vitest-environment jsdom
/**
 * The control-measure counterpart of DrawToolSplitButton: the main half re-arms the
 * remembered kind, the menu lists the pinned kinds plus a "More…" escape hatch into
 * the full picker dialog. Arming itself stays with the toolbar (which also records
 * the last-used kind); this component only emits.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import ControlMeasureSplitButton from "@/modules/scenarioeditor/ControlMeasureSplitButton.vue";
import { getControlMeasureKindOption } from "@/modules/scenarioeditor/controlMeasurePicker";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";

vi.mock("@/components/ui/button", () => ({
  // Listeners fall through to the native button; re-emitting would double-fire.
  Button: {
    name: "Button",
    props: ["disabled"],
    template: '<button :disabled="disabled"><slot /></button>',
  },
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: { name: "DropdownMenu", template: "<div><slot /></div>" },
  DropdownMenuContent: { name: "DropdownMenuContent", template: "<div><slot /></div>" },
  DropdownMenuItem: {
    name: "DropdownMenuItem",
    emits: ["select"],
    template: "<button @click=\"$emit('select', $event)\"><slot /></button>",
  },
  DropdownMenuSeparator: { name: "DropdownMenuSeparator", template: "<hr />" },
  DropdownMenuTrigger: { name: "DropdownMenuTrigger", template: "<div><slot /></div>" },
}));

vi.mock("@lucide/vue", () => ({
  ChevronDown: { name: "ChevronDown", template: "<span />" },
}));

// The preview builds real SVG geometry and has nothing to say about the split button.
vi.mock("@/modules/scenarioeditor/ControlMeasurePreview.vue", () => ({
  default: { name: "ControlMeasurePreview", props: ["kind"], template: "<span />" },
}));

function mountButton(armedKind: ControlMeasureId | null = null) {
  // Pins and lastKind live in localStorage; without this, state leaks between tests.
  localStorage.clear();
  setActivePinia(createPinia());
  const wrapper = mount(ControlMeasureSplitButton, { props: { armedKind } });
  return { wrapper, store: useControlMeasureToolStore() };
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

describe("ControlMeasureSplitButton", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("arms the remembered kind from the main half", async () => {
    const { wrapper, store } = mountButton();

    const name = getControlMeasureKindOption(store.lastKind)!.name;
    await buttonByTitle(wrapper, name).trigger("click");

    expect(wrapper.emitted("select")).toEqual([[store.lastKind]]);
  });

  it("offers the pinned kinds and the full catalog in the menu", async () => {
    const { wrapper, store } = mountButton();

    const items = wrapper.findAllComponents({ name: "DropdownMenuItem" });
    // One per pinned kind plus the "More…" escape hatch and the pin reset.
    expect(items).toHaveLength(store.pinnedKinds.length + 2);

    const boundary = items.find((item) => item.text().includes("Boundary"))!;
    await boundary.trigger("click");
    expect(wrapper.emitted("select")).toEqual([["boundary"]]);

    const more = items.find((item) => item.text().includes("More control measures"))!;
    await more.trigger("click");
    expect(wrapper.emitted("more")).toHaveLength(1);
  });

  it("resets the pins to the defaults from the menu", async () => {
    const { wrapper, store } = mountButton();
    store.pinKind("breach");

    const reset = wrapper
      .findAllComponents({ name: "DropdownMenuItem" })
      .find((item) => item.text().includes("Reset pinned"))!;
    await reset.trigger("click");

    expect(store.pinnedKinds).not.toContain("breach");
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("mirrors the armed kind even when the picker dialog armed it", async () => {
    const { wrapper } = mountButton("main-attack");

    const name = getControlMeasureKindOption("main-attack")!.name;
    await buttonByTitle(wrapper, name).trigger("click");

    expect(wrapper.emitted("select")).toEqual([["main-attack"]]);
  });

  it("disables both halves, not hides them, without engine support", () => {
    const { wrapper } = mountButton();
    wrapper.setProps({ disabled: true });

    return wrapper.vm.$nextTick().then(() => {
      const gated = wrapper
        .findAll("button")
        .filter((button) =>
          button.attributes("title")?.startsWith("Control measures are not supported"),
        );
      expect(gated).toHaveLength(2);
      for (const button of gated) expect(button.attributes("disabled")).toBeDefined();
    });
  });
});
