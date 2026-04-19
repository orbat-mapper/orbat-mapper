import { describe, expect, it } from "vitest";
import {
  extractReferenceFeatureSelection,
  formatReferenceFeatureValue,
} from "@/modules/scenarioeditor/referenceFeatureUtils";

describe("referenceFeatureUtils", () => {
  it("extracts KML feature properties without geometry", () => {
    const feature = {
      getProperties: () => ({
        geometry: { type: "Point" },
        name: "Bridge",
        description: "Crossing",
        foo: 12,
      }),
      getId: () => "feature-1",
    } as any;

    const layer = {
      get: (key: string) => {
        if (key === "id") return "layer-1";
        if (key === "title") return "Imported KML";
        return undefined;
      },
    } as any;

    expect(extractReferenceFeatureSelection(feature, layer)).toEqual({
      layerId: "layer-1",
      layerName: "Imported KML",
      featureId: "feature-1",
      name: "Bridge",
      properties: {
        name: "Bridge",
        description: "Crossing",
        foo: 12,
      },
    });
  });

  it("formats complex property values for display", () => {
    expect(formatReferenceFeatureValue("abc")).toBe("abc");
    expect(formatReferenceFeatureValue(42)).toBe("42");
    expect(formatReferenceFeatureValue({ a: 1 })).toBe('{\n  "a": 1\n}');
    expect(formatReferenceFeatureValue(null)).toBe("null");
  });
});
