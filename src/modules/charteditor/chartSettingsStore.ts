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
    connectorOffset: DEFAULT_OPTIONS.connectorOffset,
    levelPadding: DEFAULT_OPTIONS.levelPadding,
    treeOffset: DEFAULT_OPTIONS.treeOffset,
    stackedOffset: DEFAULT_OPTIONS.stackedOffset,
    lineWidth: DEFAULT_OPTIONS.lineWidth,
    useShortName: false,
    unitLevelDistance: DEFAULT_OPTIONS.unitLevelDistance,
  }),
});
