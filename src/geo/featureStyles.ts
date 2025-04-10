import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import {
  createSimpleStyle,
  defaultSimplestyleFill,
  defaultSimplestyleStroke,
} from "./simplestyle";
import type { FeatureLike } from "ol/Feature";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { TGeo } from "@/scenariostore";
import View from "ol/View";

let zoomResolutions: number[] = [];

function calculateZoomToResolution(view: View) {
  zoomResolutions = [];
  for (let i = 0; i <= 24; i++) {
    zoomResolutions.push(view.getResolutionForZoom(i));
  }
}

calculateZoomToResolution(new View());

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

  function scenarioFeatureStyle(
    feature: FeatureLike,
    resolution: number,
    overrideLimitVisibility = false,
  ) {
    const featureId = feature.getId() as FeatureId;
    let style = styleCache.get(featureId);
    const { feature: scenarioFeature } = geo.getFeatureById(featureId);
    const {
      meta: { name: label, _zIndex },
      style: {
        showLabel = false,
        limitVisibility,
        minZoom = 0,
        maxZoom = 24,
        textMinZoom = 0,
        textMaxZoom = 24,
      },
    } = scenarioFeature;
    if (!style) {
      style = createSimpleStyle(scenarioFeature.style || {}) || defaultStyle;
      // @ts-ignore
      feature.set("_zIndex", scenarioFeature.meta._zIndex, true);
      styleCache.set(featureId, style);
    }
    if (
      limitVisibility &&
      !overrideLimitVisibility &&
      (resolution > zoomResolutions[minZoom] || resolution < zoomResolutions[maxZoom])
    ) {
      return;
    }
    style.setZIndex(_zIndex ?? 0);
    if (
      showLabel &&
      resolution < zoomResolutions[textMinZoom] &&
      resolution > zoomResolutions[textMaxZoom]
    ) {
      style.getText()?.setText(label);
    } else {
      style.getText()?.setText(undefined);
    }
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
