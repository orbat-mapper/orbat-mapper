// @vitest-environment jsdom
/**
 * The pinned control-measure kinds as inline toolbar buttons plus an "All…" escape
 * hatch into the full picker dialog. Arming itself stays with the toolbar; this
 * component only emits.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import ControlMeasureQuickTools from "@/modules/scenarioeditor/ControlMeasureQuickTools.vue";
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

// The preview builds real SVG geometry and has nothing to say about the buttons.
vi.mock("@/modules/scenarioeditor/ControlMeasurePreview.vue", () => ({
  default: { name: "ControlMeasurePreview", props: ["kind"], template: "<span />" },
}));

const ALL_TITLE = "Search all control measures";

function mountTools(
  armedKind: ControlMeasureId | null = null,
  disabled = false,
  crowded = false,
) {
  // Pins live in localStorage; without this, state leaks between tests.
  localStorage.clear();
  setActivePinia(createPinia());
  const store = useControlMeasureToolStore();
  const wrapper = mount(ControlMeasureQuickTools, {
    props: { armedKind, disabled, crowded },
  });
  return { wrapper, store };
}

function buttonByTitle(wrapper: ReturnType<typeof mountTools>["wrapper"], title: string) {
  const hits = wrapper
    .findAll("button")
    .filter((button) => button.attributes("title") === title);
  expect(hits).toHaveLength(1);
  return hits[0]!;
}

function kindName(kind: ControlMeasureId) {
  return getControlMeasureKindOption(kind)!.name;
}

describe("ControlMeasureQuickTools", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("shows every pinned kind as its own button, then the All button", () => {
    const { wrapper, store } = mountTools();

    const titles = wrapper.findAll("button").map((button) => button.attributes("title"));
    expect(titles).toEqual([...store.pinnedKinds.map(kindName), ALL_TITLE]);
    expect(wrapper.text()).toContain("All…");
  });

  it("arms a pinned kind in one click", async () => {
    const { wrapper } = mountTools();

    await buttonByTitle(wrapper, kindName("boundary")).trigger("click");

    expect(wrapper.emitted("select")).toEqual([["boundary"]]);
  });

  it("opens the full catalog from the All button", async () => {
    const { wrapper } = mountTools();

    await buttonByTitle(wrapper, ALL_TITLE).trigger("click");

    expect(wrapper.emitted("more")).toHaveLength(1);
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("follows the pins as they change", async () => {
    const { wrapper, store } = mountTools();

    store.pinKind("breach");
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll("button")[0]!.attributes("title")).toBe(kindName("breach"));
  });

  it("highlights the armed pin, or the All button for a kind outside the strip", async () => {
    const { wrapper } = mountTools("boundary");

    const boundary = buttonByTitle(wrapper, kindName("boundary"));
    expect(boundary.classes()).toContain("bg-army2");
    expect(buttonByTitle(wrapper, ALL_TITLE).classes()).not.toContain("bg-army2");

    await wrapper.setProps({ armedKind: "breach" });
    expect(buttonByTitle(wrapper, ALL_TITLE).classes()).toContain("bg-army2");
  });

  // Container queries do not run in jsdom, so this checks the classes that drive them.
  it("keeps two pins in a narrow toolbar and hands a hidden pin's highlight to All", () => {
    const { wrapper, store } = mountTools("main-attack");

    const pins = wrapper.findAll("button").slice(0, store.pinnedKinds.length);
    const compactOnly = pins.map((pin) => pin.classes().includes("hidden"));
    expect(compactOnly).toEqual(store.pinnedKinds.map((_, index) => index >= 2));
    // Main Attack is the third pin: hidden when narrow, so All lights up meanwhile.
    expect(buttonByTitle(wrapper, ALL_TITLE).classes()).toContain("bg-army2");
  });

  it("keeps one pin in a narrow toolbar that also holds the selection actions", () => {
    const { wrapper, store } = mountTools("boundary", false, true);

    const pins = wrapper.findAll("button").slice(0, store.pinnedKinds.length);
    const compactOnly = pins.map((pin) => pin.classes().includes("hidden"));
    expect(compactOnly).toEqual(store.pinnedKinds.map((_, index) => index >= 1));
    // Boundary is the second pin, hidden here, so All takes its highlight.
    expect(buttonByTitle(wrapper, ALL_TITLE).classes()).toContain("bg-army2");
  });

  it("disables every button, not hides them, without engine support", () => {
    const { wrapper, store } = mountTools(null, true);

    const gated = wrapper
      .findAll("button")
      .filter((button) =>
        button.attributes("title")?.startsWith("Control measures are not supported"),
      );
    expect(gated).toHaveLength(store.pinnedKinds.length + 1);
    for (const button of gated) expect(button.attributes("disabled")).toBeDefined();
  });
});
