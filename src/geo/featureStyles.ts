import { Circle as CircleStyle, Style } from "ol/style";
import {
  createSimpleStyle,
  defaultSimplestyleFill,
  defaultSimplestyleStroke,
} from "./simplestyle";
import Feature, { FeatureLike } from "ol/Feature";
import type { FeatureId } from "@/types/scenarioGeoModels";
import { TGeo } from "@/scenariostore";

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

export function useFeatureStyles(geo: TGeo) {
  const styleCache = new Map<any, Style>();

  function clearCache() {
    styleCache.clear();
  }

  function scenarioFeatureStyle(feature: FeatureLike, resolution: number) {
    const featureId = feature.getId() as FeatureId;
    let style = styleCache.get(featureId);
    if (!style) {
      const { feature: scenarioFeature } = geo.getFeatureById(featureId);
      style = createSimpleStyle(scenarioFeature.properties) || defaultStyle;
      // @ts-ignore
      feature.set("_zIndex", scenarioFeature.properties._zIndex, true);
      styleCache.set(featureId, style);
    }
    style.setZIndex(feature.get("_zIndex"));
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
