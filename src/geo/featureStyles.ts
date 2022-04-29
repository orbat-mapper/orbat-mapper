import { Circle as CircleStyle, Style } from "ol/style";
import {
  createSimpleStyle,
  defaultSimplestyleFill,
  defaultSimplestyleStroke,
} from "./simplestyle";
import { FeatureLike } from "ol/Feature";
import { FeatureId } from "../types/scenarioGeoModels";

const styleCache = new Map<any, Style>();

export function clearStyleCache() {
  styleCache.clear();
}

export function invalidateFeatureStyle(featureId: FeatureId) {
  styleCache.delete(featureId);
}

const defaultStyle = new Style({
  stroke: defaultSimplestyleStroke,
  fill: defaultSimplestyleFill,
  image: new CircleStyle({
    fill: defaultSimplestyleFill,
    stroke: defaultSimplestyleStroke,
    radius: 5,
  }),
});

export function scenarioFeatureStyle(feature: FeatureLike, resolution: number) {
  let style = styleCache.get(feature.getId());
  if (!style) {
    style = createSimpleStyle(feature.getProperties()) || defaultStyle;
    styleCache.set(feature.getId(), style);
  }
  style.setZIndex(feature.get("_zIndex"));
  return style;
}
