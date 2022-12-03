// language=CSS format=false
import {
  BasicUnitNode,
  ConnectorOptions,
  FontOptions,
  GElementSelection,
  type LevelLayout,
  LevelLayouts,
  OrbChartOptions,
  PartialOrbChartOptions,
  RenderedLevel,
  RenderedUnitNode,
  SpecificOptions,
  SVGElementSelection,
  UnitNodeInfo,
} from "./types";
import ms from "milsymbol";

const HIGHLIGT_STYLE = `
  .o-unit:hover {
    fill: #770303;
    cursor: pointer;
    font-weight: bold;
  }

  .highlight {
    stroke: none;
    stroke-dasharray: 5, 5;
    fill: white;
    fill-opacity: 0;
  }

  .highlight:hover {
    stroke: gray;
    stroke-width: 2pt;
    fill: #ccc;
    fill-opacity: 0.1;
  }
`;

export function createChartStyle(options: OrbChartOptions) {
  return `
.o-line {
 
}

.o-label {
  text-anchor: middle;
}

${HIGHLIGT_STYLE}
`;
}

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

export function createInitialNodeStructure(
  parentElement: SVGElementSelection | GElementSelection,
  groupedLevels: BasicUnitNode[][][],
  options: OrbChartOptions,
  specificOptions: SpecificOptions
): RenderedLevel[] {
  let renderedLevels: RenderedLevel[] = [];
  for (const [levelNumber, currentLevel] of groupedLevels.entries()) {
    if (options.maxLevels && levelNumber >= options.maxLevels) break;
    let levelSpecificOptions = specificOptions.level?.[levelNumber] || {};
    let levelGElement = createGroupElement(
      parentElement,
      "o-level",
      `o-level-${levelNumber}`
    );
    addFontAttributes(levelGElement, levelSpecificOptions);

    let renderedLevel: RenderedLevel = {
      groupElement: levelGElement,
      branches: [],
      options: levelSpecificOptions,
    };

    renderedLevels.push(renderedLevel);
    let levelOptions = { ...options, ...levelSpecificOptions };

    currentLevel.forEach((branch, groupIdx) => {
      let parent = branch[0].parent;
      let branchSpecificOptions = {};
      if (parent) {
        branchSpecificOptions = specificOptions.branch?.[parent.unit.id] || {};
      }
      let branchOptions = { ...levelOptions, ...branchSpecificOptions };
      let branchId = `o-branch-${parent ? parent.unit.id : 0}`;
      let branchGElement = createGroupElement(levelGElement, "o-branch", branchId);
      addFontAttributes(branchGElement, branchSpecificOptions);

      const units = branch.map((unitNode) => {
        let unitSpecificOptions = specificOptions.unit?.[unitNode.unit.id] || {};

        let unitOptions = { ...branchOptions, ...unitSpecificOptions };
        let renderedUnitNode = createUnitGroup(
          branchGElement,
          convertBasicUnitNode2UnitNodeInfo(unitNode, unitOptions),
          unitOptions,
          unitSpecificOptions,
          levelNumber
        );
        renderedUnitNode.options = unitSpecificOptions;
        return renderedUnitNode;
      });

      renderedLevel.branches.push({
        groupElement: branchGElement,
        units,
        options: branchSpecificOptions,
        level: levelNumber,
      });
    });
  }
  return renderedLevels;
}

export function putGroupAt(
  g: GElementSelection,
  node: UnitNodeInfo,
  x: number,
  y: number,
  debug = false
) {
  const dx = x - node.octagonAnchor.x;
  const dy = y - node.octagonAnchor.y;
  return g.attr("transform", `translate(${dx}, ${dy})`);
}

export function createGroupElement(
  parentElement: any,
  className: string,
  id = ""
): GElementSelection {
  let el = parentElement.append("g").attr("class", className);
  if (id) {
    el.attr("id", id);
  }
  return el;
}

export function drawDebugRect(groupElement: GElementSelection, fill = "#ccc") {
  if (groupElement) {
    const bbox = groupElement.node()!.getBBox();
    groupElement
      .append("rect")
      .lower()
      .classed("dbg-rect", true)
      .attr("x", bbox.x)
      .attr("y", bbox.y)
      .attr("width", bbox.width)
      .attr("height", bbox.height)
      .style("fill", fill)
      .style("fill-opacity", ".4")
      .style("stroke", "#666")
      .style("stroke-width", "1.5px");
  }
}

function drawDebugPoint(parentElement: any, x: number, y: number, fillColor = "red") {
  parentElement
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 4)
    .attr("fill", fillColor);
}

