import { defineStore } from "pinia";
import { DEFAULT_OPTIONS } from "./orbatchart";

export interface State {
  maxLevels: number;
  symbolSize: number;
  fontSize: number;
}

export const useChartSettingsStore = defineStore("chartSettingsStore", {
  state: (): State => ({
    maxLevels: 3,
    symbolSize: DEFAULT_OPTIONS.symbolSize,
    fontSize: DEFAULT_OPTIONS.fontSize,
  }),
});
