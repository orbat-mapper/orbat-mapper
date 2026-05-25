export const BBOX_SOURCE_ID = "scenarioBboxSource";
export const BBOX_FILL_LAYER_ID = "scenarioBboxFill";
export const BBOX_LINE_LAYER_ID = "scenarioBboxLine";

export const MAX_EXTENT_SOURCE_ID = "mapSettingsExtentSource";
export const MAX_EXTENT_FILL_LAYER_ID = "mapSettingsExtentFill";
export const MAX_EXTENT_LINE_LAYER_ID = "mapSettingsExtentLine";

export function isScenarioBboxLayerId(layerId: string | undefined | null) {
  return (
    layerId === BBOX_FILL_LAYER_ID ||
    layerId === BBOX_LINE_LAYER_ID ||
    layerId === MAX_EXTENT_FILL_LAYER_ID ||
    layerId === MAX_EXTENT_LINE_LAYER_ID
  );
}
