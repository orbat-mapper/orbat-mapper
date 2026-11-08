import { describe, expect, it } from "vitest";
import {
  DEFAULT_ELEVATION_BAND_PRESET,
  ELEVATION_BAND_LAYER_PREFIX,
  createAtlasStyle,
  elevationBandRamp,
} from "@/geo/atlasStyle";

type Layer = ReturnType<typeof createAtlasStyle>["layers"][number];

const ids = (layers: Layer[]) => layers.map((layer) => layer.id);
const sourceOf = (layer: Layer) => ("source" in layer ? layer.source : undefined);
const bandLayers = (layers: Layer[]) =>
  layers.filter((layer) => layer.id.startsWith(ELEVATION_BAND_LAYER_PREFIX));
const ramp = (layer: Layer) =>
  (layer as { paint?: Record<string, unknown> }).paint?.["color-relief-color"];

describe("createAtlasStyle", () => {
  it("defaults to OpenFreeMap vector tiles and glyphs and Mapterhorn elevation", () => {
    const style = createAtlasStyle();
    expect(style.version).toBe(8);
    expect(style.glyphs).toBe(
      "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    );
    expect(style.sources.omt).toEqual({
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    });
    for (const id of ["dem4", "dem6", "dem8", "dem11"]) {
      expect(style.sources[id]).toMatchObject({
        type: "raster-dem",
        tiles: ["https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"],
        encoding: "terrarium",
      });
    }
  });

  it("generalizes elevation more strongly the further out, from zoom-capped copies of one DEM", () => {
    const style = createAtlasStyle();
    const bands = bandLayers(style.layers);
    expect(ids(bands)).toEqual([
      "elevation-bands-4",
      "elevation-bands-6",
      "elevation-bands-8",
      "elevation-bands-11",
    ]);
    expect(
      bands.map(
        (layer) => (style.sources[sourceOf(layer)!] as { maxzoom: number }).maxzoom,
      ),
    ).toEqual([4, 6, 8, 11]);
    // Each finer level fades in over the coarser one it overlaps.
    for (const layer of bands.slice(1)) {
      const paint = (layer as { paint: Record<string, unknown> }).paint;
      expect(paint["color-relief-opacity"]).toEqual([
        "interpolate",
        ["linear"],
        ["zoom"],
        layer.minzoom,
        0,
        layer.minzoom! + 0.5,
        1,
      ]);
    }
  });

  it("draws the default elevation bands unless asked for another preset", () => {
    for (const layer of bandLayers(createAtlasStyle().layers)) {
      expect(ramp(layer)).toEqual(elevationBandRamp(DEFAULT_ELEVATION_BAND_PRESET));
    }
    for (const layer of bandLayers(
      createAtlasStyle({ elevationBands: "lowland" }).layers,
    )) {
      expect(ramp(layer)).toEqual(elevationBandRamp("lowland"));
    }
  });

  it("swaps in other tile sources, such as PMTiles archives, without touching the layers", () => {
    const dem = {
      type: "raster-dem",
      url: "pmtiles://atlas-dem.pmtiles",
      encoding: "terrarium",
    } as const;
    const style = createAtlasStyle({
      vector: { type: "vector", url: "pmtiles://atlas.pmtiles" },
      dem,
      glyphs: "/fonts/{fontstack}/{range}.pbf",
    });
    expect(style.glyphs).toBe("/fonts/{fontstack}/{range}.pbf");
    expect(style.sources.omt).toEqual({ type: "vector", url: "pmtiles://atlas.pmtiles" });
    expect(style.sources.dem11).toEqual({ ...dem, maxzoom: 11 });
    expect(ids(style.layers)).toEqual(ids(createAtlasStyle().layers));
  });

  it("references only sources it declares", () => {
    const style = createAtlasStyle();
    const used = new Set(style.layers.map(sourceOf).filter(Boolean));
    expect([...used].sort()).toEqual(Object.keys(style.sources).sort());
  });

  it("hides river centre lines and riverbank seams under the water fill", () => {
    const layerIds = ids(createAtlasStyle().layers);
    expect(layerIds.indexOf("rivers")).toBeLessThan(layerIds.indexOf("water"));
    expect(layerIds.indexOf("shoreline")).toBeLessThan(layerIds.indexOf("water"));
  });

  it("draws US state borders and names under the country ones", () => {
    const layerIds = ids(createAtlasStyle().layers);
    expect(layerIds).toContain("state-borders");
    expect(layerIds).toContain("state-labels");
    expect(layerIds.indexOf("state-borders")).toBeLessThan(layerIds.indexOf("borders"));
    expect(layerIds.indexOf("state-labels")).toBeLessThan(
      layerIds.indexOf("country-labels"),
    );
  });

  it("returns a fresh style each call, so callers may mutate it", () => {
    const first = createAtlasStyle();
    first.layers.length = 0;
    expect(createAtlasStyle().layers.length).toBeGreaterThan(0);
  });
});
