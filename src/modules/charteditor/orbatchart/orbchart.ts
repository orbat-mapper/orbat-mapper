import ms from "milsymbol";
import { select } from "d3-selection";
import { arrSum, flattenArray, walkTree } from "./utils";
import {
  BasicUnitNode,
  GElementSelection,
  LevelLayout,
  OrbChartOptions,
  RenderedChart,
  RenderedLevel,
  RenderedLevelGroup,
  RenderedUnitNode,
  Size,
  SpecificOptions,
  SVGElementSelection,
  Unit,
  UnitLevelDistance,
  UnitNodeInfo,
  VerticalAlignment,
} from "./types";
import {
  DEFAULT_CHART_HEIGHT,
  DEFAULT_CHART_WIDTH,
  DEFAULT_OPTIONS,
  MARGIN_TOP,
} from "./defaults";
import {
  addFontAttributes,
  calculateAnchorPoints,
  createChartStyle,
  createGroupElement,
  createUnitGroup,
  drawDebugAnchors,
  drawDebugRect,
  drawUnitLevelConnectorPath,
  drawUnitLevelGroupConnectorPath,
  drawUnitLevelGroupTreeLeftRightConnectorPath,
  putGroupAt,
} from "./svgRender";

function convertBasicUnitNode2UnitNodeInfo(
  basicUnitNode: BasicUnitNode,
  options: Partial<OrbChartOptions>
): UnitNodeInfo {
  let symb: ms.Symbol;
  const symbolOptions = { size: options.symbolSize };
  if (options.symbolGenerator) {
    symb = options.symbolGenerator(basicUnitNode.unit.sidc, symbolOptions);
  } else {
    symb = new ms.Symbol(
      basicUnitNode.unit.sidc,
      symbolOptions
      // {uniqueDesignation: node.shortName || node.name},
    );
  }
  let unitNodeInfo = basicUnitNode as UnitNodeInfo;
  unitNodeInfo.symbolBoxSize = symb.getSize();
  unitNodeInfo.anchor = symb.getAnchor();
  unitNodeInfo.octagonAnchor = symb.getOctagonAnchor();
  unitNodeInfo.symb = symb;
  unitNodeInfo.x = 0;
  unitNodeInfo.y = 0;
  unitNodeInfo.lx = 0;
  unitNodeInfo.rx = 0;
  unitNodeInfo.ly = 0;

  return unitNodeInfo;
}

function isStackedLayout(layout: LevelLayout) {
  return layout === LevelLayout.Stacked;
}

function isLeftRightLayout(layout: LevelLayout) {
  return layout === LevelLayout.TreeRight || layout === LevelLayout.TreeLeft;
}

export function isTreeLayout(layout: LevelLayout) {
  return (
    layout === LevelLayout.TreeRight ||
    layout === LevelLayout.TreeLeft ||
    layout === LevelLayout.Tree
  );
}

