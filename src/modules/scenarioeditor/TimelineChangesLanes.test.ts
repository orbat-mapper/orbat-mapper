// @vitest-environment jsdom
import "@/dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { activeScenarioKey } from "@/components/injects";
import type { NScenarioEvent } from "@/types/internalModels";
import TimelineChangesLanes from "./TimelineChangesLanes.vue";
import type { ChangeGroup, TimelineChange } from "./timelineChanges";

const H = 3600000;
const T0 = Date.UTC(2024, 0, 1, 10);
const TRACK_WIDTH = 600;

function change(overrides: Partial<TimelineChange> = {}): TimelineChange {
  return {
    id: "u1:s1",
    t: T0,
    entityType: "unit",
    entityId: "u1",
    stateId: "s1",
    kinds: ["location"],
    positions: [],
    ...overrides,
  };
}

const wrappers: VueWrapper[] = [];

async function mountLanes(
  changes: TimelineChange[],
  canRetime: (c: TimelineChange) => boolean = () => true,
) {
  const wrapper = mount(TimelineChangesLanes, {
    attachTo: document.body,
    props: {
      changes,
      // 6 hours over 600 px: 1 px is 36 seconds.
      axis: [T0 - 3 * H, T0 + 3 * H] as [number, number],
      canRetime,
    },
    global: {
      provide: {
        [activeScenarioKey as symbol]: {
          store: {
            state: {
              currentTime: T0,
              unitMap: {
                u1: { id: "u1", name: "Bravo", _sid: "s1" },
                u2: { id: "u2", name: "alpha", _sid: "s1" },
                u3: { id: "u3", name: "Charlie", _sid: "s1" },
              },
              sideGroupMap: {},
              sideMap: { s1: { id: "s1", name: "Blue" } },
            },
          },
          time: { timeZone: ref("UTC") },
        },
      },
      stubs: { TimelineChangeEntity: true },
    },
  });
  wrappers.push(wrapper);
  // The lanes are virtualized and render once the scroll container is measured.
  await nextTick();
  return wrapper;
}

function pointer(el: Element, type: string, clientX: number, shiftKey = false) {
  el.dispatchEvent(
    new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientX, shiftKey }),
  );
}

function pointerAt(
  el: Element,
  type: string,
  clientX: number,
  init: PointerEventInit = {},
) {
  el.dispatchEvent(
    new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientX, ...init }),
  );
}

/** Presses and releases without moving: a click. */
function press(el: Element, init: PointerEventInit = {}) {
  pointerAt(el, "pointerdown", 300, init);
  pointerAt(el, "pointerup", 300, init);
}

/** The state marks, which can be selected. */
function stateMarks(wrapper: VueWrapper) {
  return wrapper.findAll("button[aria-pressed]").map((w) => w.element as HTMLElement);
}
function selected(wrapper: VueWrapper) {
  return stateMarks(wrapper).map((el) => el.getAttribute("aria-pressed") === "true");
}

function key(el: Element, key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  el.dispatchEvent(event);
  return event;
}

function getMark(wrapper: VueWrapper) {
  return wrapper.get(".cursor-ew-resize, .cursor-pointer").element as HTMLElement;
}

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: TRACK_WIDTH,
  } as DOMRect);
  // Gives the virtualized lane list a viewport to fill.
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(400);
});

