import { defineStore } from "pinia";

export const useMainToolbarStore = defineStore("mainToolbar", {
  state: () => ({
    showToolbar: false,
    showMeasurementsToolbar: false,
  }),
});
