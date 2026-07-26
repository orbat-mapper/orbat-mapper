/**
 * Types for MapLibre basemap configuration loaded from /config/maplibreConfig.json.
 *
 * Kept separate from layerConfigTypes.ts (which is OpenLayers-typed) so MapLibre-native
 * source options don't have to coexist with OL source option types.
 */
import type { StyleSpecification } from "maplibre-gl";

interface BaseMlLayerConfig {
  /** Unique identifier. Used as the basemap id in the UI and as the MapLibre source id. */
  name: string;
  /** Display name shown in the basemap picker. Falls back to `name` when omitted. */
  title?: string;
  minZoom?: number;
  maxZoom?: number;
  /** Applied as raster-opacity for raster sources; ignored for style sources. */
  opacity?: number;
  attribution?: string;
  /** Tile coverage bounds [minLon, minLat, maxLon, maxLat] in WGS84. */
  bounds?: [number, number, number, number];
}

export interface MlStyleLayerConfig extends BaseMlLayerConfig {
  sourceType: "style";
  /** URL to a MapLibre style JSON. Mutually exclusive with `style`. */
  styleUrl?: string;
  /** Inline style specification. Mutually exclusive with `styleUrl`. */
  style?: StyleSpecification;
}

export interface MlRasterLayerConfig extends BaseMlLayerConfig {
  sourceType: "raster";
  tiles: string[];
  tileSize?: number;
  scheme?: "xyz" | "tms";
}

/** The Protomaps basemap presets a vector PMTiles archive can be styled with. */
export const BASEMAP_FLAVORS = ["light", "dark", "white", "black", "grayscale"] as const;

export type BasemapFlavor = (typeof BASEMAP_FLAVORS)[number];

export const DEFAULT_BASEMAP_FLAVOR: BasemapFlavor = "light";

export function isBasemapFlavor(value: unknown): value is BasemapFlavor {
  return BASEMAP_FLAVORS.includes(value as BasemapFlavor);
}

/**
 * What reading a PMTiles archive header told us about it. Written by the basemap-archive seam,
 * never by hand in `maplibreConfig.json`.
 */
export interface PmtilesArchiveInfo {
  /** Decided from the archive header `tileType`, never from the file name. */
  kind: "raster" | "vector";
  /** Name of the file the archive was opened from. Absent for URL-backed archives. */
  fileName?: string;
  minZoom: number;
  maxZoom: number;
  bounds: [number, number, number, number];
  /** Read from the archive's own metadata. Absent when the archive carries none — never invented. */
  attribution?: string;
}

/**
 * A basemap read from a PMTiles archive: either a file the user picked (session-only, no `url`)
 * or an archive declared by URL in the config.
 */
export interface MlPmtilesLayerConfig extends BaseMlLayerConfig {
  sourceType: "pmtiles";
  /** URL of a config-declared archive. Absent for archives opened from disk. */
  url?: string;
  /** Protomaps flavour used to style a vector archive. Ignored for raster archives. */
  flavor?: BasemapFlavor;
  /** Label language for the generated Protomaps layers. */
  lang?: string;
  /**
   * Opt-in glyphs URL. Left unset by default so MapLibre rasterises labels locally with TinySDF
   * (see docs/adr/0003-vector-pmtiles-styling.md). Only set it if you run your own glyph server.
   */
  glyphs?: string;
  /** Filled in once the archive header has been read. Until then the layer cannot be rendered. */
  archive?: PmtilesArchiveInfo;
}

/**
 * A basemap read from a mapbundle, which carries its own style, glyphs and sprites.
 *
 * TODO(mapbundle): loading is not implemented — `maplibre-mapbundle-protocol` is not published
 * and has no usable ESM entry point. The type exists so config and the seam are ready for it.
 */
export interface MlMapbundleLayerConfig extends BaseMlLayerConfig {
  sourceType: "mapbundle";
  /** URL of a config-declared bundle. Absent for bundles opened from disk. */
  url?: string;
  /** Name of one of the styles the bundle carries. Defaults to the bundle's own default. */
  style?: string;
}

export type MlLayerConfig =
  | MlStyleLayerConfig
  | MlRasterLayerConfig
  | MlPmtilesLayerConfig
  | MlMapbundleLayerConfig;

export type MlLayerConfigFile = MlLayerConfig[];