afterEach(() => {
  while (wrappers.length) wrappers.pop()?.unmount();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("TimelineChangesLanes", () => {
  it("draws one lane per unit", async () => {
    const wrapper = await mountLanes([
      change(),
      change({ id: "u1:s2", stateId: "s2", t: T0 + H }),
      change({ id: "u2:s1", entityId: "u2" }),
    ]);
    expect(wrapper.findAll("timeline-change-entity-stub")).toHaveLength(2);
  });

  it("sorts lanes by unit name, then descending, then by first change", async () => {
    const wrapper = await mountLanes([
      change(),
      change({ id: "u2:s1", entityId: "u2", t: T0 + H }),
      change({ id: "u3:s1", entityId: "u3", t: T0 + 2 * H }),
    ]);
    const order = () =>
      wrapper
        .findAll("timeline-change-entity-stub")
        .map((el) => el.attributes("entityid"));
    const sortButton = wrapper.find('button[title="Sort by unit"]');
    expect(order()).toEqual(["u1", "u2", "u3"]);
    await sortButton.trigger("click");
    expect(order()).toEqual(["u2", "u1", "u3"]);
    await sortButton.trigger("click");
    expect(order()).toEqual(["u3", "u1", "u2"]);
    await sortButton.trigger("click");
    expect(order()).toEqual(["u1", "u2", "u3"]);
  });

  it("selects a lane's unit from its name, and zooms from the zoom button", async () => {
    const wrapper = await mountLanes([change()]);
    await wrapper.get('button[title^="Select"]').trigger("click");
    expect(wrapper.emitted("select")).toEqual([[change()]]);
    expect(wrapper.emitted("zoom")).toBeUndefined();

    await wrapper.get('button[aria-label="Zoom to"]').trigger("click");
    expect(wrapper.emitted("zoom")).toEqual([[change()]]);
  });

  it("keeps the lane order when an edit changes which lane changes first", async () => {
    const first = change({ id: "u2:s1", entityId: "u2", t: T0 - H });
    const second = change({ t: T0 });
    const wrapper = await mountLanes([first, second]);
    const order = () =>
      wrapper
        .findAll("timeline-change-entity-stub")
        .map((el) => el.attributes("entityid"));
    expect(order()).toEqual(["u2", "u1"]);

    // u2's change is retimed to after u1's, and a new lane comes in.
    await wrapper.setProps({
      changes: [
        second,
        change({ id: "u3:s1", entityId: "u3", t: T0 + 30 * 60000 }),
        { ...first, t: T0 + H },
      ],
    });
    expect(order()).toEqual(["u2", "u1", "u3"]);

    // Moving the axis orders the lanes afresh.
    await wrapper.setProps({ axis: [T0 - 2 * H, T0 + 4 * H] });
    expect(order()).toEqual(["u1", "u3", "u2"]);
  });

  it("jumps to a change that is clicked without dragging, once a double-click is ruled out", async () => {
    vi.useFakeTimers();
    const wrapper = await mountLanes([change()]);
    const mark = getMark(wrapper);
    pointer(mark, "pointerdown", 300);
    pointer(mark, "pointerup", 301);
    mark.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    expect(wrapper.emitted("jump")).toBeUndefined();
    vi.advanceTimersByTime(300);
    expect(wrapper.emitted("jump")).toEqual([[change()]]);
    expect(wrapper.emitted("retime")).toBeUndefined();
  });

  it("goes to a double-clicked change without jumping first", async () => {
    vi.useFakeTimers();
    const wrapper = await mountLanes([change()]);
    const mark = getMark(wrapper);
    for (let i = 0; i < 2; i++) {
      pointer(mark, "pointerdown", 300);
      pointer(mark, "pointerup", 300);
    }
    mark.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    vi.advanceTimersByTime(300);
    expect(wrapper.emitted("go")).toEqual([[change()]]);
    expect(wrapper.emitted("jump")).toBeUndefined();
  });

  it("retimes a dragged change, snapped to 5 minutes", async () => {
    const wrapper = await mountLanes([change()]);
    const mark = getMark(wrapper);
    pointer(mark, "pointerdown", 300);
    // 102 px is 61.2 minutes, which snaps to 60.
    pointer(mark, "pointermove", 402);
    await nextTick();
    expect(wrapper.text()).toContain("11:00 (+1 h)");
    pointer(mark, "pointerup", 402);
    expect(wrapper.emitted("retime")).toEqual([[[{ change: change(), t: T0 + H }]]]);
    expect(wrapper.emitted("jump")).toBeUndefined();
  });

  it("snaps to 1 minute with Shift held", async () => {
    const wrapper = await mountLanes([change()]);
    const mark = getMark(wrapper);
    pointer(mark, "pointerdown", 300);
    pointer(mark, "pointermove", 402, true);
    pointer(mark, "pointerup", 402, true);
    expect(wrapper.emitted("retime")).toEqual([
      [[{ change: change(), t: T0 + 61 * 60000 }]],
    ]);
  });

  it("snaps to a mark on another lane when near it, with a line across the lanes", async () => {
    // 10:43:12 on another lane, 2 px from where the drag ends at 10:44:24.
    const other = change({ id: "u2:s1", entityId: "u2", t: T0 + 43.2 * 60000 });
    const wrapper = await mountLanes([change(), other]);
    const mark = getMark(wrapper);
    pointer(mark, "pointerdown", 300);
    pointer(mark, "pointermove", 374);
    await nextTick();
    expect(wrapper.find("[data-snap-guide]").exists()).toBe(true);
    // The mark snapped to is highlighted while dragging.
    const target = wrapper.get('button[aria-label^="alpha"]');
    expect(target.classes()).toContain("ring-fuchsia-500");
    pointer(mark, "pointerup", 374);
    await nextTick();
    expect(target.classes()).not.toContain("ring-fuchsia-500");
    expect(wrapper.emitted("retime")).toEqual([[[{ change: change(), t: other.t }]]]);
  });

  it("draws scenario events across the lanes and snaps to them", async () => {
    const wrapper = await mountLanes([change()]);
    await wrapper.setProps({
      events: [
        { id: "e1", title: "H-hour", startTime: T0 + 43.2 * 60000, _type: "scenario" },
      ] as NScenarioEvent[],
    });
    const marker = wrapper.get('button[aria-label="Event: H-hour"]');
    expect(wrapper.findAll(".border-amber-500\\/60")).toHaveLength(1);
    const mark = getMark(wrapper);
    pointer(mark, "pointerdown", 300);
    pointer(mark, "pointermove", 374);
    pointer(mark, "pointerup", 374);
    expect(wrapper.emitted("retime")).toEqual([
      [[{ change: change(), t: T0 + 43.2 * 60000 }]],
    ]);
    marker.element.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
    expect(wrapper.emitted("jumpEvent")?.[0][0]).toMatchObject({ id: "e1" });
  });

  it("snaps to the grid instead with Alt held", async () => {
    const other = change({ id: "u2:s1", entityId: "u2", t: T0 + 43.2 * 60000 });
    const wrapper = await mountLanes([change(), other]);
    const mark = getMark(wrapper);
    pointerAt(mark, "pointerdown", 300);
    pointerAt(mark, "pointermove", 374, { altKey: true });
    await nextTick();
    expect(wrapper.find("[data-snap-guide]").exists()).toBe(false);
    pointerAt(mark, "pointerup", 374, { altKey: true });
    expect(wrapper.emitted("retime")).toEqual([
      [[{ change: change(), t: T0 + 45 * 60000 }]],
    ]);
  });

  it("keeps a dragged change on the axis", async () => {
    const wrapper = await mountLanes([change()]);
    const mark = getMark(wrapper);
    pointer(mark, "pointerdown", 300);
    pointer(mark, "pointermove", 2000);
    pointer(mark, "pointerup", 2000);
    expect(wrapper.emitted("retime")).toEqual([[[{ change: change(), t: T0 + 3 * H }]]]);
  });

  it("cancels a drag with Escape", async () => {
    const wrapper = await mountLanes([change()]);
    const mark = getMark(wrapper);
    pointer(mark, "pointerdown", 300);
    pointer(mark, "pointermove", 402);
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    pointer(mark, "pointerup", 402);
    expect(wrapper.emitted("retime")).toBeUndefined();
  });

  it("does not retime a change that cannot be retimed", async () => {
    const wrapper = await mountLanes([change()], () => false);
    const mark = getMark(wrapper);
    expect(mark.classList).toContain("cursor-pointer");
    pointer(mark, "pointerdown", 300);
    pointer(mark, "pointermove", 402);
    pointer(mark, "pointerup", 402);
    expect(wrapper.emitted("retime")).toBeUndefined();
  });

  it("jumps to a change activated from the keyboard", async () => {
    const wrapper = await mountLanes([change()]);
    const mark = getMark(wrapper);
    expect(mark.getAttribute("aria-label")).toBe("Bravo: Location, 01 Jan 10:00");
    // Enter and Space on a button click it with no click count.
    mark.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
    expect(wrapper.emitted("jump")).toEqual([[change()]]);
  });

  describe("selecting marks", () => {
    const M = 60000;
    const a1 = change();
    const a2 = change({ id: "u1:s2", stateId: "s2", t: T0 + 30 * M });
    const a3 = change({ id: "u1:s3", stateId: "s3", t: T0 + 60 * M });
    const b1 = change({ id: "u2:s1", entityId: "u2", t: T0 + 30 * M });

    beforeEach(() => vi.useFakeTimers());

    it("selects a clicked mark, and more with Cmd/Ctrl-click without jumping", async () => {
      const wrapper = await mountLanes([a1, a2, b1]);
      const [m1, m2, mb] = stateMarks(wrapper);
      press(m1);
      await nextTick();
      expect(selected(wrapper)).toEqual([true, false, false]);

      press(mb, { metaKey: true });
      press(m2, { ctrlKey: true });
      await nextTick();
      expect(selected(wrapper)).toEqual([true, true, true]);

      press(m2, { ctrlKey: true });
      await nextTick();
      expect(selected(wrapper)).toEqual([true, false, true]);
      vi.advanceTimersByTime(300);
      expect(wrapper.emitted("jump")).toEqual([[a1]]);
    });

    it("selects the marks between with Shift-click on a lane", async () => {
      const wrapper = await mountLanes([a1, a2, a3]);
      const [m1, , m3] = stateMarks(wrapper);
      press(m1);
      press(m3, { shiftKey: true });
      await nextTick();
      expect(selected(wrapper)).toEqual([true, true, true]);
    });

    it("moves every selected mark when one of them is dragged", async () => {
      const wrapper = await mountLanes([a1, a2, b1]);
      const [m1, , mb] = stateMarks(wrapper);
      press(m1);
      press(mb, { metaKey: true });
      // 100 px is an hour.
      pointerAt(m1, "pointerdown", 300);
      pointerAt(m1, "pointermove", 400);
      await nextTick();
      expect(wrapper.text()).toContain("· 2 changes");
      pointerAt(m1, "pointerup", 400);
      expect(wrapper.emitted("retime")).toEqual([
        [
          [
            { change: a1, t: a1.t + H },
            { change: b1, t: b1.t + H },
          ],
        ],
      ]);
    });

    it("drags an unselected mark alone, and selects it", async () => {
      const wrapper = await mountLanes([a1, a2]);
      const [m1, m2] = stateMarks(wrapper);
      press(m1);
      pointerAt(m2, "pointerdown", 300);
      pointerAt(m2, "pointermove", 400);
      pointerAt(m2, "pointerup", 400);
      await nextTick();
      expect(wrapper.emitted("retime")).toEqual([[[{ change: a2, t: a2.t + H }]]]);
      expect(selected(wrapper)).toEqual([false, true]);
    });

    it("deletes the selection, without the editor's Delete shortcut", async () => {
      const wrapper = await mountLanes([a1, a2]);
      const [m1, m2] = stateMarks(wrapper);
      const editorShortcut = vi.fn();
      document.addEventListener("keydown", editorShortcut);
      press(m1);
      press(m2, { metaKey: true });
      const event = key(m1, "Delete");
      document.removeEventListener("keydown", editorShortcut);
      expect(wrapper.emitted("delete")).toEqual([[[a1, a2]]]);
      expect(event.defaultPrevented).toBe(true);
      expect(editorShortcut).not.toHaveBeenCalled();
      await nextTick();
      expect(selected(wrapper)).toEqual([false, false]);
    });

    it("leaves keys alone when nothing is selected", async () => {
      const wrapper = await mountLanes([a1]);
      expect(key(stateMarks(wrapper)[0], "Delete").defaultPrevented).toBe(false);
      expect(wrapper.emitted("delete")).toBeUndefined();
    });

    it("nudges the selection with Alt+arrows", async () => {
      const wrapper = await mountLanes([a1]);
      const [m1] = stateMarks(wrapper);
      press(m1);
      key(m1, "ArrowRight", { altKey: true });
      key(m1, "ArrowLeft", { altKey: true, shiftKey: true });
      expect(wrapper.emitted("retime")).toEqual([
        [[{ change: a1, t: a1.t + 5 * M }]],
        [[{ change: a1, t: a1.t - M }]],
      ]);
    });

    it("clears the selection with Escape", async () => {
      const wrapper = await mountLanes([a1]);
      const [m1] = stateMarks(wrapper);
      press(m1);
      key(m1, "Escape");
      await nextTick();
      expect(selected(wrapper)).toEqual([false]);
    });

    it("selects the marks in a box drawn over the lanes, and clears on a click", async () => {
      const wrapper = await mountLanes([a1, a3, b1]);
      const track = wrapper.get(".bg-border").element;
      // The unit column is 220 px, so the 380 px track puts T0 at 410 px and T0 + 30
      // minutes at about 442 px. Lane centres are at 14 and 42 px.
      pointerAt(track, "pointerdown", 400, { clientY: 5 });
      pointerAt(track, "pointermove", 450, { clientY: 50 });
      await nextTick();
      pointerAt(track, "pointerup", 450, { clientY: 50 });
      await nextTick();
      // Lanes come in order of their first change: u1's a1 and a3, then u2's b1.
      expect(selected(wrapper)).toEqual([true, false, true]);

      press(track, { clientY: 5 });
      await nextTick();
      expect(selected(wrapper)).toEqual([false, false, false]);
    });
  });

  describe("lane names", () => {
    it("adds and takes lanes with Cmd/Ctrl-click, and the lanes between with Shift", async () => {
      const wrapper = await mountLanes([
        change(),
        change({ id: "u2:s1", entityId: "u2", t: T0 + H }),
        change({ id: "u3:s1", entityId: "u3", t: T0 + 2 * H }),
      ]);
      const names = wrapper.findAll('button[title^="Select"]');
      await names[0].trigger("click");
      await names[1].trigger("click", { metaKey: true });
      await names[2].trigger("click", { shiftKey: true });
      expect(wrapper.emitted("select")).toHaveLength(1);
      const selectMany = wrapper.emitted<[ChangeGroup[], string]>("selectMany")!;
      expect(selectMany[0][0].map((l) => l.entityId)).toEqual(["u2"]);
      expect(selectMany[0][1]).toBe("toggle");
      expect(selectMany[1][0].map((l) => l.entityId)).toEqual(["u2", "u3"]);
      expect(selectMany[1][1]).toBe("add");
    });
  });

  describe("dragging a leg", () => {
    const leg = change({
      id: "u1:s2:leg",
      stateId: "s2",
      t: T0 - H,
      kinds: ["moving"],
      leg: { start: T0 - H, end: T0, earliest: T0 - 2 * H, latest: T0 + 30 * 60000 },
    });
    const arrival = change({ id: "u1:s2", stateId: "s2" });

    it("moves the leg's start and end, up to the next state", async () => {
      const wrapper = await mountLanes([leg, arrival]);
      const bar = wrapper.get('button[aria-label^="Bravo: Moving"]').element;
      pointerAt(bar, "pointerdown", 300);
      // An hour later, but the next state is 30 minutes after the arrival.
      pointerAt(bar, "pointermove", 400);
      await nextTick();
      expect(wrapper.text()).toContain("09:30 → 10:30 (+30 min)");
      pointerAt(bar, "pointerup", 400);
      expect(wrapper.emitted("retimeLeg")).toEqual([[leg, 30 * 60000]]);
      expect(wrapper.emitted("retime")).toBeUndefined();
    });

    it("moves back no further than the state before", async () => {
      const wrapper = await mountLanes([leg, arrival]);
      const bar = wrapper.get('button[aria-label^="Bravo: Moving"]').element;
      pointerAt(bar, "pointerdown", 300);
      pointerAt(bar, "pointermove", 0);
      pointerAt(bar, "pointerup", 0);
      expect(wrapper.emitted("retimeLeg")).toEqual([[leg, -H]]);
    });
  });

  describe("clicking a leg", () => {
    // From 07:30, before the axis starts at 07:00 when clamped, to 10:00.
    const leg = change({
      id: "u1:s2:leg",
      stateId: "s2",
      t: T0 - 3 * H,
      kinds: ["moving"],
      leg: { start: T0 - 3.5 * H, end: T0, earliest: T0 - 4 * H },
    });
    const arrival = change({ id: "u1:s2", stateId: "s2" });
    const bar = (wrapper: VueWrapper) =>
      wrapper.get('button[aria-label^="Bravo: Moving"]').element;

    beforeEach(() => vi.useFakeTimers());

    it("jumps to the time under the pointer", async () => {
      const wrapper = await mountLanes([leg, arrival]);
      // 250 px is 2.5 hours into the axis: 09:30.
      pointerAt(bar(wrapper), "pointerdown", 250);
      pointerAt(bar(wrapper), "pointerup", 250);
      vi.advanceTimersByTime(300);
      expect(wrapper.emitted("jump")).toEqual([[{ ...leg, t: T0 - 0.5 * H }]]);
    });

    it("keeps the time within the leg", async () => {
      const wrapper = await mountLanes([leg, arrival]);
      pointerAt(bar(wrapper), "pointerdown", 500);
      pointerAt(bar(wrapper), "pointerup", 500);
      vi.advanceTimersByTime(300);
      expect(wrapper.emitted("jump")).toEqual([[{ ...leg, t: T0 }]]);
    });

    it("goes to the time under the pointer on a double-click", async () => {
      const wrapper = await mountLanes([leg, arrival]);
      bar(wrapper).dispatchEvent(
        new MouseEvent("dblclick", { bubbles: true, clientX: 150, detail: 2 }),
      );
      expect(wrapper.emitted("go")).toEqual([[{ ...leg, t: T0 - 1.5 * H }]]);
    });

    it("jumps to the leg's start from the keyboard, not the clamped time", async () => {
      const wrapper = await mountLanes([leg, arrival]);
      bar(wrapper).dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
      expect(wrapper.emitted("jump")).toEqual([[{ ...leg, t: T0 - 3.5 * H }]]);
    });
  });
});
