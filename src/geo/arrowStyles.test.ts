import { describe, it, expect } from "vitest";
import { getLineAngle, createArrowMarkerImage, createArrowStyles } from "./arrowStyles";
import { getArrowSvgDataUri } from "./arrowSymbols";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";

function decodeDataUri(uri: string) {
  const headerEnd = uri.indexOf(",");
  const encoded = headerEnd >= 0 ? uri.slice(headerEnd + 1) : "";
  return decodeURIComponent(encoded);
}

describe("getLineAngle", () => {
  it("returns 0 for a horizontal line pointing right", () => {
    const coords = [
      [0, 0],
      [10, 0],
    ];
    expect(getLineAngle(coords, "start")).toBeCloseTo(0);
    expect(getLineAngle(coords, "end")).toBeCloseTo(0);
  });

  it("returns PI/2 for a vertical line pointing up", () => {
    const coords = [
      [0, 0],
      [0, 10],
    ];
    expect(getLineAngle(coords, "start")).toBeCloseTo(Math.PI / 2);
    expect(getLineAngle(coords, "end")).toBeCloseTo(Math.PI / 2);
  });

  it("returns -PI/2 for a vertical line pointing down", () => {
    const coords = [
      [0, 0],
      [0, -10],
    ];
    expect(getLineAngle(coords, "start")).toBeCloseTo(-Math.PI / 2);
    expect(getLineAngle(coords, "end")).toBeCloseTo(-Math.PI / 2);
  });

  it("returns PI for a horizontal line pointing left", () => {
    const coords = [
      [10, 0],
      [0, 0],
    ];
    expect(getLineAngle(coords, "start")).toBeCloseTo(Math.PI);
    expect(getLineAngle(coords, "end")).toBeCloseTo(Math.PI);
  });

  it("handles multi-segment lines correctly", () => {
    // L-shaped line: right then up
    const coords = [
      [0, 0],
      [10, 0],
      [10, 10],
    ];
    expect(getLineAngle(coords, "start")).toBeCloseTo(0); // First segment goes right
    expect(getLineAngle(coords, "end")).toBeCloseTo(Math.PI / 2); // Last segment goes up
  });

  it("returns 0 for lines with fewer than 2 coordinates", () => {
    expect(getLineAngle([[0, 0]], "start")).toBe(0);
    expect(getLineAngle([], "end")).toBe(0);
  });
});

describe("createArrowMarkerImage", () => {
  it("returns null for 'none' arrow type", () => {
    expect(createArrowMarkerImage("none", "#000", 0)).toBeNull();
  });

  it.each([
    "arrow",
    "arrow-open",
    "dot",
    "square",
    "diamond",
    "bar",
    "arrow-curved",
    "arrow-stealth",
    "arrow-double",
    "arrow-hand-drawn",
    "arrow-double-hand-drawn",
  ] as const)("creates a shared Icon for '%s'", (arrowType) => {
    const image = createArrowMarkerImage(arrowType, "#ff0000", 0);
    expect(image).toBeInstanceOf(Icon);
  });

  it("respects scale parameter", () => {
    const scale1 = createArrowMarkerImage("arrow", "#000", 0, 1) as Icon;
    const scale2 = createArrowMarkerImage("arrow", "#000", 0, 2) as Icon;
    expect(scale2.getScale()).toBe((scale1.getScale() as number) * 2);
  });

  it("encodes the requested color in the shared SVG", () => {
    const image = createArrowMarkerImage("arrow", "rgba(255,0,0,0.5)", 0) as Icon;
    const src = image.getSrc();
    expect(src).toBeTruthy();
    expect(decodeDataUri(src!)).toContain("rgba(255,0,0,0.5)");
  });

  it("insets stroked arrow tips to keep round joins inside the viewBox", () => {
    const image = createArrowMarkerImage("arrow", "#000", 0) as Icon;
    expect(decodeDataUri(image.getSrc()!)).toContain("L23 12");
  });
});

describe("getArrowSvgDataUri", () => {
  it("returns a data URI for all supported arrow types", () => {
    expect(getArrowSvgDataUri("none", "#000")).toBeNull();
    expect(getArrowSvgDataUri("arrow", "#000")).toMatch(/^data:image\/svg\+xml;utf8,/);
    expect(getArrowSvgDataUri("arrow-hand-drawn", "#000")).toMatch(
      /^data:image\/svg\+xml;utf8,/,
    );
  });
});

