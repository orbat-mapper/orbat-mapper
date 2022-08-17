import { defineStore } from "pinia";
import { SymbologyStandard } from "@/types/scenarioModels";
import { useLocalStorage } from "@vueuse/core";

export const useSettingsStore = defineStore("settings", {
  state() {
    return {
      mapIconSize: useLocalStorage("mapIconSize", 30),
      orbatIconSize: useLocalStorage("orbatIconSize", 20),
      symbologyStandard: "2525" as SymbologyStandard,
    };
  },
});
