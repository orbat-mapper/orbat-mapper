import { describe, expect, it, vi } from "vitest";
import { createUnitStyle } from "./unitStyles";

const { symbolGeneratorMock } = vi.hoisted(() => ({
  symbolGeneratorMock: vi.fn(() => ({
    getAnchor: () => ({ x: 10, y: 10 }),
    asCanvas: () => document.createElement("canvas"),
  })),
}));

vi.mock("@/symbology/milsymbwrapper", () => ({
  symbolGenerator: symbolGeneratorMock,
}));

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbolOptions: {} }),
}));

vi.mock("@/stores/mapSettingsStore.ts", () => ({
  useMapSettingsStore: () => ({
    mapIconSize: 40,
    mapCustomIconScale: 1.7,
    mapUnitLabelBelow: false,
  }),
}));

function createScenarioWithCustomSymbol() {
  return {
    store: {
      state: {
        customSymbolMap: {
          "custom-1": {
            id: "custom-1",
            name: "Custom",
            src: "data:image/svg+xml;base64,PHN2Zy8+",
            sidc: "10031000000000000000",
          },
        },
      },
    },
  } as any;
}

describe("unit styles rotation", () => {
  it("converts degrees to radians for symbol icon rotation", () => {
    const unit = {
      id: "unit-1",
      name: "Unit",
      sidc: "10031000000000000000",
      _state: { sidc: "10031000000000000000", symbolRotation: 90 },
      textAmplifiers: {},
    } as any;

    const { style } = createUnitStyle(unit, {}, createScenarioWithCustomSymbol());
    expect(style.getImage()?.getRotation()).toBeCloseTo(Math.PI / 2);
  });

  it("creates different cache keys when rotation changes", () => {
    const unit = {
      id: "unit-1",
      name: "Unit",
      sidc: "10031000000000000000",
      _state: { sidc: "10031000000000000000", symbolRotation: 10 },
      textAmplifiers: {},
    } as any;

    const key1 = createUnitStyle(unit, {}, createScenarioWithCustomSymbol()).cacheKey;
    unit._state.symbolRotation = 20;
    const key2 = createUnitStyle(unit, {}, createScenarioWithCustomSymbol()).cacheKey;

    expect(key1).not.toBe(key2);
  });

  it("applies rotation to custom symbols", () => {
    const unit = {
      id: "unit-1",
      name: "Unit",
      sidc: "custom1:10031000000000000000:custom-1",
      _state: {
        sidc: "custom1:10031000000000000000:custom-1",
        symbolRotation: 180,
      },
      textAmplifiers: {},
    } as any;

    const { style } = createUnitStyle(unit, {}, createScenarioWithCustomSymbol());
    expect(style.getImage()?.getRotation()).toBeCloseTo(Math.PI);
  });
});
