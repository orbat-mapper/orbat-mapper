import { describe, expect, it } from "vitest";
import {
  MAPLIBRE_VECTOR_BASEMAP_ID,
  NO_BASEMAP_ID,
  getSupportedMaplibreBasemaps,
  resolveMaplibreBasemap,
} from "@/modules/maplibreview/maplibreBasemaps";
import type { MlLayerConfig } from "@/geo/maplibreLayerConfigTypes";

const layers: MlLayerConfig[] = [
  {
    name: MAPLIBRE_VECTOR_BASEMAP_ID,
    title: "OpenFreeMap Positron",
    sourceType: "style",
    styleUrl: "https://tiles.openfreemap.org/styles/positron",
  },
  {
    name: "osm",
    title: "OSM",
    sourceType: "raster",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
  },
  {
    name: "imagery",
    title: "Imagery",
    sourceType: "raster",
    tiles: ["https://tiles.example.com/{z}/{x}/{y}.png"],
    opacity: 0.6,
  },
  {
    name: "broken-style",
    title: "Broken",
    sourceType: "style",
  },
  {
    name: "name-only",
    sourceType: "raster",
    tiles: ["https://tiles.example.com/name-only/{z}/{x}/{y}.png"],
  },
];

describe("maplibreBasemaps", () => {
  it("returns the configured basemaps plus the no-basemap option", () => {
    const options = getSupportedMaplibreBasemaps(layers);

    expect(options.map((option) => option.id)).toEqual([
      MAPLIBRE_VECTOR_BASEMAP_ID,
      "osm",
      "imagery",
      "name-only",
      NO_BASEMAP_ID,
    ]);
  });

  it("falls back to the layer name when title is missing", () => {
    const options = getSupportedMaplibreBasemaps(layers);
    const nameOnly = options.find((o) => o.id === "name-only");
    expect(nameOnly?.title).toBe("name-only");
  });

  it("passes through a style URL unchanged for style sources", () => {
    const [positron] = getSupportedMaplibreBasemaps(layers);
    expect(positron.style).toBe("https://tiles.openfreemap.org/styles/positron");
  });

  it("synthesizes a raster StyleSpecification for raster sources", () => {
    const options = getSupportedMaplibreBasemaps(layers);
    const osm = options.find((o) => o.id === "osm");
    expect(osm?.style).toMatchObject({
      version: 8,
      sources: {
        osm: { type: "raster" },
      },
    });

    const imagery = options.find((o) => o.id === "imagery");
    expect(imagery?.style).toMatchObject({
      layers: [
        {
          source: "imagery",
          paint: { "raster-opacity": 0.6 },
        },
      ],
    });
  });

  it("emits an empty style for the no-basemap option", () => {
    const options = getSupportedMaplibreBasemaps(layers);
    const none = options.find((o) => o.id === NO_BASEMAP_ID);
    expect(none?.style).toMatchObject({
      version: 8,
      sources: {},
      layers: [],
    });
  });

  it("falls back to the vector maplibre basemap when the requested id is unavailable", () => {
    const option = resolveMaplibreBasemap("missing-id", layers);
    expect(option.id).toBe(MAPLIBRE_VECTOR_BASEMAP_ID);
  });
});
