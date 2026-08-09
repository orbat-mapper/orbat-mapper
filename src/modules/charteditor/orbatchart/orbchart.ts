import { select } from "d3-selection";
import { walkTree } from "./utils";
import type {
  BasicUnitNode,
  ChartUnit,
  GElementSelection,
  LevelLayout,
  OrbChartOptions,
  RenderedBranch,
  RenderedChart,
  RenderedLevel,
  RenderedUnitNode,
  SpecificOptions,
  SVGElementSelection,
  ToSvgOptions,
} from "./types";
import { LevelLayouts, UnitLevelDistances, VerticalAlignments } from "./types";
import {
  DEFAULT_CHART_HEIGHT,
  DEFAULT_CHART_WIDTH,
  DEFAULT_OPTIONS,
  MARGIN_TOP,
} from "./defaults";
import {
  addConnectorAttributes,
  addFontAttributes,
  calculateAnchorPoints,
  getUnitBoxOrigin,
  createChartStyle,
  createGroupElement,
  createInitialNodeStructure,
  drawDebugAnchors,
  drawDebugRect,
  drawUnitBranchConnectorPath,
  drawUnitBranchTreeLeftRightConnectorPath,
  drawUnitLevelConnectorPath,
  putGroupAt,
} from "./svgRender";
import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import { layoutHorizontalTree, type HorizontalTreeItem } from "./horizontalTreeLayout";

const HORIZONTAL_MARGIN = 20;
const MINIMUM_HORIZONTAL_GAP = 16;

function isStackedLayout(layout: LevelLayout) {
  return layout === LevelLayouts.Stacked;
}

function isLeftRightLayout(layout: LevelLayout) {
  return layout === LevelLayouts.TreeRight || layout === LevelLayouts.TreeLeft;
}

/**
 * Position a tree unit far enough from its parent's connector trunk that the
 * unit's complete rendered box, including resource text, clears the line.
 */
function getTreeUnitOffset(
  unit: RenderedUnitNode,
  layout: LevelLayout,
  index: number,
  options: Pick<OrbChartOptions, "connectorOffset" | "lineWidth" | "treeOffset">,
) {
  const boxLeftOffset = getUnitBoxOrigin(unit).x - unit.x;
  const boxRightOffset = boxLeftOffset + unit.boundingBox.width;
  const clearance = options.connectorOffset + options.lineWidth;
  const placeRight =
    layout === LevelLayouts.TreeRight || (layout === LevelLayouts.Tree && index % 2 > 0);

  return placeRight
    ? Math.max(options.treeOffset, clearance - boxLeftOffset)
    : -Math.max(options.treeOffset, clearance + boxRightOffset);
}

export function isTreeLayout(layout: LevelLayout) {
  return (
    layout === LevelLayouts.TreeRight ||
    layout === LevelLayouts.TreeLeft ||
    layout === LevelLayouts.Tree
  );
}

export function isStackedTreeLayout(layout: LevelLayout) {
  return (
    layout === LevelLayouts.TreeRight ||
    layout === LevelLayouts.TreeLeft ||
    layout === LevelLayouts.Tree ||
    layout === LevelLayouts.Stacked
  );
}

class OrbatChart {
  width!: number;
  height!: number;
  options: OrbChartOptions;
  groupedLevels: BasicUnitNode[][][] = [];
  svg!: SVGElementSelection;
  connectorGroup!: GElementSelection;
  renderedChart!: RenderedChart;
  wrapperGroup!: GElementSelection;
  pz: PanzoomObject | null;
  constructor(
    private rootNode: ChartUnit,
    options: Partial<OrbChartOptions> = {},
    private specificOptions: SpecificOptions = {},
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    if (rootNode) this._computeOrbatInfo(rootNode);
    this.pz = null;
  }

  cleanup() {
    // Remove event listeners
    if (this.svg) {
      this.svg.selectAll("g.o-unit").on("click", null);
      this._removeSelectEventListeners();
    }

    this._cleanupPanZoomInteraction();
  }

