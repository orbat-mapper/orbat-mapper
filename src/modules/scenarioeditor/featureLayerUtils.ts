import { featureCollection } from "@turf/helpers";
import turfCircle from "@turf/circle";
import type { ScenarioFeature } from "@/types/scenarioGeoModels";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import {
  IconLayersOutline,
  IconMapMarker,
  IconVectorCircleVariant,
  IconVectorLine,
  IconVectorTriangle,
  IconMapMarkerMultipleOutline,
  IconVectorPolyline,
} from "@iconify-prerendered/vue-mdi";
import type { ScenarioFeatureActions } from "@/types/constants";
import type { NGeometryLayerItem } from "@/types/internalModels";
import type { MenuItemData } from "@/components/types";
import type { GeometryLayerItem, ScenarioLayerItem } from "@/types/scenarioLayerItems";
import {
  isGeometryLayerItemLike,
  isTacticalGraphicLayerItem,
  toGeometryLayerItemGeoJsonProperties,
} from "@/types/scenarioLayerItems";
import { isSupportedTacticalGraphic } from "@/scenariostore/tacticalGraphics";
import { controlMeasureToGeoJsonFeatures } from "@/importexport/export/controlMeasureGeoJson";

export const LayerTypes = {
  scenarioFeature: "SCENARIO_FEATURE",
  referenceFeature: "REFERENCE_FEATURE",
  units: "UNITS",
  labels: "LABELS",
} as const;

export type LayerType = (typeof LayerTypes)[keyof typeof LayerTypes];

export function isScenarioFeatureLayerType(layerType?: string): boolean {
  return layerType === LayerTypes.scenarioFeature;
}

export function isReferenceFeatureLayerType(layerType?: string): boolean {
  return layerType === LayerTypes.referenceFeature;
}

const geometryIconMap: any = {
  Point: IconMapMarker,
  LineString: IconVectorLine,
  Polygon: IconVectorTriangle,
  Circle: IconVectorCircleVariant,
  GeometryCollection: IconMapMarkerMultipleOutline,
  layer: IconLayersOutline,
  annotation: IconMapMarker,
  // Distinct from LineString's IconVectorLine so a control-measure row is not mistaken
  // for a plain line in the layers panel.
  tacticalGraphic: IconVectorPolyline,
  measurement: IconVectorCircleVariant,
};

export type GeometryFeatureLike =
  GeometryLayerItem | NGeometryLayerItem | ScenarioFeature;

export function getGeometryKind(item: GeometryFeatureLike): string {
  return "geometryMeta" in item ? item.geometryMeta.geometryKind : item.meta.type;
}

export function getGeometryRadius(item: GeometryFeatureLike): number | undefined {
  if (!("geometryMeta" in item)) return item.meta.radius;
  return "radius" in item.geometryMeta ? item.geometryMeta.radius : undefined;
}

export function getGeometryUserData(
  item: GeometryFeatureLike,
): Record<string, unknown> | undefined {
  if ("userData" in item) return item.userData;
  return (
    ((item as ScenarioFeature).properties as Record<string, unknown> | undefined) ??
    undefined
  );
}

export function isGeometryFeatureLike(
  item: ScenarioLayerItem | NGeometryLayerItem | ScenarioFeature,
): item is GeometryFeatureLike {
  return isGeometryLayerItemLike(item);
}

function getItemIconKey(
  item?: ScenarioFeature | NGeometryLayerItem | ScenarioLayerItem,
): string | undefined {
  if (!item) return undefined;
  if (isGeometryLayerItemLike(item)) return getGeometryKind(item as GeometryFeatureLike);
  return "kind" in item ? item.kind : undefined;
}

export function getGeometryIcon(
  feature?: ScenarioFeature | NGeometryLayerItem | ScenarioLayerItem,
) {
  const key = getItemIconKey(feature);
  return (key && geometryIconMap[key]) || geometryIconMap.Polygon;
}

export function getItemsIcon(type: string) {
  return geometryIconMap[type];
}

export const featureMenuItems: MenuItemData<ScenarioFeatureActions>[] = [
  { label: "Zoom to", action: "zoom" },
  { label: "Pan to", action: "pan" },
  { label: "Move up", action: "moveUp" },
  { label: "Move down", action: "moveDown" },
  { label: "Delete", action: "delete" },
  { label: "Duplicate", action: "duplicate" },
  { label: "Copy as GeoJSON", action: "copyAsGeoJson" },
];

export function layerItemsToGeoJsonString(
  items: (ScenarioLayerItem | NGeometryLayerItem | ScenarioFeature)[],
) {
  const features: Feature<Geometry, GeoJsonProperties>[] = [];
  for (const item of items) {
    if (isTacticalGraphicLayerItem(item)) {
      const graphicKind = String(item.graphicKind);
      if (!isSupportedTacticalGraphic(item)) {
        console.warn(
          `Unsupported control measure kind '${graphicKind}' omitted from GeoJSON export.`,
        );
        continue;
      }
      features.push(
        ...controlMeasureToGeoJsonFeatures(item, {
          includeId: true,
          includeGeneratedLabels: true,
        }),
      );
      continue;
    }
    if (!isGeometryFeatureLike(item)) continue;
    const f = item;
    const properties =
      "geometryMeta" in f
        ? toGeometryLayerItemGeoJsonProperties(f)
        : {
            name: f.meta.name,
            description: f.meta.description,
            ...f.properties,
          };
    const radius = getGeometryRadius(f);
    if (
      getGeometryKind(f) === "Circle" &&
      radius !== undefined &&
      f.geometry.type === "Point"
    ) {
      const poly = turfCircle(f.geometry.coordinates, radius, {
        units: "meters",
      });
      features.push({ ...poly, id: f.id, properties });
      continue;
    }
    features.push({
      type: "Feature" as const,
      id: f.id,
      properties,
      geometry: f.geometry,
    });
  }
  const fc = featureCollection(features);
  return JSON.stringify(fc, null, 2);
}
