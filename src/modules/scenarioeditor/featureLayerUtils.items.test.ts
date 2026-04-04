import { describe, expect, it } from "vitest";
import {
  createScenarioLayerItemFeatures,
  layerItemsToGeoJsonString,
} from "@/modules/scenarioeditor/featureLayerUtils";
import type { AnnotationLayerItem, GeometryLayerItem } from "@/types/scenarioLayerItems";

const geometryItem: GeometryLayerItem = {
  kind: "geometry",
  type: "Feature",
  id: "feature-1",
  geometry: { type: "Point", coordinates: [10, 60] },
  properties: { status: "active" },
  meta: { type: "Point", name: "HQ", description: "Headquarters" },
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
});
