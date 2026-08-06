import { describe, expect, it } from "vitest";
import { CONTROL_MEASURE_IDS } from "@orbat-mapper/control-measures";
import {
  CONTROL_MEASURE_PREVIEW_DIMENSIONS,
  PREVIEW_FALLBACK_FONT_SIZE,
  buildControlMeasurePreview,
  previewFontSize,
} from "@/modules/scenarioeditor/controlMeasurePreview";

describe("the picker preview", () => {
  it("projects a representative sample into the preview box", () => {
    const { shapes, ok, viewBox } = buildControlMeasurePreview("phase-line");
    expect(ok).toBe(true);
    expect(shapes.length).toBeGreaterThan(0);
    expect(viewBox.split(" ")).toHaveLength(4);
    expect(viewBox.split(" ").every((n) => Number.isFinite(Number(n)))).toBe(true);
  });

  it("grows the viewBox past the plain box when a label hangs outside it", () => {
    // `projectRenderToShapes` fits geometry only; an end-anchored label like the phase
    // line's "PL ECHO" extends beyond it, which is why the viewBox comes from
    // `viewBoxString` rather than from the dimensions.
    const { viewBox } = buildControlMeasurePreview("phase-line");
    const [, , width] = viewBox.split(" ").map(Number);
    expect(width).toBeGreaterThan(CONTROL_MEASURE_PREVIEW_DIMENSIONS.width);
  });

  it("renders every registered kind without throwing", () => {
    for (const kind of CONTROL_MEASURE_IDS) {
      expect(() => buildControlMeasurePreview(kind)).not.toThrow();
    }
  });

  it("falls back to a fixed font size for a label with no ground-anchored sizing", () => {
    expect(previewFontSize({ type: "text" })).toBe(PREVIEW_FALLBACK_FONT_SIZE);
    expect(previewFontSize({ type: "text", heightPx: 9 })).toBe(9);
  });
});