  private _removeSelectEventListeners() {
    this.svg.selectAll(".select-rect").on("click", null);
  }

  toSVG(
    parentElement: HTMLElement,
    {
      width = DEFAULT_CHART_WIDTH,
      height = DEFAULT_CHART_HEIGHT,
      elementId,
      enablePanZoom = false,
    }: ToSvgOptions = {},
  ): SVGElement {
    this.width = width;
    this.height = height;
    const renderedChart = this._createSvgRootElement(parentElement, elementId);
    const chartGroup = createGroupElement(this.wrapperGroup, "o-chart");
    addFontAttributes(chartGroup, this.options);

    this.connectorGroup = createGroupElement(chartGroup, "o-connectors");
    addConnectorAttributes(this.connectorGroup, this.options);

    // Pass 1: Create g elements and other svg elements
    // Pass 2: Do unit layout
    // Pass 3: Fit the completed layout to the requested page
    // Pass 4: Draw connectors
    renderedChart.levels = createInitialNodeStructure(
      chartGroup,
      this.groupedLevels,
      this.options,
      this.specificOptions,
    );
    this._doNodeLayout(renderedChart);
    this._fitChartToViewport(renderedChart);
    this._drawConnectors(renderedChart);
    this.renderedChart = renderedChart;
    if (enablePanZoom) {
      this._addPanZoomInteraction();
    } else {
      this.pz = null;
    }
    return this.svg.node() as SVGElement;
  }

  private _addPanZoomInteraction() {
    this.pz = Panzoom(this.svg.node()!, {
      maxScale: 10,
      pinchAndPan: true,
    });
    this.svg.node()?.parentElement?.addEventListener("wheel", (event: WheelEvent) => {
      this.pz?.zoomWithWheel(event);
    });
  }

  private _cleanupPanZoomInteraction() {
    if (this.pz) {
      this.svg.node()?.parentElement?.removeEventListener("wheel", this.pz.zoomWithWheel);
      this.pz.destroy();
    }
  }

  highlightLevel(levelNumber: number) {
    const backgroundLayer = select("#o-highlight-layer");
    const groupElement = select(`#o-level-${levelNumber}`) as GElementSelection;
    const bbox = groupElement.node()?.getBBox();
    if (!bbox) return;
    const offset = 20;
    const tmp = backgroundLayer
      .append("rect")
      .attr("x", bbox.x - offset * 2)
      .attr("y", bbox.y - offset)
      .attr("width", bbox.width + 4 * offset)
      .attr("height", bbox.height + 2 * offset)
      .attr("class", "highlight select-rect");

    if (this.options.onLevelClick) {
      tmp.on("click", (e) => {
        this.options.onLevelClick(levelNumber);
      });
    }
  }

  highlightGroup(renderedBranch: RenderedBranch) {
    const backgroundLayer = select("#o-highlight-layer");
    const groupElement = renderedBranch.groupElement;
    const bbox = groupElement.node()!.getBBox();
    const offset = 10;
    const tmp = backgroundLayer
      .append("rect")
      .attr("x", bbox.x - offset * 2)
      .attr("y", bbox.y - offset)
      .attr("width", bbox.width + 4 * offset)
      .attr("height", bbox.height + 2 * offset)
      .attr("class", "highlight select-rect");
    if (this.options.onBranchClick) {
      tmp.on("click", (e) => {
        this.options.onBranchClick(
          renderedBranch.units[0]?.parent?.unit.id || 0,
          renderedBranch.level,
        );
      });
    }
  }

