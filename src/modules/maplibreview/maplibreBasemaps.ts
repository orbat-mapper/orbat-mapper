import type { StyleSpecification } from "maplibre-gl";

export const MAPLIBRE_VECTOR_BASEMAP_ID = "openFreeMapPositron";
export const MAPLIBRE_LIBERTY_BASEMAP_ID = "openFreeMapLiberty";
export const MAPLIBRE_BRIGHT_BASEMAP_ID = "openFreeMapBright";
export const MAPLIBRE_DARK_BASEMAP_ID = "versaTilesEclipse";
export const NO_BASEMAP_ID = "None";
const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OPEN_FREE_MAP_POSITRON_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const OPEN_FREE_MAP_LIBERTY_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const OPEN_FREE_MAP_BRIGHT_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";
const VERSATILES_ECLIPSE_STYLE_URL =
  "https://tiles.versatiles.org/assets/styles/eclipse/style.json";
const DEFAULT_GLYPHS_URL = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf";

export type MaplibreBasemapStyle = string | StyleSpecification;

export interface MaplibreBasemapOption {
  id: string;
  title: string;
  isShared: boolean;
  style: MaplibreBasemapStyle;
}

interface MaplibreBasemapLayer {
  name: string;
  title: string;
  opacity: number;
  layerSourceType?: "osm" | "xyz";
  sourceOptions?: {
    url?: string;
    attributions?: unknown;
    maxZoom?: number;
  };
}

function toMapLibreAttribution(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const parts = value.filter((part): part is string => typeof part === "string");
    return parts.length > 0 ? parts.join(" | ") : undefined;
  }
  return undefined;
}

function createRasterStyle(
  layer: MaplibreBasemapLayer,
  tiles: string[],
): StyleSpecification {
  return {
    version: 8,
    glyphs: DEFAULT_GLYPHS_URL,
    sources: {
      [layer.name]: {
        type: "raster",
        tiles,
        tileSize: 256,
        attribution: toMapLibreAttribution(layer.sourceOptions?.attributions),
        maxzoom: layer.sourceOptions?.maxZoom,
      },
    },
    layers: [
      {
        id: `${layer.name}-raster`,
        type: "raster",
        source: layer.name,
        paint: {
          "raster-opacity": layer.opacity ?? 1,
        },
      },
    ],
  };
}

function createEmptyStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: DEFAULT_GLYPHS_URL,
    sources: {},
    layers: [],
  };
}

function getTileUrls(layer: MaplibreBasemapLayer): string[] | null {
  if (layer.layerSourceType === "osm") {
    return [layer.sourceOptions?.url || OSM_TILE_URL];
  }
  if (layer.layerSourceType === "xyz" && layer.sourceOptions?.url) {
    return [layer.sourceOptions.url];
  }
  return null;
}

export function getSupportedMaplibreBasemaps(
  layers: readonly MaplibreBasemapLayer[],
): MaplibreBasemapOption[] {
  const options: MaplibreBasemapOption[] = [
    {
      id: MAPLIBRE_VECTOR_BASEMAP_ID,
      title: "OpenFreeMap Positron",
      isShared: false,
      style: OPEN_FREE_MAP_POSITRON_STYLE_URL,
    },
    {
      id: MAPLIBRE_LIBERTY_BASEMAP_ID,
      title: "OpenFreeMap Liberty",
      isShared: false,
      style: OPEN_FREE_MAP_LIBERTY_STYLE_URL,
    },
    {
      id: MAPLIBRE_BRIGHT_BASEMAP_ID,
      title: "OpenFreeMap Bright",
      isShared: false,
      style: OPEN_FREE_MAP_BRIGHT_STYLE_URL,
    },
    {
      id: MAPLIBRE_DARK_BASEMAP_ID,
      title: "VersaTiles Eclipse (dark)",
      isShared: false,
      style: VERSATILES_ECLIPSE_STYLE_URL,
    },
  ];

  for (const layer of layers) {
    const tiles = getTileUrls(layer);
    if (!tiles) continue;

    options.push({
      id: layer.name,
      title: layer.title,
      isShared: true,
      style: createRasterStyle(layer, tiles),
    });
  }

  options.push({
    id: NO_BASEMAP_ID,
    title: "No base map",
    isShared: true,
    style: createEmptyStyle(),
  });

  return options;
}

export function resolveMaplibreBasemap(
  basemapId: string | undefined,
  layers: readonly MaplibreBasemapLayer[],
): MaplibreBasemapOption {
  const options = getSupportedMaplibreBasemaps(layers);
  return (
    options.find((option) => option.id === basemapId) ??
    options.find((option) => option.id === MAPLIBRE_VECTOR_BASEMAP_ID) ??
    options[0]
  );
}
