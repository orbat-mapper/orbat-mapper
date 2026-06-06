import {
  getSymbologyStandardName,
  symbologyStandardOptions,
  symbologyStandards,
} from "@/symbology/standards";
import { describe, expect, it } from "vitest";

describe("symbology standards registry", () => {
  it("exposes only standards supported by the current SIDC model", () => {
    expect(Object.keys(symbologyStandards)).toEqual(["2525d", "app6d"]);
    expect(symbologyStandardOptions).toEqual([
      {
        value: "2525d",
        name: "MIL-STD-2525D",
        description: "US version",
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
    expect(getSymbologyStandardName("app6d")).toBe("APP-6D");
    expect(getSymbologyStandardName()).toBe("");
  });
});
