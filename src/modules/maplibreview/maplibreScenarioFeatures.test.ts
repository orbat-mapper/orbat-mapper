// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { buildScenarioFeatureRenderPlan } from "@/modules/maplibreview/maplibreScenarioFeatures";

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

    const arrowLayer = plan.layerDefinitions.find((layer) => layer.id.includes("arrows"));
    // `arrow` has its attach point (tip) at [20, 12] in a 24-wide viewBox —
    // several units behind the visual tip so the arrow body overshoots the
    // line endpoint and covers the line's round-cap. At spriteScale 1 (28px
    // native canvas) MapLibre places the `right` anchor at the feature and
    // displaces the icon forward by (24-20)/24*28 ≈ 4.667 so the tip lands
    // on the endpoint.
    expect(arrowLayer?.spec.layout).toMatchObject({
      "icon-anchor": "right",
      "icon-offset": ["literal", [((24 - 20) / 24) * 28, 0]],
      "icon-size": ["get", "iconScale"],
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
    });
    expect(arrowLayer?.spec.paint).toMatchObject({
      "icon-opacity": ["get", "sourceOpacity"],
    });
  });

  it("uses local segment bearings for arrowheads and reverses start arrows", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-3",
        kind: "overlay",
        name: "Layer 3",
        items: [
          {
            id: "line-2",
            kind: "geometry",
            _pid: "layer-3",
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 0],
                [1, 1],
              ],
            },
            properties: {},
            meta: {
              type: "LineString",
            },
            style: {
              "arrow-start": "arrow",
              "arrow-end": "arrow",
            },
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(),
      },
    );

    const startArrow = plan.arrowData.features.find(
      (feature) => feature.id === "line-2-arrow-start",
    );
    const endArrow = plan.arrowData.features.find(
      (feature) => feature.id === "line-2-arrow-end",
    );

    expect(startArrow?.properties?.rotation).toBeCloseTo(-180, 5);
    expect(endArrow?.properties?.rotation).toBeCloseTo(-90, 5);
    expect(startArrow?.properties?.iconAnchor).toBe("right");
    expect(endArrow?.properties?.iconAnchor).toBe("right");
    expect(startArrow?.properties?.iconScale).toBeCloseTo(0.8, 5);
    expect(endArrow?.properties?.iconScale).toBeCloseTo(0.8, 5);
  });

  it("scales maplibre arrowheads with stroke width", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-4",
        kind: "overlay",
        name: "Layer 4",
        items: [
          {
            id: "line-3",
            kind: "geometry",
            _pid: "layer-4",
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [0, 1],
              ],
            },
            properties: {},
            meta: {
              type: "LineString",
            },
            style: {
              "arrow-end": "bar",
              "stroke-width": 10,
            },
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(),
      },
    );

    const arrow = plan.arrowData.features.find(
      (feature) => feature.id === "line-3-arrow-end",
    );
    const imageDefinition = Array.from(plan.imageDefinitions.values()).find(
      (definition) => definition.kind === "arrow",
    );

    expect(arrow?.properties?.iconScale).toBeCloseTo(1, 5);
    expect(arrow?.properties?.iconAnchor).toBe("center");
    expect(imageDefinition).toMatchObject({
      kind: "arrow",
      spriteScale: 4,
    });
  });

  it("buckets maplibre arrow sprites upward to avoid bitmap upscaling", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-5",
        kind: "overlay",
        name: "Layer 5",
        items: [
          {
            id: "line-4",
            kind: "geometry",
            _pid: "layer-5",
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 0],
              ],
            },
            properties: {},
            meta: {
              type: "LineString",
            },
            style: {
              "arrow-end": "arrow",
              "stroke-width": 4,
            },
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(),
      },
    );

    const arrow = plan.arrowData.features.find(
      (feature) => feature.id === "line-4-arrow-end",
    );
    const imageDefinition = Array.from(plan.imageDefinitions.values()).find(
      (definition) => definition.kind === "arrow",
    );

    expect(arrow?.properties?.iconScale).toBeCloseTo(0.8, 5);
    expect(imageDefinition).toMatchObject({
      kind: "arrow",
      spriteScale: 2,
    });
  });

  it("uses per-arrow maplibre placement metadata for open hand-drawn heads", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-6",
        kind: "overlay",
        name: "Layer 6",
        items: [
          {
            id: "line-5",
            kind: "geometry",
            _pid: "layer-6",
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
            properties: {},
            meta: {
              type: "LineString",
            },
            style: {
              "arrow-end": "arrow-hand-drawn",
            },
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(),
      },
    );

    const arrowLayer = plan.layerDefinitions.find((layer) => layer.id.includes("arrows"));
    // `arrow-hand-drawn` has its attach point at [42, 24] in a 48-wide
    // viewBox; at 28px sprite canvas (spriteScale 1) the icon-offset
    // (48-42)/48*28 = 3.5 pushes the icon forward so the tip lands on the
    // endpoint.
    expect(arrowLayer?.spec.layout).toMatchObject({
      "icon-anchor": "right",
      "icon-offset": ["literal", [((48 - 42) / 48) * 28, 0]],
    });
  });
});
