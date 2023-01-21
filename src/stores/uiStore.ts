import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    modalOpen: false,
    editToolbarActive: false,
    measurementActive: false,
    getLocationActive: false,
    activeItem: null,
    activeStateItem: null,
  }),
  getters: {
    shortcutsEnabled: (state) => !state.modalOpen,
    escEnabled: (state) =>
      !(
        state.modalOpen ||
        state.editToolbarActive ||
        state.measurementActive ||
        state.getLocationActive
      ),
  },
});
