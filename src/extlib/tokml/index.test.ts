import { describe, it, expect } from "vitest";
import { foldersToKML } from "./index";
import type { Root } from "@tmcw/togeojson";

describe("foldersToKML", () => {
  it("should generate basic KML structure", () => {
    const root: Root = { type: "root", children: [] };
    const kml = foldersToKML(root);
    expect(kml).toContain('<kml xmlns="http://www.opengis.net/kml/2.2">');
    expect(kml).toContain("<Document");
  });

  it("should include radioFolder style when requested", () => {
    const root: Root = { type: "root", children: [] };
    const kml = foldersToKML(root, [], { listStyle: "radioFolder" });

    expect(kml).toContain('<Style id="radioFolder">');
    expect(kml).toContain("<ListStyle>");
    expect(kml).toContain("<listItemType>radioFolder</listItemType>");
    expect(kml).toContain("</ListStyle>");
    expect(kml).toContain("</Style>");
    expect(kml).toContain("<styleUrl>#radioFolder</styleUrl>");
  });

  it("should not include radioFolder style when not requested", () => {
    const root: Root = { type: "root", children: [] };
    const kml = foldersToKML(root);
    expect(kml).not.toContain("radioFolder");
  });

  it("should include hotspot with fraction units when provided", () => {
    const root: Root = { type: "root", children: [] };
    const kml = foldersToKML(root, [
      {
        sidc: "test-style",
        xOffset: 0.5,
        yOffset: 0.75,
        xUnits: "fraction",
        yUnits: "fraction",
      },
    ]);

    expect(kml).toContain(
      '<hotSpot x="0.5" y="0.75" xunits="fraction" yunits="fraction">',
    );
  });

  it("serializes line, polygon, and label styles for rendered graphics", () => {
    const root: Root = { type: "root", children: [] };
    const kml = foldersToKML(root, [
      {
        id: "control-measure",
        lineColor: "ff332211",
        lineWidth: 4,
        polyColor: "80332211",
        polyFill: true,
        polyOutline: true,
      },
      {
        id: "control-measure-label",
        labelColor: "ff332211",
        labelScale: 1.5,
        hideIcon: true,
      },
    ]);

    expect(kml).toContain('<Style id="control-measure">');
    expect(kml).toContain("<LineStyle><color>ff332211</color><width>4</width>");
    expect(kml).toContain(
      "<PolyStyle><color>80332211</color><fill>1</fill><outline>1</outline>",
    );
    expect(kml).toContain('<Style id="control-measure-label">');
    expect(kml).toContain("<IconStyle><scale>0</scale>");
    expect(kml).toContain("<LabelStyle><color>ff332211</color><scale>1.5</scale>");
  });
});
