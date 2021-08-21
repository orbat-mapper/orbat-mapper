import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state() {
    return {
      mapIconSize: 30,
      orbatIconSize: 20,
    };
  },
});
