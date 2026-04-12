import { describe, expect, it } from "vitest";
import {
  MAPLIBRE_BRIGHT_BASEMAP_ID,
  MAPLIBRE_DARK_BASEMAP_ID,
  MAPLIBRE_LIBERTY_BASEMAP_ID,
  MAPLIBRE_VECTOR_BASEMAP_ID,
  NO_BASEMAP_ID,
  getSupportedMaplibreBasemaps,
  resolveMaplibreBasemap,
} from "@/modules/maplibreview/maplibreBasemaps";
import type { StoredLayerConfig } from "@/stores/baseLayersStore";

const layers: StoredLayerConfig[] = [
  {
    title: "OSM",
    name: "osm",
    layerSourceType: "osm",
    sourceOptions: {
      crossOrigin: "anonymous",
    },
    layerType: "baselayer",
    opacity: 1,
  },
  {
    title: "Imagery",
    name: "imagery",
    layerSourceType: "xyz",
    sourceOptions: {
      url: "https://tiles.example.com/{z}/{x}/{y}.png",
    },
    layerType: "baselayer",
    opacity: 0.6,
  },
  {
    title: "Unsupported",
    name: "unsupported",
    layerSourceType: "wms" as any,
    sourceOptions: {},
    layerType: "baselayer",
    opacity: 1,
  },
];

describe("maplibreBasemaps", () => {
  it("returns the vector option, supported raster basemaps, and no basemap", () => {
    const options = getSupportedMaplibreBasemaps(layers);

    expect(options.map((option) => option.id)).toEqual([
      MAPLIBRE_VECTOR_BASEMAP_ID,
      MAPLIBRE_LIBERTY_BASEMAP_ID,
      MAPLIBRE_BRIGHT_BASEMAP_ID,
      MAPLIBRE_DARK_BASEMAP_ID,
      "osm",
      "imagery",
      NO_BASEMAP_ID,
    ]);
    expect(options[4].style).toMatchObject({
      version: 8,
      sources: {
        osm: {
          type: "raster",
        },
      },
    });
    expect(options[5].style).toMatchObject({
      layers: [
        {
          source: "imagery",
          paint: {
            "raster-opacity": 0.6,
          },
        },
      ],
    });
    expect(options[6].style).toMatchObject({
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
