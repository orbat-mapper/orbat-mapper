import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { TAB_ORBAT } from "@/types/constants";

export const useUiStore = defineStore("ui", {
  state: () => ({
    modalOpen: false,
    editToolbarActive: false,
    measurementActive: false,
    getLocationActive: false,
    activeItem: null,
    activeStateItem: null,
    debugMode: useLocalStorage("debugMode", false),
    mobilePanelOpen: false,
    layersPanelActive: false,
    activeTabIndex: TAB_ORBAT,
    showSearch: false,
    searchGeoMode: false,
    mapLayersPanelOpen: true,
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

export const useWidthStore = defineStore("panelWidth", {
  state: () => ({
    orbatPanelWidth: useLocalStorage("orbatPanelWidth", 400),
    detailsWidth: useLocalStorage("detailsPanelWidth", 400),
  }),
  actions: {
    resetOrbatPanelWidth() {
      this.orbatPanelWidth = 400;
    },

    resetDetailsWidth() {
      this.detailsWidth = 400;
    },
  },
});
