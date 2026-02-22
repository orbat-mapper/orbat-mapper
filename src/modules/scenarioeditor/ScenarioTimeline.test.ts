// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, nextTick, reactive, ref } from "vue";
import ScenarioTimeline from "./ScenarioTimeline.vue";
import { activeScenarioKey } from "@/components/injects";

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

function makeScenarioFixture() {
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
    state.events.sort((a, b) => state.eventMap[a].startTime - state.eventMap[b].startTime);
    return id;
  });

  const scenario = {
    time: {
      scenarioTime: ref({
        valueOf: () => state.currentTime,
        utcOffset: () => 0,
      }),
      setCurrentTime,
      computeTimeHistogram: vi.fn(() => ({ histogram: [], max: 1 })),
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

const wrappers: VueWrapper[] = [];

function mountTimeline() {
  const fixture = makeScenarioFixture();
  const wrapper = mount(ScenarioTimeline, {
    attachTo: document.body,
    global: {
      provide: {
        [activeScenarioKey as symbol]: fixture.scenario,
      },
      stubs: {
        TimelineContextMenu: TimelineContextMenuStub,
      },
    },
  });

  wrappers.push(wrapper);
  return { wrapper, ...fixture };
}

beforeEach(() => {
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
});
