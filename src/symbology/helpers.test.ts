import { describe, expect, it } from "vitest";

import { getNextEchelonBelow, setStatus } from "@/symbology/helpers";

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

describe("setStatus", () => {
  it("sets the status digit of a symbol code", () => {
    expect(setStatus("10031000001211000000", "4")).toBe("10031040001211000000");
  });

  it("sets the status digit of a custom symbol code", () => {
    expect(setStatus("custom1:10031000001211000000-abc", "4")).toBe(
      "custom1:10031040001211000000-abc",
    );
  });

  it("returns the same code when the status already matches", () => {
    const sidc = "10031040001211000000";
    expect(setStatus(sidc, "4")).toBe(sidc);
  });
});
