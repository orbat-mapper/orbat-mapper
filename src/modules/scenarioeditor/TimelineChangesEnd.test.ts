// @vitest-environment jsdom
import "@/dayjs";
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { activeScenarioKey } from "@/components/injects";
import TimelineChangesEnd from "./TimelineChangesEnd.vue";
import type { TimelineChange } from "./timelineChanges";

const T0 = Date.UTC(2024, 0, 1, 10);

const next: TimelineChange = {
  id: "u1:s1",
  t: T0,
  entityType: "unit",
  entityId: "u1",
  stateId: "s1",
  kinds: ["location"],
  positions: [],
};

function mountEnd(props: {
  empty: boolean;
  hiddenCount: number;
  previous?: TimelineChange;
  next?: TimelineChange;
}) {
  return mount(TimelineChangesEnd, {
    props,
    global: {
      provide: {
        [activeScenarioKey as symbol]: {
          store: { state: { unitMap: { u1: { id: "u1", name: "Alpha" } } } },
          time: { timeZone: ref("UTC") },
        },
      },
    },
  });
}

describe("TimelineChangesEnd", () => {
  it("says the range is empty", () => {
    const wrapper = mountEnd({ empty: true, hiddenCount: 0 });
    expect(wrapper.text()).toContain("No changes in this time range");
  });

  it("offers to clear filters that hide every change", async () => {
    const wrapper = mountEnd({ empty: true, hiddenCount: 3 });
    expect(wrapper.text()).toContain("All 3 changes in this time range are hidden");
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("clearFilters")).toHaveLength(1);
  });

  it("goes to the changes before and after the range", async () => {
    const previous = { ...next, id: "u1:s0", stateId: "s0", t: T0 - 3600000 };
    const wrapper = mountEnd({ empty: false, hiddenCount: 0, previous, next });
    expect(wrapper.text()).toContain("Previous change: 01 Jan 09:00 · Alpha");
    expect(wrapper.text()).toContain("Next change: 01 Jan 10:00 · Alpha");
    expect(wrapper.text()).not.toContain("No changes");
    await wrapper.get('button[title="Go to the previous change"]').trigger("click");
    await wrapper.get('button[title="Go to the next change"]').trigger("click");
    expect(wrapper.emitted("go")).toEqual([[previous], [next]]);
  });
});
