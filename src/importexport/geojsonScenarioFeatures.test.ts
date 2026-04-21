import { describe, expect, it } from "vitest";
import {
  convertGeoJSONFeatureToScenarioFeature,
  convertGeoJSONToScenarioFeatures,
  findLikelyNameColumn,
  getGeoJSONFeatures,
} from "@/importexport/geojsonScenarioFeatures";

describe("geojsonScenarioFeatures", () => {
  it("prefers name then title when inferring a name column", () => {
    expect(findLikelyNameColumn(["title", "other"])).toBe("title");
    expect(findLikelyNameColumn(["display_name", "other"])).toBe("display_name");
    expect(findLikelyNameColumn([])).toBeUndefined();
  });

  it("converts a feature to a scenario feature and removes the chosen name field", () => {
    const feature = convertGeoJSONFeatureToScenarioFeature(
      {
        type: "Feature",
        properties: {
          title: "Bridge",
          category: "crossing",
        },
        geometry: {
          type: "Point",
          coordinates: [10, 20],
        },
      },
      "layer-1",
      { nameColumn: "title" },
    );

    expect(feature).toMatchObject({
      _pid: "layer-1",
      name: "Bridge",
      geometryMeta: { geometryKind: "Point" },
      userData: { category: "crossing" },
    });
  });

  it("normalizes a feature collection into scenario features using the inferred name field", () => {
    const features = convertGeoJSONToScenarioFeatures(
      {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Alpha", category: "one" },
            geometry: { type: "Point", coordinates: [1, 2] },
          },
          {
            type: "Feature",
            properties: { name: "Bravo", category: "two" },
            geometry: { type: "LineString", coordinates: [[1, 2], [3, 4]] },
          },
        ],
      },
      "layer-2",
    );

    expect(features).toHaveLength(2);
    expect(features[0]).toMatchObject({
      _pid: "layer-2",
      name: "Alpha",
      geometryMeta: { geometryKind: "Point" },
      userData: { category: "one" },
    });
    expect(features[1]).toMatchObject({
      _pid: "layer-2",
      name: "Bravo",
      geometryMeta: { geometryKind: "LineString" },
      userData: { category: "two" },
    });
  });

  it("handles both feature collections and single features when extracting geojson features", () => {
    expect(
      getGeoJSONFeatures({
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [1, 2] },
      }),
    ).toHaveLength(1);

    expect(
      getGeoJSONFeatures({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: { type: "Point", coordinates: [1, 2] },
          },
        ],
      }),
    ).toHaveLength(1);
  });
});
