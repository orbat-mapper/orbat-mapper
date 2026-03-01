import type { Symbol as MilSymbol, SymbolOptions } from "milsymbol";
import { type Selection } from "d3-selection";

export type SVGElementSelection = Selection<SVGElement, any, any, any>;
export type GElementSelection = Selection<SVGGElement, any, any, any>;
export type RectElementSelection = Selection<SVGRectElement, any, any, any>;

export const ChartOrientations = {
  Top: "TOP",
  Bottom: "BOTTOM",
  // Left = "LEFT",
  // Right = "RIGHT"
} as const;

export type ChartOrientation = (typeof ChartOrientations)[keyof typeof ChartOrientations];

/**
 * Different ways to place units
 */
export const LevelLayouts = {
  Horizontal: "HORIZONTAL",
  Stacked: "STACKED",
  Tree: "TREE",
  TreeLeft: "TREE_LEFT",
  TreeRight: "TREE_RIGHT",
} as const;

export type LevelLayout = (typeof LevelLayouts)[keyof typeof LevelLayouts];

export const UnitLevelDistances = {
  Fixed: "FIXED",
  EqualPadding: "EQUAL_PADDING",
} as const;

export type UnitLevelDistance =
  (typeof UnitLevelDistances)[keyof typeof UnitLevelDistances];

export const VerticalAlignments = {
  Top: "TOP",
  Middle: "MIDDLE",
  Bottom: "BOTTOM",
} as const;

export type VerticalAlignment =
  (typeof VerticalAlignments)[keyof typeof VerticalAlignments];

export const FontWeights = {
  Normal: "normal",
  Bold: "bold",
  Bolder: "bolder",
  Lighter: "lighter",
} as const;

export type FontWeight = (typeof FontWeights)[keyof typeof FontWeights];

export const FontStyles = {
  Normal: "normal",
  Italic: "italic",
} as const;

export const LabelPlacements = {
  Below: "below",
  // Left: "left",
  Right: "right",
} as const;

export type LabelPlacement = (typeof LabelPlacements)[keyof typeof LabelPlacements];

export const ChartItemTypes = {
  Chart: "chart",
  Level: "level",
  Branch: "branch",
  Unit: "unit",
} as const;

export type ChartItemType = (typeof ChartItemTypes)[keyof typeof ChartItemTypes];

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BasicUnitNode {
  unit: ChartUnit;
  parent?: BasicUnitNode;
}

export interface UnitNodeInfo extends BasicUnitNode {
  symbolBoxSize: Size;
  anchor: Point;
  octagonAnchor: Point;
  symb: MilSymbol;
  x: number;
  y: number;
  parent?: UnitNodeInfo;
  unit: ChartUnit;
  // bounding box (including label)
  ly: number;
  lx: number;
  rx: number;
  // symbol box
  lsx: number;
  rsx: number;
}

export type OnUnitClickCallback = (unit: RenderedUnitNode) => void;
export type OnLevelClickCallback = (levelNumber: number) => void;
export type OnBranchClickCallback = (
  parentId: string | number,
  levelNumber: number,
) => void;
export type SymbolGenerator = (sidc: string, options: SymbolOptions) => MilSymbol;

export interface FontOptions {
  fontSize: number;
  fontStyle: "normal" | "italic" | "oblique";
  fontWeight: "normal" | "bold" | "lighter" | "bolder" | number;
  fontColor: string;
}

export interface ConnectorOptions {
  lineWidth: number;
  lineColor: string;
}

export interface LabelOptions {
  useShortName: boolean;
  labelOffset: number;
  hideLabel: boolean;
  labelPlacement: LabelPlacement;
}

export interface EquipmentOptions {
  showEquipment: boolean;
}

export interface PersonnelOptions {
  showPersonnel: boolean;
}

export interface ChartSymbolOptions {
  symbolOutlineWidth?: number;
  symbolOutlineColor?: string;
}

export interface OrbChartOptions
  extends
    FontOptions,
    ConnectorOptions,
    LabelOptions,
    EquipmentOptions,
    PersonnelOptions,
    ChartSymbolOptions {
  symbolSize: number;
  maxLevels: number;
  debug: boolean;
  onClick: OnUnitClickCallback;
  onLevelClick: OnLevelClickCallback;
  onBranchClick: OnBranchClickCallback;
  connectorOffset: number;
  symbolGenerator: SymbolGenerator;
  orientation: ChartOrientation;
  unitLevelDistance: UnitLevelDistance;
  lastLevelLayout: LevelLayout;
  layout: LevelLayout;
  verticalAlignment: VerticalAlignment;
  levelPadding: number;
  treeOffset: number;
  stackedOffset: number;
}

export type PartialOrbChartOptions = Partial<OrbChartOptions>;
export type LevelSpecificOptions = Record<number, PartialOrbChartOptions>;
export type BranchSpecificOptions = Record<string | number, PartialOrbChartOptions>;
export type UnitSpecificOptions = Record<string | number, PartialOrbChartOptions>;

export interface SpecificOptions {
  level?: LevelSpecificOptions;
  branch?: BranchSpecificOptions;
  unit?: UnitSpecificOptions;
}

export type UnitNodeVisitorCallback = (
  unit: ChartUnit,
  level: number,
  parent: ChartUnit | null,
) => void;

export interface Equipment {
  name: string;
  count: number;
}

export interface Personnel {
  name: string;
  count: number;
}

export interface ChartUnit {
  name: string;
  sidc: string;
  shortName?: string;
  subUnits?: ChartUnit[];
  id: string;
  symbolOptions?: SymbolOptions;
  equipment?: Equipment[];
  personnel?: Personnel[];
}

export interface RenderedElement {
  groupElement: GElementSelection;
}

export interface RenderedChart extends RenderedElement {
  levels: RenderedLevel[];
}

export interface RenderedLevel extends RenderedElement {
  branches: RenderedBranch[];
  options: Partial<OrbChartOptions>;
}

export interface RenderedBranch extends RenderedElement {
  units: RenderedUnitNode[];
  options: Partial<OrbChartOptions>;
  level: number;
}

export interface RenderedUnitNode extends RenderedElement, UnitNodeInfo {
  boundingBox: DOMRect;
  parent?: RenderedUnitNode;
  options: Partial<OrbChartOptions>;
  level: number;
}

export interface ToSvgOptions {
  width?: number;
  height?: number;
  elementId?: string;
  enablePanZoom?: boolean;
}
