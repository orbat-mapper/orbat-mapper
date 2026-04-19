import turfBuffer from "@turf/buffer";
import { featureCollection } from "@turf/helpers";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  MultiLineString,
  MultiPoint,
  Polygon,
  MultiPolygon,
  Point,
} from "geojson";
import type {
  FullScenarioLayerItemsLayer,
  NGeometryLayerItem,
} from "@/types/scenarioLayerItems";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { RoutingObstacleCollection } from "@/geo/routing/types";

const DEFAULT_LINE_OBSTACLE_BUFFER_METERS = 1;

export interface RoutingObstacleExtractionOptions {
  lineBufferMeters?: number;
  pointBufferMeters?: number;
}

export interface ObstacleSelection {
  layerIds: ReadonlySet<FeatureId>;
  featureIds: ReadonlySet<FeatureId>;
}

type RoutableGeometry =
  | Polygon
  | MultiPolygon
  | LineString
  | MultiLineString
  | Point
  | MultiPoint;

function flattenRoutableGeometries(geometry: Geometry): RoutableGeometry[] {
  switch (geometry.type) {
    case "Polygon":
    case "MultiPolygon":
    case "LineString":
    case "MultiLineString":
    case "Point":
    case "MultiPoint":
      return [geometry];
    case "GeometryCollection":
      return geometry.geometries.flatMap(flattenRoutableGeometries);
    default:
      return [];
  }
}

function toObstacleFeatures(
  item: NGeometryLayerItem,
  geometry: RoutableGeometry,
  layerId: FeatureId,
  suffix: string,
  options: RoutingObstacleExtractionOptions,
): Feature<Polygon | MultiPolygon>[] {
  const baseId = suffix ? `${item.id}${suffix}` : item.id;
  if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
    return [
      {
        type: "Feature",
        id: baseId,
        geometry,
        properties: {
          layerId,
          sourceFeatureId: item.id,
        },
      } satisfies Feature<Polygon | MultiPolygon>,
    ];
  }

  const bufferMeters =
    geometry.type === "Point" || geometry.type === "MultiPoint"
      ? (options.pointBufferMeters ?? 0)
      : Math.max(
          DEFAULT_LINE_OBSTACLE_BUFFER_METERS,
          options.lineBufferMeters ?? DEFAULT_LINE_OBSTACLE_BUFFER_METERS,
        );
  if (bufferMeters <= 0) return [];

  const bufferedFeature: Feature<LineString | MultiLineString | Point | MultiPoint> = {
    type: "Feature",
    geometry,
    properties: {},
  };
  const buffered = turfBuffer(bufferedFeature, bufferMeters, {
    units: "meters",
  }) as
    | Feature<Polygon | MultiPolygon>
    | FeatureCollection<Polygon | MultiPolygon>
    | undefined;
  if (!buffered) return [];

  if (buffered.type === "FeatureCollection") {
    return buffered.features
      .filter(
        (feature): feature is Feature<Polygon | MultiPolygon> =>
          feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon",
      )
      .map((feature, index) => ({
        ...feature,
        id: index === 0 ? baseId : `${baseId}-${index}`,
        properties: {
          ...feature.properties,
          layerId,
          sourceFeatureId: item.id,
        },
      }));
  }

  return [
    {
      ...buffered,
      id: baseId,
      properties: {
        ...buffered.properties,
        layerId,
        sourceFeatureId: item.id,
      },
    } satisfies Feature<Polygon | MultiPolygon>,
  ];
}

function itemToObstacleFeatures(
  item: NGeometryLayerItem,
  layerId: FeatureId,
  options: RoutingObstacleExtractionOptions,
): Feature<Polygon | MultiPolygon>[] {
  const geometry = item._state?.geometry ?? item.geometry;
  const routable = flattenRoutableGeometries(geometry);
  if (routable.length === 0) return [];
  if (routable.length === 1) {
    return toObstacleFeatures(item, routable[0]!, layerId, "", options);
  }
  let includedIndex = 0;
  return routable.flatMap((subGeometry) => {
    const suffix = `:${includedIndex}`;
    const features = toObstacleFeatures(item, subGeometry, layerId, suffix, options);
    if (features.length > 0) {
      includedIndex += 1;
    }
    return features;
  });
}

export function extractRoutingObstacles(
  layers: FullScenarioLayerItemsLayer[],
  selection: ObstacleSelection,
  options: RoutingObstacleExtractionOptions = {},
): RoutingObstacleCollection {
  const features = layers.flatMap((layer) => {
    const layerSelected = selection.layerIds.has(layer.id);
    return layer.items.flatMap((item) => {
      if (item.kind !== "geometry") return [];
      if (!layerSelected && !selection.featureIds.has(item.id)) return [];
      return itemToObstacleFeatures(item, layer.id, options);
    });
  });

  return featureCollection(features);
}
