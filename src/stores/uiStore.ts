import { defineStore } from "pinia";
import { TAB_ORBAT } from "@/types/constants";

export const useUiStore = defineStore("ui", {
  state: () => ({
    modalOpen: false,
    editToolbarActive: false,
    measurementActive: false,
    getLocationActive: false,
    activeItem: null,
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

export const useTabStore = defineStore("uiTabs", {
  state: () => ({
    activeScenarioTab: TAB_ORBAT,
  }),
});

export const useMapSelectStore = defineStore("uiMapSelect", {
  state: () => ({
    unitSelectEnabled: true,
    featureSelectEnabled: true,
  }),
});
