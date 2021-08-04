import { defineStore } from "pinia";

export const useUiStore = defineStore({
  id: "ui",
  state: () => ({
    modalOpen: false,
  }),
  getters: {
    shortcutsEnabled: (state) => !state.modalOpen,
  },
});
