import { describe, expect, it, vi } from "vitest";
import type { Map, StyleSpecification } from "maplibre-gl";
import {
  syncMapTerrain,
  DEFAULT_TERRAIN_DISPLAY,
  TERRAIN_SOURCE_ID,
  HILLSHADE_LAYER_ID,
  HILLSHADE_SOURCE_ID,
  syncHillshadeOrder,
  terrainElevationMeters,
} from "./mapTerrain";

function fixture() {
  const style: StyleSpecification = {
    version: 8,
    sources: {},
    layers: [
      { id: "basemap", type: "background" },
      { id: "editor", type: "background" },
    ],
  };
  const map = {
    getLayer: (id: string) => style.layers.find((layer) => layer.id === id),
    getPaintProperty: (id: string, property: string) => {
      const layer = style.layers.find((layer) => layer.id === id);
      return (layer?.paint as Record<string, unknown> | undefined)?.[property];
    },
    setPaintProperty: (id: string, property: string, value: unknown) => {
      const layer = style.layers.find((layer) => layer.id === id)!;
      (layer.paint as Record<string, unknown>)[property] = value;
    },
    getLayersOrder: () => style.layers.map((layer) => layer.id),
    addLayer: (layer: StyleSpecification["layers"][number], before?: string) => {
      if (style.layers.some((existing) => existing.id === layer.id))
        throw new Error("Duplicate layer");
      const index = before
        ? style.layers.findIndex((item) => item.id === before)
        : style.layers.length;
      style.layers.splice(index, 0, layer);
    },
    removeLayer: (id: string) => {
      style.layers = style.layers.filter((layer) => layer.id !== id);
    },
    moveLayer: (id: string, before: string) => {
      const layer = style.layers.find((item) => item.id === id)!;
      style.layers = style.layers.filter((item) => item.id !== id);
      style.layers.splice(
        style.layers.findIndex((item) => item.id === before),
        0,
        layer,
      );
    },
    getStyle: () => style,
    getSource: (id: string) => style.sources[id],
    addSource: (id: string, source: StyleSpecification["sources"][string]) => {
      if (style.sources[id]) throw new Error("Duplicate source");
      style.sources[id] = source;
    },
    removeSource: (id: string) => {
      if (style.terrain?.source === id) throw new Error("Source still used by terrain");
      if (style.layers.some((layer) => "source" in layer && layer.source === id))
        throw new Error("Source still used by layer");
      delete style.sources[id];
    },
    getTerrain: () => style.terrain,
    setTerrain: (terrain: StyleSpecification["terrain"] | null) => {
      style.terrain = terrain ?? undefined;
    },
  } as unknown as Map;
  return { map, style };
}

describe("map terrain", () => {
  it("enables terrain and flat hillshading independently and releases unused sources", () => {
    const { map, style } = fixture();
    syncMapTerrain(map, { ...DEFAULT_TERRAIN_DISPLAY, hillshadeEnabled: true });
    expect(style.terrain).toBeUndefined();
    expect(map.getLayer(HILLSHADE_LAYER_ID)).toBeDefined();
    syncMapTerrain(map, {
      ...DEFAULT_TERRAIN_DISPLAY,
      enabled: true,
      exaggeration: 3,
      hillshadeEnabled: true,
    });
    expect(style.terrain).toEqual({ source: TERRAIN_SOURCE_ID, exaggeration: 3 });
    expect(Object.keys(style.sources)).toHaveLength(2);
    syncMapTerrain(map, { ...DEFAULT_TERRAIN_DISPLAY, enabled: true });
    expect(map.getLayer(HILLSHADE_LAYER_ID)).toBeUndefined();
    expect(style.sources[HILLSHADE_SOURCE_ID]).toBeUndefined();
    syncMapTerrain(map, DEFAULT_TERRAIN_DISPLAY);
    expect(style.terrain).toBeUndefined();
    expect(style.sources).toEqual({});
  });

  it("restores display after a style replacement and keeps shading below scenario features", () => {
    const { map, style } = fixture();
    const display = {
      ...DEFAULT_TERRAIN_DISPLAY,
      enabled: true,
      hillshadeEnabled: true,
      hillshadeSettings: {
        ...DEFAULT_TERRAIN_DISPLAY.hillshadeSettings,
        strength: 0.8,
        direction: 90,
        anchor: "viewport" as const,
        shadowColor: "#123456",
      },
    };
    syncMapTerrain(map, display, "editor");
    syncMapTerrain(map, display, "editor");
    expect(style.layers.map((l) => l.id)).toEqual([
      "basemap",
      HILLSHADE_LAYER_ID,
      "editor",
    ]);
    expect(map.getPaintProperty(HILLSHADE_LAYER_ID, "hillshade-exaggeration")).toBe(0.8);
    expect(
      map.getPaintProperty(HILLSHADE_LAYER_ID, "hillshade-illumination-anchor"),
    ).toBe("viewport");
    map.addLayer({ id: "raster-overlay", type: "raster", source: "raster" }, "editor");
    syncHillshadeOrder(map, "editor");
    expect(style.layers.map((l) => l.id)).toEqual([
      "basemap",
      "raster-overlay",
      HILLSHADE_LAYER_ID,
      "editor",
    ]);
    style.sources = {};
    style.layers = [{ id: "new-basemap", type: "background" }];
    delete style.terrain;
    syncMapTerrain(map, display);
    expect(map.getTerrain()?.exaggeration).toBe(1);
    expect(map.getPaintProperty(HILLSHADE_LAYER_ID, "hillshade-shadow-color")).toBe(
      "#123456",
    );
  });

  it("reports natural elevation and omits values until the DEM is loaded", () => {
    const { map } = fixture();
    map.isSourceLoaded = vi.fn(() => false);
    map.queryTerrainElevation = vi.fn(() => 750);
    syncMapTerrain(map, { ...DEFAULT_TERRAIN_DISPLAY, enabled: true, exaggeration: 3 });
    expect(terrainElevationMeters(map, [10, 60])).toBeNull();
    vi.mocked(map.isSourceLoaded).mockReturnValue(true);
    expect(terrainElevationMeters(map, [10, 60])).toBe(250);
    vi.mocked(map.queryTerrainElevation).mockReturnValue(0);
    expect(terrainElevationMeters(map, [10, 60])).toBe(0);
    vi.mocked(map.queryTerrainElevation).mockReturnValue(-90);
    expect(terrainElevationMeters(map, [10, 60])).toBe(-30);
    vi.mocked(map.queryTerrainElevation).mockReturnValue(null);
    expect(terrainElevationMeters(map, [10, 60])).toBeNull();
  });
});
