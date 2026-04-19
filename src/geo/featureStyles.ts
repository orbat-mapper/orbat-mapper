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
import { isNGeometryLayerItem } from "@/types/scenarioLayerItems";
import { useRoutingStore } from "@/stores/routingStore";
import { isObstacleHighlighted } from "@/geo/routing/obstacleHighlight";
import {
  createFeatureSelectionMarkerStyle,
  createFeatureSelectionStyle,
} from "@/modules/scenarioeditor/featureLayerUtils";

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

const obstacleHighlightStyle = createFeatureSelectionStyle();
const obstacleHighlightMarkerStyle = createFeatureSelectionMarkerStyle();

export function useFeatureStyles(geo: TGeo) {
  const styleCache = new Map<any, { style: Style | Style[]; revision: number }>();
  const routingStore = useRoutingStore();

  function clearCache() {
    styleCache.clear();
  }

  function scenarioFeatureStyle(
    feature: FeatureLike,
    resolution: number,
    overrideLimitVisibility = false,
  ) {
    const featureId = feature.getId() as FeatureId;
    const geometry = feature.getGeometry();
    const revision = (geometry as any)?.getRevision?.() ?? 0;

    let cachedItem = styleCache.get(featureId);
    if (cachedItem && cachedItem.revision !== revision) {
      cachedItem = undefined;
    }
    let cachedStyle = cachedItem?.style;

    const { layerItem } = geo.getLayerItemById(featureId);
    if (!layerItem || !isNGeometryLayerItem(layerItem)) return;
    const scenarioFeature = layerItem;

    const {
      name: label,
      _zIndex,
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
      feature.set("_zIndex", scenarioFeature._zIndex, true);

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
      styleCache.set(featureId, { style: cachedStyle, revision });
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

    const highlighted = isObstacleHighlighted(
      {
        active: routingStore.obstaclePickerOpen,
        layerIds: routingStore.obstacleLayerIds,
        featureIds: routingStore.obstacleFeatureIds,
      },
      featureId,
      scenarioFeature._pid,
    );
    if (highlighted) {
      if (feature.getGeometry()?.getType() === "Point") {
        return [obstacleHighlightMarkerStyle, ...stylesArray];
      }
      obstacleHighlightStyle
        .getStroke()
        ?.setWidth((baseStyle.getStroke()?.getWidth() || 0) + 8);
      return [obstacleHighlightStyle, ...stylesArray];
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
