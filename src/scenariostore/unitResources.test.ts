import { describe, expect, it, vi } from "vitest";
import {
  applyResourceDiff,
  applyResourceUpdate,
  entriesToExternal,
  entriesToInternal,
  type ResourceEntry,
} from "./unitResources";

describe("applyResourceUpdate", () => {
  it("replaces fields on the entry matched by id", () => {
    const target = [
      { id: "a", count: 10, onHand: 10 },
      { id: "b", count: 5, onHand: 5 },
    ];
    applyResourceUpdate(target, [{ id: "b", count: 8 }], "equipment");
    expect(target).toEqual([
      { id: "a", count: 10, onHand: 10 },
      { id: "b", count: 8, onHand: 5 },
    ]);
  });

  it("warns and skips entries with no match", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const target = [{ id: "a", count: 1 }];
    applyResourceUpdate(target, [{ id: "missing", count: 9 }], "personnel");
    expect(target).toEqual([{ id: "a", count: 1 }]);
    expect(warn).toHaveBeenCalledWith("personnel not found", { id: "missing", count: 9 });
    warn.mockRestore();
  });

  it("is a no-op when target or updates are undefined", () => {
    expect(() => applyResourceUpdate(undefined, [{ id: "a" }], "supplies")).not.toThrow();
    const target = [{ id: "a", count: 1 }];
    applyResourceUpdate(target, undefined, "supplies");
    expect(target).toEqual([{ id: "a", count: 1 }]);
  });
});

describe("applyResourceDiff", () => {
  it("accumulates an onHand delta on the matched entry", () => {
    const target = [{ id: "a", count: 10, onHand: 10 }];
    applyResourceDiff(target, [{ id: "a", onHand: -3 }], "equipment");
    applyResourceDiff(target, [{ id: "a", onHand: 1 }], "equipment");
    expect(target).toEqual([{ id: "a", count: 10, onHand: 8 }]);
  });

  it("defaults onHand to count before the first delta", () => {
    const target: ResourceEntry[] = [{ id: "a", count: 12 }];
    applyResourceDiff(target, [{ id: "a", onHand: -2 }], "supplies");
    expect(target).toEqual([{ id: "a", count: 12, onHand: 10 }]);
  });

  it("treats a missing delta as zero", () => {
    const target = [{ id: "a", count: 4, onHand: 4 }];
    applyResourceDiff(target, [{ id: "a" }], "personnel");
    expect(target).toEqual([{ id: "a", count: 4, onHand: 4 }]);
  });
});

describe("name↔id round-trip", () => {
  it("maps name→id and back, preserving other fields", () => {
    const external = [{ name: "Rifle", count: 30, onHand: 28 }];
    const nameToId = (name: string) => ({ Rifle: "eq-1" })[name] ?? name;
    const idToName = (id: string) => ({ "eq-1": "Rifle" })[id] ?? id;

    const internal = entriesToInternal(external, nameToId);
    expect(internal).toEqual([{ id: "eq-1", count: 30, onHand: 28 }]);

    const back = entriesToExternal(internal, idToName);
    expect(back).toEqual(external);
  });

  it("falls back to the raw key when the catalog has no entry", () => {
    expect(entriesToInternal([{ name: "x", count: 1 }], (n) => n)).toEqual([
      { id: "x", count: 1 },
    ]);
    expect(entriesToExternal([{ id: "x", count: 1 }], (id) => id)).toEqual([
      { name: "x", count: 1 },
    ]);
  });

  it("passes undefined through", () => {
    expect(entriesToInternal(undefined, (n) => n)).toBeUndefined();
    expect(entriesToExternal(undefined, (id) => id)).toBeUndefined();
  });
});
