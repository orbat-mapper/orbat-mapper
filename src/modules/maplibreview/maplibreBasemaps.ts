import type { StyleSpecification } from "maplibre-gl";
import type {
  MlLayerConfig,
  MlRasterLayerConfig,
  MlStyleLayerConfig,
} from "@/geo/maplibreLayerConfigTypes";

export const MAPLIBRE_VECTOR_BASEMAP_ID = "openFreeMapPositron";
export const MAPLIBRE_LIBERTY_BASEMAP_ID = "openFreeMapLiberty";
export const MAPLIBRE_BRIGHT_BASEMAP_ID = "openFreeMapBright";
export const MAPLIBRE_DARK_BASEMAP_ID = "versaTilesEclipse";
export const NO_BASEMAP_ID = "None";

const DEFAULT_GLYPHS_URL = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf";

export type MaplibreBasemapStyle = string | StyleSpecification;

export interface MaplibreBasemapOption {
  id: string;
  title: string;
  style: MaplibreBasemapStyle;
}

function resolveBasemapTitle(layer: MlLayerConfig): string {
  return layer.title || layer.name;
}

function createRasterStyle(layer: MlRasterLayerConfig): StyleSpecification {
  return {
    version: 8,
    glyphs: DEFAULT_GLYPHS_URL,
    sources: {
      [layer.name]: {
        type: "raster",
        tiles: layer.tiles,
        tileSize: layer.tileSize ?? 256,
        attribution: layer.attribution,
        maxzoom: layer.maxZoom,
        minzoom: layer.minZoom,
        scheme: layer.scheme,
        bounds: layer.bounds,
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

function resolveStyleSource(layer: MlStyleLayerConfig): MaplibreBasemapStyle | null {
  if (layer.styleUrl) return layer.styleUrl;
  if (layer.style) return layer.style;
  return null;
}

function configToBasemapOption(layer: MlLayerConfig): MaplibreBasemapOption | null {
  switch (layer.sourceType) {
    case "style": {
      const style = resolveStyleSource(layer);
      if (!style) return null;
      return { id: layer.name, title: resolveBasemapTitle(layer), style };
    }
    case "raster": {
      if (!layer.tiles || layer.tiles.length === 0) return null;
      return {
        id: layer.name,
        title: resolveBasemapTitle(layer),
        style: createRasterStyle(layer),
      };
    }
  }
}

export function getSupportedMaplibreBasemaps(
  layers: MlLayerConfig[],
): MaplibreBasemapOption[] {
  const options: MaplibreBasemapOption[] = [];
  for (const layer of layers) {
    const option = configToBasemapOption(layer);
    if (option) options.push(option);
  }

  options.push({
    id: NO_BASEMAP_ID,
    title: "No base map",
    style: createEmptyStyle(),
  });

  return options;
}

export function resolveMaplibreBasemap(
  basemapId: string | undefined,
  layers: MlLayerConfig[],
): MaplibreBasemapOption {
  const options = getSupportedMaplibreBasemaps(layers);
  return (
    options.find((option) => option.id === basemapId) ??
    options.find((option) => option.id === MAPLIBRE_VECTOR_BASEMAP_ID) ??
    options[0]
  );
}
