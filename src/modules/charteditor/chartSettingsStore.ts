import { defineStore } from "pinia";
import { DEFAULT_OPTIONS, LevelLayout, PartialOrbChartOptions } from "./orbatchart";

export interface State {
  maxLevels: number;
  symbolSize: number;
  fontSize: number;
}

export const useChartSettingsStore = defineStore("chartSettingsStore", {
  state: (): PartialOrbChartOptions => ({
    maxLevels: 4,
    symbolSize: DEFAULT_OPTIONS.symbolSize,
    fontSize: DEFAULT_OPTIONS.fontSize,
    lastLevelLayout: LevelLayout.TreeRight,
    connectorOffset: DEFAULT_OPTIONS.connectorOffset,
    levelPadding: 160,
    treeOffset: DEFAULT_OPTIONS.treeOffset,
    stackedOffset: DEFAULT_OPTIONS.stackedOffset,
    lineWidth: DEFAULT_OPTIONS.lineWidth,
    useShortName: true,
    unitLevelDistance: DEFAULT_OPTIONS.unitLevelDistance,
  }),
});
