import { describe, expect, it, vi } from "vitest";
import { layerItemsToGeoJsonString } from "@/modules/scenarioeditor/featureLayerUtils";
import { createScenarioLayerItemFeatures } from "@/modules/scenarioeditor/featureLayerUtilsOl";
import type {
  AnnotationLayerItem,
  GeometryLayerItem,
  TacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";

const geometryItem: GeometryLayerItem = {
  kind: "geometry",
  id: "feature-1",
  geometry: { type: "Point", coordinates: [10, 60] },
  geometryMeta: { geometryKind: "Point" },
  name: "HQ",
  description: "Headquarters",
  userData: { status: "active" },
  style: { showLabel: true },
};

const annotationItem: AnnotationLayerItem = {
  id: "annotation-1",
  kind: "annotation",
  annotationType: "label",
  anchor: { type: "point", position: [10, 60] },
  content: { text: "Note" },
};

describe("feature layer item adapters", () => {
  it("creates OpenLayers features for geometry items only", () => {
    const olFeatures = createScenarioLayerItemFeatures(
      [geometryItem, annotationItem],
      "EPSG:3857",
    );

    expect(olFeatures).toHaveLength(1);
    expect(olFeatures[0].getId()).toBe("feature-1");
  });

  it("exports GeoJSON for geometry items only", () => {
    const parsed = JSON.parse(
      layerItemsToGeoJsonString([geometryItem, annotationItem]),
    ) as {
      features: Array<{
        id: string;
        geometry: { type: string };
        properties: Record<string, unknown>;
      }>;
    };

    expect(parsed.features).toHaveLength(1);
    expect(parsed.features[0].id).toBe("feature-1");
    expect(parsed.features[0].geometry.type).toBe("Point");
    expect(parsed.features[0].properties.name).toBe("HQ");
  });

  it("exports every rendered part of a control measure", () => {
    const controlMeasure: TacticalGraphicLayerItem = {
      id: "cm-1",
      kind: "tacticalGraphic",
      graphicKind: "boundary",
      controlPoints: [
        [10, 60],
        [11, 61],
      ],
      textAmplifiers: { T: "BLUE" },
    };

    const parsed = JSON.parse(layerItemsToGeoJsonString([controlMeasure])) as {
      features: Array<{ properties: Record<string, unknown> }>;
    };

    expect(parsed.features.length).toBeGreaterThan(1);
    expect(parsed.features.every((feature) => feature.properties.cmId === "cm-1")).toBe(
      true,
    );
    expect(parsed.features[0]!.properties.graphicKind).toBe("boundary");
  });

  it("omits unsupported control measures and reports them", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unsupported = {
      id: "future-cm",
      kind: "tacticalGraphic",
      graphicKind: "future-kind",
      controlPoints: [[10, 60]],
    } as unknown as TacticalGraphicLayerItem;

    const parsed = JSON.parse(layerItemsToGeoJsonString([unsupported])) as {
      features: unknown[];
    };

    expect(parsed.features).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("future-kind"));
    warn.mockRestore();
  });
});
