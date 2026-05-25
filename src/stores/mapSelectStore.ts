import { defineStore } from "pinia";

export const useMapSelectStore = defineStore("uiMapSelect", {
  state: () => ({
    unitSelectEnabled: true,
    featureSelectEnabled: true,
    hoverEnabled: true,
    // Active selection-suppression tokens. While any are held, the map's click
    // selection handler stands down. Refcounted (via a Set of tokens) so several
    // interactions can suppress at once — e.g. the image-export area draw, where
    // the click that finishes the box must not also select a unit underneath.
    selectionSuppressors: new Set<symbol>(),
  }),
  getters: {
    // True while any interaction has asked selection to stand down.
    selectionSuppressed: (state) => state.selectionSuppressors.size > 0,
  },
  actions: {
    /**
     * Suppress map click selection until the returned disposer is called.
     * The disposer is idempotent, so calling it more than once is safe.
     *
     *   const release = store.suppressSelection();
     *   // ...interaction owns the clicks...
     *   release();
     */
    suppressSelection(): () => void {
      const token = Symbol("selectionSuppressor");
      this.selectionSuppressors.add(token);
      return () => {
        this.selectionSuppressors.delete(token);
      };
    },
  },
});
