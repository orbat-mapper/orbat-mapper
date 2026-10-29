import { describe, expect, it } from "vitest";

import { resolveStateGeometry } from "@/modules/scenarioeditor/featureStateGeometry";
import type { NGeometryLayerItem } from "@/types/scenarioLayerItems";

const square = {
  type: "Polygon",
  coordinates: [
    [
      [10, 60],
      [11, 60],
      [11, 61],
      [10, 61],
      [10, 60],
    ],
  ],
};

function polygonItem(overrides: Partial<NGeometryLayerItem> = {}): NGeometryLayerItem {
  return {
    id: "feature-1",
    _pid: "layer-1",
    kind: "geometry",
    name: "Area",
    geometry: square,
    geometryMeta: { geometryKind: "Polygon" },
    style: {},
    ...overrides,
  } as NGeometryLayerItem;
}

describe("resolveStateGeometry", () => {
  it("takes the geometry of a single pasted GeoJSON feature", () => {
    const result = resolveStateGeometry(polygonItem(), {
      type: "Feature",
      properties: { name: "ignored" },
      geometry: square,
    });

    expect(result).toEqual({ ok: true, geometry: square });
  });

  it("takes a bare geometry or a collection with exactly one feature", () => {
    const feature = { type: "Feature", properties: {}, geometry: square };

    expect(resolveStateGeometry(polygonItem(), square)).toEqual({
      ok: true,
      geometry: square,
    });
    expect(
      resolveStateGeometry(polygonItem(), {
        type: "FeatureCollection",
        features: [feature],
      }),
    ).toEqual({ ok: true, geometry: square });
    expect(
      resolveStateGeometry(polygonItem(), {
        type: "FeatureCollection",
        features: [feature, feature],
      }),
    ).toEqual({ ok: false, message: "Expected one feature, got 2" });
  });

  it("drops the elevation from 3D coordinates", () => {
    const result = resolveStateGeometry(
      polygonItem({ geometryMeta: { geometryKind: "LineString" } }),
      {
        type: "LineString",
        coordinates: [
          [10, 60, 120],
          [11, 61, 80.5],
        ],
      },
    );

    expect(result).toEqual({
      ok: true,
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
        ],
      },
    });
  });

  it("rejects a geometry of another type than the feature", () => {
    const result = resolveStateGeometry(polygonItem(), {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
        ],
      },
    });

    expect(result).toEqual({
      ok: false,
      message: "Expected a Polygon geometry, got LineString",
    });
  });

  it("rejects circles and rectangles, whose shape plain GeoJSON cannot keep", () => {
    const circle = polygonItem({
      geometry: { type: "Point", coordinates: [10, 60] },
      geometryMeta: { geometryKind: "Circle", radius: 1000 },
    });
    const rectangle = polygonItem({
      geometryMeta: { geometryKind: "Polygon", shape: "rectangle" },
    });
    const point = { type: "Point", coordinates: [11, 61] };

    expect(resolveStateGeometry(circle, point)).toEqual({
      ok: false,
      message: "Circles cannot take a pasted geometry",
    });
    expect(resolveStateGeometry(rectangle, square)).toEqual({
      ok: false,
      message: "Rectangles cannot take a pasted geometry",
    });
  });
});
