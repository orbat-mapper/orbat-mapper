import {
  type BasicUnitNode,
  type ChartUnit,
  type LevelLayout,
  LevelLayouts,
  type OrbChartOptions,
  type PartialOrbChartOptions,
  type RenderedLevel,
  type RenderedUnitNode,
  type SpecificOptions,
  type UnitNodeInfo,
  type RenderedLink,
} from "./types";
import ms from "milsymbol";
import { sortBy } from "@/utils/index";
import { walkTree } from "./utils";

function convertBasicUnitNode2UnitNodeInfo(
  basicUnitNode: BasicUnitNode,
  options: Partial<OrbChartOptions>,
): UnitNodeInfo {
  const symbolOptions = {
    size: options.symbolSize,
    outlineWidth: options.symbolOutlineWidth,
    outlineColor: options.symbolOutlineColor,
    ...basicUnitNode.unit.symbolOptions,
  };
  const symb = options.symbolGenerator
    ? options.symbolGenerator(basicUnitNode.unit.sidc, symbolOptions)
    : new ms.Symbol(basicUnitNode.unit.sidc, symbolOptions);

  const unitNodeInfo = basicUnitNode as UnitNodeInfo;
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

export function createInitialNodeStructure(
  groupedLevels: BasicUnitNode[][][],
  options: OrbChartOptions,
  specificOptions: SpecificOptions,
): RenderedLevel[] {
  const renderedLevels: RenderedLevel[] = [];
  for (const [levelNumber, currentLevel] of groupedLevels.entries()) {
    if (options.maxLevels && levelNumber >= options.maxLevels) break;
    const levelSpecificOptions = specificOptions.level?.[levelNumber] || {};
    const levelOptions = { ...options, ...levelSpecificOptions };

    const renderedLevel: RenderedLevel = {
      branches: [],
      options: levelOptions,
      boundingBox: { x: 0, y: 0, width: 0, height: 0 },
    };

    renderedLevels.push(renderedLevel);

    currentLevel.forEach((branch) => {
      const parent = branch[0].parent;
      let branchSpecificOptions = {};
      if (parent) {
        branchSpecificOptions = specificOptions.branch?.[parent.unit.id] || {};
      }
      const branchOptions = { ...levelOptions, ...branchSpecificOptions };

      const units = branch.map((unitNode) => {
        const unitSpecificOptions = specificOptions.unit?.[unitNode.unit.id] || {};
        const unitOptions = { ...branchOptions, ...unitSpecificOptions };

        const renderedUnitNode = createUnitGroup(
          convertBasicUnitNode2UnitNodeInfo(unitNode, unitOptions),
          unitOptions,
          levelNumber,
        );
        renderedUnitNode.options = unitOptions as PartialOrbChartOptions;
        return renderedUnitNode;
      });

      renderedLevel.branches.push({
        units,
        options: branchOptions,
        level: levelNumber,
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        parentId: parent?.unit.id ?? "root",
      });
    });
  }
  return renderedLevels;
}

export function createUnitGroup(
  unitNode: UnitNodeInfo,
  options: OrbChartOptions,
  level: number,
): RenderedUnitNode {
  const symbolWidth = unitNode.symbolBoxSize.width;
  const symbolHeight = unitNode.symbolBoxSize.height;

  const unitLabel = options.useShortName
    ? unitNode.unit.shortName || unitNode.unit.name
    : unitNode.unit.name;

  // Estimate dimensions
  const labelHeight = options.hideLabel
    ? 0
    : options.fontSize * 1.5 + options.labelOffset;
  let maxBoundingHeight = symbolHeight + labelHeight;

  if (options.labelPlacement === "right" && !options.hideLabel) {
    maxBoundingHeight = Math.max(symbolHeight, options.fontSize * 1.5);
  }

  const charWidth = options.fontSize * 0.6;
  const labelWidth = unitLabel.length * charWidth;
  const maxBoundingWidth =
    options.labelPlacement === "right" && !options.hideLabel
      ? symbolWidth + labelWidth + options.labelOffset
      : Math.max(symbolWidth, labelWidth);

  if (options.showPersonnel || options.showEquipment) {
    const { aggregatedPersonnel, aggregatedEquipment } = aggregateData(unitNode.unit);
    const isLastLevel = level === options.maxLevels - 1;
    if (options.showPersonnel && aggregatedPersonnel.length) {
      maxBoundingHeight += 25;
    }
    if (options.showEquipment && (isLastLevel || !unitNode.unit.subUnits?.length)) {
      maxBoundingHeight += 25 + aggregatedEquipment.length * 20;
    }
  }

  const boundingBox = {
    width: maxBoundingWidth,
    height: maxBoundingHeight,
  };

  const renderedUnitNode = unitNode as RenderedUnitNode;
  renderedUnitNode.boundingBox = boundingBox;
  renderedUnitNode.level = level;

  return renderedUnitNode;
}

export function aggregateData(unit: ChartUnit) {
  const aggEquipment: Record<string, number> = {};
  const aggPersonnel: Record<string, number> = {};
  walkTree(unit, (u) => {
    u.equipment?.forEach((e) => {
      aggEquipment[e.name] = (aggEquipment[e.name] ?? 0) + e.count;
    });
    u.personnel?.forEach((p) => {
      aggPersonnel[p.name] = (aggPersonnel[p.name] ?? 0) + p.count;
    });
  });
  const aggregatedEquipment = sortBy(
    Object.entries(aggEquipment).map(([name, count]) => ({
      name,
      count,
    })),
    "name",
  );
  const aggregatedPersonnel = sortBy(
    Object.entries(aggPersonnel).map(([name, count]) => ({
      name,
      count,
    })),
    "name",
  );

  return { aggregatedEquipment, aggregatedPersonnel };
}

export function calculateAnchorPoints(
  unitNode: RenderedUnitNode,
  options: OrbChartOptions,
) {
  const { x, y } = unitNode;
  const symbolSize = options.symbolSize || 32;
  const halfOctagonHeight = (symbolSize * 0.7) / 2;

  unitNode.ot = y - halfOctagonHeight;
  unitNode.ob = y + halfOctagonHeight;
  unitNode.st = y - unitNode.octagonAnchor.y;
  unitNode.sb = unitNode.st + unitNode.symbolBoxSize.height;
  unitNode.ty = unitNode.st;
  unitNode.ly = unitNode.ty + unitNode.boundingBox.height;
  unitNode.lx = x - unitNode.boundingBox.width / 2;
  unitNode.rx = x + unitNode.boundingBox.width / 2;
  unitNode.lsx = x - unitNode.symbolBoxSize.width / 2;
  unitNode.rsx = x + unitNode.symbolBoxSize.width / 2;

  // For text-only units, adjust ot/ob/st/sb if symbol box is empty
  if (unitNode.symbolBoxSize.height < 5) {
    unitNode.ot = unitNode.st = unitNode.ty;
    unitNode.ob = unitNode.sb = unitNode.ty + options.fontSize * 1.2;
  }
}

export function drawUnitBranchConnectorPath(
  unit: UnitNodeInfo,
  options: OrbChartOptions,
): string | null {
  const { x, st } = unit;
  if (unit.parent) {
    const dy = (unit.parent.ly + st) / 2;
    // Use st (symbol top) to account for modifiers like echelon
    return `M ${x}, ${st - options.connectorOffset} V ${dy}`;
  }
  return null;
}

export function drawUnitLevelConnectorPath(
  unitBranch: RenderedUnitNode[],
  options: OrbChartOptions,
): RenderedLink[] {
  const links: RenderedLink[] = [];
  const firstUnitInGroup = unitBranch[0];
  const parentUnit = firstUnitInGroup.parent;
  if (!parentUnit) return links;
  const lastUnitInGroup = unitBranch[unitBranch.length - 1];

  const dy = (parentUnit.ly + firstUnitInGroup.st) / 2;
  const d1 = `M ${parentUnit.x}, ${parentUnit.ly + options.connectorOffset} V ${dy}`;
  links.push({ d: d1, options });

  const d = `M ${firstUnitInGroup.x}, ${dy} H ${Math.max(lastUnitInGroup.x, parentUnit.x)}`;
  links.push({ d: d, options });
  return links;
}

export function drawUnitBranchTreeLeftRightConnectorPath(
  unitBranch: RenderedUnitNode[],
  levelLayout: LevelLayout,
  options: OrbChartOptions,
): RenderedLink[] {
  const links: RenderedLink[] = [];
  const lastUnitInGroup = unitBranch[unitBranch.length - 1];
  const parentUnit = lastUnitInGroup.parent as RenderedUnitNode;
  if (!parentUnit) return links;
  const d1 = `M ${parentUnit.x}, ${parentUnit.ly + options.connectorOffset} V ${lastUnitInGroup.y}`;
  links.push({ d: d1, options });

  for (const [yIdx, unit] of unitBranch.entries()) {
    let dLine;
    const delta = 0;
    if (
      levelLayout === LevelLayouts.TreeRight ||
      (levelLayout === LevelLayouts.Tree && yIdx % 2)
    )
      dLine = `M ${unit.lsx - delta - options.connectorOffset}, ${unit.y} H ${parentUnit.x}`;
    else
      dLine = `M ${unit.rsx + delta + options.connectorOffset}, ${unit.y} H ${parentUnit.x}`;

    links.push({ d: dLine, options });
  }
  return links;
}
