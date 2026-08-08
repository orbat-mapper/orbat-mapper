import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OrbatChart } from "./orbchart";
import { UnitLevelDistances, type ChartUnit } from "./types";

const sidc = "10031000151211004600";
const originalGetBBox = Object.getOwnPropertyDescriptor(SVGElement.prototype, "getBBox");

function unit(id: string, subUnits?: ChartUnit[]): ChartUnit {
  return { id, name: id, sidc, subUnits };
}

function createSymbol() {
  return {
    getSize: () => ({ width: 40, height: 40 }),
    getAnchor: () => ({ x: 20, y: 20 }),
    getOctagonAnchor: () => ({ x: 20, y: 20 }),
    asSVG: () => "<svg />",
  } as never;
}

beforeAll(() => {
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    configurable: true,
    value(this: SVGElement) {
      const label = this.querySelector("text")?.textContent ?? "";
      const width = Math.max(40, label.length * 8);
      return { x: 20 - width / 2, y: 0, width, height: 40 };
    },
  });
});

afterAll(() => {
  if (originalGetBBox) {
    Object.defineProperty(SVGElement.prototype, "getBBox", originalGetBBox);
  } else {
    delete (SVGElement.prototype as { getBBox?: unknown }).getBBox;
  }
});

describe.each([UnitLevelDistances.Fixed, UnitLevelDistances.EqualPadding])(
  "horizontal subtree layout (%s)",
  (unitLevelDistance) => {
    it("keeps an adjacent parent trunk outside another branch's connector bus", () => {
      const root = unit("root", [
        unit("wide", [unit("w1"), unit("w2"), unit("w3"), unit("w4"), unit("w5")]),
        unit("narrow", [unit("n1")]),
      ]);
      const chart = new OrbatChart(root, {
        maxLevels: 3,
        symbolGenerator: createSymbol,
        unitLevelDistance,
      });

      chart.toSVG(document.createElement("div"), { width: 600, height: 600 });

      const wideChildren = chart.renderedChart.levels[2].branches[0].units;
      const [wideParent, narrowParent] = chart.renderedChart.levels[1].branches[0].units;
      const busLeft = wideChildren[0].x;
      const busRight = wideChildren[wideChildren.length - 1].x;

      expect(narrowParent.x >= busLeft && narrowParent.x <= busRight).toBe(false);
      expect(wideParent.x).toBeCloseTo((busLeft + busRight) / 2);
    });
  },
);

describe("horizontal layout bounds", () => {
  it("fits an oversized label inside the requested page size", () => {
    const root = unit("A unit name that is wider than the requested chart viewport");
    const chart = new OrbatChart(root, {
      maxLevels: 1,
      symbolGenerator: createSymbol,
    });

    const svg = chart.toSVG(document.createElement("div"), {
      width: 200,
      height: 200,
    });

    expect(svg.getAttribute("viewBox")).toBe("0 0 200 200");

    const transform = svg
      .querySelector<SVGGElement>("g.o-wrapper")!
      .getAttribute("transform")!;
    const match = transform.match(
      /^translate\(([-\d.e]+) ([-\d.e]+)\) scale\(([-\d.e]+)\)$/,
    )!;
    const translateX = Number(match[1]);
    const scale = Number(match[3]);
    const renderedRoot = chart.renderedChart.levels[0].branches[0].units[0];
    const contentLeft =
      renderedRoot.x - renderedRoot.octagonAnchor.x + renderedRoot.boundingBox.x;
    const contentRight = contentLeft + renderedRoot.boundingBox.width;

    expect(scale).toBeLessThan(1);
    expect(contentLeft * scale + translateX).toBeGreaterThanOrEqual(0);
    expect(contentRight * scale + translateX).toBeLessThanOrEqual(200);
  });

  it("preserves a non-horizontal final level relative to its parent", () => {
    const root = unit("root", [
      unit("left", [unit("left-child")]),
      unit("right", [unit("right-child")]),
    ]);
    const chart = new OrbatChart(root, {
      lastLevelLayout: "TREE_RIGHT",
      maxLevels: 3,
      symbolGenerator: createSymbol,
      treeOffset: 60,
    });

    chart.toSVG(document.createElement("div"), { width: 600, height: 600 });

    const parents = chart.renderedChart.levels[1].branches[0].units;
    const childBranches = chart.renderedChart.levels[2].branches;
    expect(childBranches[0].units[0].x).toBe(parents[0].x + 60);
    expect(childBranches[1].units[0].x).toBe(parents[1].x + 60);
  });
});
