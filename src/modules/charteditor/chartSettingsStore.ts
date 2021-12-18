import { defineStore } from "pinia";

export interface State {
  maxLevels: number;
  symbolSize: number;
}

export const useChartSettingsStore = defineStore("chartSettingsStore", {
  state: (): State => ({
    maxLevels: 3,
    symbolSize: 32,
  }),
});
