import { describe, expect, it } from "vitest";
import {
  extractReferenceFeatureSelection,
  formatReferenceFeatureValue,
  getReferenceFeatureDisplayValue,
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

  it("renders HTML-like values as sanitized rich text", () => {
    expect(
      getReferenceFeatureDisplayValue(
        "<p>Hello <strong>world</strong> <script>alert(1)</script></p>",
      ),
    ).toEqual({
      kind: "html",
      value: "<p>Hello <strong>world</strong> alert(1)</p>",
    });
  });

  it("drops unsafe link targets from HTML values", () => {
    expect(
      getReferenceFeatureDisplayValue(
        '<p><a href="javascript:alert(1)">Bad</a> <a href="https://example.com">Good</a></p>',
      ),
    ).toEqual({
      kind: "html",
      value:
        '<p><a>Bad</a> <a href="https://example.com" target="_blank" rel="noopener noreferrer">Good</a></p>',
    });
  });

  it("preserves common KML table layout and safe inline styles", () => {
    expect(
      getReferenceFeatureDisplayValue(
        '<table style="width:100%; border-collapse:collapse"><tr><td style="font-weight:bold; color:#333">Name</td><td>Bridge</td></tr></table>',
      ),
    ).toEqual({
      kind: "html",
      value:
        '<table style="width: 100%; border-collapse: collapse"><tbody><tr><td style="font-weight: bold; color: #333">Name</td><td>Bridge</td></tr></tbody></table>',
    });
  });
});