  private _createSvgRootElement(
    parentElement: HTMLElement,
    elementId?: string,
  ): RenderedChart {
    parentElement.innerHTML = "";
    const svg = select(parentElement)
      .append<SVGElement>("svg")
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .attr("class", "orbat-chart");
    if (elementId) svg.attr("id", elementId);

    svg.append("style").text(createChartStyle(this.options));
    svg.attr("width", "100%");
    svg.attr("height", "100%");
    if (this.options.debug) {
      svg
        .append<SVGRectElement>("rect")
        .attr("class", "o-page-boundary")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("y", "0")
        .attr("x", "0")
        .attr("width", this.width)
        .attr("height", this.height);
    }

    this.wrapperGroup = createGroupElement(svg, "o-wrapper");
    createGroupElement(this.wrapperGroup, "", "o-highlight-layer");
    this.svg = svg;
    return {
      groupElement: (<unknown>this.wrapperGroup) as GElementSelection,
      levels: [],
    };
  }

  private _computeOrbatInfo(rootNode: ChartUnit) {
    const levels: BasicUnitNode[][] = [];
    const nodeMap: Record<string, BasicUnitNode> = {};

    walkTree(rootNode, (unit, levelIdx, parent) => {
      const unitNodeInfo: BasicUnitNode = { unit };
      const currentLevel = levels[levelIdx] || [];
      if (parent) {
        unitNodeInfo.parent = nodeMap[parent.id];
      }
      nodeMap[unit.id] = unitNodeInfo;
      currentLevel.push(unitNodeInfo);
      levels[levelIdx] = currentLevel;
    });

    this.groupedLevels = groupLevelsByParent();

    function groupLevelsByParent(): BasicUnitNode[][][] {
      const groupedLevels: BasicUnitNode[][][] = [];
      levels.forEach((level, yIdx) => {
        groupedLevels[yIdx] = level.reduce(
          (accumulator: BasicUnitNode[][], currentValue, currentIndex, array) => {
            if (currentIndex === 0) {
              accumulator.push([currentValue]);
              return accumulator;
            }
            if (array[currentIndex - 1].parent === currentValue.parent) {
              accumulator[accumulator.length - 1].push(currentValue);
              return accumulator;
            }
            accumulator.push([currentValue]);
            return accumulator;
          },
          [],
        );
      });
      return groupedLevels;
    }
  }

  private _doNodeLayout(renderedChart: RenderedChart) {
    this._layoutHorizontalLevels(renderedChart);
    const numberOfLevels = this.groupedLevels.length;
    const maxLevels = this.options.maxLevels || numberOfLevels;
    const chartHeight = this.height;
    let prevY = MARGIN_TOP;
    renderedChart.levels.forEach((renderedLevel, yIdx) => {
      const levelOptions = { ...this.options, ...renderedLevel.options };
      let y: number;
      if (this.options.verticalAlignment === VerticalAlignments.Middle) {
        y = chartHeight * ((yIdx + 1) / (numberOfLevels + 1));
      } else {
        y = prevY;
        prevY += levelOptions.levelPadding;
      }

      let levelLayout: LevelLayout = LevelLayouts.Horizontal;
      if (yIdx === maxLevels - 1) levelLayout = this.options.lastLevelLayout;
      this._renderLevel(renderedLevel, y, levelLayout);
    });
  }

