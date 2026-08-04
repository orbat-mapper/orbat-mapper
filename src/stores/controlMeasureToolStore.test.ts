import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  DEFAULT_NEW_CONTROL_MEASURE_DEFAULTS,
  DEFAULT_PINNED_CONTROL_MEASURE_KINDS,
  MAX_PINNED_CONTROL_MEASURE_KINDS,
  useControlMeasureToolStore,
} from "@/stores/controlMeasureToolStore";

beforeEach(() => {
  // Pins and lastKind live in localStorage now; without this, state leaks between tests.
  localStorage.clear();
  setActivePinia(createPinia());
});

describe("pinned control-measure kinds", () => {
  it("starts with the defaults", () => {
    expect(useControlMeasureToolStore().pinnedKinds).toEqual(
      DEFAULT_PINNED_CONTROL_MEASURE_KINDS,
    );
  });

  it("pins most-recently-used first without duplicating", () => {
    const store = useControlMeasureToolStore();
    store.pinKind("breach");
    store.pinKind("breach");
    expect(store.pinnedKinds[0]).toBe("breach");
    expect(store.pinnedKinds.filter((kind) => kind === "breach")).toHaveLength(1);
  });

  it("moves an already pinned kind to the front rather than growing", () => {
    const store = useControlMeasureToolStore();
    const before = store.pinnedKinds.length;
    store.pinKind("boundary");
    expect(store.pinnedKinds[0]).toBe("boundary");
    expect(store.pinnedKinds).toHaveLength(before);
  });

  it("evicts the least recently used once the menu is full", () => {
    const store = useControlMeasureToolStore();
    const extras = [
      "light-line",
      "engineer-work-line",
      "battle-position",
      "strong-point",
      "ambush",
      "encirclement",
      "assembly-area",
      "drop-zone",
      "extraction-zone",
      "landing-zone",
      "pickup-zone",
      "objective-area",
    ] as const;
    expect(extras).toHaveLength(MAX_PINNED_CONTROL_MEASURE_KINDS);
    extras.forEach((kind) => store.pinKind(kind));
    expect(store.pinnedKinds).toHaveLength(MAX_PINNED_CONTROL_MEASURE_KINDS);
    expect(store.pinnedKinds).toEqual([...extras].reverse());
  });

  it("resets the pins to the defaults but leaves the last-used kind alone", () => {
    const store = useControlMeasureToolStore();
    store.pinKind("breach");
    store.lastKind = "breach";
    store.resetPinnedKinds();
    expect(store.pinnedKinds).toEqual(DEFAULT_PINNED_CONTROL_MEASURE_KINDS);
    expect(store.lastKind).toBe("breach");
  });

  it("toggles a kind off and back on", () => {
    const store = useControlMeasureToolStore();
    store.togglePinnedKind("boundary");
    expect(store.pinnedKinds).not.toContain("boundary");
    store.togglePinnedKind("boundary");
    expect(store.pinnedKinds[0]).toBe("boundary");
  });
});

describe("authoring defaults", () => {
  it("starts session-sticky rather than empty", () => {
    expect(useControlMeasureToolStore().defaults).toEqual(
      DEFAULT_NEW_CONTROL_MEASURE_DEFAULTS,
    );
  });

  it("merges a patch instead of replacing the whole set", () => {
    const store = useControlMeasureToolStore();
    store.setDefaults({ status: "planned" });
    store.setDefaults({ style: { color: "#ff0000" } });
    expect(store.defaults).toEqual({
      ...DEFAULT_NEW_CONTROL_MEASURE_DEFAULTS,
      status: "planned",
      style: { color: "#ff0000" },
    });
  });

  it("clears a field with an explicit undefined", () => {
    const store = useControlMeasureToolStore();
    store.setDefaults({ style: { color: "#ff0000" } });
    store.setDefaults({ style: undefined });
    expect(store.defaults.style).toBeUndefined();
  });
});
