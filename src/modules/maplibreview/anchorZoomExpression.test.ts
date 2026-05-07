import { describe, expect, it } from "vitest";
import { buildAnchorZoomScaleExpression } from "@/modules/maplibreview/anchorZoomExpression";

describe("buildAnchorZoomScaleExpression", () => {
  it("builds a zoom-relative scale expression from a numeric base scale", () => {
    expect(buildAnchorZoomScaleExpression(3, "anchorZoom")).toEqual([
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      0,
      [
        "case",
        ["has", "anchorZoom"],
        ["*", 3, ["^", 2, ["-", 0, ["get", "anchorZoom"]]]],
        3,
      ],
      24,
      [
        "case",
        ["has", "anchorZoom"],
        ["*", 3, ["^", 2, ["-", 24, ["get", "anchorZoom"]]]],
        3,
      ],
    ]);
  });

  it("accepts a feature-property expression as the base scale", () => {
    expect(buildAnchorZoomScaleExpression(["get", "strokeWidth"], "anchorZoom")).toEqual([
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      0,
      [
        "case",
        ["has", "anchorZoom"],
        ["*", ["get", "strokeWidth"], ["^", 2, ["-", 0, ["get", "anchorZoom"]]]],
        ["get", "strokeWidth"],
      ],
      24,
      [
        "case",
        ["has", "anchorZoom"],
        ["*", ["get", "strokeWidth"], ["^", 2, ["-", 24, ["get", "anchorZoom"]]]],
        ["get", "strokeWidth"],
      ],
    ]);
  });
});
