import { featureCollection } from "@turf/helpers";
import centerOfMass from "@turf/center-of-mass";
import turfCircle from "@turf/circle";
import { transformExtent } from "ol/proj";
import type { Feature as GeoJsonFeature, Position } from "geojson";
import type {
  RefreshScenarioFeatureLayersOptions,
  ScenarioLayerController,
  ScenarioLayerControllerEvent,
} from "@/geo/contracts/scenarioLayerController";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { TScenario } from "@/scenariostore";
import type {
  FeatureId,
  ScenarioFeature,
  ScenarioMapLayer,
} from "@/types/scenarioGeoModels";
import type { NScenarioFeature } from "@/types/internalModels";
import { fixExtent } from "@/utils/geoConvert";

function normalizeMapLayerExtent(
  extent: number[] | undefined,
): [number, number, number, number] | undefined {
  const fixedExtent = fixExtent(extent);
  if (!fixedExtent) return;
  const [minX, minY, maxX, maxY] = fixedExtent;
  const looksLikeLonLat =
    Math.abs(minX) <= 180 &&
    Math.abs(maxX) <= 180 &&
    Math.abs(minY) <= 90 &&
    Math.abs(maxY) <= 90;
  if (looksLikeLonLat) {
    return fixedExtent as [number, number, number, number];
  }
  return transformExtent(
    fixedExtent as [number, number, number, number],
    "EPSG:3857",
    "EPSG:4326",
  ) as [number, number, number, number];
}

function toCurrentFeature(feature: ScenarioFeature): GeoJsonFeature | undefined {
  const geometry = feature._state?.geometry ?? feature.geometry;
  if (!geometry) return;
  if (feature.meta.radius && geometry.type === "Point") {
    return turfCircle(geometry.coordinates as Position, feature.meta.radius / 1000, {
      steps: 48,
      units: "kilometers",
      properties: feature.properties ?? {},
    }) as GeoJsonFeature;
  }
  return {
    type: "Feature",
    id: feature.id,
    geometry,
    properties: feature.properties ?? {},
  };
}

function getMapLayerCenter(mapLayer: ScenarioMapLayer): Position | undefined {
  if (mapLayer.type === "ImageLayer" && mapLayer.imageCenter) {
    return mapLayer.imageCenter as Position;
  }
  const extent = normalizeMapLayerExtent(mapLayer.extent);
  if (!extent) return;
  return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
}

function isScenarioFeature(
  feature: NScenarioFeature | undefined,
): feature is NScenarioFeature {
  return Boolean(feature);
}

export function createMapLibreScenarioLayerController(
  mapAdapter: MapAdapter,
): ScenarioLayerController {
  const layerEventHandlers = new Set<(event: ScenarioLayerControllerEvent) => void>();
  let activeScenario: TScenario | null = null;
  let cleanupScenarioBinding = () => {};

  function emitLayerEvent(event: ScenarioLayerControllerEvent) {
    layerEventHandlers.forEach((handler) => handler(event));
  }

  function getFeature(featureId: FeatureId) {
    return activeScenario?.geo.getFeatureById(featureId).feature;
  }

  function getFeatureCollection(featureIds: FeatureId[]) {
    const features = featureIds
      .map((featureId) => getFeature(featureId))
      .filter(isScenarioFeature)
      .map(toCurrentFeature)
      .filter((feature): feature is GeoJsonFeature => Boolean(feature));
    if (!features.length) return;
    return featureCollection(features);
  }

  function zoomToFeature(featureId: FeatureId) {
    const collection = getFeatureCollection([featureId]);
    if (!collection) return;
    mapAdapter.fitGeometry(collection, { maxZoom: 15 });
  }

  function zoomToFeatures(featureIds: FeatureId[]) {
    const collection = getFeatureCollection(featureIds);
    if (!collection) return;
    mapAdapter.fitGeometry(collection, { maxZoom: 17 });
  }

  function panToFeature(featureId: FeatureId) {
    const collection = getFeatureCollection([featureId]);
    if (!collection) return;
    const center = centerOfMass(collection);
    mapAdapter.animateView({
      center: center.geometry.coordinates as Position,
      duration: 900,
    });
  }

  function zoomToScenarioLayer(layerId: FeatureId) {
    const layer = activeScenario?.geo.getLayerById(layerId);
    if (!layer) return;
    const visibleFeatureIds = layer.features.filter((featureId) => {
      const feature = activeScenario?.geo.getFeatureById(featureId).feature;
      return feature && !feature._hidden;
    });
    const featureIds = visibleFeatureIds.length ? visibleFeatureIds : layer.features;
    zoomToFeatures(featureIds);
  }

  function zoomToMapLayer(layerId: FeatureId) {
    const mapLayer = activeScenario?.geo.getMapLayerById(layerId);
    if (!mapLayer) return;
    const extent = normalizeMapLayerExtent(mapLayer.extent);
    if (extent) {
      mapAdapter.fitExtent(extent, { maxZoom: 15 });
      return;
    }
    const center = getMapLayerCenter(mapLayer);
    if (center) {
      mapAdapter.animateView({ center, zoom: 12, duration: 900 });
    }
  }

  function bindScenario(scenario: TScenario) {
    cleanupScenarioBinding();
    activeScenario = scenario;

    const cleanupMapLayers = scenario.geo.onMapLayerEvent((event) => {
      if (event.type !== "update") return;
      emitLayerEvent({
        type: "map-layer-updated",
        layerId: event.id,
        data: event.data,
      });
    });

    const cleanupFeatureLayers = scenario.geo.onFeatureLayerEvent((event) => {
      if (event.type !== "updateLayer" || event.data.isHidden === undefined) return;
      emitLayerEvent({
        type: "scenario-layer-visibility-changed",
        layerId: event.id,
        isHidden: event.data.isHidden,
      });
    });

    cleanupScenarioBinding = () => {
      cleanupMapLayers.off();
      cleanupFeatureLayers.off();
      activeScenario = null;
    };

    return cleanupScenarioBinding;
  }

  return {
    capabilities: {
      zoomToFeature: true,
      zoomToFeatureSet: true,
      panToFeature: true,
      zoomToScenarioLayer: true,
      zoomToMapLayer: true,
      mapLayerTransform: false,
      mapLayerExtent: true,
    },
    bindScenario,
    refreshScenarioFeatureLayers(_options: RefreshScenarioFeatureLayersOptions = {}) {},
    zoomToFeature,
    zoomToFeatures,
    panToFeature,
    zoomToScenarioLayer,
    zoomToMapLayer,
    startMapLayerTransform() {},
    endMapLayerTransform() {},
    onLayerEvent(handler) {
      layerEventHandlers.add(handler);
      return () => {
        layerEventHandlers.delete(handler);
      };
    },
  };
}
