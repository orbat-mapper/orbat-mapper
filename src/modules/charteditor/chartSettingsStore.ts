import { defineStore } from "pinia";
import {
  DEFAULT_OPTIONS,
  LevelLayout,
  PartialOrbChartOptions,
  SpecificOptions,
  UnitNodeInfo,
} from "./orbatchart";

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
    labelOffset: DEFAULT_OPTIONS.labelOffset,
    fontWeight: "normal",
    fontStyle: "normal",
  }),
});

export const useSelectedChartUnitStore = defineStore("selectedChartUnitStore", {
  state: (): { node: UnitNodeInfo | null } => ({
    node: null,
  }),
  actions: {
    clear() {
      this.node = null;
    },
  },
});

export const useSpecificChartOptionsStore = defineStore("specificChartOptions", {
  state: (): Required<SpecificOptions> => ({
    level: {},
    levelGroup: {},
    unit: {},
  }),
  actions: {
    clear() {
      this.level = {};
      this.levelGroup = {};
      this.unit = {};
    },
  },
});
