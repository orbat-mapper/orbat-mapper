import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import {
  createSimpleStyle,
  defaultSimplestyleFill,
  defaultSimplestyleStroke,
} from "./simplestyle";
import { createArrowStyles } from "./arrowStyles";
import type { FeatureLike } from "ol/Feature";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { TGeo } from "@/scenariostore";
import View from "ol/View";
import Geometry from "ol/geom/Geometry";

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
  const styleCache = new Map<any, Style | Style[]>();

  function clearCache() {
    styleCache.clear();
  }

  function scenarioFeatureStyle(
    feature: FeatureLike,
    resolution: number,
    overrideLimitVisibility = false,
  ) {
    const featureId = feature.getId() as FeatureId;
    let cachedStyle = styleCache.get(featureId);
    const { feature: scenarioFeature } = geo.getFeatureById(featureId);
    if (!scenarioFeature) return;

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

    if (!cachedStyle) {
      const baseStyle = createSimpleStyle(scenarioFeature.style || {}) || defaultStyle;
      // @ts-ignore
      feature.set("_zIndex", scenarioFeature.meta._zIndex, true);

      // Create arrow styles if applicable
      const geometry = feature.getGeometry();
      const featureStyle = scenarioFeature.style;
      if (
        geometry instanceof Geometry &&
        (featureStyle["arrow-start"] || featureStyle["arrow-end"])
      ) {
        const arrowStyles = createArrowStyles(geometry, featureStyle);
        if (arrowStyles.length > 0) {
          cachedStyle = [baseStyle, ...arrowStyles];
        } else {
          cachedStyle = baseStyle;
        }
      } else {
        cachedStyle = baseStyle;
      }
      styleCache.set(featureId, cachedStyle);
    }

    if (
      limitVisibility &&
      !overrideLimitVisibility &&
      (resolution > zoomResolutions[minZoom] || resolution < zoomResolutions[maxZoom])
    ) {
      return;
    }

    const stylesArray = Array.isArray(cachedStyle) ? cachedStyle : [cachedStyle];
    const baseStyle = stylesArray[0];

    baseStyle.setZIndex(_zIndex ?? 0);
    if (
      showLabel &&
      resolution < zoomResolutions[textMinZoom] &&
      resolution > zoomResolutions[textMaxZoom]
    ) {
      baseStyle.getText()?.setText(label);
    } else {
      baseStyle.getText()?.setText(undefined);
    }

    // Update arrow z-index
    for (let i = 1; i < stylesArray.length; i++) {
      stylesArray[i].setZIndex((_zIndex ?? 0) + 1);
    }

    return cachedStyle;
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
