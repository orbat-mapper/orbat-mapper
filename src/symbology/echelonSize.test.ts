import { describe, expect, it } from "vitest";

import {
  defaultUnitSymbolSize,
  echelonRatio,
  echelonSizeKey,
  echelonSymbolSize,
  MIN_ECHELON_SIZE_PX,
  NO_ECHELON,
  ratioForSize,
  SEED_ECHELON_RATIOS,
  unitSymbolSize,
} from "@/symbology/echelonSize";

// Friendly infantry at the given echelon.
const landUnit = (emt: string) => `10031000${emt}1211000000`;

describe("echelonSizeKey", () => {
  it("reads the echelon of a land unit", () => {
    expect(echelonSizeKey(landUnit("18"))).toBe("18");
  });

  it("reads the echelon inside a custom symbol code", () => {
    expect(echelonSizeKey(`custom1:${landUnit("21")}:abc123`)).toBe("21");
  });

  it("ignores mobility in positions 9–10 of equipment", () => {
    expect(echelonSizeKey("10031500331101000000")).toBe(NO_ECHELON);
  });
});

describe("echelonRatio", () => {
  it("falls back to the seed for a missing or invalid row", () => {
    expect(echelonRatio({}, "22")).toBe(SEED_ECHELON_RATIOS["22"]);
    expect(echelonRatio({ "22": 0 }, "22")).toBe(SEED_ECHELON_RATIOS["22"]);
  });

  it("takes a row the table has", () => {
    expect(echelonRatio({ "22": 3 }, "22")).toBe(3);
  });
});

describe("echelonSymbolSize", () => {
  it("draws a Battalion at the base", () => {
    expect(echelonSymbolSize(landUnit("16"), 25, {})).toBe(25);
  });

  it("scales other echelons by their ratio", () => {
    expect(echelonSymbolSize(landUnit("18"), 25, {})).toBe(32);
    expect(echelonSymbolSize(landUnit("26"), 25, {})).toBe(50);
    expect(echelonSymbolSize(landUnit("15"), 25, {})).toBe(22);
  });

  it("never goes below the minimum", () => {
    expect(echelonSymbolSize(landUnit("11"), 10, {})).toBe(MIN_ECHELON_SIZE_PX);
  });
});

describe("ratioForSize", () => {
  it("round-trips a typed size", () => {
    const ratio = ratioForSize(37, 25);
    expect(Math.round(25 * ratio)).toBe(37);
  });
});

describe("unitSymbolSize", () => {
  const settings = {
    mapIconSize: 25,
    mapSizeUnitsByEchelon: true,
    mapEchelonSizeRatios: {},
  };

  it("keeps a unit's own size", () => {
    expect(unitSymbolSize(30, landUnit("26"), settings)).toBe(30);
  });

  it("takes the default for a unit without one", () => {
    expect(unitSymbolSize(undefined, landUnit("26"), settings)).toBe(50);
  });
});

describe("defaultUnitSymbolSize", () => {
  const settings = { mapIconSize: 25, mapEchelonSizeRatios: SEED_ECHELON_RATIOS };

  it("is the map symbol size when echelon sizing is off", () => {
    expect(
      defaultUnitSymbolSize(landUnit("26"), {
        ...settings,
        mapSizeUnitsByEchelon: false,
      }),
    ).toBe(25);
  });

  it("is the echelon size when echelon sizing is on", () => {
    expect(
      defaultUnitSymbolSize(landUnit("26"), { ...settings, mapSizeUnitsByEchelon: true }),
    ).toBe(50);
  });
});
