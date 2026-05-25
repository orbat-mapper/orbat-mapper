export const BBOX_SOURCE_ID = "scenarioBboxSource";
export const BBOX_FILL_LAYER_ID = "scenarioBboxFill";
export const BBOX_LINE_LAYER_ID = "scenarioBboxLine";

export function isScenarioBboxLayerId(layerId: string | undefined | null) {
  return layerId === BBOX_FILL_LAYER_ID || layerId === BBOX_LINE_LAYER_ID;
}
