import { defineStore } from "pinia";
import {
  DEFAULT_OPTIONS,
  LevelLayout,
  PartialOrbChartOptions,
  RenderedUnitNode,
  SpecificOptions,
  Unit,
} from "./orbatchart";

export interface State {
  maxLevels: number;
  symbolSize: number;
  fontSize: number;
}

export interface SelectedState {
  node: RenderedUnitNode | null;
  level: number | null;
  branch: { level: number; parent: string | number } | null;
}

export interface RootUnitState {
  unit: Unit | null | undefined;
}

export interface ChartSettingsState extends PartialOrbChartOptions {
  paperSize: string;
}

export const useRootUnitStore = defineStore("chartRootUnit", {
  state: (): RootUnitState => {
    return { unit: null };
  },
});

export const useChartSettingsStore = defineStore("chartSettingsStore", {
  state: (): ChartSettingsState => ({
    paperSize: "4:3",
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
    lineColor: DEFAULT_OPTIONS.lineColor,
    hideLabel: false,
    fontColor: DEFAULT_OPTIONS.fontColor,
  }),
});

export const useSelectedChartElementStore = defineStore("selectedChartUnitStore", {
  state: (): SelectedState => ({
    node: null,
    level: null,
    branch: null,
  }),
  actions: {
    clear() {
      this.node = null;
      this.level = null;
      this.branch = null;
    },
    selectUnit(unit: RenderedUnitNode) {
      this.node = unit;
      this.level = unit.level;
      this.branch = unit.parent
        ? { parent: unit.parent.unit.id, level: unit.level }
        : null;
    },
    selectLevel(levelNumber: number) {
      this.level = levelNumber;
      this.node = null;
      this.branch = null;
    },
    selectBranch(parentId: string | number, level: number) {
      this.branch = { level, parent: parentId };
      this.level = level;
      this.node = null;
    },
  },
});

export const useSpecificChartOptionsStore = defineStore("specificChartOptions", {
  state: (): Required<SpecificOptions> => ({
    level: {},
    branch: {},
    unit: {},
  }),
  actions: {
    clear() {
      this.level = {};
      this.branch = {};
      this.unit = {};
    },
  },
});

export const useMergedChartOptionsStore = defineStore("mergedChartOption", {
  getters: {
    level() {
      const selected = useSelectedChartElementStore();
      const specific = useSpecificChartOptionsStore();
      const chart = useChartSettingsStore();
      const spec = selected.level !== null ? specific.level[selected.level] || {} : {};
      return { ...chart.$state, ...spec };
    },

    branch() {
      const selected = useSelectedChartElementStore();
      const specific = useSpecificChartOptionsStore();
      const spec =
        selected.branch !== null ? specific.branch[selected.branch.parent] || {} : {};
      return { ...this.level, ...spec };
    },

    unit() {
      const selected = useSelectedChartElementStore();
      const specific = useSpecificChartOptionsStore();
      const spec = selected.node ? specific.unit[selected.node.unit.id] || {} : {};

      return { ...this.branch, ...spec };
    },
  },
});
