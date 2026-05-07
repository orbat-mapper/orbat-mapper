import { describe, expect, it } from "vitest";
import { buildAnchorZoomScaleExpression } from "@/modules/maplibreview/anchorZoomExpression";

describe("buildAnchorZoomScaleExpression", () => {
  it("builds a zoom-relative scale expression from a numeric base scale", () => {
    expect(buildAnchorZoomScaleExpression(3, "anchorZoom")).toEqual([
      "*",
      3,
      ["^", 2, ["-", ["zoom"], ["get", "anchorZoom"]]],
    ]);
  });

  it("accepts a feature-property expression as the base scale", () => {
    expect(buildAnchorZoomScaleExpression(["get", "strokeWidth"], "anchorZoom")).toEqual(
      ["*", ["get", "strokeWidth"], ["^", 2, ["-", ["zoom"], ["get", "anchorZoom"]]]],
    );
  });
});
