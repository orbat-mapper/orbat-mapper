import { defineStore } from "pinia";
import { DEFAULT_OPTIONS, LevelLayout, PartialOrbChartOptions } from "./orbatchart";

export interface State {
  maxLevels: number;
  symbolSize: number;
  fontSize: number;
}

export const useChartSettingsStore = defineStore("chartSettingsStore", {
  state: (): PartialOrbChartOptions => ({
    maxLevels: 3,
    symbolSize: DEFAULT_OPTIONS.symbolSize,
    fontSize: DEFAULT_OPTIONS.fontSize,
    lastLevelLayout: LevelLayout.TreeRight,
  }),
});
