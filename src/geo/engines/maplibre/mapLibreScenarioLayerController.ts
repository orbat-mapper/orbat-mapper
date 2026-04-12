import { featureCollection } from "@turf/helpers";
import centerOfMass from "@turf/center-of-mass";
import turfCircle from "@turf/circle";
import type { Map as MlMap } from "maplibre-gl";
import { transformExtent } from "ol/proj";
import type { Feature as GeoJsonFeature, Position } from "geojson";
import type {
  RefreshScenarioFeatureLayersOptions,
  ScenarioLayerController,
  ScenarioLayerControllerEvent,
} from "@/geo/contracts/scenarioLayerController";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { TScenario } from "@/scenariostore";
import type { ActionLabel } from "@/scenariostore/newScenarioStore";
import { MapLibreScenarioFeatureManager } from "@/modules/maplibreview/maplibreScenarioFeatures";
import { useSelectedItems } from "@/stores/selectedStore";
import type { ScenarioLayerUpdate } from "@/types/internalModels";
import type { FeatureId, ScenarioMapLayer } from "@/types/scenarioGeoModels";
import {
  isNGeometryLayerItem,
  type NGeometryLayerItem,
} from "@/types/scenarioLayerItems";
import { fixExtent } from "@/utils/geoConvert";

const undoActionLabels: ActionLabel[] = [
  "deleteLayer",
  "moveLayer",
  "updateLayer",
  "batchLayer",
  "moveFeature",
  "deleteFeature",
  "addFeature",
  "updateFeatureGeometry",
  "updateFeature",
];

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

function toCurrentFeature(feature: NGeometryLayerItem): GeoJsonFeature | undefined {
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

function isGeometryLayerItem(
  item: NGeometryLayerItem | undefined,
): item is NGeometryLayerItem {
  return Boolean(item);
}

export function createMapLibreScenarioLayerController(
  mapAdapter: MapAdapter,
): ScenarioLayerController {
  const mlMap = mapAdapter.getNativeMap() as MlMap;
  const { selectedFeatureIds } = useSelectedItems();
  const layerEventHandlers = new Set<(event: ScenarioLayerControllerEvent) => void>();
  let activeScenario: TScenario | null = null;
  let featureManager: MapLibreScenarioFeatureManager | null = null;
  let currentFilterVisible = true;
  let cleanupScenarioBinding = () => {};

  function emitLayerEvent(event: ScenarioLayerControllerEvent) {
    layerEventHandlers.forEach((handler) => handler(event));
  }

  function getFeature(featureId: FeatureId) {
    return activeScenario?.geo.getGeometryLayerItemById(featureId).layerItem;
  }

  function getFeatureCollection(featureIds: FeatureId[]) {
    const features = featureIds
      .map((featureId) => getFeature(featureId))
      .filter(isGeometryLayerItem)
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
    const fullLayer = activeScenario?.geo.getFullLayerItemsLayer(layerId);
    if (!fullLayer) return;
    const items = fullLayer.items.filter(isNGeometryLayerItem);
    const visible = items.filter((item) => !item._hidden);
    const picked = (visible.length ? visible : items).map((item) => item.id);
    zoomToFeatures(picked);
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

  function refreshScenarioFeatureLayers(
    options: RefreshScenarioFeatureLayersOptions = {},
  ) {
    if (options.filterVisible !== undefined) {
      currentFilterVisible = options.filterVisible;
    }
    if (!activeScenario || !featureManager) return;
    featureManager.refresh(activeScenario.geo.layerItemsLayers.value, {
      doClearCache: options.doClearCache ?? false,
      filterVisible: currentFilterVisible,
    });
  }

  function refreshAfterFeatureUpdate(_featureId: FeatureId) {
    refreshScenarioFeatureLayers({ doClearCache: false });
  }

  function emitScenarioLayerVisibility(layerId: FeatureId, data: ScenarioLayerUpdate) {
    if (data.isHidden === undefined) return;
    emitLayerEvent({
      type: "scenario-layer-visibility-changed",
      layerId,
      isHidden: data.isHidden,
    });
  }

  function bindScenario(scenario: TScenario) {
    cleanupScenarioBinding();
    activeScenario = scenario;
    featureManager = new MapLibreScenarioFeatureManager(
      mlMap,
      () => selectedFeatureIds.value,
    );
    refreshScenarioFeatureLayers({ doClearCache: true, filterVisible: true });

    const onStyleLoad = () => {
      refreshScenarioFeatureLayers({ doClearCache: true });
    };
    mlMap.on("style.load", onStyleLoad);

    const cleanupMapLayers = scenario.geo.onMapLayerEvent((event) => {
      if (event.type === "update") {
        emitLayerEvent({
          type: "map-layer-updated",
          layerId: event.id,
          data: event.data,
        });
      }
    });

    const cleanupFeatureLayers = scenario.geo.onFeatureLayerEvent((event) => {
      switch (event.type) {
        case "removeLayer":
        case "addLayer":
        case "moveLayer":
        case "moveFeature":
          refreshScenarioFeatureLayers({ doClearCache: false });
          break;
        case "updateLayer":
          refreshScenarioFeatureLayers({ doClearCache: false });
          emitScenarioLayerVisibility(event.id, event.data);
          break;
        case "updateFeature":
        case "deleteFeature":
        case "addFeature":
          refreshAfterFeatureUpdate(event.id);
          break;
      }
    });

    const cleanupUndoRedo = scenario.store.onUndoRedo(({ meta }) => {
      if (!meta || !undoActionLabels.includes(meta.label as ActionLabel)) return;
      refreshScenarioFeatureLayers({ doClearCache: false });
    });

    cleanupScenarioBinding = () => {
      cleanupMapLayers.off();
      cleanupFeatureLayers.off();
      cleanupUndoRedo.off();
      mlMap.off("style.load", onStyleLoad);
      featureManager?.destroy();
      featureManager = null;
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
      featureTransform: false,
      mapLayerTransform: false,
      mapLayerExtent: true,
    },
    bindScenario,
    refreshScenarioFeatureLayers,
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
