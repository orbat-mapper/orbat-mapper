// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useTimelineChangesStore } from "@/stores/timelineChangesStore";

describe("timelineChangesStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("toggles the changes around the current time", () => {
    const store = useTimelineChangesStore();
    store.toggle(null);
    expect(store.isOpen).toBe(true);
    expect(store.centerT).toBeNull();

    store.toggle(null);
    expect(store.isOpen).toBe(false);
  });

  it("centres on a time, and goes back to following now", () => {
    const store = useTimelineChangesStore();
    store.toggle(1000);
    expect(store.isOpen).toBe(true);
    expect(store.centerT).toBe(1000);

    store.toggle(2000);
    expect(store.isOpen).toBe(true);
    expect(store.centerT).toBe(2000);

    store.followNow();
    expect(store.isOpen).toBe(true);
    expect(store.centerT).toBeNull();
  });

  it("closes when the same time is toggled again", () => {
    const store = useTimelineChangesStore();
    store.toggle(1000);
    store.toggle(1000);
    expect(store.isOpen).toBe(false);
    expect(store.centerT).toBeNull();
  });

  it("switches to now rather than closing when centred on a time", () => {
    const store = useTimelineChangesStore();
    store.toggle(1000);
    store.toggle(null);
    expect(store.isOpen).toBe(true);
    expect(store.centerT).toBeNull();
  });

  it("forgets the centre when closed", () => {
    const store = useTimelineChangesStore();
    store.toggle(1000);
    store.close();
    expect(store.isOpen).toBe(false);
    expect(store.centerT).toBeNull();
  });
});