export function createUnitGroup(
  parentElement: GElementSelection,
  unitNode: UnitNodeInfo,
  options: OrbChartOptions,
  specificOptions: PartialOrbChartOptions,
  level: number
): RenderedUnitNode {
  const g = createGroupElement(parentElement, "o-unit");
  const unitLabel = options.useShortName
    ? unitNode.unit.shortName || unitNode.unit.name
    : unitNode.unit.name;
  g.append("g").html(unitNode.symb.asSVG());
  if (!options.hideLabel) {
    const text = g
      .append("text")
      .attr("x", unitNode.octagonAnchor.x)
      .attr("dy", `${options.labelOffset}pt`)
      .attr("y", unitNode.symbolBoxSize.height)
      .attr("class", "o-label")
      .text(unitLabel);

    if (specificOptions.fontSize) text.attr("font-size", `${options.fontSize}pt`);
    if (specificOptions.fontWeight) text.attr("font-weight", options.fontWeight);
    if (specificOptions.fontStyle) text.attr("font-style", options.fontStyle);
    if (specificOptions.fontColor) text.attr("fill", options.fontColor);
  }

  if (options.onClick) {
    g.on("click", (e) => {
      // @ts-ignore
      options.onClick(unitNode);
    });
  }

  if (options.debug) {
    drawDebugRect(g);
  }

  let renderedUnitNode = unitNode as RenderedUnitNode;
  renderedUnitNode.groupElement = g;
  renderedUnitNode.boundingBox = g.node()!.getBBox();
  renderedUnitNode.level = level;

  return renderedUnitNode;
}

export function calculateAnchorPoints(unitNode: RenderedUnitNode) {
  const { x, y } = unitNode;
  unitNode.ly = y + (unitNode.boundingBox.height - unitNode.octagonAnchor.y);
  unitNode.lx = x - unitNode.boundingBox.width / 2;
  unitNode.rx = x + unitNode.boundingBox.width / 2;
}

export function drawDebugAnchors(svg: SVGElementSelection, unitNode: RenderedUnitNode) {
  drawDebugPoint(svg, unitNode.x, unitNode.y);
  drawDebugPoint(svg, unitNode.x, unitNode.ly);
  drawDebugPoint(svg, unitNode.lx, unitNode.y);
  drawDebugPoint(svg, unitNode.rx, unitNode.y);
}

export function drawUnitBranchConnectorPath(
  g: GElementSelection,
  unit: UnitNodeInfo,
  options: any
) {
  const { x, y } = unit;
  if (unit.parent) {
    const dy = y - (y - unit.parent.y) / 2;
    const d = `M ${x}, ${y - unit.octagonAnchor.y - options.connectorOffset} V ${dy}`;
    g.append("path").attr("d", d).classed("o-line", true);
  }
}

export function drawUnitLevelConnectorPath(
  g: GElementSelection,
  unitBranch: RenderedUnitNode[],
  options: OrbChartOptions
) {
  let firstUnitInGroup = unitBranch[0];
  let parentUnit = firstUnitInGroup.parent;
  if (!parentUnit) return;
  let lastUnitInGroup = unitBranch[unitBranch.length - 1];

  const dy = firstUnitInGroup.y - (firstUnitInGroup.y - parentUnit.y) / 2;
  const d1 = `M ${parentUnit.x}, ${parentUnit.ly + options.connectorOffset} V ${dy}`;
  g.append("path").attr("d", d1).classed("o-line", true);
  const d = `M ${firstUnitInGroup.x}, ${dy} H ${lastUnitInGroup.x}`;
  g.append("path").attr("d", d).classed("o-line", true);
}

export function drawUnitBranchTreeLeftRightConnectorPath(
  g: GElementSelection,
  unitBranch: RenderedUnitNode[],
  levelLayout: LevelLayout,
  options: OrbChartOptions
) {
  let lastUnitInGroup = unitBranch[unitBranch.length - 1];
  let parentUnit = lastUnitInGroup.parent as RenderedUnitNode;
  if (!parentUnit) return;

  const d1 = `M ${parentUnit.x}, ${parentUnit.ly + options.connectorOffset} V ${
    lastUnitInGroup.y
  }`;
  g.append("path").attr("d", d1).classed("o-line", true);

  // find the widest node
  let maxWidth = Math.max(...unitBranch.map((u) => u.boundingBox.width));
  for (const [yIdx, unit] of unitBranch.entries()) {
    let d1;
    const delta = Math.abs(unit.boundingBox.width / 2 - maxWidth / 2);
    if (
      levelLayout === LevelLayouts.TreeRight ||
      (levelLayout === LevelLayouts.Tree && yIdx % 2)
    )
      d1 = `M ${unit.lx - delta - options.connectorOffset}, ${unit.y}  H ${parentUnit.x}`;
    else
      d1 = `M ${unit.rx + delta + options.connectorOffset}, ${unit.y}  H ${parentUnit.x}`;
    g.append("path").attr("d", d1).classed("o-line", true);
  }
}

export function addFontAttributes(
  group: GElementSelection,
  options: Partial<FontOptions>
) {
  const { fontSize, fontWeight, fontStyle, fontColor } = options;
  fontSize && group.attr("font-size", `${fontSize}pt`);
  fontWeight && group.attr("font-weight", fontWeight);
  fontStyle && group.attr("font-style", fontStyle);
  fontColor && group.attr("fill", fontColor);
}

export function addConnectorAttributes(
  group: GElementSelection,
  options: Partial<ConnectorOptions>
) {
  const { lineColor, lineWidth } = options;
  lineColor && group.attr("stroke", lineColor);
  lineWidth && group.attr("stroke-width", `${lineWidth}pt`);
}
