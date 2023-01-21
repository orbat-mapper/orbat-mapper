import { defineStore } from "pinia";
import { TAB_ORBAT } from "@/types/constants";

export const useTabStore = defineStore("uiTabs", {
  state: () => ({
    activeScenarioTab: TAB_ORBAT,
  }),
});
