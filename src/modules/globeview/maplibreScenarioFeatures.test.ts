// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { buildScenarioFeatureRenderPlan } from "@/modules/globeview/maplibreScenarioFeatures";

describe("buildScenarioFeatureRenderPlan", () => {
  it("converts circles into polygon render features", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-1",
        kind: "overlay",
        name: "Layer 1",
        items: [
          {
            id: "circle-1",
            kind: "geometry",
            _pid: "layer-1",
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [10, 20],
            },
            properties: {},
            meta: {
              type: "Circle",
              radius: 1500,
            },
            style: {},
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(),
      },
    );

    expect(plan.featureData.features).toHaveLength(1);
    expect(plan.featureData.features[0].geometry.type).toBe("Polygon");
  });

  it("filters hidden items and emits label, marker, and arrow layers from feature styles", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-2",
        kind: "overlay",
        name: "Layer 2",
        items: [
          {
            id: "point-1",
            kind: "geometry",
            _pid: "layer-2",
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [10, 20],
            },
            properties: { name: "Alpha" },
            meta: {
              type: "Point",
              name: "Alpha",
            },
            style: {
              showLabel: true,
              "marker-symbol": "square",
              "marker-size": "large",
            },
          },
          {
            id: "line-1",
            kind: "geometry",
            _pid: "layer-2",
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [15, 25],
              ],
            },
            properties: {},
            meta: {
              type: "LineString",
            },
            style: {
              "arrow-end": "arrow",
              "stroke-style": "dashed",
            },
          },
          {
            id: "hidden-1",
            kind: "geometry",
            _pid: "layer-2",
            _hidden: true,
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [0, 0],
            },
            properties: {},
            meta: {
              type: "Point",
            },
            style: {},
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(["point-1"]),
      },
    );

    expect(
      plan.featureData.features.map((feature) => feature.properties?.featureId),
    ).not.toContain("hidden-1");
    expect(
      plan.labelData.features.map((feature) => feature.properties?.featureId),
    ).toContain("point-1");
    expect(
      plan.arrowData.features.map((feature) => feature.properties?.featureId),
    ).toContain("line-1");
    expect(plan.imageDefinitions.size).toBeGreaterThan(0);
    expect(plan.layerDefinitions.some((layer) => layer.id.includes("point-icon"))).toBe(
      true,
    );
    expect(plan.layerDefinitions.some((layer) => layer.id.includes("labels"))).toBe(true);
    expect(plan.layerDefinitions.some((layer) => layer.id.includes("arrows"))).toBe(true);

    const dashedLineLayer = plan.layerDefinitions.find((layer) =>
      layer.id.includes("-line-"),
    );
    expect(dashedLineLayer?.spec.paint).toMatchObject({
      "line-dasharray": expect.any(Array),
    });
  });
});