  private _renderLevel(
    renderedLevel: RenderedLevel,
    y: number,
    levelLayout: LevelLayout = LevelLayouts.Horizontal,
  ) {
    const levelOptions = { ...this.options, ...renderedLevel.options };
    const chartWidth = this.width;
    const wrapperGroup = this.wrapperGroup;

    switch (levelLayout) {
      case LevelLayouts.Horizontal:
        _doHorizontalLayout();
        break;
      case LevelLayouts.Tree:
        _doTreeLayout();
        break;
      case LevelLayouts.Stacked:
      case LevelLayouts.TreeRight:
      case LevelLayouts.TreeLeft:
        _doStackedLayout(levelLayout);
        break;
      default:
        console.warn("Unhandled layout", levelLayout);
    }

    if (levelOptions.debug) drawDebugRect(renderedLevel.groupElement);

    function _doHorizontalLayout() {
      renderedLevel.branches.forEach((unitBranch) => {
        const branchOptions = { ...levelOptions, ...unitBranch.options };
        for (const unitNode of unitBranch.units) {
          const unitOptions = { ...branchOptions, ...unitNode.options };
          const x = unitNode.x;
          unitNode.y = y;
          calculateAnchorPoints(unitNode);

          putGroupAt(unitNode.groupElement, unitNode, x, y, unitOptions.debug);

          if (unitOptions.debug) drawDebugAnchors(wrapperGroup, unitNode);
        }
        if (branchOptions.debug) drawDebugRect(unitBranch.groupElement, "yellow");
      });
    }

    function _doTreeLayout() {
      const groupsOnLevel = renderedLevel.branches.length;
      renderedLevel.branches.forEach((unitBranch, groupIdx) => {
        const branchOptions = { ...levelOptions, ...unitBranch.options };
        let rowY = y;
        let rowBottom = Number.NEGATIVE_INFINITY;
        let previousInRow: RenderedUnitNode | null = null;
        for (const [yIdx, unitNode] of unitBranch.units.entries()) {
          const unitOptions = { ...branchOptions, ...unitNode.options };
          let x = unitNode.parent
            ? unitNode.parent.x
            : ((groupIdx + 1) * chartWidth) / (groupsOnLevel + 1);

          x += getTreeUnitOffset(unitNode, LevelLayouts.Tree, yIdx, unitOptions);
          unitNode.x = x;
          unitNode.y = rowY;
          calculateAnchorPoints(unitNode);

          // TREE normally shares a row between its left and right unit. Wide
          // resource tables can meet in the middle, so move the right unit below
          // the left one only when their rendered boxes actually intersect.
          if (
            yIdx % 2 &&
            previousInRow &&
            unitNode.lx < previousInRow.rx &&
            unitNode.rx > previousInRow.lx
          ) {
            const boxTopOffset = getUnitBoxOrigin(unitNode).y - unitNode.y;
            unitNode.y = rowBottom + unitOptions.stackedOffset - boxTopOffset;
            calculateAnchorPoints(unitNode);
          }

          rowBottom = Math.max(rowBottom, unitNode.ly);

          putGroupAt(
            unitNode.groupElement,
            unitNode,
            unitNode.x,
            unitNode.y,
            unitOptions.debug,
          );
          if (unitOptions.debug) drawDebugAnchors(wrapperGroup, unitNode);

          if (yIdx % 2) {
            rowY = rowBottom + unitOptions.stackedOffset;
            rowBottom = Number.NEGATIVE_INFINITY;
            previousInRow = null;
          } else {
            previousInRow = unitNode;
          }
        }
        if (branchOptions.debug) drawDebugRect(unitBranch.groupElement, "yellow");
      });
    }

    function _doStackedLayout(layout: LevelLayout) {
      const groupsOnLevel = renderedLevel.branches.length;
      renderedLevel.branches.forEach((unitBranch, groupIdx) => {
        const branchOptions = { ...levelOptions, ...unitBranch.options };
        let prevY = y;
        for (const [yIdx, unitNode] of unitBranch.units.entries()) {
          const unitOptions = { ...branchOptions, ...unitNode.options };
          let x = unitNode.parent
            ? unitNode.parent.x
            : ((groupIdx + 1) * chartWidth) / (groupsOnLevel + 1);

          if (isLeftRightLayout(layout)) {
            x += getTreeUnitOffset(unitNode, layout, yIdx, unitOptions);
          }
          const ny = prevY;
          unitNode.x = x;
          unitNode.y = ny;
          calculateAnchorPoints(unitNode);

          prevY = unitNode.ly + unitOptions.stackedOffset;
          putGroupAt(unitNode.groupElement, unitNode, x, ny, unitOptions.debug);
          if (unitOptions.debug) drawDebugAnchors(wrapperGroup, unitNode);
        }
        if (branchOptions.debug) drawDebugRect(unitBranch.groupElement, "yellow");
      });
    }
  }

