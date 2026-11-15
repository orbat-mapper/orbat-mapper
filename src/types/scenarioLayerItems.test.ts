import { describe, expect, it } from "vitest";
import { getGeometryLayerItemTooltipName } from "@/types/scenarioLayerItems";

describe("getGeometryLayerItemTooltipName", () => {
  const item = { name: " Oslo ", userData: { "name:en": "Oslo EN", "name:de": "  " } };

  it("uses the feature name when no language is set", () => {
    expect(getGeometryLayerItemTooltipName(item)).toBe("Oslo");
    expect(getGeometryLayerItemTooltipName(item, "")).toBe("Oslo");
    expect(getGeometryLayerItemTooltipName(item, "  ")).toBe("Oslo");
  });

  it("prefers the name tag for the language", () => {
    expect(getGeometryLayerItemTooltipName(item, "en")).toBe("Oslo EN");
    expect(getGeometryLayerItemTooltipName(item, " EN ")).toBe("Oslo EN");
  });

  it("falls back to the feature name when the tag is missing, blank or not a string", () => {
    expect(getGeometryLayerItemTooltipName(item, "fr")).toBe("Oslo");
    expect(getGeometryLayerItemTooltipName(item, "de")).toBe("Oslo");
    expect(
      getGeometryLayerItemTooltipName(
        { name: "Oslo", userData: { "name:en": 42 } },
        "en",
      ),
    ).toBe("Oslo");
  });

  it("returns an empty string when there is no name at all", () => {
    expect(getGeometryLayerItemTooltipName({ name: "" }, "en")).toBe("");
  });
});
