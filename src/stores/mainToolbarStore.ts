import { defineStore } from "pinia";
import type { SimpleStyleSpec } from "@/geo/simplestyle";

export type ToolbarType = "measurements" | "draw" | "track";

export const useMainToolbarStore = defineStore("mainToolbar", {
  state: () => ({
    currentToolbar: null as ToolbarType | null,
    addMultiple: false,
    currentDrawStyle: {} as Partial<SimpleStyleSpec>,
    modifyFeatureState: false,
  }),
  actions: {
    toggleToolbar(toolbar: ToolbarType | null) {
      this.currentToolbar = this.currentToolbar === toolbar ? null : toolbar;
    },
    clearToolbar() {
      this.currentToolbar = null;
    },
  },
});
