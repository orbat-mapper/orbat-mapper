import {
  ChartOrientation,
  DEFAULT_OPTIONS,
  OrbatChart,
  PartialOrbChartOptions,
  SymbolGenerator,
  Unit,
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
    let o = new OrbatChart(ORBAT1);
    let svg = o.toSVG(document.body);
    expect(svg.getAttribute("width")).toBe("100%");
  });
});

describe("OrbatChart SVG rendering", () => {
  it("renders", () => {
    let o = new OrbatChart(ORBAT1);
    let svg = o.toSVG(document.body);
    expect(svg.getAttribute("width")).toBe("100%");
  });

  it("has empty ID by default", () => {
    let o = new OrbatChart(ORBAT1);
    let svg = o.toSVG(document.body);
    expect(svg.id).toBe("");
  });

  it("allows a custom ID", () => {
    let o = new OrbatChart(ORBAT1);
    let svg = o.toSVG(document.body, { elementId: "CustomID" });
    expect(svg.id).toBe("CustomID");
  });
});

const DUMMY_UNIT: Unit = {
  name: "Unit A",
  shortName: "A Bde",
  id: "1",
  sidc: "10031000151211000000",
  subUnits: [],
};

describe("OrbatChart options", () => {
  it("has default values", () => {
    let ob = new OrbatChart(DUMMY_UNIT);
    expect(ob.options).toBeDefined();
    expect(ob.options.symbolSize).toBe(DEFAULT_OPTIONS.symbolSize);
    expect(ob.options.connectorOffset).toBe(DEFAULT_OPTIONS.connectorOffset);
    expect(ob.options.maxLevels).toBe(DEFAULT_OPTIONS.maxLevels);
    expect(ob.options.onClick).toBeUndefined();
    expect(ob.options.symbolGenerator).toBeUndefined();
  });

  it("overrides default values", () => {
    let ob = new OrbatChart(DUMMY_UNIT, { symbolSize: 13, maxLevels: 4 });
    expect(ob.options.symbolSize).toBe(13);
    expect(ob.options.connectorOffset).toBe(DEFAULT_OPTIONS.connectorOffset);
    expect(ob.options.maxLevels).toBe(4);
  });
});

describe("Symbol generator", () => {
  it("is undefined by default", () => {
    let ob = new OrbatChart(DUMMY_UNIT);
    expect(ob.options.symbolGenerator).toBeUndefined();
  });

  it("can be set", () => {
    let customGenerator: SymbolGenerator = (sidc, options) =>
      new ms.Symbol(sidc, options);
    let ob = new OrbatChart(DUMMY_UNIT, { symbolGenerator: customGenerator });
    expect(ob.options.symbolGenerator).toBe(customGenerator);
  });
});

describe("OrbatChart orientation", () => {
  it("has default value 'TOP'", () => {
    let ob = new OrbatChart(DUMMY_UNIT);
    expect(ob.options.orientation).toBe(ChartOrientation.Top);
  });

  it("can be changed", () => {
    let ob = new OrbatChart(DUMMY_UNIT, {
      orientation: ChartOrientation.Bottom,
    });
    expect(ob.options.orientation).toBe(ChartOrientation.Bottom);
  });
});

function createChartSvgString(options?: PartialOrbChartOptions) {
  let o = new OrbatChart(DUMMY_UNIT, options);
  let svg = o.toSVG(document.body);
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
  });
});
