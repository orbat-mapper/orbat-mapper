import { point as turfPoint } from "@turf/helpers";
import turfCircle from "@turf/circle";
import type { Feature, Position } from "geojson";
import { controlMeasureExtentFeature } from "@/geo/controlMeasures";
import type { ScenarioState } from "@/scenariostore/newScenarioStore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import {
  isNGeometryLayerItem,
  isNPointSymbolLayerItem,
  isNTacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";

/**
 * The shape a layer item is framed by at the current scenario time, for zoom, pan and
 * scenario event locations. Returns null for unknown ids and kinds with no shape.
 */
export function layerItemToGeoJsonFeature(
  state: Pick<ScenarioState, "layerItemMap">,
  featureId: FeatureId,
): Feature | null {
  const item = state.layerItemMap[featureId];
  if (!item) return null;
  // Zoom and pan are shared chrome over every layer-item kind — the same Z/P
  // shortcuts and the same context menu act on whatever is selected. A control
  // measure has no `geometry`, so it frames through its control points instead.
  if (isNTacticalGraphicLayerItem(item)) {
    return controlMeasureExtentFeature(item) ?? null;
  }
  if (isNPointSymbolLayerItem(item)) {
    const position = item._state?.position ?? item.position;
    return { ...turfPoint(position), id: featureId };
  }
  if (!isNGeometryLayerItem(item)) return null;
  const geometry = item._state?.geometry ?? item.geometry;
  if (!geometry) return null;
  const radius = "radius" in item.geometryMeta ? item.geometryMeta.radius : undefined;
  if (typeof radius === "number" && geometry.type === "Point") {
    const circle = turfCircle(geometry.coordinates as Position, radius / 1000, {
      steps: 48,
      units: "kilometers",
    });
    return { ...circle, id: featureId };
  }
  return {
    type: "Feature" as const,
    id: featureId,
    geometry,
    properties: {},
  };
}
