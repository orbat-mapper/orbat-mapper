import { Symbol as MilSymbol, SymbolOptions } from "milsymbol";
import { Selection } from "d3-selection";

export type SVGElementSelection = Selection<SVGElement, any, any, any>;
export type GElementSelection = Selection<SVGGElement, any, any, any>;
export type RectElementSelection = Selection<SVGRectElement, any, any, any>;

export interface StringNumberMap<T> {
  [key: string]: T;

  [key: number]: T;
}

export interface IdMap<T> {
  [key: string | number]: T;
}

export interface NumberMap<T> {
  [idx: number]: T;
}

export enum ChartOrientation {
  Top = "TOP",
  Bottom = "BOTTOM",
  // Left = "LEFT",
  // Right = "RIGHT"
}

/**
 * Different ways to place units
 */
export enum LevelLayout {
  Horizontal = "HORIZONTAL",
  Stacked = "STACKED",
  Tree = "TREE",
  TreeLeft = "TREE_LEFT",
  TreeRight = "TREE_RIGHT",
}

export enum UnitLevelDistance {
  Fixed = "FIXED",
  EqualPadding = "EQUAL_PADDING",
}

export enum VerticalAlignment {
  Top = "TOP",
  Middle = "MIDDLE",
  Bottom = "BOTTOM",
}

export enum FontWeight {
  Normal = "normal",
  Bold = "bold",
  Bolder = "bolder",
  Lighter = "lighter",
}

export enum FontStyle {
  Normal = "normal",
  Italic = "italic",
}

export enum ChartItemType {
  Chart = "chart",
  Level = "level",
  Branch = "branch",
  Unit = "unit",
}

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BasicUnitNode {
  unit: Unit;
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
  unit: Unit;
  ly: number;
  lx: number;
  rx: number;
}

export type OnUnitClickCallback = (unit: RenderedUnitNode) => void;
export type OnLevelClickCallback = (levelNumber: number) => void;
export type OnBranchClickCallback = (
  parentId: string | number,
  levelNumber: number
) => void;
export type SymbolGenerator = (sidc: string, options: SymbolOptions) => MilSymbol;

export interface FontOptions {
  fontSize: number;
  fontStyle: "normal" | "italic" | "oblique";
  fontWeight: "normal" | "bold" | "lighter" | "bolder" | number;
}

export interface ConnectorOptions {
  lineWidth: number;
  lineColor: string;
}

export interface LabelOptions {
  useShortName: boolean;
  labelOffset: number;
  hideLabel: boolean;
}

export interface OrbChartOptions extends FontOptions, ConnectorOptions, LabelOptions {
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
export type LevelSpecificOptions = NumberMap<PartialOrbChartOptions>;
export type BranchSpecificOptions = StringNumberMap<PartialOrbChartOptions>;
export type UnitSpecificOptions = StringNumberMap<PartialOrbChartOptions>;

export interface SpecificOptions {
  level?: LevelSpecificOptions;
  branch?: BranchSpecificOptions;
  unit?: UnitSpecificOptions;
}

export type UnitNodeVisitorCallback = (
  unit: Unit,
  level: number,
  parent: Unit | null
) => void;

export interface Unit {
  name: string;
  sidc: string;
  shortName?: string;
  subUnits?: Unit[];
  id: string;
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
}
