// @vitest-environment jsdom
import "@/dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { activeScenarioKey } from "@/components/injects";
import type { NScenarioEvent } from "@/types/internalModels";
import TimelineChangesList from "./TimelineChangesList.vue";
import type { TimelineChange } from "./timelineChanges";

const H = 3600000;
const T0 = Date.UTC(2024, 0, 1, 10);

function change(id: string, t: number): TimelineChange {
  return {
    id,
    t,
    entityType: "unit",
    entityId: "u1",
    stateId: id,
    kinds: ["location"],
    positions: [],
  };
}

function event(id: string, startTime: number): NScenarioEvent {
  return { id, title: `Event ${id}`, startTime, _type: "scenario" };
}

const wrappers: VueWrapper[] = [];

async function mountList(changes: TimelineChange[], events: NScenarioEvent[]) {
  const wrapper = mount(TimelineChangesList, {
    attachTo: document.body,
    props: { changes, events, now: T0 },
    global: {
      provide: {
        [activeScenarioKey as symbol]: {
          store: {
            state: {
              unitMap: { u1: { id: "u1", name: "Alpha", _sid: "s1" } },
              sideGroupMap: {},
              sideMap: { s1: { id: "s1", name: "Blue" } },
              unitStatusMap: {},
            },
          },
          time: { timeZone: ref("UTC") },
        },
      },
      stubs: { TimelineChangeEntity: true },
    },
  });
  wrappers.push(wrapper);
  // The rows are virtualized and render once the scroll container is measured.
  await nextTick();
  return wrapper;
}

/** Each rendered row as "now", "event <title>" or "change <time>". */
function rowLabels(wrapper: VueWrapper) {
  return wrapper.findAll("tbody tr[data-index]").map((tr) => {
    const eventTitle = tr.find('button[title="Show event details"]');
    if (eventTitle.exists()) return `event ${eventTitle.text()}`;
    return tr.attributes("aria-hidden") ? "now" : `change ${tr.find("td").text()}`;
  });
}

beforeEach(() => {
  setActivePinia(createPinia());
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(400);
});

afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount());
  vi.restoreAllMocks();
});

describe("TimelineChangesList", () => {
  it("lists scenario events among the changes in time order", async () => {
    const wrapper = await mountList(
      [change("c1", T0 - 2 * H), change("c2", T0 - H), change("c3", T0 + H)],
      [event("a", T0 - H), event("b", T0 + 2 * H)],
    );
    expect(rowLabels(wrapper)).toEqual([
      "change 01 Jan 08:00",
      "event Event a",
      "change 01 Jan 09:00",
      "now",
      "change 01 Jan 11:00",
      "event Event b",
    ]);
  });

  it("jumps to an event on a row click and opens it from its title", async () => {
    const e = event("a", T0 + H);
    const wrapper = await mountList([], [e]);
    const row = wrapper.find('tbody tr[title^="Go to"]');
    await row.trigger("click");
    expect(wrapper.emitted("jumpEvent")).toEqual([[e]]);

    await wrapper.get('button[title="Show event details"]').trigger("click");
    expect(wrapper.emitted("selectEvent")).toEqual([[e]]);
    // The title click doesn't also jump.
    expect(wrapper.emitted("jumpEvent")).toHaveLength(1);

    await wrapper.get('button[title="Go to event"]').trigger("click");
    expect(wrapper.emitted("goEvent")).toEqual([[e]]);
  });

  it("shows and goes to the real start of a leg that began before the range", async () => {
    // Queried for a range from T0 - 2 h, so the leg's time is clamped to that.
    const leg: TimelineChange = {
      ...change("leg", T0 - 2 * H),
      kinds: ["moving"],
      leg: { start: T0 - 10 * H, end: T0 + 5 * H, earliest: T0 - 10 * H },
    };
    const wrapper = await mountList([leg], []);
    expect(rowLabels(wrapper)).toEqual(["change 01 Jan 00:00", "now"]);

    await wrapper.get('tbody tr[title^="Go to"]').trigger("click");
    expect(wrapper.emitted("jump")).toEqual([[{ ...leg, t: T0 - 10 * H }]]);
    await wrapper.get('button[title="Go to time, select and zoom"]').trigger("click");
    expect(wrapper.emitted("go")).toEqual([[{ ...leg, t: T0 - 10 * H }]]);
  });
});
