import { describe, expect, it } from "vitest";
import { computeOverlayPadding } from "@/geo/mapOverlayPadding";

const container = { top: 100, right: 1100, bottom: 900, left: 100 };
const base: [number, number, number, number] = [10, 10, 10, 10];

describe("computeOverlayPadding", () => {
  it("returns the base padding when nothing overlaps the map", () => {
    expect(computeOverlayPadding(container, [], base)).toEqual(base);
    const sidebar = { top: 100, right: 100, bottom: 900, left: 0 };
    expect(computeOverlayPadding(container, [sidebar], base)).toEqual(base);
  });

  it("pads each side by the overlay hugging it", () => {
    const header = { top: 100, right: 1100, bottom: 150, left: 100 };
    const toolbar = { top: 840, right: 800, bottom: 890, left: 400 };
    const detailsPanel = { top: 110, right: 1090, bottom: 600, left: 750 };
    expect(
      computeOverlayPadding(container, [header, toolbar, detailsPanel], base),
    ).toEqual([60, 360, 70, 10]);
  });

  it("keeps the largest inset when overlays share a side", () => {
    const toolbar = { top: 840, right: 800, bottom: 890, left: 400 };
    const drawToolbar = { top: 780, right: 700, bottom: 830, left: 500 };
    expect(computeOverlayPadding(container, [toolbar, drawToolbar], base)[2]).toBe(130);
  });

  it("keeps a tall panel to its side on a short map", () => {
    const shortMap = { top: 0, right: 1100, bottom: 382, left: 0 };
    const header = { top: 0, right: 1100, bottom: 56, left: 0 };
    const detailsPanel = { top: 8, right: 1092, bottom: 296, left: 692 };
    const toolbar = { top: 304, right: 1100, bottom: 374, left: 0 };
    expect(
      computeOverlayPadding(shortMap, [header, detailsPanel, toolbar], base),
    ).toEqual([66, 418, 88, 10]);
  });

  it("falls back to the base padding when overlays cover the whole map", () => {
    const cover = { top: 0, right: 2000, bottom: 2000, left: 0 };
    expect(computeOverlayPadding(container, [cover], base)).toEqual(base);
  });

  it("scales the padding down when it would leave too little map", () => {
    const shortMap = { top: 0, right: 1100, bottom: 400, left: 0 };
    const tallHeader = { top: 0, right: 1100, bottom: 250, left: 0 };
    const toolbar = { top: 330, right: 1100, bottom: 400, left: 0 };
    const [top, , bottom] = computeOverlayPadding(shortMap, [tallHeader, toolbar], base);
    expect(top + bottom).toBeLessThanOrEqual(300);
    expect(top).toBeGreaterThan(bottom);
  });
});
