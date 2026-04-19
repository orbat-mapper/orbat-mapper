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
