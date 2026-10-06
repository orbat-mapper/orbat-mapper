import { describe, expect, it } from "vitest";
import { useImmerStore } from "./immerStore";

describe("useImmerStore groupUpdate", () => {
  it("preserves revision boundaries and patch order across undo and redo", () => {
    const store = useImmerStore<{ items: string[] }, string>({ items: [] });

    store.groupUpdate(() => {
      store.update((draft) => {
        draft.items.push("first");
      });
      store.update((draft) => {
        draft.items.push("second");
      });
    });

    expect(store.state.items).toEqual(["first", "second"]);
    expect(store.revision.value).toBe(2);

    store.undo();
    expect(store.state.items).toEqual([]);
    expect(store.revision.value).toBe(0);

    store.redo();
    expect(store.state.items).toEqual(["first", "second"]);
    expect(store.revision.value).toBe(2);
  });
});

describe("useImmerStore update", () => {
  it("sets a key whose value is undefined, and undoes it", () => {
    const store = useImmerStore<{ entry: { value?: number } }, string>({
      entry: { value: undefined },
    });

    store.update((draft) => {
      draft.entry.value = 1;
    });
    expect(store.state.entry.value).toBe(1);

    store.undo();
    expect(store.state.entry.value).toBeUndefined();
    store.redo();
    expect(store.state.entry.value).toBe(1);
  });

  it("still replaces array elements in place", () => {
    const store = useImmerStore<{ items: string[] }, string>({ items: ["a", "b"] });

    store.update((draft) => {
      draft.items[0] = "c";
    });
    expect(store.state.items).toEqual(["c", "b"]);
  });
});
