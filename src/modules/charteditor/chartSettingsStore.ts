import { defineStore } from "pinia";

interface State {
  maxLevels: 3;
}
export const useChartSettingsStore = defineStore("chartSettingsStore", {
  state: (): State => ({
    maxLevels: 3,
  }),
});
