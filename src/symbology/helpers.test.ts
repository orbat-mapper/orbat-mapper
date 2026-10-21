import { describe, expect, it } from "vitest";

import {
  getCustomSymbolId,
  getFullUnitSidc,
  getNextEchelonBelow,
  setSid,
  setStatus,
  updateSidc,
} from "@/symbology/helpers";

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

  it("sets the status digit of a custom symbol code with a 30-character SIDC", () => {
    expect(setStatus("custom1:150310000011000000000000000000:abc", "4")).toBe(
      "custom1:150310400011000000000000000000:abc",
    );
  });

  it("returns the same code when the status already matches", () => {
    const sidc = "10031040001211000000";
    expect(setStatus(sidc, "4")).toBe(sidc);
  });
});

describe("getCustomSymbolId", () => {
  it("returns the symbol ID of a custom code with a 20-character SIDC", () => {
    expect(getCustomSymbolId("custom1:10031000001211000000:abc-123_X")).toBe("abc-123_X");
  });

  it("returns the symbol ID of a custom code with a 30-character SIDC", () => {
    expect(getCustomSymbolId("custom1:150310000011000000000000000000:abc-123_X")).toBe(
      "abc-123_X",
    );
  });

  it("returns undefined for a custom code without a symbol ID separator", () => {
    expect(getCustomSymbolId("custom1:xxxxxx")).toBeUndefined();
  });

  it("returns undefined for a missing code", () => {
    expect(getCustomSymbolId(undefined)).toBeUndefined();
  });
});

describe("getFullUnitSidc", () => {
  it("returns a plain SIDC unchanged", () => {
    expect(getFullUnitSidc("10031000001211000000")).toBe("10031000001211000000");
  });

  it("returns the 20-character SIDC of a custom code", () => {
    expect(getFullUnitSidc("custom1:10031000001211000000:abc-123_X")).toBe(
      "10031000001211000000",
    );
  });

  it("returns the 30-character SIDC of a custom code", () => {
    expect(getFullUnitSidc("custom1:150310000011000000000000000000:abc-123_X")).toBe(
      "150310000011000000000000000000",
    );
  });
});

describe("setSid", () => {
  it("sets the standard identity of a custom symbol code with a 30-character SIDC", () => {
    expect(setSid("custom1:150310000011000000000000000000:abc", "6")).toBe(
      "custom1:150610000011000000000000000000:abc",
    );
  });
});

describe("updateSidc", () => {
  it("updates a plain SIDC", () => {
    expect(
      updateSidc("10031000141211000000", (sidc) => {
        sidc.standardIdentity = "6";
        sidc.emt = "16";
      }),
    ).toBe("10061000161211000000");
  });

  it("updates the embedded SIDC of a custom symbol code and keeps the symbol ID", () => {
    expect(
      updateSidc("custom1:10031000141211000000:abc123", (sidc) => {
        sidc.standardIdentity = "6";
        sidc.emt = "16";
      }),
    ).toBe("custom1:10061000161211000000:abc123");
  });
});
