import { describe, expect, it, vi } from "vitest";
import type { MapGeoJSONFeature, Map as MlMap, PointLike } from "maplibre-gl";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import {
  deleteUnitHitBox,
  getMilSymbolHitBox,
  queryUnitHitsAt,
  rankUnitHits,
  setUnitHitBox,
  type UnitHitBox,
} from "@/geo/engines/maplibre/unitHitBox";

function createMap({
  bearing = 0,
  alignment = "viewport",
  layers = ["unitLayer"],
  rendered = [] as MapGeoJSONFeature[],
}: {
  bearing?: number;
  alignment?: "map" | "viewport";
  layers?: string[];
  rendered?: MapGeoJSONFeature[];
} = {}) {
  // Every unit anchor projects to (100, 100).
  return {
    project: () => ({ x: 100, y: 100 }),
    getBearing: () => bearing,
    getLayoutProperty: () => alignment,
    getLayersOrder: () => layers,
    queryRenderedFeatures: vi.fn(() => rendered),
  } as unknown as MlMap;
}

function unitFeature(symbolKey: string, symbolRotation = 0, id = "unit-1") {
  return {
    layer: { id: "unitLayer" },
    geometry: { type: "Point", coordinates: [10, 20] },
    properties: { id, symbolKey, symbolRotation },
  } as unknown as MapGeoJSONFeature;
}

// 40 px wide, 20 px tall around the anchor.
const BOX: UnitHitBox = [-20, -10, 20, 10];

function isHit(
  map: MlMap,
  feature: MapGeoJSONFeature,
  point: PointLike,
  tolerance = 0,
): boolean {
  return rankUnitHits(map, [feature], point, tolerance).length === 1;
}

describe("getMilSymbolHitBox", () => {
  it("leaves out the text amplifiers", () => {
    const options = { size: 30, outlineWidth: 7, outlineColor: "white" };
    const plain = symbolGenerator("SFGPUCI----K", options);
    const amplified = {
      ...options,
      uniqueDesignation: "x24 A-10 x24 F-4E",
      additionalInformation: "long text here",
    };

    expect(symbolGenerator("SFGPUCI----K", amplified).getSize().width).toBeGreaterThan(
      plain.getSize().width * 3,
    );
    const [left, top, right, bottom] = getMilSymbolHitBox("SFGPUCI----K", amplified);
    expect(right - left).toBeCloseTo(plain.getSize().width);
    expect(bottom - top).toBeCloseTo(plain.getSize().height);
    expect(left).toBeCloseTo(-plain.getAnchor().x);
    expect(top).toBeCloseTo(-plain.getAnchor().y);
  });

  it("keeps the headquarters staff below the anchor of the full symbol", () => {
    const full = symbolGenerator("SFGPUCI---AH", {
      size: 30,
      uniqueDesignation: "1st HQ",
    });
    const [, top, , bottom] = getMilSymbolHitBox("SFGPUCI---AH", {
      size: 30,
      uniqueDesignation: "1st HQ",
    });
    // A headquarters symbol is anchored at the foot of its staff.
    expect(bottom).toBeCloseTo(full.getSize().height - full.getAnchor().y);
    expect(top).toBeLessThan(-30);
  });
});

describe("rankUnitHits", () => {
  it("keeps units whose symbol is within the tolerance", () => {
    const map = createMap();
    setUnitHitBox(map, "key", BOX);
    const feature = unitFeature("key");

    expect(isHit(map, feature, [100, 100])).toBe(true);
    expect(isHit(map, feature, [120, 110])).toBe(true);
    expect(isHit(map, feature, [121, 100])).toBe(false);
    // 30 px right of the symbol, 5 px off its corner diagonally.
    expect(isHit(map, feature, [150, 100], 30)).toBe(true);
    expect(isHit(map, feature, [150, 100], 29)).toBe(false);
    expect(isHit(map, feature, { x: 123, y: 114 } as PointLike, 5)).toBe(true);
    expect(isHit(map, feature, { x: 123, y: 114 } as PointLike, 4.9)).toBe(false);
  });

  it("puts the closest unit first and keeps the draw order of ties", () => {
    const map = createMap();
    setUnitHitBox(map, "wide", [-40, -10, 40, 10]);
    setUnitHitBox(map, "narrow", BOX);
    const far = unitFeature("narrow", 0, "far");
    const near = unitFeature("wide", 0, "near");
    const alsoNear = unitFeature("wide", 0, "also-near");

    const ids = (features: MapGeoJSONFeature[]) => features.map((f) => f.properties.id);
    expect(ids(rankUnitHits(map, [far, near, alsoNear], [135, 100], 20))).toEqual([
      "near",
      "also-near",
      "far",
    ]);
  });

  it("counts the whole image of a symbol without a hit box", () => {
    const map = createMap();
    setUnitHitBox(map, "key", BOX);
    deleteUnitHitBox(map, "key");

    expect(isHit(map, unitFeature("key"), [300, 300])).toBe(true);
    expect(isHit(map, unitFeature("custom-symbol"), [300, 300])).toBe(true);
  });

  it("follows the symbol rotation", () => {
    const map = createMap();
    setUnitHitBox(map, "key", BOX);
    // Turned a quarter clockwise, the wide symbol stands upright on screen.
    const feature = unitFeature("key", 90);

    expect(isHit(map, feature, [100, 118])).toBe(true);
    expect(isHit(map, feature, [118, 100])).toBe(false);
    expect(isHit(map, feature, [118, 100], 8.01)).toBe(true);
  });

  it("turns map-aligned symbols with the map bearing", () => {
    const map = createMap({ bearing: 90, alignment: "map" });
    setUnitHitBox(map, "key", BOX);
    const feature = unitFeature("key");

    expect(isHit(map, feature, [100, 118])).toBe(true);
    expect(isHit(map, feature, [118, 100])).toBe(false);
    // A viewport-aligned symbol ignores the bearing.
    const viewportMap = createMap({ bearing: 90 });
    setUnitHitBox(viewportMap, "key", BOX);
    expect(isHit(viewportMap, feature, [118, 100])).toBe(true);
  });
});

describe("queryUnitHitsAt", () => {
  it("queries the unit layers and drops hits on the text amplifiers", () => {
    const onSymbol = unitFeature("key", 0, "on-symbol");
    const map = createMap({
      layers: ["basemap", "unitLayer", "unitLayer-moving"],
      rendered: [onSymbol],
    });
    setUnitHitBox(map, "key", BOX);

    expect(queryUnitHitsAt(map, [110, 100])).toEqual([onSymbol]);
    expect(queryUnitHitsAt(map, [180, 100])).toEqual([]);
    expect(map.queryRenderedFeatures).toHaveBeenCalledWith([110, 100], {
      layers: ["unitLayer", "unitLayer-moving"],
    });
  });

  it("skips the query without unit layers", () => {
    const map = createMap({ layers: ["basemap"] });

    expect(queryUnitHitsAt(map, [100, 100])).toEqual([]);
    expect(map.queryRenderedFeatures).not.toHaveBeenCalled();
  });
});
