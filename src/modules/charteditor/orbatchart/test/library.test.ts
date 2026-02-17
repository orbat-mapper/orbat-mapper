import { describe, expect, it } from "vitest";
import {
  ChartOrientations,
  DEFAULT_OPTIONS,
  OrbatChart,
  type PartialOrbChartOptions,
  type SymbolGenerator,
  type ChartUnit,
} from "../index";
import { ORBAT1 } from "./testorbats";
import ms from "milsymbol";

// @ts-ignore
SVGElement.prototype.getBBox = () => {
  return { x: 0, y: 0, width: 20, height: 10 };
};

describe("OrbatChart class", () => {
  it("is defined", () => {
    expect(OrbatChart).toBeDefined();
  });

  it("renders", () => {
    const o = new OrbatChart(ORBAT1);
    const svg = o.toSVG(document.body);
    expect(svg.getAttribute("width")).toBe("100%");
  });
});

describe("OrbatChart SVG rendering", () => {
  it("renders", () => {
    const o = new OrbatChart(ORBAT1);
    const svg = o.toSVG(document.body);
    expect(svg.getAttribute("width")).toBe("100%");
  });

  it("has empty ID by default", () => {
    const o = new OrbatChart(ORBAT1);
    const svg = o.toSVG(document.body);
    expect(svg.id).toBe("");
  });

  it("allows a custom ID", () => {
    const o = new OrbatChart(ORBAT1);
    const svg = o.toSVG(document.body, { elementId: "CustomID" });
    expect(svg.id).toBe("CustomID");
  });
});

const DUMMY_UNIT: ChartUnit = {
  name: "Unit A",
  shortName: "A Bde",
  id: "1",
  sidc: "10031000151211000000",
  subUnits: [],
};

describe("OrbatChart options", () => {
  it("has default values", () => {
    const ob = new OrbatChart(DUMMY_UNIT);
    expect(ob.options).toBeDefined();
    expect(ob.options.symbolSize).toBe(DEFAULT_OPTIONS.symbolSize);
    expect(ob.options.connectorOffset).toBe(DEFAULT_OPTIONS.connectorOffset);
    expect(ob.options.maxLevels).toBe(DEFAULT_OPTIONS.maxLevels);
    expect(ob.options.onClick).toBeUndefined();
    expect(ob.options.symbolGenerator).toBeUndefined();
  });

  it("overrides default values", () => {
    const ob = new OrbatChart(DUMMY_UNIT, { symbolSize: 13, maxLevels: 4 });
    expect(ob.options.symbolSize).toBe(13);
    expect(ob.options.connectorOffset).toBe(DEFAULT_OPTIONS.connectorOffset);
    expect(ob.options.maxLevels).toBe(4);
  });
});

describe("Symbol generator", () => {
  it("is undefined by default", () => {
    const ob = new OrbatChart(DUMMY_UNIT);
    expect(ob.options.symbolGenerator).toBeUndefined();
  });

  it("can be set", () => {
    const customGenerator: SymbolGenerator = (sidc, options) =>
      new ms.Symbol(sidc, options);
    const ob = new OrbatChart(DUMMY_UNIT, { symbolGenerator: customGenerator });
    expect(ob.options.symbolGenerator).toBe(customGenerator);
  });
});

describe("OrbatChart orientation", () => {
  it("has default value 'TOP'", () => {
    const ob = new OrbatChart(DUMMY_UNIT);
    expect(ob.options.orientation).toBe(ChartOrientations.Top);
  });

  it("can be changed", () => {
    const ob = new OrbatChart(DUMMY_UNIT, {
      orientation: ChartOrientations.Bottom,
    });
    expect(ob.options.orientation).toBe(ChartOrientations.Bottom);
  });
});

function createChartSvgString(options?: PartialOrbChartOptions) {
  const o = new OrbatChart(DUMMY_UNIT, options);
  const svg = o.toSVG(document.body);
  return svg.innerHTML;
}

describe("OrbatChart unit labels", () => {
  it("uses name by default", () => {
    const svgString = createChartSvgString();
    expect(svgString).toContain(DUMMY_UNIT.name);
  });

  it("uses short name if useShortName is true", () => {
    const svgString = createChartSvgString({ useShortName: true });
    expect(svgString).toContain(DUMMY_UNIT.shortName);
  });

  it("has configurable labelOffset", () => {
    const svgString = createChartSvgString({ labelOffset: 1337 });
    expect(svgString).toContain("1337");
    expect(svgString).toContain(DUMMY_UNIT.name);
  });

  it("can be disable with hideLabel setting", () => {
    const svgString = createChartSvgString({ labelOffset: 1337, hideLabel: true });
    expect(svgString).not.toContain(DUMMY_UNIT.name);
    expect(svgString).not.toContain("1337");
  });

  it("can change color", () => {
    const svgString = createChartSvgString({ fontColor: "testvalue" });
    expect(svgString).toContain('fill="testvalue"');
  });
});
