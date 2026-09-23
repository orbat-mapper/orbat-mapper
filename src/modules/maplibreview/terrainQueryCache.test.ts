import { describe, expect, it, vi } from "vitest";
import type { Map } from "maplibre-gl";
import { installTerrainQueryCache } from "./terrainQueryCache";

type Point = { x: number; y: number };

function fixture() {
  const rayCast = vi.fn((point: Point, terrain?: unknown) => ({ ...point, terrain }));
  class Transform {
    screenPointToMercatorCoordinate(point: Point, terrain?: unknown) {
      return rayCast(point, terrain);
    }
  }
  const transform = new Transform();
  const terrain = {};
  // Stands in for MapLibre projecting the query geometry once per source.
  const queryRenderedFeatures = vi.fn(function (this: typeof map, sources: number) {
    const hits = [];
    for (let i = 0; i < sources; i++) {
      hits.push(transform.screenPointToMercatorCoordinate({ x: 1, y: 2 }, terrain));
      hits.push(transform.screenPointToMercatorCoordinate({ x: 3, y: 4 }, terrain));
    }
    return hits;
  });
  const map = { _camera: { transform }, transform, queryRenderedFeatures };
  const query = (sources: number) =>
    (map.queryRenderedFeatures as unknown as (n: number) => unknown[]).call(map, sources);
  return { map: map as unknown as Map, raw: map, transform, rayCast, query, terrain };
}

describe("installTerrainQueryCache", () => {
  it("ray-casts each screen point once per query", () => {
    const { map, rayCast, query } = fixture();
    installTerrainQueryCache(map);
    const hits = query(10);
    expect(rayCast).toHaveBeenCalledTimes(2);
    expect(hits).toHaveLength(20);
    expect(hits[18]).toEqual({ x: 1, y: 2, terrain: expect.anything() });
  });

  it("starts a fresh cache for every query", () => {
    const { map, rayCast, query } = fixture();
    installTerrainQueryCache(map);
    query(3);
    query(3);
    expect(rayCast).toHaveBeenCalledTimes(4);
  });

  it("does not cache lookups made without terrain or outside a query", () => {
    const { map, transform, rayCast } = fixture();
    installTerrainQueryCache(map);
    transform.screenPointToMercatorCoordinate({ x: 1, y: 2 }, {});
    transform.screenPointToMercatorCoordinate({ x: 1, y: 2 }, {});
    expect(rayCast).toHaveBeenCalledTimes(2);
    expect(Object.hasOwn(transform, "screenPointToMercatorCoordinate")).toBe(false);
  });

  it("restores the transform when the query throws", () => {
    const { map, raw, transform } = fixture();
    raw.queryRenderedFeatures.mockImplementation(() => {
      throw new Error("boom");
    });
    installTerrainQueryCache(map);
    expect(() => map.queryRenderedFeatures()).toThrow("boom");
    expect(Object.hasOwn(transform, "screenPointToMercatorCoordinate")).toBe(false);
  });

  it("restores the original query on uninstall", () => {
    const { map, raw } = fixture();
    const original = raw.queryRenderedFeatures;
    const uninstall = installTerrainQueryCache(map);
    expect(raw.queryRenderedFeatures).not.toBe(original);
    uninstall();
    expect(raw.queryRenderedFeatures).toBe(original);
  });

  it("does nothing for a map without queryRenderedFeatures", () => {
    const map = {} as Map;
    expect(() => installTerrainQueryCache(map)()).not.toThrow();
    expect("queryRenderedFeatures" in map).toBe(false);
  });
});
