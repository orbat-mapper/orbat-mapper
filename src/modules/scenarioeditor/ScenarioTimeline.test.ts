// @vitest-environment jsdom
import "@/dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, nextTick, reactive, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import ScenarioTimeline from "./ScenarioTimeline.vue";
import { activeScenarioKey } from "@/components/injects";
import { usePlaybackStore } from "@/stores/playbackStore";
import { useTimelineChangesStore } from "@/stores/timelineChangesStore";

const { formatterSpy } = vi.hoisted(() => ({
  formatterSpy: vi.fn((value: number) => `fmt:${value}`),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");
  const { ref } = await import("vue");
  const width = ref(1000);

  return {
    ...actual,
    useElementSize: () => ({ width }),
    useThrottleFn: (fn: (...args: any[]) => any) => fn,
  };
});

vi.mock("@/stores/timeFormatStore", () => ({
  useTimeFormatStore: () => ({
    scenarioFormatter: {
      format: formatterSpy,
    },
  }),
}));

const TimelineContextMenuStub = defineComponent({
  name: "TimelineContextMenu",
  props: {
    formattedHoveredDate: {
      type: String,
      default: "",
    },
  },
  emits: ["action"],
  template: `
    <div data-test="ctx" :data-hover="formattedHoveredDate">
      <button data-test="ctx-zoom-in" @click="$emit('action', 'zoomIn')" />
      <button data-test="ctx-zoom-out" @click="$emit('action', 'zoomOut')" />
      <button data-test="ctx-add" @click="$emit('action', 'addScenarioEvent')" />
      <slot :onContextMenu="() => {}" />
    </div>
  `,
});

function makeScenarioFixture(histogram: { t: number; count: number }[] = []) {
  const state = reactive({
    currentTime: Date.UTC(2024, 0, 1, 10, 7),
    events: [] as string[],
    eventMap: {} as Record<string, any>,
    unitStateCounter: 0,
    featureStateCounter: 0,
  });

  const setCurrentTime = vi.fn((timestamp: number) => {
    state.currentTime = timestamp;
  });
  const addScenarioEvent = vi.fn((event: { title: string; startTime: number }) => {
    const id = `evt-${state.events.length + 1}`;
    state.eventMap[id] = { id, _type: "scenario", ...event };
    state.events.push(id);
    state.events.sort(
      (a, b) => state.eventMap[a].startTime - state.eventMap[b].startTime,
    );
    return id;
  });

  const scenario = {
    time: {
      scenarioTime: ref({
        valueOf: () => state.currentTime,
        utcOffset: () => 0,
      }),
      timeZone: ref("UTC"),
      setCurrentTime,
      computeTimeHistogram: vi.fn(() => ({ histogram, max: 1 })),
      goToScenarioEvent: vi.fn(),
      addScenarioEvent,
    },
    store: {
      state,
    },
  };

  return { scenario, state, setCurrentTime, addScenarioEvent };
}

function parseWidth(style: string | undefined) {
  const match = /width:\s*([\d.]+)px/.exec(style || "");
  return match ? Number(match[1]) : NaN;
}

function nonEmptyTexts(wrapper: VueWrapper, selector: string) {
  return wrapper
    .findAll(selector)
    .map((node) => node.text().trim())
    .filter(Boolean);
}

const wrappers: VueWrapper[] = [];

function mountTimeline(histogram: { t: number; count: number }[] = []) {
  const fixture = makeScenarioFixture(histogram);
  const wrapper = mount(ScenarioTimeline, {
    attachTo: document.body,
    global: {
      provide: {
        [activeScenarioKey as symbol]: fixture.scenario,
      },
      stubs: {
        TimelineContextMenu: TimelineContextMenuStub,
        TimelineChangesPanel: { template: "<div data-test='changes-panel' />" },
      },
    },
  });

  wrappers.push(wrapper);
  return { wrapper, ...fixture };
}

beforeEach(() => {
  setActivePinia(createPinia());
  formatterSpy.mockClear();
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  while (wrappers.length) {
    wrappers.pop()?.unmount();
  }
  document.body.innerHTML = "";
});

describe("ScenarioTimeline", () => {
  it("adds scenario event from context-menu position without prior mousemove", async () => {
    const { wrapper, addScenarioEvent } = mountTimeline();
    await nextTick();

    const host = wrapper.get("[data-testid='scenario-timeline']").element;
    host.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        clientX: 500,
      }),
    );
    await nextTick();

    await wrapper.get("[data-test='ctx-add']").trigger("click");

    expect(addScenarioEvent).toHaveBeenCalledTimes(1);
    expect(addScenarioEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: Date.UTC(2024, 0, 1, 10, 0),
      }),
    );
    expect(wrapper.findAll("[data-testid='scenario-event-marker']")).toHaveLength(1);
  });

  it("does not add scenario event before first hover sample", async () => {
    const { wrapper, addScenarioEvent } = mountTimeline();
    await nextTick();

    await wrapper.get("[data-test='ctx-add']").trigger("click");

    expect(addScenarioEvent).not.toHaveBeenCalled();
  });

  it("provides an empty hover label before mouse move", async () => {
    const { wrapper } = mountTimeline();
    await nextTick();

    expect(wrapper.get("[data-test='ctx']").attributes("data-hover")).toBe("");
  });

  it("keeps wheel and context-menu zoom-in increments consistent", async () => {
    const { wrapper: wheelWrapper } = mountTimeline();
    await nextTick();

    await wheelWrapper.get("[data-testid='scenario-timeline']").trigger("wheel", {
      deltaY: -1,
    });
    await nextTick();

    const wheelWidth = parseWidth(
      wheelWrapper.get("[data-testid='major-tick']").attributes("style"),
    );

    const { wrapper: contextWrapper } = mountTimeline();
    await nextTick();

    await contextWrapper.get("[data-test='ctx-zoom-in']").trigger("click");
    await nextTick();

    const contextWidth = parseWidth(
      contextWrapper.get("[data-testid='major-tick']").attributes("style"),
    );

    expect(wheelWidth).toBe(140);
    expect(contextWidth).toBe(140);
  });

  it("allows zooming out below 10px and clamps stepped day blocks", async () => {
    const { wrapper } = mountTimeline();
    await nextTick();

    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await nextTick();

    const steppedWidth = parseWidth(
      wrapper.get("[data-testid='minor-tick']").attributes("style"),
    );
    expect(steppedWidth).toBeGreaterThanOrEqual(5);
    expect(steppedWidth).toBeLessThanOrEqual(140);
    expect(steppedWidth % 5).toBe(0);
  });

  it("uses denser minor tick blocks when space allows it", async () => {
    const { wrapper } = mountTimeline();
    await nextTick();

    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await nextTick();

    const widths = wrapper
      .findAll("[data-testid='minor-tick']")
      .map((node) => parseWidth(node.attributes("style")));

    expect(widths.some((value) => value === 60)).toBe(true);
    expect(widths.every((value) => value <= 60)).toBe(true);
  });

  it("switches to month/day rows at threshold mode", async () => {
    const { wrapper } = mountTimeline();
    await nextTick();

    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await nextTick();

    const majorLabels = nonEmptyTexts(wrapper, "[data-testid='major-tick']");
    const minorLabels = nonEmptyTexts(wrapper, "[data-testid='minor-tick']");

    expect(majorLabels.some((label) => /[A-Za-z]{3}\s\d{4}/.test(label))).toBe(true);
    expect(minorLabels.some((label) => /^\d{2}$/.test(label))).toBe(true);
  });

  it("uses month-anchored day labels that include 01 in stepped mode", async () => {
    const { wrapper } = mountTimeline();
    await nextTick();

    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await wrapper.get("[data-test='ctx-zoom-out']").trigger("click");
    await nextTick();

    const minorLabels = nonEmptyTexts(wrapper, "[data-testid='minor-tick']");

    expect(minorLabels).toContain("01");
    expect(
      minorLabels.every((label) =>
        ["01", "04", "07", "10", "13", "16", "19", "22", "25", "28", "31"].includes(
          label,
        ),
      ),
    ).toBe(true);
  });

  it("rounds click-selected time to the nearest 15 minutes", async () => {
    const { wrapper, setCurrentTime, state } = mountTimeline();
    await nextTick();

    state.currentTime = Date.UTC(2024, 0, 1, 10, 7);
    await nextTick();

    const host = wrapper.get("[data-testid='scenario-timeline']").element;
    host.dispatchEvent(
      new MouseEvent("pointerup", {
        bubbles: true,
        button: 0,
        clientX: 500,
      }),
    );
    await nextTick();

    expect(setCurrentTime).toHaveBeenLastCalledWith(Date.UTC(2024, 0, 1, 10, 0));
  });

  it("does not trigger timeline pointerup rounding when pressing an event marker", async () => {
    const { wrapper, setCurrentTime, state } = mountTimeline();
    state.eventMap["evt-1"] = {
      id: "evt-1",
      _type: "scenario",
      title: "Event 1",
      startTime: Date.UTC(2024, 0, 1, 10, 7),
    };
    state.events.push("evt-1");
    await nextTick();
    await nextTick();

    setCurrentTime.mockClear();

    const marker = wrapper.get("[data-testid='scenario-event-marker']").element;
    marker.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerId: 1,
        clientX: 500,
      }),
    );
    marker.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        pointerId: 1,
        button: 0,
        clientX: 500,
      }),
    );
    await nextTick();

    expect(setCurrentTime).not.toHaveBeenCalled();
  });

  it.each(["pointerup", "pointercancel"])(
    "flags time scrubbing while the timeline is dragged until %s",
    async (endEvent) => {
      const { wrapper } = mountTimeline();
      const playback = usePlaybackStore();
      await nextTick();

      const host = wrapper.get("[data-testid='scenario-timeline']").element;
      const pointer = (type: string, clientX: number) =>
        host.dispatchEvent(
          new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientX }),
        );
      pointer("pointerdown", 500);
      pointer("pointermove", 502);
      await nextTick();
      expect(playback.timeScrubbing).toBe(false);

      pointer("pointermove", 540);
      await nextTick();
      expect(playback.timeScrubbing).toBe(true);
      expect(playback.timeAnimating).toBe(true);

      pointer(endEvent, 540);
      await nextTick();
      expect(playback.timeScrubbing).toBe(false);
    },
  );

  describe("unit change bins", () => {
    const binT = Date.UTC(2024, 0, 1, 10);

    it("shows the changes around a clicked bin, and closes on a second click", async () => {
      const { wrapper, setCurrentTime } = mountTimeline([{ t: binT, count: 3 }]);
      await nextTick();
      const store = useTimelineChangesStore();

      const bin = wrapper.get("[data-testid='timeline-bin']");
      expect(bin.attributes("aria-label")).toBe("3 changes. Click to see what changed.");

      await bin.trigger("click");
      expect(store.isOpen).toBe(true);
      expect(store.centerT).toBe(binT);
      expect(wrapper.find("[data-test='changes-panel']").exists()).toBe(true);
      expect(wrapper.get("[data-testid='timeline-bin']").classes()).toContain("ring-2");

      await wrapper.get("[data-testid='timeline-bin']").trigger("click");
      expect(store.isOpen).toBe(false);
      expect(wrapper.find("[data-test='changes-panel']").exists()).toBe(false);
      expect(setCurrentTime).not.toHaveBeenCalled();
    });

    it("follows now again when a time is clicked on the timeline", async () => {
      const { wrapper } = mountTimeline([{ t: binT, count: 1 }]);
      await nextTick();
      const store = useTimelineChangesStore();
      await wrapper.get("[data-testid='timeline-bin']").trigger("click");
      expect(store.centerT).toBe(binT);

      wrapper
        .get("[data-testid='scenario-timeline']")
        .element.dispatchEvent(
          new MouseEvent("pointerup", { bubbles: true, button: 0, clientX: 500 }),
        );
      await nextTick();

      expect(store.isOpen).toBe(true);
      expect(store.centerT).toBeNull();
    });

    it("does not move the scenario time when a bin is pressed", async () => {
      const { wrapper, setCurrentTime } = mountTimeline([{ t: binT, count: 1 }]);
      await nextTick();

      const bin = wrapper.get("[data-testid='timeline-bin']").element;
      for (const type of ["pointerdown", "pointerup"]) {
        bin.dispatchEvent(
          new PointerEvent(type, { bubbles: true, pointerId: 1, clientX: 500 }),
        );
      }
      await nextTick();

      expect(setCurrentTime).not.toHaveBeenCalled();
    });

    it("toggles the changes around the current time", async () => {
      const { wrapper } = mountTimeline();
      await nextTick();
      const store = useTimelineChangesStore();

      await wrapper.get("[data-testid='timeline-changes-toggle']").trigger("click");
      expect(store.isOpen).toBe(true);

      await wrapper.get("[data-testid='timeline-changes-toggle']").trigger("click");
      expect(store.isOpen).toBe(false);
    });

    it("closes the changes panel when the timeline unmounts", async () => {
      const { wrapper } = mountTimeline([{ t: binT, count: 1 }]);
      await nextTick();
      const store = useTimelineChangesStore();
      await wrapper.get("[data-testid='timeline-bin']").trigger("click");

      wrapper.unmount();
      wrappers.splice(wrappers.indexOf(wrapper), 1);
      expect(store.isOpen).toBe(false);
    });
  });
});