describe("createArrowStyles", () => {
  it("returns empty array for non-LineString geometries", () => {
    const point = new Point([0, 0]);
    const polygon = new Polygon([
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 0],
      ],
    ]);

    expect(createArrowStyles(point, { "arrow-end": "arrow" })).toEqual([]);
    expect(createArrowStyles(polygon, { "arrow-end": "arrow" })).toEqual([]);
  });

  it("returns empty array when no arrows are configured", () => {
    const line = new LineString([
      [0, 0],
      [10, 10],
    ]);
    expect(createArrowStyles(line, {})).toEqual([]);
    expect(
      createArrowStyles(line, { "arrow-start": "none", "arrow-end": "none" }),
    ).toEqual([]);
  });

  it("creates a single style for end arrow only", () => {
    const line = new LineString([
      [0, 0],
      [10, 10],
    ]);
    const styles = createArrowStyles(line, { "arrow-end": "arrow" });
    expect(styles).toHaveLength(1);
    expect(styles[0]).toBeInstanceOf(Style);
  });

  it("creates a single style for start arrow only", () => {
    const line = new LineString([
      [0, 0],
      [10, 10],
    ]);
    const styles = createArrowStyles(line, { "arrow-start": "dot" });
    expect(styles).toHaveLength(1);
    expect(styles[0]).toBeInstanceOf(Style);
  });

  it("creates two styles for both start and end arrows", () => {
    const line = new LineString([
      [0, 0],
      [10, 10],
    ]);
    const styles = createArrowStyles(line, {
      "arrow-start": "dot",
      "arrow-end": "arrow",
    });
    expect(styles).toHaveLength(2);
  });

  it("uses strokeColor for arrow markers", () => {
    const line = new LineString([
      [0, 0],
      [10, 10],
    ]);
    const strokeColor = "#00ff00";
    const styles = createArrowStyles(line, { "arrow-end": "arrow", stroke: strokeColor });
    expect(styles).toHaveLength(1);
  });

  it("uses strokeOpacity for arrow markers", () => {
    const line = new LineString([
      [0, 0],
      [10, 10],
    ]);
    const strokeColor = "#ff0000";
    const strokeOpacity = 0.5;
    const styles = createArrowStyles(line, {
      "arrow-end": "arrow",
      stroke: strokeColor,
      "stroke-opacity": strokeOpacity,
    });
    expect(styles).toHaveLength(1);
    const image = styles[0].getImage() as Icon;
    expect(decodeDataUri(image.getSrc()!)).toContain("rgba(255,0,0,0.5)");
  });

  it("scales arrow markers with strokeWidth", () => {
    const line = new LineString([
      [0, 0],
      [10, 10],
    ]);
    const stylesWidth2 = createArrowStyles(line, {
      "arrow-end": "arrow",
      stroke: "#000",
      "stroke-width": 2,
    });
    const stylesWidth4 = createArrowStyles(line, {
      "arrow-end": "arrow",
      stroke: "#000",
      "stroke-width": 4,
    });

    const image2 = stylesWidth2[0].getImage() as Icon;
    const image4 = stylesWidth4[0].getImage() as Icon;

    expect(image4.getScale() as number).toBeGreaterThan(image2.getScale() as number);
  });

  it("returns empty for lines with too few coordinates", () => {
    const line = new LineString([[0, 0]]);
    const styles = createArrowStyles(line, { "arrow-end": "arrow" });
    expect(styles).toEqual([]);
  });

  it("positions start arrow at first coordinate", () => {
    const line = new LineString([
      [5, 5],
      [10, 10],
    ]);
    const styles = createArrowStyles(line, { "arrow-start": "dot" });
    const geometry = styles[0].getGeometry() as Point;
    expect(geometry.getCoordinates()).toEqual([5, 5]);
  });

  it("positions end arrow at last coordinate", () => {
    const line = new LineString([
      [5, 5],
      [10, 10],
      [15, 20],
    ]);
    const styles = createArrowStyles(line, { "arrow-end": "dot" });
    const geometry = styles[0].getGeometry() as Point;
    expect(geometry.getCoordinates()).toEqual([15, 20]);
  });
});
