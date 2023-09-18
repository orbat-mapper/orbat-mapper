import { defineStore } from "pinia";
import { TAB_ORBAT } from "@/types/constants";

export const useTabStore = defineStore("uiTabs", {
  state: () => ({
    activeScenarioTab: TAB_ORBAT,
    unitDetailsTab: 0,
    featureDetailsTab: 0,
  }),
  getters: {
    orbatTabActive: (state) => state.activeScenarioTab === TAB_ORBAT,
  },
});
