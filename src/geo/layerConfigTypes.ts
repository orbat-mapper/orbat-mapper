/**
 * Types for layer configuration loaded from the mapConfig.json file.
 *
 * ORBAT Mapper uses OpenLayers for its mapping functionality and most of the layer configuration
 * is passed directly to OpenLayers.
 */
import type { Options as XYZOptions } from "ol/source/XYZ";
import type { Options as OSMOptions } from "ol/source/OSM";
import type { Options as TileLayerOptions } from "ol/layer/BaseTile";

/**
 * Base configuration for a layer.
 *
 * See https://openlayers.org/en/latest/apidoc/module-ol_layer_Base-BaseLayer.html for
 * available tile layer options.
 */
interface BaseLayerConfig {
  title: string; // Display name for the layer
  name: string; // Unique identifier for the layer
  layerSourceType?: "osm" | "xyz";
  layerType?: "baselayer";
  tileLayerOptions?: Exclude<TileLayerOptions<any>, "source" | "map" | "properties">;
}

/**
 * Configuration for a XYZ layer.
 *
 * See https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html for available
 * source options.
 */
interface XYZLayerConfig extends BaseLayerConfig {
  layerSourceType: "xyz";
  sourceOptions: XYZOptions;
}

/**
 * Configuration for a OSM layer.
 *
 * See https://openlayers.org/en/latest/apidoc/module-ol_source_OSM-OSM.html for available
 * source options.
 */
interface OSMLayerConfig extends BaseLayerConfig {
  layerSourceType: "osm";
  sourceOptions: OSMOptions;
}

export type LayerConfig = XYZLayerConfig | OSMLayerConfig;
export type LayerConfigFile = LayerConfig[];
