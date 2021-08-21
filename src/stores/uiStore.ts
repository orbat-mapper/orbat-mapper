import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    modalOpen: false,
  }),
  getters: {
    shortcutsEnabled: (state) => !state.modalOpen,
  },
});
