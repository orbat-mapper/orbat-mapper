import type { StyleSpecification } from "maplibre-gl";
import { layers as protomapsLayers, namedFlavor } from "@protomaps/basemaps";
import { DEFAULT_MAPLIBRE_BASEMAP_ID } from "@/config/constants";
import {
  DEFAULT_BASEMAP_FLAVOR,
  type BasemapFlavor,
  type MlLayerConfig,
  type MlPmtilesLayerConfig,
  type MlRasterLayerConfig,
  type MlStyleLayerConfig,
} from "@/geo/maplibreLayerConfigTypes";
import { archiveTileUrl } from "@/geo/pmtilesProtocol";
import { protomapsSpriteUrl } from "@/geo/protomapsSprite";

export const MAPLIBRE_VECTOR_BASEMAP_ID = DEFAULT_MAPLIBRE_BASEMAP_ID;
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

/**
 * The "No base map" style. `glyphs` is left unset so MapLibre rasterises the scenario labels
 * locally with TinySDF instead of reaching out to a remote font server — this is the only style a
 * standalone (`file://`) install has, and it must not contact a third party. See ADR 0003.
 */
function createEmptyStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [],
  };
}

function resolveStyleSource(layer: MlStyleLayerConfig): MaplibreBasemapStyle | null {
  if (layer.styleUrl) return layer.styleUrl;
  if (layer.style) return layer.style;
  return null;
}

/**
 * Style for a raster PMTiles archive. Generic — any raster archive works, and no glyphs, sprite
 * or extra assets are needed.
 */
function createPmtilesRasterStyle(layer: MlPmtilesLayerConfig): StyleSpecification {
  const archive = layer.archive!;
  return {
    version: 8,
    sources: {
      [layer.name]: {
        type: "raster",
        tiles: [archiveTileUrl(layer.name)],
        tileSize: 256,
        minzoom: archive.minZoom,
        maxzoom: archive.maxZoom,
        bounds: archive.bounds,
        attribution: archive.attribution,
      },
    },
    layers: [
      {
        id: `${layer.name}-raster`,
        type: "raster",
        source: layer.name,
        paint: { "raster-opacity": layer.opacity ?? 1 },
      },
    ],
  };
}

/**
 * Style for a vector PMTiles archive. The archive holds tiles only, so the layers come from
 * `@protomaps/basemaps` (which assumes the Protomaps schema) and the sprite is the committed one.
 *
 * `glyphs` is deliberately left unset unless the config opts in, which makes MapLibre rasterise
 * labels locally with TinySDF. See docs/adr/0003-vector-pmtiles-styling.md.
 */
function createPmtilesVectorStyle(layer: MlPmtilesLayerConfig): StyleSpecification {
  const archive = layer.archive!;
  const flavor = layer.flavor ?? DEFAULT_BASEMAP_FLAVOR;
  const style: StyleSpecification = {
    version: 8,
    sprite: protomapsSpriteUrl(flavor),
    sources: {
      [layer.name]: {
        type: "vector",
        tiles: [archiveTileUrl(layer.name)],
        minzoom: archive.minZoom,
        maxzoom: archive.maxZoom,
        bounds: archive.bounds,
        attribution: archive.attribution,
      },
    },
    layers: protomapsLayers(layer.name, namedFlavor(flavor), {
      lang: layer.lang ?? "en",
    }),
  };
  if (layer.glyphs) style.glyphs = layer.glyphs;
  return style;
}

/**
 * Style for a basemap archive. Raster or vector is decided by the archive header, read into
 * `layer.archive` by the basemap-archive seam — never by the file name.
 *
 * Returns null while the archive has not been opened yet, which is the normal state after a
 * reload for an archive the user picked from disk.
 */
export function createPmtilesStyle(
  layer: MlPmtilesLayerConfig,
): StyleSpecification | null {
  if (!layer.archive) return null;
  return layer.archive.kind === "vector"
    ? createPmtilesVectorStyle(layer)
    : createPmtilesRasterStyle(layer);
}

/** Whether the Layers panel should offer an opacity control for this basemap. */
export function basemapSupportsOpacity(layer: MlLayerConfig | undefined): boolean {
  if (!layer) return false;
  if (layer.sourceType === "raster") return true;
  return layer.sourceType === "pmtiles" && layer.archive?.kind === "raster";
}

/**
 * Whether the Layers panel should offer a flavour select for this basemap. Only a vector PMTiles
 * archive has flavours; raster archives and mapbundles do not.
 */
export function basemapSupportsFlavor(
  layer: MlLayerConfig | undefined,
): layer is MlPmtilesLayerConfig {
  return layer?.sourceType === "pmtiles" && layer.archive?.kind === "vector";
}

/** The flavour currently in effect for a basemap, or undefined when it has none. */
export function basemapFlavor(
  layer: MlLayerConfig | undefined,
): BasemapFlavor | undefined {
  return basemapSupportsFlavor(layer)
    ? (layer.flavor ?? DEFAULT_BASEMAP_FLAVOR)
    : undefined;
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
    case "pmtiles": {
      const style = createPmtilesStyle(layer);
      if (!style) return null;
      return { id: layer.name, title: resolveBasemapTitle(layer), style };
    }
    case "mapbundle": {
      // TODO(mapbundle): render the style the bundle carries once the protocol is available.
      return null;
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
  return options.find((option) => option.id === basemapId) ?? options[0];
}
