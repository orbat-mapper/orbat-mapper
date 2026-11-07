import { describe, expect, it } from "vitest";
import type { ColorReliefLayerSpecification } from "maplibre-gl";
import { ATLAS_ELEVATION_LAYER_PREFIX, createAtlasStyle } from "@/geo/atlasStyle";

describe("createAtlasStyle", () => {
  it("defaults to OpenFreeMap tiles and glyphs and Mapterhorn elevation", () => {
    const style = createAtlasStyle();
    expect(style.sources.omt).toEqual({
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    });
    expect(style.glyphs).toBe(
      "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    );
    expect(style.sources.dem4).toMatchObject({ type: "raster-dem", maxzoom: 4 });
    expect(style.sources.dem11).toMatchObject({ type: "raster-dem", maxzoom: 11 });
  });

  it("uses the vector source and glyphs it is given", () => {
    const style = createAtlasStyle({
      vector: { type: "vector", url: "https://tiles.example.com/planet" },
      glyphs: "https://fonts.example.com/{fontstack}/{range}.pbf",
    });
    expect(style.sources.omt).toEqual({
      type: "vector",
      url: "https://tiles.example.com/planet",
    });
    expect(style.glyphs).toBe("https://fonts.example.com/{fontstack}/{range}.pbf");
  });

  it("tints elevation on the Alpine five-band scale", () => {
    const relief = createAtlasStyle().layers.filter(
      (layer): layer is ColorReliefLayerSpecification => layer.type === "color-relief",
    );
    expect(relief.map((layer) => layer.id)).toEqual(
      [4, 6, 8, 11].map((zoom) => `${ATLAS_ELEVATION_LAYER_PREFIX}${zoom}`),
    );
    const ramp = relief[0].paint!["color-relief-color"] as unknown[];
    const thresholds = ramp.slice(3).filter((_, i) => i % 4 === 2);
    expect(thresholds).toEqual([100, 200, 500, 1000, 2000]);
  });

  it("returns a fresh style on every call", () => {
    expect(createAtlasStyle()).not.toBe(createAtlasStyle());
    expect(createAtlasStyle().layers).not.toBe(createAtlasStyle().layers);
  });
});
