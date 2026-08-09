import { describe, expect, it } from "vitest";
import { cssColorToKml, controlMeasuresToKml } from "./index";
import type { TacticalGraphicLayerItem } from "@/types/scenarioLayerItems";

function phaseLine(
  patch: Partial<TacticalGraphicLayerItem> = {},
): TacticalGraphicLayerItem {
  return {
    id: "phase-1",
    kind: "tacticalGraphic",
    graphicKind: "phase-line",
    controlPoints: [
      [10, 59],
      [11, 60],
    ],
    style: { color: "rgba(17, 34, 51, 0.5)", strokeWidth: 4 },
    textAmplifiers: { T: "PL RED" },
    ...patch,
  };
}

describe("controlMeasuresToKml", () => {
  it("converts CSS colors to KML aabbggrr colors", () => {
    expect(cssColorToKml("#123456")).toBe("ff563412");
    expect(cssColorToKml("#12345680")).toBe("80563412");
    expect(cssColorToKml("rgba(17, 34, 51, 0.5)")).toBe("80332211");
  });

  it("exports the complete rendered geometry with shared KML styles and labels", () => {
    const result = controlMeasuresToKml([phaseLine()]);

    expect(result.features.length).toBeGreaterThan(1);
    expect(
      result.features.every((feature) => feature.properties?.cmId === "phase-1"),
    ).toBe(true);
    expect(result.features.every((feature) => feature.properties?.styleUrl)).toBe(true);

    const lineStyle = result.styles.find((style) => style.lineColor);
    expect(lineStyle).toMatchObject({ lineColor: "80332211", lineWidth: 4 });

    const label = result.features.find(
      (feature) => feature.geometry.type === "Point" && feature.properties?.name,
    );
    expect(label?.properties?.name).toContain("PL RED");
    const labelStyle = result.styles.find(
      (style) => `#${style.id}` === label?.properties?.styleUrl,
    );
    expect(labelStyle).toMatchObject({ labelColor: "80332211", hideIcon: true });
  });

  it("reports KML's solid fallback for planned dash styling", () => {
    const result = controlMeasuresToKml([
      phaseLine({ status: "planned", style: { color: "#ff0000" } }),
    ]);
    expect(result.warnings).toEqual([expect.stringContaining("dash patterns")]);
  });

  it("creates image-backed styles with original rotation and anchor in rendered mode", () => {
    const result = controlMeasuresToKml(
      [
        {
          id: "text-1",
          kind: "tacticalGraphic",
          graphicKind: "text",
          controlPoints: [[10, 59]],
          style: { color: "#123456" },
          options: { text: "ALPHA", rotation: 0, sizePixels: 20, textAlign: "right" },
        },
      ],
      { labelMode: "rendered" },
    );

    expect(result.labelImages).toEqual([
      expect.objectContaining({ text: "ALPHA", fontSize: 20 }),
    ]);
    expect(result.styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          iconHref: result.labelImages[0]?.path,
          iconHeading: 0,
          labelScale: 0,
        }),
      ]),
    );
    const label = result.features.find((feature) => feature.properties?.labelText);
    expect(label?.properties?.name).toBeUndefined();
  });
});
