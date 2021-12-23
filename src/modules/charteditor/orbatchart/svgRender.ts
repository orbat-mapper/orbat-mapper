// language=CSS format=false
import {
  GElementSelection,
  OrbChartOptions,
  PartialOrbChartOptions,
  RenderedUnitNode,
  SVGElementSelection,
  UnitNodeInfo,
} from "./types";

const HIGHLIGT_STYLE = `
  .o-unit:hover {
    fill: #770303;
    cursor: pointer;
    font-weight: bold;
  }

  .highlight {
    stroke: gray;
    stroke-dasharray: 5, 5;
    fill: white;
    fill-opacity: 0;
  }

  .highlight:hover {
    stroke: red;
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
  specificOptions: PartialOrbChartOptions
): RenderedUnitNode {
  const g = createGroupElement(parentElement, "o-unit");
  const unitLabel = options.useShortName
    ? unitNode.unit.shortName || unitNode.unit.name
    : unitNode.unit.name;
  g.append("g").html(unitNode.symb.asSVG());
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
