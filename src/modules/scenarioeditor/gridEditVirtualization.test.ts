import { describe, expect, it } from "vitest";
import {
  findNextFocusableRowIndex,
  getRowIndexByEntityId,
  isCellFocusable,
} from "./gridEditVirtualization";

describe("gridEditVirtualization helpers", () => {
  it("applies focusable column rules per row type", () => {
    expect(isCellFocusable("side", 0, 3)).toBe(true);
    expect(isCellFocusable("side", 1, 3)).toBe(true);
    expect(isCellFocusable("side", 2, 3)).toBe(false);

    expect(isCellFocusable("sidegroup", 1, 3)).toBe(true);
    expect(isCellFocusable("sidegroup", 3, 3)).toBe(false);

    expect(isCellFocusable("unit", 0, 3)).toBe(true);
    expect(isCellFocusable("unit", 3, 3)).toBe(true);
    expect(isCellFocusable("unit", 4, 3)).toBe(false);
  });

  it("finds next focusable rows while skipping incompatible row types", () => {
    const items = [
      { type: "side" },
      { type: "sidegroup" },
      { type: "unit" },
      { type: "unit" },
      { type: "sidegroup" },
    ] as const;

    expect(findNextFocusableRowIndex(items, 0, 1, "down", 3)).toBe(1);
    expect(findNextFocusableRowIndex(items, 0, 2, "down", 3)).toBe(2);
    expect(findNextFocusableRowIndex(items, 2, 2, "up", 3)).toBeNull();
    expect(findNextFocusableRowIndex(items, 3, 1, "up", 3)).toBe(2);
    expect(findNextFocusableRowIndex(items, 3, 0, "down", 3)).toBe(4);
  });

  it("builds an id-to-row index map", () => {
    const rowIndexById = getRowIndexByEntityId([
      { id: "side-1" },
      { id: "sg-1" },
      { id: "u-1" },
      { id: "u-2" },
    ]);

    expect(rowIndexById.get("side-1")).toBe(0);
    expect(rowIndexById.get("u-2")).toBe(3);
    expect(rowIndexById.has("missing")).toBe(false);
  });
});
