// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { computed } from "vue";
import { describe, expect, it, vi } from "vitest";
import UnitTreeSelect from "@/components/UnitTreeSelect.vue";

vi.mock("@tanstack/vue-virtual", () => ({
  useVirtualizer: (options: any) =>
    computed(() => {
      const count = options.value.count;
      const size = options.value.estimateSize();
      const renderedCount = Math.min(count, 8);
      return {
        getTotalSize: () => count * size,
        getVirtualItems: () =>
          Array.from({ length: renderedCount }, (_, index) => ({
            index,
            key: index,
            start: index * size,
            size,
          })),
      };
    }),
}));

function makeUnit(id: string, name: string, subUnits: string[] = []) {
  return {
    id,
    name,
    sidc: "10031000000000000000",
    subUnits,
    _pid: "",
    _sid: "side-1",
  };
}

describe("UnitTreeSelect", () => {
  it("renders nested units in tree order without virtualization below threshold", async () => {
    const wrapper = mount(UnitTreeSelect, {
      props: {
        units: ["unit-1"],
        unitMap: {
          "unit-1": makeUnit("unit-1", "Alpha", ["unit-1-1"]),
          "unit-1-1": makeUnit("unit-1-1", "Alpha Child"),
        } as any,
        virtualizationThreshold: 10,
      },
      global: {
        stubs: {
          Popover: { template: "<div><slot /></div>" },
          PopoverTrigger: { template: "<div><slot /></div>" },
          PopoverContent: { template: "<div><slot /></div>" },
          UnitSymbol: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Alpha");
    expect(wrapper.text()).not.toContain("Alpha Child");

    const expandToggle = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Alpha"))!
      .find("svg")!;
    await expandToggle.trigger("click");

    expect(wrapper.text()).toContain("Alpha Child");
  });

  it("uses virtual rows at and above threshold", () => {
    const unitIds = Array.from({ length: 120 }, (_, index) => `unit-${index}`);
    const unitMap = Object.fromEntries(
      unitIds.map((id, index) => [id, makeUnit(id, `Unit ${index}`)]),
    );

    const wrapper = mount(UnitTreeSelect, {
      props: {
        units: unitIds,
        unitMap: unitMap as any,
        virtualizationThreshold: 1,
      },
      global: {
        stubs: {
          Popover: { template: "<div><slot /></div>" },
          PopoverTrigger: { template: "<div><slot /></div>" },
          PopoverContent: { template: "<div><slot /></div>" },
          UnitSymbol: true,
        },
      },
    });

    const renderedButtons = wrapper.findAll("button").filter((button) => {
      return button.text().startsWith("Unit ");
    });
    expect(renderedButtons.length).toBeGreaterThan(0);
    expect(renderedButtons.length).toBeLessThan(unitIds.length);
  });
});
