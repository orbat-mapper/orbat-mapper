import { describe, expect, it } from "vitest";
import { maskToRgba, Visibility } from ".";

describe("maskToRgba", () => {
  it("colours visible and hidden cells, and leaves cells without data clear", () => {
    const pixels = maskToRgba(
      Uint8Array.of(Visibility.Visible, Visibility.Hidden, Visibility.NoData),
      {
        visible: [1, 2, 3, 4],
        hidden: [5, 6, 7, 8],
      },
    );
    expect([...pixels]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0, 0, 0, 0]);
  });
});
