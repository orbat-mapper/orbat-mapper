import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import ReferenceGridControl from "@/modules/maplibreview/ReferenceGridControl.vue";
import { useReferenceGridStore } from "@/stores/referenceGridStore";

vi.mock("@/components/ui/popover", () => ({
  Popover: defineComponent({ template: "<div><slot /></div>" }),
  PopoverTrigger: defineComponent({ template: "<div><slot /></div>" }),
  PopoverContent: defineComponent({ template: "<div><slot /></div>" }),
}));

vi.mock("@/components/ui/slider", () => ({
  Slider: defineComponent({
    name: "SliderStub",
    props: ["modelValue", "min", "max", "step"],
    emits: ["update:modelValue"],
    template: "<div />",
  }),
}));

vi.mock("@/modules/maplibreview/useReferenceGridLayers", () => ({
  useReferenceGridLayers: () => ({ labels: { value: [] } }),
}));

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe("ReferenceGridControl", () => {
  it("toggles the session grid independently of its settings menu", async () => {
    const wrapper = mount(ReferenceGridControl);
    const grid = useReferenceGridStore();

    await wrapper.get("button[aria-label='Toggle reference grid']").trigger("click");
    expect(grid.visible).toBe(true);
    expect(
      wrapper
        .get("button[aria-label='Toggle reference grid']")
        .attributes("aria-pressed"),
    ).toBe("true");
  });

  it("offers only MGRS and latitude/longitude modes", async () => {
    const wrapper = mount(ReferenceGridControl);
    const mode = wrapper.get("#reference-grid-mode");

    expect(mode.findAll("option").map((option) => option.attributes("value"))).toEqual([
      "mgrs",
      "latlong",
    ]);
    await mode.setValue("latlong");
    expect(useReferenceGridStore().mode).toBe("latlong");
  });

  it("commits a positive latitude/longitude interval", async () => {
    const wrapper = mount(ReferenceGridControl);
    const grid = useReferenceGridStore();
    grid.setMode("latlong");
    await nextTick();

    const interval = wrapper.get("#reference-grid-latlong-interval");
    await interval.setValue("0.25");
    await interval.trigger("blur");
    expect(grid.latLongInterval).toBe(0.25);
  });
});
