import { arrSum, flattenArray, walkTree } from "./utils";
import type {
  BasicUnitNode,
  ChartUnit,
  LevelLayout,
  OrbChartOptions,
  RenderedChart,
  RenderedLevel,
  RenderedUnitNode,
  SpecificOptions,
} from "./types";
import { LevelLayouts, UnitLevelDistances, VerticalAlignments } from "./types";
import {
  DEFAULT_CHART_HEIGHT,
  DEFAULT_CHART_WIDTH,
  DEFAULT_OPTIONS,
  MARGIN_TOP,
} from "./defaults";
import {
  calculateAnchorPoints,
  createInitialNodeStructure,
  drawUnitBranchConnectorPath,
  drawUnitBranchTreeLeftRightConnectorPath,
  drawUnitLevelConnectorPath,
} from "./svgRender";

function isLeftRightLayout(layout: LevelLayout) {
  return layout === LevelLayouts.TreeRight || layout === LevelLayouts.TreeLeft;
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

export class OrbatChart {
  width!: number;
  height!: number;
  options: OrbChartOptions;
  groupedLevels: BasicUnitNode[][][] = [];
  renderedChart!: RenderedChart;

  constructor(
    private rootNode: ChartUnit,
    options: Partial<OrbChartOptions> = {},
    private specificOptions: SpecificOptions = {},
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    if (rootNode) this._computeOrbatInfo(rootNode);
  }

  cleanup() {}

  calculateLayout(
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT,
  ): RenderedChart {
    this.width = width;
    this.height = height;

    const renderedChart: RenderedChart = {
      levels: [],
      links: [],
    };

    // Pass 1: Create initial node structure with basic sizes
    renderedChart.levels = createInitialNodeStructure(
      this.groupedLevels,
      this.options,
      this.specificOptions,
    );

    // Pass 2: Do unit layout (calculate x/y)
    this._doNodeLayout(renderedChart);

    // Pass 3: Draw connectors (calculate SVG paths)
    this._drawConnectors(renderedChart);

    // Pass 4: Calculate hierarchy bounding boxes for interaction
    this._calculateHierarchyBoundingBoxes(renderedChart);

    this.renderedChart = renderedChart;
    return renderedChart;
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

    const renderGroups = renderedLevel.branches;
    const unitsOnLevel = flattenArray<RenderedUnitNode>(
      renderGroups.map((unitGroup) => unitGroup.units),
    );
    const numberOfUnitsOnLevel = unitsOnLevel.length;
    const totalWidth = arrSum(unitsOnLevel.map((u) => u.boundingBox.width));

    const availableSpace = chartWidth - totalWidth;
    const padding = availableSpace / numberOfUnitsOnLevel;

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

    function _doHorizontalLayout() {
      let xIdx = 0;
      let prevX = -padding / 2;

      renderedLevel.branches.forEach((unitBranch) => {
        const branchOptions = { ...levelOptions, ...unitBranch.options };
        for (const unitNode of unitBranch.units) {
          let x;
          const unitOptions = { ...branchOptions, ...unitNode.options };
          if (unitOptions.unitLevelDistance === UnitLevelDistances.EqualPadding) {
            x = prevX + unitNode.boundingBox.width / 2 + padding;
          } else {
            x = ((xIdx + 1) * chartWidth) / (numberOfUnitsOnLevel + 1);
          }

          unitNode.x = x;
          unitNode.y = y;
          calculateAnchorPoints(unitNode, unitOptions);

          prevX = unitNode.x + unitNode.boundingBox.width / 2;
          xIdx += 1;
        }
      });
    }

    function _doTreeLayout() {
      const groupsOnLevel = renderedLevel.branches.length;
      renderedLevel.branches.forEach((unitBranch, groupIdx) => {
        const branchOptions = { ...levelOptions, ...unitBranch.options };
        let prevY = y;
        for (const [yIdx, unitNode] of unitBranch.units.entries()) {
          const unitOptions = { ...branchOptions, ...unitNode.options };
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
          calculateAnchorPoints(unitNode, unitOptions);

          if (yIdx % 2) prevY = unitNode.ly + unitOptions.stackedOffset;
        }
      });
    }

    function _doStackedLayout(layout: LevelLayout) {
      const groupsOnLevel = renderedLevel.branches.length;
      renderedLevel.branches.forEach((unitBranch, groupIdx) => {
        const branchOptions = { ...levelOptions, ...unitBranch.options };
        let prevY = y;
        for (const unitNode of unitBranch.units) {
          const unitOptions = { ...branchOptions, ...unitNode.options };
          let x = unitNode.parent
            ? unitNode.parent.x
            : ((groupIdx + 1) * chartWidth) / (groupsOnLevel + 1);

          if (layout === LevelLayouts.TreeRight) {
            x += unitOptions.treeOffset;
          } else if (layout === LevelLayouts.TreeLeft) {
            x -= unitOptions.treeOffset;
          }
          const ny = prevY;
          unitNode.x = x;
          unitNode.y = ny;
          calculateAnchorPoints(unitNode, unitOptions);

          prevY = unitNode.ly + unitOptions.stackedOffset;
        }
      });
    }
  }

  private _drawConnectors(renderedChart: RenderedChart) {
    const nLevels = this.options.maxLevels || renderedChart.levels.length;
    renderedChart.levels.forEach((renderedLevel, yIdx) => {
      const levelOptions = { ...this.options, ...renderedLevel.options };

      renderedLevel.branches.forEach((branch) => {
        const currentLevelLayout =
          yIdx === nLevels - 1 ? this.options.lastLevelLayout : LevelLayouts.Horizontal;
        const branchOptions = { ...levelOptions, ...branch.options };

        branch.units.forEach((unitNode, idx) => {
          const unitOptions = { ...branchOptions, ...unitNode.options };
          if (currentLevelLayout === LevelLayouts.Stacked && idx > 0) return;
          if (isLeftRightLayout(currentLevelLayout)) return;
          if (currentLevelLayout === LevelLayouts.Tree) return;

          const pathD = drawUnitBranchConnectorPath(unitNode, unitOptions);
          if (pathD) renderedChart.links.push({ d: pathD, options: unitOptions });
        });

        switch (currentLevelLayout) {
          case LevelLayouts.TreeRight:
          case LevelLayouts.TreeLeft:
          case LevelLayouts.Tree:
            const treeLinks = drawUnitBranchTreeLeftRightConnectorPath(
              branch.units,
              currentLevelLayout,
              branchOptions,
            );
            renderedChart.links.push(...treeLinks);
            break;
          default:
            const levelLinks = drawUnitLevelConnectorPath(branch.units, branchOptions);
            renderedChart.links.push(...levelLinks);
        }
      });
    });
  }

  private _calculateHierarchyBoundingBoxes(renderedChart: RenderedChart) {
    renderedChart.levels.forEach((level) => {
      let lMinX = Infinity,
        lMinY = Infinity,
        lMaxX = -Infinity,
        lMaxY = -Infinity;

      level.branches.forEach((branch) => {
        let bMinX = Infinity,
          bMinY = Infinity,
          bMaxX = -Infinity,
          bMaxY = -Infinity;

        branch.units.forEach((unit) => {
          const { x } = unit;
          const ux = x - unit.boundingBox.width / 2;
          const uy = unit.y - unit.octagonAnchor.y;
          const urx = unit.x + unit.boundingBox.width / 2;
          const uby = uy + unit.boundingBox.height;

          bMinX = Math.min(bMinX, ux);
          bMinY = Math.min(bMinY, uy);
          bMaxX = Math.max(bMaxX, urx);
          bMaxY = Math.max(bMaxY, uby);
        });

        // Add some padding to the highlight box
        const padding = 10;
        branch.boundingBox = {
          x: bMinX - padding,
          y: bMinY - padding,
          width: bMaxX - bMinX + padding * 2,
          height: bMaxY - bMinY + padding * 2,
        };

        lMinX = Math.min(lMinX, branch.boundingBox.x);
        lMinY = Math.min(lMinY, branch.boundingBox.y);
        lMaxX = Math.max(lMaxX, branch.boundingBox.x + branch.boundingBox.width);
        lMaxY = Math.max(lMaxY, branch.boundingBox.y + branch.boundingBox.height);
      });

      level.boundingBox = {
        x: lMinX,
        y: lMinY,
        width: lMaxX - lMinX,
        height: lMaxY - lMinY,
      };
    });
  }
}
