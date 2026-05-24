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
            geometry: {
              type: "Point",
              coordinates: [10, 20],
            },
            geometryMeta: {
              geometryKind: "Circle",
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

  it("treats null fill as no polygon fill", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-fill-null",
        kind: "overlay",
        name: "Layer Fill Null",
        items: [
          {
            id: "polygon-1",
            kind: "geometry",
            _pid: "layer-fill-null",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1],
                  [0, 0],
                ],
              ],
            },
            geometryMeta: { geometryKind: "Polygon" },
            style: {
              fill: null,
              "fill-opacity": 0.5,
            },
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(),
      },
    );

    expect(plan.featureData.features[0].properties?.fillOpacity).toBe(0);
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
            geometry: {
              type: "Point",
              coordinates: [10, 20],
            },
            userData: { name: "Alpha" },
            geometryMeta: { geometryKind: "Point" },
            name: "Alpha",
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
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [15, 25],
              ],
            },
            geometryMeta: { geometryKind: "LineString" },
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
            geometry: {
              type: "Point",
              coordinates: [0, 0],
            },
            geometryMeta: { geometryKind: "Point" },
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
      "icon-size": [
        "interpolate",
        ["exponential", 2],
        ["zoom"],
        0,
        [
          "case",
          ["has", "anchorZoom"],
          ["*", ["get", "iconScale"], ["^", 2, ["-", 0, ["get", "anchorZoom"]]]],
          ["get", "iconScale"],
        ],
        24,
        [
          "case",
          ["has", "anchorZoom"],
          ["*", ["get", "iconScale"], ["^", 2, ["-", 24, ["get", "anchorZoom"]]]],
          ["get", "iconScale"],
        ],
      ],
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
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 0],
                [1, 1],
              ],
            },
            geometryMeta: { geometryKind: "LineString" },
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
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [0, 1],
              ],
            },
            geometryMeta: { geometryKind: "LineString" },
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
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 0],
              ],
            },
            geometryMeta: { geometryKind: "LineString" },
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

  it("renders line-placement labels along the line geometry", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-line-label",
        kind: "overlay",
        name: "Layer line label",
        items: [
          {
            id: "line-label-1",
            kind: "geometry",
            _pid: "layer-line-label",
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 0],
                [2, 0],
              ],
            },
            geometryMeta: { geometryKind: "LineString" },
            name: "Phase Line Alpha",
            style: {
              showLabel: true,
              "text-placement": "line",
            },
          },
          {
            id: "point-label-1",
            kind: "geometry",
            _pid: "layer-line-label",
            geometry: {
              type: "Point",
              coordinates: [10, 10],
            },
            geometryMeta: { geometryKind: "Point" },
            name: "Bravo",
            style: {
              showLabel: true,
              "text-placement": "line",
            },
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(),
      },
    );

    const lineLabel = plan.labelData.features.find(
      (feature) => feature.properties?.featureId === "line-label-1",
    );
    expect(lineLabel?.geometry.type).toBe("LineString");

    const pointLabel = plan.labelData.features.find(
      (feature) => feature.properties?.featureId === "point-label-1",
    );
    expect(pointLabel?.geometry.type).toBe("Point");

    const labelLayers = plan.layerDefinitions.filter((layer) =>
      layer.id.includes("labels"),
    );
    const linePlacementLayer = labelLayers.find(
      (layer) => (layer.spec.layout as any)?.["symbol-placement"] === "line",
    );
    const pointPlacementLayer = labelLayers.find(
      (layer) => (layer.spec.layout as any)?.["symbol-placement"] === "point",
    );
    expect(linePlacementLayer).toBeDefined();
    expect(pointPlacementLayer).toBeDefined();
    expect((linePlacementLayer?.spec.layout as any)["text-rotation-alignment"]).toBe(
      "map",
    );
    expect((pointPlacementLayer?.spec.layout as any)["text-anchor"]).toEqual([
      "get",
      "textAnchor",
    ]);
  });

  it("renders annotation arrows and text with anchor-zoom scaling metadata", () => {
    const plan = buildScenarioFeatureRenderPlan(
      {
        id: "layer-annotation",
        kind: "overlay",
        name: "Layer annotation",
        items: [
          {
            id: "annotation-arrow-1",
            kind: "annotation",
            annotationKind: "arrow",
            _pid: "layer-annotation",
            anchorZoom: 6,
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
            style: {
              "stroke-width": 4,
              "arrow-end": "arrow",
            },
          },
          {
            id: "annotation-text-1",
            kind: "annotation",
            annotationKind: "text",
            textType: "label",
            _pid: "layer-annotation",
            anchorZoom: 5,
            anchor: { type: "point", position: [10, 10] },
            content: { text: "Note" },
            style: {
              textSize: 18,
              textMinZoom: 4,
              textMaxZoom: 10,
            },
          },
        ],
      } as any,
      {
        filterVisible: true,
        selectedFeatureIds: new Set(),
      },
    );

    expect(
      plan.featureData.features.find(
        (feature) => feature.properties?.featureId === "annotation-arrow-1",
      )?.properties,
    ).toMatchObject({
      anchorZoom: 6,
      strokeWidth: 4,
    });
    expect(
      plan.labelData.features.find(
        (feature) => feature.properties?.featureId === "annotation-text-1",
      )?.properties,
    ).toMatchObject({
      anchorZoom: 5,
      textField: "Note",
      textSize: 18,
    });

    const arrowLayer = plan.layerDefinitions.find((layer) => layer.id.includes("arrows"));
    expect((arrowLayer?.spec.layout as any)["icon-size"]).toEqual([
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      0,
      [
        "case",
        ["has", "anchorZoom"],
        ["*", ["get", "iconScale"], ["^", 2, ["-", 0, ["get", "anchorZoom"]]]],
        ["get", "iconScale"],
      ],
      24,
      [
        "case",
        ["has", "anchorZoom"],
        ["*", ["get", "iconScale"], ["^", 2, ["-", 24, ["get", "anchorZoom"]]]],
        ["get", "iconScale"],
      ],
    ]);

    const textLayer = plan.layerDefinitions.find((layer) => layer.id.includes("labels"));
    expect((textLayer?.spec.layout as any)["text-size"]).toEqual([
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      0,
      [
        "case",
        ["has", "anchorZoom"],
        [
          "*",
          ["coalesce", ["get", "textSize"], 13],
          ["^", 2, ["-", 0, ["get", "anchorZoom"]]],
        ],
        ["coalesce", ["get", "textSize"], 13],
      ],
      24,
      [
        "case",
        ["has", "anchorZoom"],
        [
          "*",
          ["coalesce", ["get", "textSize"], 13],
          ["^", 2, ["-", 24, ["get", "anchorZoom"]]],
        ],
        ["coalesce", ["get", "textSize"], 13],
      ],
    ]);
    expect(textLayer?.spec.minzoom).toBe(4);
    expect(textLayer?.spec.maxzoom).toBe(10);
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
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
            geometryMeta: { geometryKind: "LineString" },
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
