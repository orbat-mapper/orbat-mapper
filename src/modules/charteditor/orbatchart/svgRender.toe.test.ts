import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OrbatChart } from "./orbchart";
import { resolveToeFonts } from "./toeFonts";
import type { ChartUnit, PartialOrbChartOptions, SpecificOptions } from "./types";

const sidc = "10031000151211004600";
const originalGetBBox = Object.getOwnPropertyDescriptor(SVGElement.prototype, "getBBox");

function createSymbol() {
  return {
    getSize: () => ({ width: 40, height: 40 }),
    getAnchor: () => ({ x: 20, y: 20 }),
    getOctagonAnchor: () => ({ x: 20, y: 20 }),
    asSVG: () => "<svg />",
  } as never;
}

const unit: ChartUnit = {
  id: "platoon",
  name: "Platoon",
  sidc,
  personnel: [{ name: "Enlisted", count: 30 }],
  equipment: [{ name: "APC", count: 4 }],
};

function renderUnit(
  options: PartialOrbChartOptions = {},
  specificOptions: SpecificOptions = {},
) {
  const chart = new OrbatChart(
    unit,
    {
      maxLevels: 1,
      symbolGenerator: createSymbol,
      showPersonnel: true,
      showEquipment: true,
      ...options,
    },
    specificOptions,
  );
  const svg = chart.toSVG(document.createElement("div"), { width: 400, height: 400 });
  const group = svg.querySelector<SVGGElement>("g.o-unit")!;
  const [name, personnel, equipment] = Array.from(group.querySelectorAll("text"));
  return { group, name, personnel, equipment };
}

beforeAll(() => {
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    configurable: true,
    value: () => ({ x: 0, y: 0, width: 40, height: 40 }),
  });
});

afterAll(() => {
  if (originalGetBBox) {
    Object.defineProperty(SVGElement.prototype, "getBBox", originalGetBBox);
  } else {
    delete (SVGElement.prototype as { getBBox?: unknown }).getBBox;
  }
});

describe("personnel and equipment label styling", () => {
  it("inherits the unit label font by default, with equipment at 90%", () => {
    const { name, personnel, equipment } = renderUnit({ fontSize: 10 });

    expect(name.textContent).toBe("Platoon");
    expect(personnel.textContent).toBe("30  (30)");
    expect(personnel.getAttribute("font-size")).toBe("10pt");
    expect(personnel.getAttribute("font-weight")).toBe("normal");
    expect(equipment.getAttribute("font-size")).toBe("9pt");
    expect(equipment.getAttribute("fill")).toBe(personnel.getAttribute("fill"));
  });

  it("applies the personnel font to both lines, with equipment at 90%", () => {
    const { name, personnel, equipment } = renderUnit({
      personnelFontSize: 20,
      personnelFontWeight: "bold",
      personnelFontStyle: "italic",
      personnelFontColor: "#ff0000",
    });

    for (const text of [personnel, equipment]) {
      expect(text.getAttribute("font-weight")).toBe("bold");
      expect(text.getAttribute("font-style")).toBe("italic");
      expect(text.getAttribute("fill")).toBe("#ff0000");
    }
    expect(personnel.getAttribute("font-size")).toBe("20pt");
    expect(equipment.getAttribute("font-size")).toBe("18pt");
    expect(name.getAttribute("font-weight")).toBeNull();
    expect(name.getAttribute("fill")).toBeNull();
  });

  it("lets the equipment font override the personnel font", () => {
    const { personnel, equipment } = renderUnit({
      personnelFontWeight: "bold",
      personnelFontColor: "#ff0000",
      equipmentFontSize: 8,
      equipmentFontColor: "#00aa00",
    });

    expect(personnel.getAttribute("fill")).toBe("#ff0000");
    expect(equipment.getAttribute("fill")).toBe("#00aa00");
    expect(equipment.getAttribute("font-size")).toBe("8pt");
    expect(equipment.getAttribute("font-weight")).toBe("bold");
  });

  it("puts a unit's own font options on the unit group so every line inherits them", () => {
    const { group, name } = renderUnit(
      {},
      { unit: { platoon: { fontWeight: "bold", fontColor: "#0000ff" } } },
    );

    expect(group.getAttribute("font-weight")).toBe("bold");
    expect(group.getAttribute("fill")).toBe("#0000ff");
    expect(name.getAttribute("font-weight")).toBeNull();
  });

  it("spaces the lines by the size of the line above", () => {
    const small = renderUnit({ fontSize: 10, personnelFontSize: 10 });
    const large = renderUnit({ fontSize: 10, personnelFontSize: 20 });
    const gap = (r: ReturnType<typeof renderUnit>) =>
      Number(r.equipment.getAttribute("y")) - Number(r.personnel.getAttribute("y"));

    expect(gap(large)).toBeCloseTo(gap(small) * 2);
  });
});

describe("resolveToeFonts", () => {
  it("falls back from equipment to personnel to the unit label font", () => {
    const fonts = resolveToeFonts({
      fontSize: 10,
      fontWeight: "bold",
      fontColor: "#111111",
      personnelFontColor: "#ff0000",
      equipmentFontStyle: "italic",
    });

    expect(fonts.personnel).toEqual({
      fontSize: 10,
      fontWeight: "bold",
      fontStyle: "normal",
      fontColor: "#ff0000",
    });
    expect(fonts.equipment).toEqual({
      fontSize: 9,
      fontWeight: "bold",
      fontStyle: "italic",
      fontColor: "#ff0000",
    });
  });
});
