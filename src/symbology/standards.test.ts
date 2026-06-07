import {
  getSymbologyStandardName,
  symbologyStandardOptions,
  symbologyStandards,
} from "@/symbology/standards";
import { describe, expect, it } from "vitest";

describe("symbology standards registry", () => {
  it("exposes supported symbology standards", () => {
    expect(Object.keys(symbologyStandards)).toEqual(["2525d", "2525e", "app6d"]);
    expect(symbologyStandardOptions).toEqual([
      {
        value: "2525d",
        name: "MIL-STD-2525D",
        description: "US version",
      },
      {
        value: "2525e",
        name: "MIL-STD-2525E",
        description: "",
      },
      {
        value: "app6d",
        name: "APP-6D",
        description: "NATO version",
      },
    ]);
  });

  it("resolves display names from the same registry", () => {
    expect(getSymbologyStandardName("2525d")).toBe("MIL-STD-2525D");
    expect(getSymbologyStandardName("2525e")).toBe("MIL-STD-2525E");
    expect(getSymbologyStandardName("app6d")).toBe("APP-6D");
    expect(getSymbologyStandardName()).toBe("");
  });

  it("loads 2525E common modifiers onto each symbol set", async () => {
    const symbolSets = await symbologyStandards["2525e"].load();
    expect(symbolSets["10"].modifierOne).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "107", modifier: "Armored" }),
      ]),
    );
    expect(symbolSets["10"].modifierTwo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "100", modifier: "Airborne" }),
      ]),
    );
  });
});
