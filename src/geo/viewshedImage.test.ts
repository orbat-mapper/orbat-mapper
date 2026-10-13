import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gridAround, Visibility } from "@/lib/terrain";
import {
  DEAD_GROUND_COLOR,
  SEEN_BY_BANDS,
  VIEWSHED_COLORS,
  viewshedImage,
} from "./viewshedImage";

/** jsdom has no ImageData. */
class FakeImageData {
  constructor(
    readonly data: Uint8ClampedArray,
    readonly width: number,
    readonly height: number,
  ) {}
}

beforeEach(() => vi.stubGlobal("ImageData", FakeImageData));
afterEach(() => vi.unstubAllGlobals());

const pixel = (image: ImageData, i: number) =>
  Array.from(image.data.slice(i * 4, i * 4 + 4));

describe("viewshedImage", () => {
  // A 3 × 3 grid: hidden from all, seen by 1, 2, 3 and 5, and without data.
  const grid = gridAround([10, 50], 1000, 3);
  const { Hidden, Visible, NoData } = Visibility;
  const mask = Uint8Array.from([
    Hidden,
    Visible,
    Visible,
    Visible,
    Visible,
    NoData,
    NoData,
    NoData,
    NoData,
  ]);
  const masking = new Float32Array(9);

  it("shades combined ground by how many observers see it, and dead ground as hidden", () => {
    const seenBy = Uint8Array.from([0, 1, 2, 3, 5, 0, 0, 0, 0]);
    const image = viewshedImage({ grid, mask, masking, seenBy }, "visible");
    expect(pixel(image, 0)).toEqual([...VIEWSHED_COLORS.hidden]);
    expect(pixel(image, 1)).toEqual([...SEEN_BY_BANDS[0]!.color]);
    expect(pixel(image, 2)).toEqual([...SEEN_BY_BANDS[1]!.color]);
    expect(pixel(image, 3)).toEqual([...SEEN_BY_BANDS[2]!.color]);
    expect(pixel(image, 4)).toEqual([...SEEN_BY_BANDS[2]!.color]);
    expect(pixel(image, 5)).toEqual([0, 0, 0, 0]);
  });

  it("shades a single viewshed's ground as seen or hidden", () => {
    const image = viewshedImage({ grid, mask, masking }, "visible");
    expect(pixel(image, 1)).toEqual([...VIEWSHED_COLORS.visible]);
    expect(pixel(image, 0)).toEqual([...VIEWSHED_COLORS.hidden]);
  });

  it("highlights only dead ground when asked, leaving seen ground clear", () => {
    const seenBy = Uint8Array.from([0, 1, 2, 3, 5, 0, 0, 0, 0]);
    for (const coverage of [
      { grid, mask, masking },
      { grid, mask, masking, seenBy },
    ]) {
      const image = viewshedImage(coverage, "dead");
      expect(pixel(image, 0)).toEqual([...DEAD_GROUND_COLOR]);
      expect(pixel(image, 1)).toEqual([0, 0, 0, 0]);
      expect(pixel(image, 4)).toEqual([0, 0, 0, 0]);
      expect(pixel(image, 5)).toEqual([0, 0, 0, 0]);
    }
  });
});
