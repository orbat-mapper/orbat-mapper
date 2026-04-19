import { describe, expect, it } from "vitest";
import turfBbox from "@turf/bbox";
import { extractRoutingObstacles } from "@/geo/routing/obstacleExtraction";
import type { FullScenarioLayerItemsLayer } from "@/types/scenarioLayerItems";
import type { FeatureId } from "@/types/scenarioGeoModels";

function selection(
  layerIds: FeatureId[] = [],
  featureIds: FeatureId[] = [],
): { layerIds: Set<FeatureId>; featureIds: Set<FeatureId> } {
  return { layerIds: new Set(layerIds), featureIds: new Set(featureIds) };
}

describe("extractRoutingObstacles", () => {
  it("includes every geometry item from a selected layer, including hidden ones", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-obstacle",
            kind: "geometry",
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
            style: {},
          },
          {
            id: "feature-line",
            kind: "geometry",
            geometryMeta: { geometryKind: "LineString" },
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
            style: {},
          },
          {
            id: "feature-hidden",
            kind: "geometry",
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [2, 2],
                  [3, 2],
                  [3, 3],
                  [2, 2],
                ],
              ],
            },
            style: {},
            _hidden: true,
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(layers, selection(["layer-1"]));

    expect(obstacles.features).toHaveLength(3);
    expect(obstacles.features.map((f) => f.id)).toEqual([
      "feature-obstacle",
      "feature-line",
      "feature-hidden",
    ]);
  });

  it("includes only specifically-selected features", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-a",
            kind: "geometry",
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
            style: {},
          },
          {
            id: "feature-b",
            kind: "geometry",
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [5, 5],
                  [6, 5],
                  [6, 6],
                  [5, 5],
                ],
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(layers, selection([], ["feature-b"]));

    expect(obstacles.features).toHaveLength(1);
    expect(obstacles.features[0]?.id).toBe("feature-b");
  });

  it("unions layer-level and feature-level selections without duplication", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-a",
            kind: "geometry",
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
            style: {},
          },
        ],
      },
      {
        id: "layer-2",
        name: "Layer 2",
        items: [
          {
            id: "feature-b",
            kind: "geometry",
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [5, 5],
                  [6, 5],
                  [6, 6],
                  [5, 5],
                ],
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(
      layers,
      selection(["layer-1"], ["feature-a", "feature-b"]),
    );

    expect(obstacles.features.map((f) => f.id).sort()).toEqual([
      "feature-a",
      "feature-b",
    ]);
  });

  it("includes hidden layers and hidden features when selected", () => {
    const layers = [
      {
        id: "layer-hidden",
        name: "Hidden",
        _hidden: true,
        items: [
          {
            id: "feature-h",
            kind: "geometry",
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [4, 4],
                  [5, 4],
                  [5, 5],
                  [4, 4],
                ],
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(
      layers,
      selection(["layer-hidden"], ["feature-h"]),
    );

    expect(obstacles.features).toHaveLength(1);
    expect(obstacles.features[0]?.id).toBe("feature-h");
  });

  it("includes hidden features when selected individually", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-hidden",
            kind: "geometry",
            _hidden: true,
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [4, 4],
                  [5, 4],
                  [5, 5],
                  [4, 4],
                ],
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(layers, selection([], ["feature-hidden"]));

    expect(obstacles.features).toHaveLength(1);
    expect(obstacles.features[0]?.id).toBe("feature-hidden");
  });

  it("returns nothing when selection is empty", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-a",
            kind: "geometry",
            geometryMeta: { geometryKind: "Polygon" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(layers, selection());

    expect(obstacles.features).toHaveLength(0);
  });

  it("buffers line obstacles into polygon blockers", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-line-obstacle",
            kind: "geometry",
            geometryMeta: { geometryKind: "LineString" },
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [11, 21],
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(layers, selection(["layer-1"]));

    expect(obstacles.features).toHaveLength(1);
    expect(obstacles.features[0]?.geometry.type).toBe("Polygon");
    expect(obstacles.features[0]?.id).toBe("feature-line-obstacle");
  });

  it("buffers point obstacles into polygon blockers when a point buffer is provided", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-point-obstacle",
            kind: "geometry",
            geometryMeta: { geometryKind: "Point" },
            geometry: {
              type: "Point",
              coordinates: [10, 20],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(layers, selection(["layer-1"]), {
      pointBufferMeters: 50,
    });

    expect(obstacles.features).toHaveLength(1);
    expect(obstacles.features[0]?.geometry.type).toBe("Polygon");
    expect(obstacles.features[0]?.id).toBe("feature-point-obstacle");
  });

  it("flattens GeometryCollection items into routable obstacle features", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-collection",
            kind: "geometry",
            geometryMeta: { geometryKind: "GeometryCollection" },
            geometry: {
              type: "GeometryCollection",
              geometries: [
                {
                  type: "Polygon",
                  coordinates: [
                    [
                      [0, 0],
                      [1, 0],
                      [1, 1],
                      [0, 0],
                    ],
                  ],
                },
                {
                  type: "LineString",
                  coordinates: [
                    [5, 5],
                    [6, 6],
                  ],
                },
                {
                  type: "Point",
                  coordinates: [10, 10],
                },
                {
                  type: "GeometryCollection",
                  geometries: [
                    {
                      type: "Polygon",
                      coordinates: [
                        [
                          [20, 20],
                          [21, 20],
                          [21, 21],
                          [20, 20],
                        ],
                      ],
                    },
                  ],
                },
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(layers, selection(["layer-1"]));

    expect(obstacles.features).toHaveLength(3);
    expect(obstacles.features.map((feature) => feature.id)).toEqual([
      "feature-collection:0",
      "feature-collection:1",
      "feature-collection:2",
    ]);
    expect(
      obstacles.features.every((feature) => feature.geometry.type === "Polygon"),
    ).toBe(true);
    expect(
      obstacles.features.every(
        (feature) => feature.properties?.sourceFeatureId === "feature-collection",
      ),
    ).toBe(true);
  });

  it("skips GeometryCollection items without routable sub-geometries", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-only-points",
            kind: "geometry",
            geometryMeta: { geometryKind: "GeometryCollection" },
            geometry: {
              type: "GeometryCollection",
              geometries: [
                { type: "Point", coordinates: [0, 0] },
                {
                  type: "MultiPoint",
                  coordinates: [
                    [1, 1],
                    [2, 2],
                  ],
                },
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const obstacles = extractRoutingObstacles(layers, selection(["layer-1"]));

    expect(obstacles.features).toHaveLength(0);
  });

  it("scales line obstacle buffering with the provided extraction options", () => {
    const layers = [
      {
        id: "layer-1",
        name: "Layer 1",
        items: [
          {
            id: "feature-line-obstacle",
            kind: "geometry",
            geometryMeta: { geometryKind: "LineString" },
            geometry: {
              type: "LineString",
              coordinates: [
                [10, 20],
                [10.01, 20],
              ],
            },
            style: {},
          },
        ],
      },
    ] as FullScenarioLayerItemsLayer[];

    const narrow = extractRoutingObstacles(layers, selection(["layer-1"]), {
      lineBufferMeters: 5,
    });
    const wide = extractRoutingObstacles(layers, selection(["layer-1"]), {
      lineBufferMeters: 200,
    });
    const narrowBbox = turfBbox(narrow.features[0]!);
    const wideBbox = turfBbox(wide.features[0]!);

    expect(wideBbox[0]).toBeLessThan(narrowBbox[0]);
    expect(wideBbox[1]).toBeLessThan(narrowBbox[1]);
    expect(wideBbox[2]).toBeGreaterThan(narrowBbox[2]);
    expect(wideBbox[3]).toBeGreaterThan(narrowBbox[3]);
  });
});
