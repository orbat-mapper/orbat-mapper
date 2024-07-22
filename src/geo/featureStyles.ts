import { Circle as CircleStyle, Style } from "ol/style";
import {
  createSimpleStyle,
  defaultSimplestyleFill,
  defaultSimplestyleStroke,
} from "./simplestyle";
import { FeatureLike } from "ol/Feature";
import type { FeatureId } from "@/types/scenarioGeoModels";
import { TGeo } from "@/scenariostore";

const defaultStyle = new Style({
  stroke: defaultSimplestyleStroke,
  fill: defaultSimplestyleFill,
  image: new CircleStyle({
    fill: defaultSimplestyleFill,
    stroke: defaultSimplestyleStroke,
    radius: 5,
  }),
});

export function useFeatureStyles(geo: TGeo) {
  const styleCache = new Map<any, Style>();

  function clearCache() {
    styleCache.clear();
  }

  function scenarioFeatureStyle(feature: FeatureLike, resolution: number) {
    const featureId = feature.getId() as FeatureId;
    let style = styleCache.get(featureId);
    const { feature: scenarioFeature } = geo.getFeatureById(featureId);
    const {
      meta: { name: label },
      style: { showLabel = false },
    } = scenarioFeature;
    if (!style) {
      style = createSimpleStyle(scenarioFeature.style || {}) || defaultStyle;
      // @ts-ignore
      feature.set("_zIndex", scenarioFeature.meta._zIndex, true);
      styleCache.set(featureId, style);
    }
    style.setZIndex(feature.get("_zIndex"));
    style.getText()?.setText(showLabel && resolution < 1200 ? label : undefined);
    return style;
  }

  function invalidateStyle(featureId: FeatureId) {
    styleCache.delete(featureId);
  }

  return {
    clearCache,
    scenarioFeatureStyle,
    invalidateStyle,
  };
}

export type UseFeatureStyles = ReturnType<typeof useFeatureStyles>;
