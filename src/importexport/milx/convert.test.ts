import { describe, expect, it } from "vitest";
import { haversineDistance, project } from "@orbat-mapper/control-measures";
import {
  convertMilX,
  resolveSymbol,
  summaryCaveats,
  type MilXGraphicEntry,
  type MilXImportEntry,
  type MilXUnitEntry,
} from "./convert";
import { readRtf } from "./genericGraphics";
import { parseMilX } from "./model";
import gallery from "./fixtures/map-army-tactical-graphics.milxly?raw";

function milx(graphics: string, layer = "Layer"): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<MilXDocument_Layer xmlns="http://gs-soft.com/MilX/V3.1">
  <MilXLayer><Name>${layer}</Name><LayerType>Normal</LayerType>
    <GraphicList>${graphics}</GraphicList>
    <CoordSystemType>WGS84</CoordSystemType>
  </MilXLayer>
</MilXDocument_Layer>`;
}

function graphic(symbol: string, points: number[][], name = "", radius?: number) {
  const pointList = points
    .map(([x, y]) => `<Point><X>${x}</X><Y>${y}</Y></Point>`)
    .join("");
  const escaped = symbol
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const locations =
    radius === undefined
      ? ""
      : `<LocationAttributeList><LocationAttribute><AttrType>Radius</AttrType><Value>${radius}</Value></LocationAttribute></LocationAttributeList>`;
  return `<MilXGraphic><MssStringXML>${escaped}</MssStringXML><Name>${name}</Name><PointList>${pointList}</PointList>${locations}</MilXGraphic>`;
}

const entries = (source: string) => convertMilX(parseMilX(source)).entries;
const byName = (list: MilXImportEntry[], prefix: string) =>
  list.find((entry) => entry.name.startsWith(prefix));
const graphicItem = (list: MilXImportEntry[], prefix: string) =>
  (byName(list, prefix) as MilXGraphicEntry).item;

describe("map.army tactical graphics gallery", () => {
  const document = parseMilX(gallery);

  it("reads every layer and graphic in file order", () => {
    expect(document.layers).toHaveLength(12);
    expect(document.layers.flatMap((layer) => layer.graphics)).toHaveLength(121);
    expect(document.layers[0].name).toBe("01 Tasks");
    const aca = document.layers
      .flatMap((l) => l.graphics)
      .find((g) => g.name.startsWith("097"))!;
    expect(aca).toMatchObject({
      sidc: "GFFPACAC-------",
      locationAttributes: { Radius: 2520.00010013581 },
    });
  });

  it("imports every graphic with an equivalent and reports the rest", () => {
    const { entries, summary } = convertMilX(document);
    expect(entries.filter((e) => e.type === "graphic")).toHaveLength(82);
    expect(entries.filter((e) => e.type === "unit")).toHaveLength(17);
    expect(summary).toMatchObject({
      unsupported: 22,
      skipped: 0,
      omittedLayers: 0,
    });
    expect(summaryCaveats(summary)[0]).toContain(
      "22 graphics without an ORBAT Mapper equivalent skipped (077 Trip Wire",
    );
  });

  it("maps symbol codes to control measure kinds and options", () => {
    const list = convertMilX(document).entries;
    expect(graphicItem(list, "001 Block").graphicKind).toBe("block-mission-task");
    expect(graphicItem(list, "040 Boundaries")).toMatchObject({
      graphicKind: "boundary",
      options: expect.objectContaining({ echelon: "region" }),
    });
    expect(graphicItem(list, "052 Boundaries").options).toMatchObject({
      echelon: "team",
    });
    expect(graphicItem(list, "055 Forward Line").graphicKind).toBe("flot");
    expect(graphicItem(list, "112 Bridge").graphicKind).toBe("bridge-or-gap");
    expect(graphicItem(list, "079 Minefields").options).toMatchObject({
      mineType: "antitank",
    });
    expect(byName(list, "081 Minefields")).toBeUndefined();
    expect(byName(list, "120 Polysector")).toBeUndefined();
    expect(byName(list, "030 Check Point")).toMatchObject({
      type: "unit",
      sidc: "10032500001303000000",
    });
  });

  it("converts the 2525C three-point security task and seize forms to 2525E anchors", () => {
    const list = convertMilX(document).entries;
    const screen = graphicItem(list, "021 Screen");
    const vertex = [-35.0275, 34.5826];
    expect(screen.controlPoints).toHaveLength(4);
    // The arrow tips are the MSS tips; the opening sits around the vertex.
    expect(screen.controlPoints[0][0]).toBeCloseTo(-34.9725, 4);
    expect(screen.controlPoints[3][1]).toBeCloseTo(34.5374, 4);
    expect(
      Math.hypot(
        screen.controlPoints[1][0] - vertex[0],
        screen.controlPoints[1][1] - vertex[1],
      ),
    ).toBeLessThan(0.02);
    const seize = graphicItem(list, "024 Seize");
    expect(seize.controlPoints).toHaveLength(4);
    expect(seize.controlPoints[3][0]).toBeCloseTo(-34.1625, 4);
  });
});

describe("MilX units and modifiers", () => {
  it("imports a unit with its amplifiers, fill color, direction and reinforcement", () => {
    const [unit] = entries(
      milx(
        graphic(
          '<Symbol ID="SFGPUCI----D---"><Attribute ID="T">1-66</Attribute><Attribute ID="M">3 BDE</Attribute><Attribute ID="F">R</Attribute><Attribute ID="Q">370</Attribute><Attribute ID="XO">$000080FF</Attribute></Symbol>',
          [[10, 60]],
          "1st Platoon",
        ),
      ),
    ) as MilXUnitEntry[];
    expect(unit).toMatchObject({
      type: "unit",
      name: "1-66",
      location: [10, 60],
      fillColor: "#ff8000",
      reinforcedStatus: "Reinforced",
      textAmplifiers: { higherFormation: "3 BDE", direction: 10 },
    });
    expect(unit.sidc.slice(0, 10)).toBe("1003100014");
  });

  it("falls back to the graphic name for a unit without a T amplifier", () => {
    const [unit] = entries(
      milx(graphic('<Symbol ID="SFGPUCI----D---"/>', [[10, 60]], "HQ")),
    );
    expect(unit.name).toBe("HQ");
  });

  it("keeps hostile identity, planned status and text on a control measure", () => {
    const [line] = entries(
      milx(
        graphic(
          '<Symbol ID="GHGAGLP--------"><Attribute ID="T">BLUE</Attribute></Symbol>',
          [
            [10, 60],
            [11, 60],
          ],
        ),
      ),
    ) as MilXGraphicEntry[];
    expect(line.item).toMatchObject({
      kind: "tacticalGraphic",
      graphicKind: "phase-line",
      standardIdentity: "6",
      status: "planned",
      textAmplifiers: { T: "BLUE" },
    });
    expect(line.item.style).toBeUndefined();
  });

  it("sizes control measure details on the ground, capped by each graphic", () => {
    const [boundary, fortified, short] = entries(
      milx(
        graphic('<Symbol ID="GFGPGLB----J---"/>', [
          [11, 60],
          [12, 61],
        ]) +
          graphic('<Symbol ID="GFMPSL---------"/>', [
            [11.2, 60.2],
            [11.8, 60.8],
          ]) +
          graphic('<Symbol ID="GFMPSL---------"/>', [
            [11.9, 60.9],
            [11.901, 60.901],
          ]),
      ),
    ) as MilXGraphicEntry[];
    // The import spans 1° by 1°, framed in a 1024 by 768 px viewport.
    const [west, south] = project(11, 60);
    const [east, north] = project(12, 61);
    const metersPerPixel = Math.max((east - west) / 1024, (north - south) / 768);
    expect(boundary.item.options!.echelonSize).toBeCloseTo(16 * metersPerPixel, 0);
    expect(boundary.item.options).not.toHaveProperty("echelonSizePixels");
    expect(fortified.item.options!.toothSize).toBeCloseTo(10 * metersPerPixel, 0);
    expect(fortified.item.options).not.toHaveProperty("toothSizePixels");
    // A line too short for those teeth caps them at a tenth of its extent.
    const [x0, y0] = project(11.9, 60.9);
    const [x1, y1] = project(11.901, 60.901);
    expect(short.item.options!.toothSize).toBeCloseTo(
      Math.hypot(x1 - x0, y1 - y0) / 10,
      0,
    );
    // Labels stay on screen.
    expect(boundary.item.options).not.toHaveProperty("labelSize");
  });

  it("takes the engine's default meters when the import has no extent", () => {
    const [flot] = entries(
      milx(
        graphic('<Symbol ID="GFGPGLF--------"/>', [
          [11, 60],
          [11, 60],
        ]),
      ),
    ) as MilXGraphicEntry[];
    expect(flot.item.options).toMatchObject({ radius: 50 });
    expect(flot.item.options).not.toHaveProperty("radiusPixels");
  });

  it("skips graphics with unusable points and omits non-WGS84 layers", () => {
    const bad = milx(
      graphic('<Symbol ID="GFGPGLP--------"/>', [
        [10, 95],
        [11, 60],
      ]),
    );
    expect(convertMilX(parseMilX(bad))).toMatchObject({
      entries: [],
      summary: { skipped: 1 },
    });
    const utm = milx(
      graphic('<Symbol ID="GFGPGLP--------"/>', [
        [10, 60],
        [11, 60],
      ]),
    ).replace("<CoordSystemType>WGS84", "<CoordSystemType>UTM");
    expect(convertMilX(parseMilX(utm))).toMatchObject({
      entries: [],
      summary: { omittedLayers: 1 },
    });
  });

  it("rejects documents that are not MilX", () => {
    expect(() => parseMilX("<kml/>")).toThrow("not a MilX layer file");
    expect(() => parseMilX("{}")).toThrow("not a MilX layer file");
  });
});

describe("resolveSymbol", () => {
  it("routes codes to kinds, units, or unsupported", () => {
    expect(resolveSymbol("GFGPGLP--------", 2)).toMatchObject({
      type: "control-measure",
      kind: "phase-line",
    });
    expect(resolveSymbol("SFGPUCI----D---", 1)).toMatchObject({ type: "unit" });
    expect(resolveSymbol("GFGPAAR--------", 3)).toEqual({ type: "unsupported" });
    expect(resolveSymbol("not a sidc", 1)).toEqual({ type: "unsupported" });
  });
});

describe("MilX free-format graphics", () => {
  const style = (line: string, fill = "") =>
    `<Attribute ID="XM"><Line Color="${line}"/>${fill}<Text Color="clBlack"/></Attribute>`;
  const measure = (symbol: string, points: number[][], radius?: number) => {
    const [entry] = entries(milx(graphic(symbol, points, "Shape", radius)));
    expect(entry.type).toBe("graphic");
    return (entry as MilXGraphicEntry).item;
  };

  it("imports polylines and polygons with their colors and the T amplifier", () => {
    const line = measure(
      `<Symbol ID="GF9PLP---------">${style("$0000C0FF")}<Attribute ID="T">Route A</Attribute></Symbol>`,
      [
        [10, 60],
        [11, 60],
        [11, 61],
      ],
    );
    expect(line).toMatchObject({
      graphicKind: "line",
      style: { color: "#ffc000" },
      options: { smooth: false },
      textAmplifiers: { T: "Route A" },
    });
    const area = measure(
      `<Symbol ID="GF9PAP---------">${style("clRed", '<Fill Color="clRed" StyleEx="bsSolidGS" Transparency="75"/>')}</Symbol>`,
      [
        [10, 60],
        [11, 60],
        [11, 61],
        [10, 60],
      ],
    );
    // The repeated closing vertex is dropped; 25% opacity is alpha 0x40.
    expect(area.controlPoints).toHaveLength(3);
    expect(area).toMatchObject({
      graphicKind: "polygon",
      style: { color: "#ff0000", fillColor: "#ff000040" },
      options: { filled: true },
    });
    const clear = measure(
      `<Symbol ID="GF9PAP---------">${style("clBlue", '<Fill StyleEx="bsClearGS"/>')}</Symbol>`,
      [
        [10, 60],
        [11, 60],
        [11, 61],
      ],
    );
    expect(clear).toMatchObject({
      style: { color: "#0000ff" },
      options: { filled: false },
    });
  });

  it("imports Bézier lines and areas as smoothed generic graphics", () => {
    const points = [
      [10, 60],
      [10.3, 60.5],
      [10.7, 60.5],
      [11, 60],
    ];
    expect(measure(`<Symbol ID="GF9PLB---------"/>`, points)).toMatchObject({
      graphicKind: "line",
      style: { color: "#000000" },
      options: { smooth: true, smoothMode: "bezier" },
    });
    expect(measure(`<Symbol ID="GF9PAB---------"/>`, points).options).toMatchObject({
      smooth: true,
      smoothMode: "bezier",
    });
  });

  it("turns an MSS rectangle's center and half axes into three corners", () => {
    const rectangle = measure(
      `<Symbol ID="GF9PAR---------"><Attribute ID="XM"><Line Color="clRed"/><Fill Color="clRed"/></Attribute></Symbol>`,
      [
        [10, 60],
        [10.2, 60],
        [10, 59.9],
      ],
    );
    // A fill color alone fills at MSS's default 50% transparency.
    expect(rectangle).toMatchObject({
      graphicKind: "rectangle",
      style: { fillColor: "#ff000080" },
      options: { filled: true },
    });
    const [first, second, third] = rectangle.controlPoints;
    expect(first[0]).toBeCloseTo(9.8);
    expect(second[0]).toBeCloseTo(10.2);
    expect(second[1]).toBeCloseTo(first[1]);
    expect(third[0]).toBeCloseTo(10.2);
    // The second half axis points south, so the far edge runs north of center.
    expect(first[1]).toBeGreaterThan(60);
    expect(third[1]).toBeLessThan(60);
    expect(first[1] + third[1]).toBeCloseTo(120, 2);
  });

  it("places a circle's radius point the MSS radius away from its center", () => {
    const circle = measure(`<Symbol ID="GF9PAC---------"/>`, [[10, 60]], 5000);
    expect(circle.graphicKind).toBe("circle");
    expect(circle.controlPoints).toHaveLength(2);
    expect(
      haversineDistance(circle.controlPoints[0], circle.controlPoints[1]),
    ).toBeCloseTo(5000);
    expect(entries(milx(graphic(`<Symbol ID="GF9PAC---------"/>`, [[10, 60]])))).toEqual(
      [],
    );
  });

  it("imports a text label from its RTF with the text color", () => {
    const text = measure(
      `<Symbol ID="GF9PT----------"><Attribute ID="XM"><Line Color="clRed"/><Text Color="$00785800"/></Attribute><Attribute ID="XN">{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil Arial;}}\n{\\*\\generator Msftedit 5.41.21.2510;}\\viewkind4\\uc1\\pard\\qr\\f0\\fs20 Objective\\par Gr\\'fcn\\fs16\\par\n}</Attribute></Symbol>`,
      [[10, 60]],
    );
    expect(text).toMatchObject({
      graphicKind: "text",
      style: { color: "#005878" },
      options: { text: "Objective\nGrün", textAlign: "right" },
    });
    expect(text.textAmplifiers).toBeUndefined();
  });

  it("reports free-format graphics without a generic graphic counterpart", () => {
    const plan = convertMilX(
      parseMilX(
        milx(
          graphic(
            `<Symbol ID="GF9PAE---------"/>`,
            [
              [10, 60],
              [10.1, 60],
              [10, 59.9],
            ],
            "Ellipse",
          ) + graphic(`<Symbol ID="GF9PP----------"/>`, [[10, 60]], "Pin"),
        ),
      ),
    );
    expect(plan.entries).toEqual([]);
    expect(plan.summary).toMatchObject({ unsupported: 2, skipped: 0 });
  });
});

describe("readRtf", () => {
  it("reads plain text, Unicode escapes and alignment, skipping destinations", () => {
    expect(
      readRtf("{\\rtf1{\\fonttbl{\\f0 Tahoma;}}\\pard\\qc A\\u8364?B \\{x\\}\\par}"),
    ).toEqual({
      text: "A€B {x}",
      textAlign: "center",
    });
    expect(readRtf("  plain  ")).toEqual({ text: "plain" });
  });
});
