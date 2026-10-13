import { describe, expect, it } from "vitest";
import { gridSizeFor } from ".";

describe("gridSizeFor", () => {
  it("makes cells the asked size, rounding to more cells rather than coarser ones", () => {
    expect(gridSizeFor(1000, { cellSize: 100, maxSize: 401 })).toBe(21);
    expect(gridSizeFor(1050, { cellSize: 100, maxSize: 401 })).toBe(23);
  });

  it("stops at the largest odd size allowed", () => {
    expect(gridSizeFor(50_000, { cellSize: 10, maxSize: 401 })).toBe(401);
    expect(gridSizeFor(50_000, { cellSize: 10, maxSize: 400 })).toBe(399);
  });

  it("takes the most cells allowed when any cell size will do", () => {
    expect(gridSizeFor(50_000, { maxSize: 801 })).toBe(801);
  });

  it("never makes cells finer than the elevation data", () => {
    expect(gridSizeFor(1000, { cellSize: 1, maxSize: 1601, finest: 30 })).toBe(67);
  });

  it("keeps at least the observer's cell and one around it", () => {
    expect(gridSizeFor(10, { cellSize: 100, maxSize: 401 })).toBe(3);
    expect(gridSizeFor(1000, { cellSize: 1, maxSize: 401, finest: 5000 })).toBe(3);
  });
});
