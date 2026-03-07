import { describe, expect, it } from "vitest";
import {
  ChartOrientations,
  DEFAULT_OPTIONS,
  OrbatChart,
  type SymbolGenerator,
  type ChartUnit,
} from "../index";
import { ORBAT1 } from "./testorbats";
import ms from "milsymbol";

describe("OrbatChart class", () => {
  it("is defined", () => {
    expect(OrbatChart).toBeDefined();
  });

  it("calculates layout", () => {
    const o = new OrbatChart(ORBAT1);
    const layout = o.calculateLayout(1000, 1000);
    expect(layout.levels).toBeDefined();
    expect(layout.links).toBeDefined();
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