export function isStackedTreeLayout(layout: LevelLayout) {
  return (
    layout === LevelLayout.TreeRight ||
    layout === LevelLayout.TreeLeft ||
    layout === LevelLayout.Tree ||
    layout === LevelLayout.Stacked
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

  constructor(
    private rootNode: Unit,
    options: Partial<OrbChartOptions> = {},
    private specificOptions: SpecificOptions = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    if (rootNode) this._computeOrbatInfo(rootNode);
  }

  cleanup() {
    // Remove event listeners
    if (this.svg) {
      this.svg.selectAll("g.o-unit").on("click", null);
      this._removeSelectEventListeners();
    }
  }

  private _removeSelectEventListeners() {
    this.svg.selectAll(".select-rect").on("click", null);
  }

  toSVG(size: Partial<Size>, parentElement: HTMLElement, elementId?: string): SVGElement {
    this.width = size.width || DEFAULT_CHART_WIDTH;
    this.height = size.height || DEFAULT_CHART_HEIGHT;
    let renderedChart = this._createSvgRootElement(parentElement, elementId);
    const chartGroup = createGroupElement(this.svg, "o-chart");
    addFontAttributes(chartGroup, this.options);
    this.connectorGroup = createGroupElement(chartGroup, "o-connectors");
    this._addConnectorAttributes(this.connectorGroup);

    // Pass 1: Create g elements and other svg elements
    // Pass 2: Do unit layout
    // Pass 3: Draw connectors
    renderedChart.levels = this._createInitialNodeStructure(
      chartGroup,
      this.groupedLevels
    );
    this._doNodeLayout(renderedChart);
    this._drawConnectors(renderedChart);
    this.renderedChart = renderedChart;
    return this.svg.node() as SVGElement;
  }

  private _addConnectorAttributes(group: GElementSelection) {
    group
      .attr("stroke", this.options.lineColor)
      .attr("stroke-width", `${this.options.lineWidth}pt`);
  }

  highlightLevel(levelNumber: number) {
    const backgroundLayer = select("#o-highlight-layer");
    const groupElement = select(`#o-level-${levelNumber}`) as GElementSelection;
    const bbox = groupElement.node()?.getBBox();
    if (!bbox) return;
    let offset = 20;
    let tmp = backgroundLayer
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

  highlightGroup(renderedLevelGroup: RenderedLevelGroup) {
    const backgroundLayer = select("#o-highlight-layer");
    const groupElement = renderedLevelGroup.groupElement;
    const bbox = groupElement.node()!.getBBox();
    let offset = 10;
    let tmp = backgroundLayer
      .append("rect")
      .attr("x", bbox.x - offset * 2)
      .attr("y", bbox.y - offset)
      .attr("width", bbox.width + 4 * offset)
      .attr("height", bbox.height + 2 * offset)
      .attr("class", "highlight select-rect");
    if (this.options.onLevelGroupClick) {
      tmp.on("click", (e) => {
        this.options.onLevelGroupClick(renderedLevelGroup.units[0]?.parent?.unit.id || 0);
      });
    }
  }

  private _createSvgRootElement(
    parentElement: HTMLElement,
    elementId?: string
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
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("y", "0")
        .attr("x", "0")
        .attr("width", this.width)
        .attr("height", this.height);
    }
    createGroupElement(svg, "", "o-highlight-layer");
    this.svg = svg;
    return { groupElement: (<unknown>svg) as GElementSelection, levels: [] };
  }

  private _computeOrbatInfo(rootNode: Unit) {
    let levels: BasicUnitNode[][] = [];
    const nodeMap: any = {};

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

    this.groupedLevels = _groupLevelsByParent();

    function _groupLevelsByParent(): BasicUnitNode[][][] {
      let groupedLevels: BasicUnitNode[][][] = [];
      levels.forEach((level, yIdx) => {
        let groupedLevel = level.reduce(
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
          []
        );
        groupedLevels[yIdx] = groupedLevel;
      });
      return groupedLevels;
    }
  }

  private _createInitialNodeStructure(
    parentElement: SVGElementSelection | GElementSelection,
    groupedLevels: BasicUnitNode[][][]
  ): RenderedLevel[] {
    const options = this.options;
    let renderedLevels: RenderedLevel[] = [];
    for (const [yIdx, currentLevel] of groupedLevels.entries()) {
      if (options.maxLevels && yIdx >= options.maxLevels) break;
      let levelSpecificOptions = {};
      if (this.specificOptions.level && this.specificOptions.level[yIdx]) {
        levelSpecificOptions = this.specificOptions.level[yIdx] || {};
      }
      let levelGElement = createGroupElement(parentElement, "o-level", `o-level-${yIdx}`);
      addFontAttributes(levelGElement, levelSpecificOptions);

      let renderedLevel: RenderedLevel = {
        groupElement: levelGElement,
        unitGroups: [],
        options: levelSpecificOptions,
      };

      renderedLevels.push(renderedLevel);
      let levelOptions = { ...options, ...levelSpecificOptions };

      currentLevel.forEach((unitLevelGroup, groupIdx) => {
        let parent = unitLevelGroup[0].parent;
        let lgSpecificOptions = {};
        if (parent && this.specificOptions && this.specificOptions.levelGroup) {
          lgSpecificOptions = this.specificOptions.levelGroup[parent.unit.id] || {};
        }
        let levelGroupOptions = { ...levelOptions, ...lgSpecificOptions };
        let levelGroupId = `o-level-group-${parent ? parent.unit.id : 0}`;
        let levelGroupGElement = createGroupElement(
          levelGElement,
          "o-level-group",
          levelGroupId
        );
        const units = unitLevelGroup.map((unitNode) => {
          let unitSpecificOptions =
            this.specificOptions && this.specificOptions.unit
              ? this.specificOptions.unit[unitNode.unit.id] || {}
              : {};
          let unitOptions = { ...levelGroupOptions, ...unitSpecificOptions };
          let renderedUnitNode = createUnitGroup(
            levelGroupGElement,
            convertBasicUnitNode2UnitNodeInfo(unitNode, unitOptions),
            unitOptions,
            unitSpecificOptions,
            yIdx
          );
          renderedUnitNode.options = unitSpecificOptions;
          return renderedUnitNode;
        });
        renderedLevel.unitGroups.push({
          groupElement: levelGroupGElement,
          units,
          options: lgSpecificOptions,
        });
      });
    }
    return renderedLevels;
  }

  private _doNodeLayout(renderedChart: RenderedChart) {
    const numberOfLevels = this.groupedLevels.length;
    const maxLevels = this.options.maxLevels || numberOfLevels;
    const chartHeight = this.height;
    let prevY = MARGIN_TOP;
    renderedChart.levels.forEach((renderedLevel, yIdx) => {
      // if (options.orientation === ChartOrientation.Bottom)
      let y: number;
      if (this.options.verticalAlignment === VerticalAlignment.Middle) {
        y = chartHeight * ((yIdx + 1) / (numberOfLevels + 1));
      } else {
        y = prevY;
        prevY += this.options.levelPadding;
      }

      let levelLayout = LevelLayout.Horizontal;
      if (yIdx === maxLevels - 1) levelLayout = this.options.lastLevelLayout;
      this._renderLevel(renderedLevel, y, levelLayout);
    });
  }

  private _renderLevel(
    renderedLevel: RenderedLevel,
    y: number,
    levelLayout: LevelLayout = LevelLayout.Horizontal
  ) {
    const levelOptions = { ...this.options, ...renderedLevel.options };
    const chartWidth = this.width;
    const svg = this.svg;
    const renderGroups = renderedLevel.unitGroups;
    const unitsOnLevel = flattenArray<RenderedUnitNode>(
      renderGroups.map((unitGroup) => unitGroup.units)
    );
    const numberOfUnitsOnLevel = unitsOnLevel.length;
    const totalWidth = arrSum(unitsOnLevel.map((u) => u.boundingBox.width));

    const availableSpace = chartWidth - totalWidth;
    const padding = availableSpace / numberOfUnitsOnLevel;

    switch (levelLayout) {
      case LevelLayout.Horizontal:
        _doHorizontalLayout();
        break;
      case LevelLayout.Tree:
        _doTreeLayout();
        break;
      case LevelLayout.Stacked:
      case LevelLayout.TreeRight:
      case LevelLayout.TreeLeft:
        _doStackedLayout(levelLayout);
        break;
      default:
        console.warn("Unhandled layout", levelLayout);
    }

    if (levelOptions.debug) drawDebugRect(renderedLevel.groupElement);

    function _doHorizontalLayout() {
      let xIdx = 0;
      let prevX = -padding / 2;

      renderedLevel.unitGroups.forEach((unitLevelGroup, groupIdx) => {
        let levelGroupOptions = { ...levelOptions, ...unitLevelGroup.options };
        for (const unitNode of unitLevelGroup.units) {
          let x;
          let unitOptions = { ...levelGroupOptions, ...unitNode.options };
          if (unitOptions.unitLevelDistance == UnitLevelDistance.EqualPadding) {
            x = prevX + unitNode.boundingBox.width / 2 + padding;
          } else {
            x = ((xIdx + 1) * chartWidth) / (numberOfUnitsOnLevel + 1);
          }

          unitNode.x = x;
          unitNode.y = y;
          calculateAnchorPoints(unitNode);

          prevX = unitNode.x + unitNode.boundingBox.width / 2;
          putGroupAt(unitNode.groupElement, unitNode, x, y, unitOptions.debug);

          if (unitOptions.debug) drawDebugAnchors(svg, unitNode);
          xIdx += 1;
        }
        if (levelGroupOptions.debug) drawDebugRect(unitLevelGroup.groupElement, "yellow");
      });
    }

    function _doTreeLayout() {
      const groupsOnLevel = renderedLevel.unitGroups.length;
      renderedLevel.unitGroups.forEach((unitLevelGroup, groupIdx) => {
        let levelGroupOptions = { ...levelOptions, ...unitLevelGroup.options };
        let prevY = y;
        for (const [yIdx, unitNode] of unitLevelGroup.units.entries()) {
          let unitOptions = { ...levelGroupOptions, ...unitNode.options };
          let x = unitNode.parent
            ? unitNode.parent.x
            : ((groupIdx + 1) * chartWidth) / (groupsOnLevel + 1);

          if (yIdx % 2) {
            x += unitOptions.treeOffset;
          } else {
            x -= unitOptions.treeOffset;
          }
          const ny = prevY;
          unitNode.x = x;
          unitNode.y = ny;
          calculateAnchorPoints(unitNode);

          if (yIdx % 2) prevY = unitNode.ly + unitOptions.stackedOffset;

          putGroupAt(unitNode.groupElement, unitNode, x, ny, unitOptions.debug);
          if (unitOptions.debug) drawDebugAnchors(svg, unitNode);
        }
        if (levelGroupOptions.debug) drawDebugRect(unitLevelGroup.groupElement, "yellow");
      });
    }

    function _doStackedLayout(layout: LevelLayout) {
      const groupsOnLevel = renderedLevel.unitGroups.length;
      renderedLevel.unitGroups.forEach((unitLevelGroup, groupIdx) => {
        let levelGroupOptions = { ...levelOptions, ...unitLevelGroup.options };
        let prevY = y;
        for (const [yIdx, unitNode] of unitLevelGroup.units.entries()) {
          let unitOptions = { ...levelGroupOptions, ...unitNode.options };
          let x = unitNode.parent
            ? unitNode.parent.x
            : ((groupIdx + 1) * chartWidth) / (groupsOnLevel + 1);

          if (layout === LevelLayout.TreeRight) {
            x += unitOptions.treeOffset;
          } else if (layout === LevelLayout.TreeLeft) {
            x -= unitOptions.treeOffset;
          }
          const ny = prevY;
          unitNode.x = x;
          unitNode.y = ny;
          calculateAnchorPoints(unitNode);

          prevY = unitNode.ly + unitOptions.stackedOffset;
          putGroupAt(unitNode.groupElement, unitNode, x, ny, unitOptions.debug);
          if (unitOptions.debug) drawDebugAnchors(svg, unitNode);
        }
        if (levelGroupOptions.debug) drawDebugRect(unitLevelGroup.groupElement, "yellow");
      });
    }
  }

  private _drawConnectors(renderedChart: RenderedChart) {
    const nLevels = this.options.maxLevels || renderedChart.levels.length;
    renderedChart.levels.forEach((renderedLevel, yIdx) => {
      let levelOptions = { ...this.options, ...renderedLevel.options };
      const currentLevelGroupElement =
        yIdx > 0
          ? createGroupElement(this.connectorGroup, "", `o-connectors-level-${yIdx}`)
          : null;
      renderedLevel.unitGroups.forEach((unitLevelGroup, groupIdx) => {
        const parent = unitLevelGroup.units[0].parent;
        let currentLevelLayout =
          yIdx === nLevels - 1 ? this.options.lastLevelLayout : LevelLayout.Horizontal;
        let levelGroupOptions = { ...levelOptions, ...unitLevelGroup.options };
        if (!currentLevelGroupElement) return;

        const levelGroupId = `o-connectors-group-${parent ? parent.unit.id : 0}`;
        const currentGroupElement = createGroupElement(
          currentLevelGroupElement,
          "",
          levelGroupId
        );
        unitLevelGroup.units.forEach((unitNode, idx) => {
          let unitOptions = { ...levelGroupOptions, ...unitNode.options };
          if (currentLevelLayout === LevelLayout.Stacked && idx > 0) return;
          if (isLeftRightLayout(currentLevelLayout)) return;
          if (currentLevelLayout === LevelLayout.Tree) return;
          drawUnitLevelGroupConnectorPath(currentGroupElement, unitNode, unitOptions);
        });
        switch (currentLevelLayout) {
          case LevelLayout.TreeRight:
          case LevelLayout.TreeLeft:
          case LevelLayout.Tree:
            drawUnitLevelGroupTreeLeftRightConnectorPath(
              currentGroupElement,
              unitLevelGroup.units,
              currentLevelLayout,
              levelGroupOptions
            );
            break;
          default:
            drawUnitLevelConnectorPath(
              currentGroupElement,
              unitLevelGroup.units,
              levelGroupOptions
            );
        }
      });
    });
  }

  public makeInteractive() {
    this._addSelectionLayer(this.renderedChart);
  }

  private _addSelectionLayer(renderedChart: RenderedChart) {
    renderedChart.levels.forEach((level, index) => {
      this.highlightLevel(index);
      level.unitGroups.forEach((levelGroup) => {
        this.highlightGroup(levelGroup);
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
}

export { OrbatChart };
