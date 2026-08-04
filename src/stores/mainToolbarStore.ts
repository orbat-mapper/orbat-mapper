import { defineStore } from "pinia";
import type { SimpleStyleSpec } from "@/geo/simplestyle";
import type { DrawType } from "@/geo/drawTypes";

export type ToolbarType = "measurements" | "draw" | "track" | "route";

export const useMainToolbarStore = defineStore("mainToolbar", {
  state: () => ({
    currentToolbar: null as ToolbarType | null,
    addMultiple: false,
    currentDrawStyle: {} as Partial<SimpleStyleSpec>,
    // Remembered by the draw split button; lives here because the toolbar is v-if'd.
    lastDrawType: "LineString" as DrawType,
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
