/**
 * The Atlas basemap style, ported from TacTrace's `src/lib/atlasStyle`. Keep this folder free of
 * app, Vue and Pinia imports, with only types from MapLibre and GeoJSON, so the two stay easy to
 * compare.
 */
export { createAtlasStyle, type AtlasStyle, type AtlasStyleOptions } from "./style";
export {
  DEFAULT_ELEVATION_BAND_PRESET,
  ELEVATION_BAND_LAYER_PREFIX,
  ELEVATION_BAND_PRESETS,
  applyElevationBands,
  elevationBandRamp,
  isElevationBandPreset,
  type ElevationBandPreset,
} from "./elevationBands";
export {
  ALL_ATLAS_LAYER_GROUPS,
  ATLAS_LABEL_CATEGORIES,
  ATLAS_LAYER_GROUPS,
  ATLAS_LAYER_GROUPS_METADATA_KEY,
  applyAtlasLayerGroups,
  canDrawLabelCategory,
  type AtlasLayerGroup,
} from "./layerGroups";
