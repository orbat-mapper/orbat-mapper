import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OrbatChart } from "./orbchart";
import { getUnitBoxOrigin } from "./svgRender";
import {
  LevelLayouts,
  UnitLevelDistances,
  type ChartUnit,
  type RenderedUnitNode,
} from "./types";

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
      const textElements = Array.from(this.querySelectorAll("text"));
      const width = Math.max(
        40,
        ...textElements.map((text) => (text.textContent?.length ?? 0) * 8),
      );
      const bottom = Math.max(
        40,
        ...textElements.map((text) => Number(text.getAttribute("y")) + 16),
      );
      return { x: 20 - width / 2, y: 0, width, height: bottom };
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

  it("keeps the debug page boundary in page coordinates", () => {
    const chart = new OrbatChart(
      unit("A unit name that is wider than the requested chart viewport"),
      {
        debug: true,
        maxLevels: 1,
        symbolGenerator: createSymbol,
      },
    );

    const svg = chart.toSVG(document.createElement("div"), {
      width: 200,
      height: 200,
    });

    const pageBoundary = svg.querySelector<SVGRectElement>(
      ":scope > rect.o-page-boundary",
    );
    expect(pageBoundary).not.toBeNull();
    expect(pageBoundary!.getAttribute("width")).toBe("200");
    expect(pageBoundary!.getAttribute("height")).toBe("200");
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

function resourceUnit(id: string): ChartUnit {
  return {
    ...unit(id),
    equipment: Array.from({ length: 4 }, (_, index) => ({
      name: `${id} extremely long equipment category description ${index + 1}`,
      count: index + 1,
    })),
    personnel: Array.from({ length: 6 }, (_, index) => ({
      name: `${id} personnel category ${index + 1}`,
      count: index + 1,
    })),
  };
}

function boxesOverlap(a: RenderedUnitNode, b: RenderedUnitNode) {
  const aOrigin = getUnitBoxOrigin(a);
  const bOrigin = getUnitBoxOrigin(b);
  return (
    aOrigin.x < bOrigin.x + b.boundingBox.width &&
    aOrigin.x + a.boundingBox.width > bOrigin.x &&
    aOrigin.y < bOrigin.y + b.boundingBox.height &&
    aOrigin.y + a.boundingBox.height > bOrigin.y
  );
}

describe.each([LevelLayouts.Tree, LevelLayouts.TreeLeft, LevelLayouts.TreeRight])(
  "resource table spacing for %s",
  (lastLevelLayout) => {
    it("keeps resource tables from different units from overlapping", () => {
      const root = unit("root", [
        unit("left-parent", [resourceUnit("left-1"), resourceUnit("left-2")]),
        unit("right-parent", [resourceUnit("right-1"), resourceUnit("right-2")]),
      ]);
      const chart = new OrbatChart(root, {
        lastLevelLayout,
        maxLevels: 3,
        showEquipment: true,
        showPersonnel: true,
        symbolGenerator: createSymbol,
      });

      const svg = chart.toSVG(document.createElement("div"), {
        width: 600,
        height: 600,
      });

      const lastLevelUnits = chart.renderedChart.levels[2].branches.flatMap(
        (branch) => branch.units,
      );
      for (const [index, unitNode] of lastLevelUnits.entries()) {
        for (const otherNode of lastLevelUnits.slice(index + 1)) {
          expect(
            boxesOverlap(unitNode, otherNode),
            `${unitNode.unit.id} overlaps ${otherNode.unit.id}`,
          ).toBe(false);
        }
      }

      const trunkPath = svg.querySelector<SVGPathElement>("#o-connectors-level-2 path");
      const trunkX = Number(trunkPath?.getAttribute("d")?.match(/^M ([-\d.e]+),/)?.[1]);
      expect(Number.isFinite(trunkX)).toBe(true);
      for (const unitNode of lastLevelUnits) {
        const origin = getUnitBoxOrigin(unitNode);
        expect(
          trunkX <= origin.x || trunkX >= origin.x + unitNode.boundingBox.width,
          `${unitNode.unit.id} table crosses the connector trunk`,
        ).toBe(true);
      }
    });
  },
);
