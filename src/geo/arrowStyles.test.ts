import { describe, it, expect } from "vitest";
import { getLineAngle, createArrowMarkerImage, createArrowStyles } from "./arrowStyles";
import { LineString, Point, Polygon } from "ol/geom";
import Style from "ol/style/Style";
import RegularShape from "ol/style/RegularShape";
import CircleStyle from "ol/style/Circle";
import Icon from "ol/style/Icon";

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

  it("creates a RegularShape for 'arrow' type", () => {
    const image = createArrowMarkerImage("arrow", "#ff0000", 0);
    expect(image).toBeInstanceOf(RegularShape);
  });

  it("creates a RegularShape for 'arrow-open' type", () => {
    const image = createArrowMarkerImage("arrow-open", "#ff0000", 0);
    expect(image).toBeInstanceOf(RegularShape);
  });

  it("creates a CircleStyle for 'dot' type", () => {
    const image = createArrowMarkerImage("dot", "#ff0000", 0);
    expect(image).toBeInstanceOf(CircleStyle);
  });

  it("creates a RegularShape for 'square' type", () => {
    const image = createArrowMarkerImage("square", "#ff0000", 0);
    expect(image).toBeInstanceOf(RegularShape);
  });

  it("creates a RegularShape for 'diamond' type", () => {
    const image = createArrowMarkerImage("diamond", "#ff0000", 0);
    expect(image).toBeInstanceOf(RegularShape);
  });

  it("creates a RegularShape for 'bar' type", () => {
    const image = createArrowMarkerImage("bar", "#ff0000", 0);
    expect(image).toBeInstanceOf(RegularShape);
  });

  it("creates an Icon for 'arrow-curved' type", () => {
    const image = createArrowMarkerImage("arrow-curved", "#ff0000", 0);
    expect(image).toBeInstanceOf(Icon);
  });

  it("creates an Icon for 'arrow-stealth' type", () => {
    const image = createArrowMarkerImage("arrow-stealth", "#ff0000", 0);
    expect(image).toBeInstanceOf(Icon);
  });

  it("creates an Icon for 'arrow-double' type", () => {
    const image = createArrowMarkerImage("arrow-double", "#ff0000", 0);
    expect(image).toBeInstanceOf(Icon);
  });

  it("creates an Icon for 'arrow-hand-drawn' type", () => {
    const image = createArrowMarkerImage("arrow-hand-drawn", "#ff0000", 0);
    expect(image).toBeInstanceOf(Icon);
  });

  it("creates an Icon for 'arrow-double-hand-drawn' type", () => {
    const image = createArrowMarkerImage("arrow-double-hand-drawn", "#ff0000", 0);
    expect(image).toBeInstanceOf(Icon);
  });

  it("respects scale parameter", () => {
    const scale1 = createArrowMarkerImage("arrow", "#000", 0, 1) as RegularShape;
    const scale2 = createArrowMarkerImage("arrow", "#000", 0, 2) as RegularShape;
    expect(scale2.getRadius()).toBe(scale1.getRadius() * 2);
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
    const image = styles[0].getImage() as RegularShape;
    expect(image.getFill()?.getColor()).toBe("rgba(255,0,0,0.5)");
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

    const image2 = stylesWidth2[0].getImage() as RegularShape;
    const image4 = stylesWidth4[0].getImage() as RegularShape;

    // Radius should be larger for larger strokeWidth
    expect(image4.getRadius()).toBeGreaterThan(image2.getRadius());
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
