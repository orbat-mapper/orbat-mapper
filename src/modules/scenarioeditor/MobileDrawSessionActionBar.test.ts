// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";

import MobileDrawSessionActionBar from "@/modules/scenarioeditor/MobileDrawSessionActionBar.vue";
import { scenarioDrawKey } from "@/components/injects";
import type { DrawSessionProgress } from "@/modules/scenarioeditor/useScenarioDraw";

function mountBar(progress: DrawSessionProgress) {
  const drawSessionProgress = ref<DrawSessionProgress | null>(progress);
  const finishDrawSession = vi.fn();
  const cancel = vi.fn();
  const wrapper = mount(MobileDrawSessionActionBar, {
    global: {
      provide: {
        [scenarioDrawKey as symbol]: {
          drawSessionProgress,
          finishDrawSession,
          cancel,
        },
      },
    },
  });
  return { wrapper, drawSessionProgress, finishDrawSession, cancel };
}

describe("MobileDrawSessionActionBar", () => {
  it("shows accessible progress and disables Done for an incomplete draft", async () => {
    const { wrapper, finishDrawSession, cancel } = mountBar({
      family: "plain",
      drawType: "Polygon",
      pointCount: 1,
      minPoints: 3,
      canCommit: false,
    });

    const status = wrapper.get("[aria-live='polite']");
    expect(status.text()).toContain("Polygon · 1 point — add 2 more");

    const done = wrapper.get("[aria-label='Done drawing']");
    expect(done.attributes("disabled")).toBeDefined();
    await done.trigger("click");
    expect(finishDrawSession).not.toHaveBeenCalled();

    await wrapper.get("[aria-label='Cancel drawing']").trigger("click");
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("allows an empty session to be ended explicitly", async () => {
    const { wrapper, finishDrawSession } = mountBar({
      family: "plain",
      drawType: "LineString",
      pointCount: 0,
      minPoints: 2,
      canCommit: false,
    });

    expect(wrapper.text()).toContain("Line · Tap to start");
    const done = wrapper.get("[aria-label='Done drawing']");
    expect(done.attributes("disabled")).toBeUndefined();
    await done.trigger("click");
    expect(finishDrawSession).toHaveBeenCalledOnce();
  });

  it("keeps the replacement row at the existing toolbar footprint", () => {
    const { wrapper } = mountBar({
      family: "plain",
      drawType: "LineString",
      pointCount: 0,
      minPoints: 2,
      canCommit: false,
    });

    // Existing toolbar rows are 36px buttons plus 4px padding on each edge. This row
    // uses 44px touch targets with no vertical padding: both footprints are 44px.
    expect(wrapper.get("[aria-label='Drawing actions']").classes()).toContain("p-0");
    expect(wrapper.get("[aria-label='Cancel drawing']").classes()).toContain("size-11");
    expect(wrapper.get("[aria-label='Done drawing']").classes()).toContain("size-11");
  });
});
