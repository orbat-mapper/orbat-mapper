import {
  getSymbologyStandardName,
  symbologyStandardOptions,
  symbologyStandards,
} from "@/symbology/standards";
import { describe, expect, it } from "vitest";

describe("symbology standards registry", () => {
  it("exposes only standards supported by the current SIDC model", () => {
    expect(Object.keys(symbologyStandards)).toEqual(["2525", "app6"]);
    expect(symbologyStandardOptions).toEqual([
      {
        value: "2525",
        name: "MIL-STD-2525D",
        description: "US version",
      },
      {
        value: "app6",
        name: "APP-6",
        description: "NATO version",
      },
    ]);
  });

  it("resolves display names from the same registry", () => {
    expect(getSymbologyStandardName("2525")).toBe("MIL-STD-2525D");
    expect(getSymbologyStandardName("app6")).toBe("APP-6");
    expect(getSymbologyStandardName()).toBe("");
  });
});
