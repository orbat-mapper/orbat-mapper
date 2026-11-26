import { afterEach, describe, expect, it } from "vitest";
import { effectScope, nextTick } from "vue";
import { settingsFromLegacy, useExporterSettings } from "./settings";
import { spatialIllusionsExporter } from "./spatialIllusions";

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

describe("useExporterSettings", () => {
  afterEach(() => localStorage.clear());

  it("starts a format from the old shared settings and saves it under its own key", async () => {
    localStorage.setItem(
      "exportSettings",
      JSON.stringify({ format: "csv", maxLevels: 5 }),
    );
    const scope = effectScope();
    const settings = scope.run(() =>
      useExporterSettings([spatialIllusionsExporter])(spatialIllusionsExporter),
    )!;

    expect(settings.value).toEqual({ rootUnit: "", maxLevels: 5 });
    settings.value.rootUnit = "unit-1";
    await nextTick();
    expect(JSON.parse(localStorage.getItem("exportSettings.unitgenerator")!)).toEqual({
      rootUnit: "unit-1",
      maxLevels: 5,
    });
    scope.stop();
  });

  it("stops saving a format's settings once its component is gone", async () => {
    const scope = effectScope();
    const settings = scope.run(() =>
      useExporterSettings([spatialIllusionsExporter])(spatialIllusionsExporter),
    )!;
    await nextTick();
    scope.stop();

    settings.value.maxLevels = 9;
    await nextTick();
    expect(
      JSON.parse(localStorage.getItem("exportSettings.unitgenerator")!).maxLevels,
    ).toBe(3);
  });
});
