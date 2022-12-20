import { describe, expect, it } from "vitest";

import { getNextEchelonBelow } from "@/symbology/helpers";

describe("getNextEchelonBelow", function () {
  it("skips regiment", () => {
    expect(getNextEchelonBelow("18")).toBe("16");
  });

  it("does not go below zero", () => {
    expect(getNextEchelonBelow("00")).toBe("00");
  });

  it("returns input value if not found", () => {
    expect(getNextEchelonBelow("40")).toBe("40");
  });

  it("return lower echelon", () => {
    expect(getNextEchelonBelow("16")).toBe("15");
    expect(getNextEchelonBelow("15")).toBe("14");
    expect(getNextEchelonBelow("11")).toBe("00");
  });
});
