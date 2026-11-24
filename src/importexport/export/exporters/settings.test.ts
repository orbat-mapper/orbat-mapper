import { describe, expect, it } from "vitest";
import { settingsFromLegacy } from "./settings";

describe("settingsFromLegacy", () => {
  const defaults = { rootUnit: "", maxLevels: 3 };

  it("keeps a format's own values from the old shared export settings", () => {
    const legacy = { format: "kml", rootUnit: "unit-7", maxLevels: 5, separator: ";" };
    expect(settingsFromLegacy(defaults, legacy)).toEqual({
      rootUnit: "unit-7",
      maxLevels: 5,
    });
  });

  it("uses the defaults for values the old settings do not have", () => {
    expect(settingsFromLegacy(defaults, { maxLevels: 2 })).toEqual({
      rootUnit: "",
      maxLevels: 2,
    });
  });

  it("uses the defaults when there are no old settings", () => {
    expect(settingsFromLegacy(defaults, null)).toEqual(defaults);
    expect(settingsFromLegacy(defaults, "not an object")).toEqual(defaults);
  });

  it("does not share the defaults' arrays with the result", () => {
    const withArray = { columns: [] as string[] };
    const result = settingsFromLegacy(withArray, null);
    result.columns.push("name");
    expect(withArray.columns).toEqual([]);
  });
});