  private _layoutHorizontalLevels(renderedChart: RenderedChart) {
    if (renderedChart.levels.length === 0) return;
    const lastLevelIndex = renderedChart.levels.length - 1;
    const lastHorizontalLevel =
      this.options.lastLevelLayout === LevelLayouts.Horizontal
        ? lastLevelIndex
        : lastLevelIndex - 1;
    if (lastHorizontalLevel < 0) return;

    const root = renderedChart.levels[0].branches[0]?.units[0];
    if (!root) return;

    // Levels are ordered top down, so a unit's parent is always visited before the
    // unit itself and membership can be decided in a single pass.
    const includedNodes = new Set<RenderedUnitNode>();
    const childrenByParent = new Map<RenderedUnitNode, RenderedUnitNode[]>();
    renderedChart.levels.slice(0, lastHorizontalLevel + 1).forEach((level) => {
      level.branches.forEach((branch) => {
        branch.units.forEach((unit) => {
          includedNodes.add(unit);
          if (!unit.parent || !includedNodes.has(unit.parent)) return;
          const children = childrenByParent.get(unit.parent) ?? [];
          children.push(unit);
          childrenByParent.set(unit.parent, children);
        });
      });
    });

    const trailingBranchesByParent = new Map<RenderedUnitNode, RenderedBranch>();
    if (lastHorizontalLevel < lastLevelIndex) {
      renderedChart.levels[lastLevelIndex].branches.forEach((branch) => {
        const parent = branch.units[0]?.parent;
        if (parent) trailingBranchesByParent.set(parent, branch);
      });
    }

    const trailingBranchExtents = (unit: RenderedUnitNode) => {
      const branch = trailingBranchesByParent.get(unit);
      if (!branch) return null;
      const level = renderedChart.levels[lastLevelIndex];
      const levelOptions = { ...this.options, ...level.options };
      const branchOptions = { ...levelOptions, ...branch.options };
      let left = 0;
      let right = 0;
      branch.units.forEach((child, index) => {
        const unitOptions = { ...branchOptions, ...child.options };
        const offset = getTreeUnitOffset(
          child,
          this.options.lastLevelLayout,
          index,
          unitOptions,
        );
        const childBoxLeft = getUnitBoxOrigin(child).x - child.x + offset;
        left = Math.min(left, childBoxLeft);
        right = Math.max(right, childBoxLeft + child.boundingBox.width);
      });
      return { left, right };
    };

    const toLayoutItem = (
      unit: RenderedUnitNode,
    ): HorizontalTreeItem<RenderedUnitNode> => {
      const boxLeft = getUnitBoxOrigin(unit).x;
      const trailingExtents = trailingBranchExtents(unit);
      return {
        value: unit,
        leftExtent: Math.max(unit.x - boxLeft, -(trailingExtents?.left ?? 0)),
        rightExtent: Math.max(
          boxLeft + unit.boundingBox.width - unit.x,
          trailingExtents?.right ?? 0,
        ),
        children: (childrenByParent.get(unit) ?? []).map(toLayoutItem),
      };
    };

    const positions = layoutHorizontalTree(toLayoutItem(root), {
      viewportWidth: this.width,
      margin: HORIZONTAL_MARGIN,
      minimumGap: Math.max(
        MINIMUM_HORIZONTAL_GAP,
        this.options.connectorOffset * 2 + this.options.lineWidth,
      ),
      uniformNodeSlots: this.options.unitLevelDistance === UnitLevelDistances.Fixed,
    });
    positions.forEach((x, unit) => {
      unit.x = x;
    });
  }

