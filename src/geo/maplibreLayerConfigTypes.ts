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

export type MlLayerConfig = MlStyleLayerConfig | MlRasterLayerConfig;

export type MlLayerConfigFile = MlLayerConfig[];
