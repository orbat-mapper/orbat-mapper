import { describe, expect, it } from "vitest";
import {
  checkExportSize,
  MAX_EXPORT_DIMENSION,
  pixelsFromPaperPreset,
} from "./mapLibreExport";

describe("pixelsFromPaperPreset", () => {
  it("computes A4 landscape at 300 DPI", () => {
    const px = pixelsFromPaperPreset("a4", 300, "landscape");
    // 297mm × 210mm at 300 DPI
    expect(px.width).toBe(Math.round((297 / 25.4) * 300));
    expect(px.height).toBe(Math.round((210 / 25.4) * 300));
  });

  it("computes Letter portrait at 150 DPI", () => {
    const px = pixelsFromPaperPreset("letter", 150, "portrait");
    expect(px.width).toBe(Math.round((215.9 / 25.4) * 150));
    expect(px.height).toBe(Math.round((279.4 / 25.4) * 150));
  });

  it("returns fixed dimensions for screen presets regardless of DPI", () => {
    expect(pixelsFromPaperPreset("uhd-4k", 72)).toEqual({ width: 3840, height: 2160 });
    expect(pixelsFromPaperPreset("slide-16-9", 600)).toEqual({
      width: 1920,
      height: 1080,
    });
  });
});

describe("checkExportSize", () => {
  it("accepts reasonable dimensions", () => {
    expect(checkExportSize(1920, 1080)).toBeNull();
  });

  it("rejects non-positive dimensions", () => {
    expect(checkExportSize(0, 100)).toMatch(/positive/);
    expect(checkExportSize(100, -1)).toMatch(/positive/);
  });

  it("rejects dimensions exceeding the per-side limit", () => {
    expect(checkExportSize(MAX_EXPORT_DIMENSION + 1, 100)).toMatch(/Maximum dimension/);
  });

  it("rejects total pixel counts above the cap", () => {
    expect(checkExportSize(10000, 10000)).toMatch(/too large/);
  });
});