  private _fitChartToViewport(renderedChart: RenderedChart) {
    let left = 0;
    let top = 0;
    let right = this.width;
    let bottom = this.height;
    renderedChart.levels.forEach((level) => {
      level.branches.forEach((branch) => {
        branch.units.forEach((unit) => {
          const { x: unitLeft, y: unitTop } = getUnitBoxOrigin(unit);
          left = Math.min(left, unitLeft - HORIZONTAL_MARGIN);
          top = Math.min(top, unitTop - HORIZONTAL_MARGIN);
          right = Math.max(right, unitLeft + unit.boundingBox.width + HORIZONTAL_MARGIN);
          bottom = Math.max(
            bottom,
            unitTop + unit.boundingBox.height + HORIZONTAL_MARGIN,
          );
        });
      });
    });
    const contentWidth = right - left;
    const contentHeight = bottom - top;
    const scale = Math.min(1, this.width / contentWidth, this.height / contentHeight);
    const translateX = (this.width - contentWidth * scale) / 2 - left * scale;
    const translateY = -top * scale;
    this.wrapperGroup.attr(
      "transform",
      `translate(${translateX} ${translateY}) scale(${scale})`,
    );
  }

  private _drawConnectors(renderedChart: RenderedChart) {
    const nLevels = this.options.maxLevels || renderedChart.levels.length;
    renderedChart.levels.forEach((renderedLevel, yIdx) => {
      const levelOptions = { ...this.options, ...renderedLevel.options };
      const currentLevelGElement =
        yIdx > 0
          ? createGroupElement(this.connectorGroup, "", `o-connectors-level-${yIdx}`)
          : null;

      if (currentLevelGElement)
        addConnectorAttributes(currentLevelGElement, levelOptions);
      renderedLevel.branches.forEach((branch, groupIdx) => {
        const parent = branch.units[0].parent;
        const currentLevelLayout =
          yIdx === nLevels - 1 ? this.options.lastLevelLayout : LevelLayouts.Horizontal;
        const branchOptions = { ...levelOptions, ...branch.options };
        if (!currentLevelGElement) return;

        const branchId = `o-connectors-group-${parent ? parent.unit.id : 0}`;
        const currentBranchElement = createGroupElement(
          currentLevelGElement,
          "",
          branchId,
        );
        addConnectorAttributes(currentBranchElement, branchOptions);
        branch.units.forEach((unitNode, idx) => {
          const unitOptions = { ...branchOptions, ...unitNode.options };
          if (currentLevelLayout === LevelLayouts.Stacked && idx > 0) return;
          if (isLeftRightLayout(currentLevelLayout)) return;
          if (currentLevelLayout === LevelLayouts.Tree) return;
          drawUnitBranchConnectorPath(currentBranchElement, unitNode, unitOptions);
        });
        switch (currentLevelLayout) {
          case LevelLayouts.TreeRight:
          case LevelLayouts.TreeLeft:
          case LevelLayouts.Tree:
            drawUnitBranchTreeLeftRightConnectorPath(
              currentBranchElement,
              branch.units,
              currentLevelLayout,
              branchOptions,
            );
            break;
          default:
            drawUnitLevelConnectorPath(currentBranchElement, branch.units, branchOptions);
        }
      });
    });
  }

  public makeInteractive() {
    this._addSelectionLayer(this.renderedChart);
  }

  private _addSelectionLayer(renderedChart: RenderedChart) {
    renderedChart.levels.forEach((level, levelNumber) => {
      this.highlightLevel(levelNumber);
      level.branches.forEach((branch) => {
        this.highlightGroup(branch);
      });
    });
  }

  public removeSelectionLayer() {
    this._removeSelectEventListeners();
    this.svg.selectAll("#o-highlight-layer rect").remove();
  }

  public highlightLevels(levelIndexes: number[]) {
    console.log("Not implemented yet", levelIndexes);
  }

  public resetZoom() {
    this.pz?.reset();
  }

  public zoomIn() {
    this.pz?.zoomIn();
  }

  public zoomOut() {
    this.pz?.zoomOut();
  }

  public getPanScale() {
    if (this.pz) {
      return { pan: this.pz.getPan(), scale: this.pz.getScale() };
    } else return null;
  }

  public setPanScale(pan: { x: number; y: number }, scale: number) {
    if (this.pz) {
      this.pz.zoom(scale);
      setTimeout(() => this.pz?.pan(pan.x, pan.y));
    }
  }
}

export { OrbatChart };
