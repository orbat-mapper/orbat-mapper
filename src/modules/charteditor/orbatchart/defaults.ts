import {
  ChartOrientation,
  LevelLayout,
  OrbChartOptions,
  UnitLevelDistance,
  VerticalAlignment,
} from "./types";

export const DEFAULT_CHART_WIDTH = 600;
export const DEFAULT_CHART_HEIGHT = 600;
export const TREE_LEFT_RIGHT_OFFSET = 50;
export const STACKED_OFFSET = 50;
export const MARGIN_TOP = 100;

export const DEFAULT_OPTIONS = {
  symbolSize: 32,
  maxLevels: 0,
  debug: false,
  connectorOffset: 5,
  orientation: ChartOrientation.Top,
  unitLevelDistance: UnitLevelDistance.Fixed,
  lastLevelLayout: LevelLayout.Horizontal,
  layout: LevelLayout.Horizontal,
  verticalAlignment: VerticalAlignment.Top,
  levelPadding: 175,
  treeOffset: TREE_LEFT_RIGHT_OFFSET,
  stackedOffset: STACKED_OFFSET,
  lineWidth: 1,
  fontSize: 12,
} as OrbChartOptions;
