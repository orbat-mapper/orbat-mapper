import { defineStore } from "pinia";

export type ToolbarType = "measurements" | "draw";

export const useMainToolbarStore = defineStore("mainToolbar", {
  state: () => ({
    currentToolbar: null as ToolbarType | null,
    addMultiple: false,
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
