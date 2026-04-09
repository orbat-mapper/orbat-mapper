import type OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import TileJSON from "ol/source/TileJSON";
import XYZ from "ol/source/XYZ";
import GeoImageLayer from "ol-ext/layer/GeoImage";
import GeoImage from "ol-ext/source/GeoImage";
import { KMLZ } from "@/geo/kmlz";
import { imageCache } from "@/importexport/fileHandling";
import {
  createScenarioLayerItemFeatures,
  getOrCreateLayerGroup,
  LayerTypes,
} from "@/modules/scenarioeditor/featureLayerUtils";
import { useImageLayerTransformInteraction } from "@/composables/geoImageLayerInteraction";
import { activeFeatureStylesKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { fixExtent } from "@/utils/geoConvert";
import type { TScenario } from "@/scenariostore";
import type {
  RefreshScenarioFeatureLayersOptions,
  ScenarioLayerController,
  ScenarioLayerControllerEvent,
} from "@/geo/contracts/scenarioLayerController";
import type {
  FeatureId,
  ScenarioImageLayer,
  ScenarioKMLLayer,
  ScenarioMapLayer,
  ScenarioTileJSONLayer,
  ScenarioXYZLayer,
} from "@/types/scenarioGeoModels";
import type {
  NScenarioLayer,
  ScenarioImageLayerUpdate,
  ScenarioKMLLayerUpdate,
  ScenarioLayerUpdate,
  ScenarioMapLayerUpdate,
  ScenarioTileJSONLayerUpdate,
  ScenarioXYZLayerUpdate,
} from "@/types/internalModels";
import type { ActionLabel } from "@/scenariostore/newScenarioStore";
import type { Position } from "geojson";
import type { ProjectionLike } from "ol/proj";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import { getCenter, isEmpty } from "ol/extent";
import { featureCollection } from "@turf/helpers";
import turfEnvelope from "@turf/envelope";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import SimpleGeometry from "ol/geom/SimpleGeometry";
import { unByKey } from "ol/Observable";
import { getFeatureAndLayerById } from "@/composables/openlayersHelpers";
import {
  type FullScenarioLayerItemsLayer,
  isNGeometryLayerItem,
} from "@/types/scenarioLayerItems";
import {
  isScenarioOverlayLayer,
  isScenarioReferenceLayer,
} from "@/types/scenarioStackLayers";

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

const mapLayerUndoActionLabels = [
  "addMapLayer",
  "updateMapLayer",
  "deleteMapLayer",
  "moveMapLayer",
] as const;

type CleanupHandle = (() => void) | { off: () => void };

function isImageLayer(layer: ScenarioMapLayer): layer is ScenarioImageLayer {
  return layer.type === "ImageLayer";
}

function isKmlLayer(layer: ScenarioMapLayer): layer is ScenarioKMLLayer {
  return layer.type === "KMLLayer";
}

function isTileJsonLayer(layer: ScenarioMapLayer): layer is ScenarioTileJSONLayer {
  return layer.type === "TileJSONLayer";
}

function isXyzLayer(layer: ScenarioMapLayer): layer is ScenarioXYZLayer {
  return layer.type === "XYZLayer";
}

function runCleanup(cleanup: CleanupHandle | undefined) {
  if (!cleanup) return;
  if (typeof cleanup === "function") cleanup();
  else cleanup.off();
}

export function useOlScenarioLayerController(olMap: OLMap): ScenarioLayerController {
  const { scenarioFeatureStyle, clearCache, invalidateStyle } =
    injectStrict(activeFeatureStylesKey);
  const scenarioLayersGroup = getOrCreateLayerGroup(olMap);
  const layerEventHandlers = new Set<(event: ScenarioLayerControllerEvent) => void>();

  const {
    startTransform,
    endTransform,
    isActive: imageTransformIsActive,
  } = useImageLayerTransformInteraction(olMap, {
    updateHandler: handleTransformUpdate,
  });

  let activeScenario: TScenario | null = null;
  let cleanupScenarioBinding: () => void = () => {};
  const visibilityEventKeys = new Map<FeatureId, any>();

  function emitLayerEvent(event: ScenarioLayerControllerEvent) {
    layerEventHandlers.forEach((handler) => handler(event));
  }

  function clearScenarioLayerVisibilityListeners() {
    visibilityEventKeys.forEach((key) => unByKey(key));
    visibilityEventKeys.clear();
  }

  function addScenarioLayerVisibilityListener(layer: VectorLayer<any>) {
    const layerId = layer.get("id") as FeatureId | undefined;
    if (!layerId) return;
    if (visibilityEventKeys.has(layerId)) {
      unByKey(visibilityEventKeys.get(layerId));
    }
    const key = layer.on("change:visible", () => {
      const isHidden = !layer.getVisible();
      const scenario = activeScenario;
      if (!scenario) return;
      const storedLayer = scenario.geo.getLayerById(layerId);
      if (storedLayer?.isHidden === isHidden) return;
      scenario.geo.updateLayer(layerId, { isHidden }, { undoable: false });
      emitLayerEvent({ type: "scenario-layer-visibility-changed", layerId, isHidden });
    });
    visibilityEventKeys.set(layerId, key);
  }

  function initializeScenarioLayerListeners() {
    clearScenarioLayerVisibilityListeners();
    scenarioLayersGroup.getLayers().forEach((layer) => {
      addScenarioLayerVisibilityListener(layer as VectorLayer<any>);
    });
  }

  function getScenarioLayersCollection() {
    return scenarioLayersGroup.getLayers() as any;
  }

  function getScenarioOlLayerById(layerId: FeatureId) {
    return getScenarioLayersCollection()
      .getArray()
      .find((layer: VectorLayer<any>) => layer.get("id") === layerId) as
      | VectorLayer<any>
      | undefined;
  }

  function getMapOlLayerById(layerId: FeatureId) {
    return getScenarioLayersCollection()
      .getArray()
      .find((layer: any) => layer.get("id") === layerId);
  }

  function refreshManagedLayers(options: RefreshScenarioFeatureLayersOptions = {}) {
    const scenario = activeScenario;
    if (!scenario) return;
    const { doClearCache = true, filterVisible = true } = options;
    if (doClearCache) {
      clearCache();
    }
    const olLayers = getScenarioLayersCollection();
    olLayers.clear();
    const projection = olMap.getView().getProjection();
    scenario.geo.stackLayers.value.forEach((layer: any) => {
      if (isScenarioOverlayLayer(layer)) {
        const fullLayer = scenario.geo.getFullLayerItemsLayer(layer.id);
        if (!fullLayer) return;
        if (filterVisible && fullLayer._hidden) return;
        const olLayer = createScenarioFeatureLayer(fullLayer, {
          projection,
          filterVisible,
        });
        olLayers.push(olLayer);
        addScenarioLayerVisibilityListener(olLayer);
        return;
      }
      if (isScenarioReferenceLayer(layer)) {
        const olLayer = createReferenceLayer(layer.id);
        if (olLayer) {
          olLayers.push(olLayer);
        }
      }
    });
  }

  function refreshScenarioFeatureLayers(
    options: RefreshScenarioFeatureLayersOptions = {},
  ) {
    refreshManagedLayers(options);
  }

  function createScenarioFeatureLayer(
    layer: FullScenarioLayerItemsLayer,
    options: { projection?: ProjectionLike; filterVisible?: boolean } = {},
  ) {
    const { projection = "EPSG:3857", filterVisible = true } = options;
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: createScenarioLayerItemFeatures(
          layer.items.filter(
            (layerItem) =>
              isNGeometryLayerItem(layerItem) && (!filterVisible || !layerItem._hidden),
          ),
          projection,
        ),
      }),
      style: scenarioFeatureStyle,
      properties: {
        id: layer.id,
        title: layer.name,
        layerType: LayerTypes.scenarioFeature,
      },
      updateWhileInteracting: true,
      updateWhileAnimating: true,
    });
    if (layer.isHidden) vectorLayer.setVisible(false);
    return vectorLayer;
  }

  function deleteScenarioLayer(layerId: FeatureId) {
    const layer = getScenarioOlLayerById(layerId);
    if (!layer) return;
    layer.getSource()?.clear();
    getScenarioLayersCollection().remove(layer);
    const key = visibilityEventKeys.get(layerId);
    if (key) {
      unByKey(key);
      visibilityEventKeys.delete(layerId);
    }
  }

  function addScenarioLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    if (!scenario) return;
    const featureLayer = scenario.geo.getFullLayerItemsLayer(layerId);
    if (!featureLayer) return;
    const olLayer = createScenarioFeatureLayer(featureLayer);
    getScenarioLayersCollection().push(olLayer);
    addScenarioLayerVisibilityListener(olLayer);
  }

  function updateScenarioLayer(layerId: FeatureId, data: ScenarioLayerUpdate) {
    const layer = getScenarioOlLayerById(layerId);
    if (!layer) {
      addScenarioLayer(layerId);
      return;
    }
    if (data.isHidden !== undefined) {
      layer.setVisible(!data.isHidden);
    }
    if (data.opacity !== undefined) {
      layer.setOpacity(data.opacity);
    }
    if (data.attributions !== undefined) {
      layer.getSource()?.setAttributions(data.attributions);
    }
    if (data.name !== undefined) {
      layer.set("title", data.name);
    }
  }

  function moveScenarioLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    const layer = getScenarioOlLayerById(layerId);
    if (!(scenario && layer)) return;
    const newIndex = scenario.geo.getLayerIndex(layerId);
    const layers = getScenarioLayersCollection();
    layers.remove(layer);
    layers.insertAt(newIndex, layer);
  }

  function addScenarioFeature(featureId: FeatureId) {
    const scenario = activeScenario;
    if (!scenario) return;
    const { layerItem } = scenario.geo.getLayerItemById(featureId);
    if (!layerItem) return;
    const olLayer = getScenarioOlLayerById(layerItem._pid);
    if (!olLayer) return;
    const olFeature = createScenarioLayerItemFeatures([layerItem], "EPSG:3857");
    olLayer.getSource()?.addFeatures(olFeature);
  }

  function deleteScenarioFeature(featureId: FeatureId) {
    const { feature, layer } =
      getFeatureAndLayerById(featureId, getScenarioLayersCollection()) || {};
    if (!(feature && layer)) return;
    layer.getSource()?.removeFeature(feature);
  }

  function addImageLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    if (!scenario) return;
    const data = scenario.geo.getMapLayerById(layerId);
    if (!(data && isImageLayer(data))) return;
    const imageCenter = data.imageCenter
      ? fromLonLat(data.imageCenter, olMap.getView().getProjection())
      : olMap.getView().getCenter();
    const layer = new GeoImageLayer({
      name: data.name,
      opacity: data.opacity ?? 0.7,
      visible: false,
      source: new GeoImage({
        url: data.url,
        imageCenter,
        imageScale: data.imageScale ?? [1, 1],
        imageRotate: data.imageRotate ?? 0,
        attributions: data.attributions,
      }),
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });

    layer.getSource().once("change", () => {
      const currentScenario = activeScenario;
      if (!currentScenario) return;
      const res = olMap.getView().getResolution() || 1;
      const width = layer.getSource().getGeoImage().width as number;
      if (width === 0) return;
      if (!data.imageScale) layer.getSource().setScale((res * 96 * 10) / width);
      layer.setVisible(!(data.isHidden ?? false));
      const extent = layer.getExtent();
      const update: ScenarioImageLayerUpdate = {
        imageCenter: toLonLat(
          layer.getSource().getCenter(),
          olMap.getView().getProjection(),
        ) as Position,
        imageRotate: layer.getSource().getRotation(),
        imageScale: layer.getSource().getScale(),
        extent,
      };
      currentScenario.geo.updateMapLayer(data.id, update, {
        noEmit: true,
        undoable: false,
      });
      emitLayerEvent({ type: "map-layer-updated", layerId: data.id, data: update });
      const statusUpdate: ScenarioMapLayerUpdate = {
        _status: "initialized",
        _isNew: false,
      };
      currentScenario.geo.updateMapLayer(data.id, statusUpdate, {
        noEmit: true,
        undoable: false,
      });
      emitLayerEvent({
        type: "map-layer-updated",
        layerId: data.id,
        data: statusUpdate,
      });
    });

    return layer;
  }

  function addKmlLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    if (!scenario) return;
    const data = scenario.geo.getMapLayerById(layerId);
    if (!(data && isKmlLayer(data))) return;
    if (!data.url) {
      console.warn("Missing url for tile layer");
      return;
    }

    if (data.url.startsWith("blob:")) {
      data._isTemporary = true;
    }

    const format = new KMLZ({
      extractStyles: data.extractStyles ?? false,
      showPointNames: data.showPointNames ?? true,
      crossOrigin: "anonymous",
      iconUrlFunction: (href: string) => {
        const index = window.location.href.lastIndexOf("/");
        if (index !== -1) {
          return imageCache.get(href.slice(index + 1)) || href;
        }
        return href;
      },
    });

    const source = new VectorSource({
      url: data.url,
      format,
    });

    const layer = new VectorLayer({
      opacity: data.opacity ?? 0.7,
      visible: !(data.isHidden ?? false),
      source,
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });

    const statusUpdate: ScenarioMapLayerUpdate = { _status: "initialized" };
    scenario.geo.updateMapLayer(data.id, statusUpdate, {
      noEmit: true,
      undoable: false,
    });
    emitLayerEvent({ type: "map-layer-updated", layerId: data.id, data: statusUpdate });
    layer.getSource()?.once("featuresloadend", () => {
      const extent = fixExtent(source.getExtent());
      if (extent && !isEmpty(extent)) {
        olMap.getView().fit(extent);
      }
    });
    return layer;
  }

  function addTileJsonLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    if (!scenario) return;
    const data = scenario.geo.getMapLayerById(layerId);
    if (!(data && isTileJsonLayer(data))) return;
    if (!data.url) {
      console.warn("Missing url for tile layer");
      return;
    }

    const source = new TileJSON({
      url: data.url,
      crossOrigin: "anonymous",
    });
    const layer = new TileLayer({
      opacity: data.opacity ?? 0.7,
      visible: false,
      source,
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });
    const loadingUpdate: ScenarioMapLayerUpdate = { _status: "loading" };
    scenario.geo.updateMapLayer(data.id, loadingUpdate, {
      noEmit: true,
      undoable: false,
    });
    emitLayerEvent({ type: "map-layer-updated", layerId: data.id, data: loadingUpdate });

    const key = source.on("change", () => {
      const currentScenario = activeScenario;
      if (!currentScenario) return;
      if (source.getState() === "ready") {
        unByKey(key);
        const tileJson = source.getTileJSON();
        const dataUpdate: ScenarioTileJSONLayerUpdate = {};
        if (tileJson?.bounds) {
          const extent = fixExtent(
            transformExtent(
              tileJson.bounds,
              "EPSG:4326",
              olMap.getView().getProjection(),
            ),
          );
          if (extent && !isEmpty(extent)) {
            layer.setExtent(extent);
            dataUpdate.extent = extent;
          }
          if (tileJson.attribution) {
            dataUpdate.attributions = tileJson.attribution;
          }
          currentScenario.geo.updateMapLayer(data.id, dataUpdate, {
            noEmit: true,
            undoable: false,
          });
          emitLayerEvent({
            type: "map-layer-updated",
            layerId: data.id,
            data: dataUpdate,
          });
          const readyUpdate: ScenarioMapLayerUpdate = {
            _status: "initialized",
            _isNew: false,
          };
          currentScenario.geo.updateMapLayer(data.id, readyUpdate, {
            noEmit: true,
            undoable: false,
          });
          emitLayerEvent({
            type: "map-layer-updated",
            layerId: data.id,
            data: readyUpdate,
          });
        }
        layer.setVisible(!(data.isHidden ?? false));
      } else if (source.getState() === "error") {
        unByKey(key);
        const errorUpdate: ScenarioMapLayerUpdate = { _status: "error" };
        currentScenario.geo.updateMapLayer(data.id, errorUpdate, {
          noEmit: true,
          undoable: false,
        });
        emitLayerEvent({
          type: "map-layer-updated",
          layerId: data.id,
          data: errorUpdate,
        });
        getScenarioLayersCollection().remove(layer);
      }
    });
    return layer;
  }

  function addXyzLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    if (!scenario) return;
    const data = scenario.geo.getMapLayerById(layerId);
    if (!(data && isXyzLayer(data))) return;
    if (!data.url) {
      console.warn("Missing url for tile layer");
      return;
    }
    const source = new XYZ({
      url: data.url,
      attributions: data.attributions,
    });

    const layer = new TileLayer({
      opacity: data.opacity ?? 0.7,
      visible: !(data.isHidden ?? false),
      source,
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });
    const statusUpdate: ScenarioMapLayerUpdate = { _status: "initialized" };
    scenario.geo.updateMapLayer(data.id, statusUpdate, {
      noEmit: true,
      undoable: false,
    });
    emitLayerEvent({ type: "map-layer-updated", layerId: data.id, data: statusUpdate });
    return layer;
  }

  function createReferenceLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    if (!scenario) return;
    const mapLayer = scenario.geo.getMapLayerById(layerId);
    if (!mapLayer) return;
    if (mapLayer.type === "ImageLayer") return addImageLayer(layerId);
    if (mapLayer.type === "TileJSONLayer") return addTileJsonLayer(layerId);
    if (mapLayer.type === "XYZLayer") return addXyzLayer(layerId);
    if (mapLayer.type === "KMLLayer") return addKmlLayer(layerId);
  }

  function deleteMapLayer(layerId: FeatureId) {
    const layer = getMapOlLayerById(layerId) as any;
    if (!layer) return;
    layer.getSource?.().clear?.();
    getScenarioLayersCollection().remove(layer);
  }

  function updateMapLayer(layerId: FeatureId, data: ScenarioMapLayerUpdate) {
    const scenario = activeScenario;
    if (!scenario) return;
    const mapLayer = scenario.geo.getMapLayerById(layerId);
    if (!mapLayer) return;
    const layer = getMapOlLayerById(layerId) as any;
    if (!layer) {
      refreshManagedLayers({ doClearCache: false, filterVisible: true });
      return;
    }

    if (data.isHidden !== undefined) {
      layer.setVisible(!data.isHidden);
    }
    if (data.opacity !== undefined) {
      layer.setOpacity(data.opacity);
    }

    if (
      mapLayer.type === "TileJSONLayer" ||
      mapLayer.type === "XYZLayer" ||
      mapLayer.type === "ImageLayer"
    ) {
      if ("url" in data && data.url !== undefined) {
        deleteMapLayer(layerId);
        refreshManagedLayers({ doClearCache: false, filterVisible: true });
        if (imageTransformIsActive.value) {
          const updatedLayer = getMapOlLayerById(layerId);
          if (updatedLayer) startTransform(updatedLayer as any, layerId);
        }
        return;
      }
    }

    if (mapLayer.type === "ImageLayer") {
      const imageData = data as ScenarioImageLayerUpdate;
      if (imageData.imageCenter !== undefined) {
        layer.getSource().setCenter(fromLonLat(imageData.imageCenter));
      }
      if (imageData.imageScale !== undefined) {
        layer.getSource().setScale(imageData.imageScale);
      }
      if (imageData.imageRotate !== undefined) {
        layer.getSource().setRotation(imageData.imageRotate);
      }
      if (data.attributions !== undefined) {
        layer.getSource().setAttributions(data.attributions);
      }
    }
  }

  function moveMapLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    const layer = getMapOlLayerById(layerId);
    if (!(scenario && layer)) return;
    const newIndex = scenario.geo.getMapLayerIndex(layerId);
    const layers = getScenarioLayersCollection();
    layers.remove(layer);
    layers.insertAt(newIndex, layer);
  }

  function zoomToFeature(featureId: FeatureId) {
    const { feature } =
      getFeatureAndLayerById(featureId, getScenarioLayersCollection()) || {};
    if (!feature?.getGeometry()) return;
    olMap.getView().fit(feature.getGeometry() as SimpleGeometry, { maxZoom: 15 });
  }

  function zoomToFeatures(featureIds: FeatureId[]) {
    const scenario = activeScenario;
    if (!scenario) return;
    const collection = featureCollection(
      featureIds
        .map((featureId) => scenario.geo.getLayerItemById(featureId).layerItem)
        .filter(isNGeometryLayerItem),
    );
    if (!collection.features.length) return;
    const bboxFeature = new GeoJSON().readFeature(turfEnvelope(collection), {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    }) as Feature<any>;
    if (!bboxFeature) return;
    olMap.getView().fit(bboxFeature.getGeometry(), { maxZoom: 17 });
  }

  function panToFeature(featureId: FeatureId) {
    const { feature } =
      getFeatureAndLayerById(featureId, getScenarioLayersCollection()) || {};
    if (!feature) return;
    const extent = feature.getGeometry()?.getExtent();
    if (!extent) return;
    olMap.getView().animate({ center: getCenter(extent) });
  }

  function zoomToScenarioLayer(layerId: FeatureId) {
    const layer = getScenarioOlLayerById(layerId);
    if (!layer) return;
    const extent = layer.getSource()?.getExtent();
    if (extent && !isEmpty(extent)) {
      olMap.getView().fit(extent);
    }
  }

  function zoomToMapLayer(layerId: FeatureId) {
    const layer = getMapOlLayerById(layerId) as any;
    if (!layer) return;
    let extent = layer.getExtent?.() || layer.getSource?.()?.getExtent?.();
    if (!extent) {
      extent = layer.getSource?.()?.getTileGrid?.().getExtent?.();
    }
    extent = fixExtent(extent);
    if (extent && !isEmpty(extent)) {
      olMap.getView().fit(extent);
    }
  }

  function startMapLayerTransform(layerId: FeatureId) {
    const layer = getMapOlLayerById(layerId);
    if (!layer || !controller.capabilities.mapLayerTransform) return;
    startTransform(layer as any, layerId);
  }

  function handleTransformUpdate(update: {
    id: FeatureId;
    rotation: number;
    center: number[];
    scale: number[];
    active: boolean;
  }) {
    const scenario = activeScenario;
    if (!scenario) return;
    const data: ScenarioImageLayerUpdate = {
      imageRotate: update.rotation,
      imageCenter: toLonLat(update.center) as Position,
      imageScale: update.scale,
    };
    scenario.geo.updateMapLayer(update.id, data, {
      emitOnly: update.active,
      undoable: !update.active,
    });
    emitLayerEvent({
      type: "map-layer-transform",
      layerId: update.id,
      rotation: update.rotation,
      center: data.imageCenter!,
      scale: update.scale,
      active: update.active,
    });
  }

  function bindScenario(scenario: TScenario) {
    cleanupScenarioBinding();
    activeScenario = scenario;
    refreshManagedLayers({ doClearCache: true, filterVisible: true });
    initializeScenarioLayerListeners();

    const cleanups: CleanupHandle[] = [
      scenario.geo.onFeatureLayerEvent((event) => {
        switch (event.type) {
          case "removeLayer":
            deleteScenarioLayer(event.id);
            break;
          case "addLayer":
            addScenarioLayer(event.id);
            break;
          case "moveLayer":
            moveScenarioLayer(event.id);
            break;
          case "updateLayer":
            updateScenarioLayer(event.id, event.data);
            break;
          case "updateFeature":
            deleteScenarioFeature(event.id);
            const updatedFeature = scenario.geo.getGeometryLayerItemById(
              event.id,
            ).layerItem;
            if (updatedFeature && !updatedFeature._hidden) {
              addScenarioFeature(event.id);
            }
            invalidateStyle(event.id);
            getScenarioLayersCollection().forEach((layer: VectorLayer<any>) =>
              layer.changed(),
            );
            break;
          case "moveFeature":
            refreshScenarioFeatureLayers({
              doClearCache: false,
              filterVisible: false,
            });
            break;
          case "deleteFeature":
            deleteScenarioFeature(event.id);
            break;
          case "addFeature":
            addScenarioFeature(event.id);
            break;
        }
      }),
      scenario.geo.onMapLayerEvent((event) => {
        if (event.type === "add") {
          refreshManagedLayers({ doClearCache: false, filterVisible: true });
        } else if (event.type === "remove") {
          refreshManagedLayers({ doClearCache: false, filterVisible: true });
        } else if (event.type === "update") {
          updateMapLayer(event.id, event.data as ScenarioMapLayerUpdate);
        } else if (event.type === "move") {
          moveMapLayer(event.id);
        }
      }),
      scenario.store.onUndoRedo(({ action, meta }) => {
        if (!meta) return;
        const layerId = meta.value;
        if (undoActionLabels.includes(meta.label as ActionLabel)) {
          if (meta.label === "deleteLayer") {
            if (action === "undo") {
              deleteScenarioLayer(layerId);
            } else {
              addScenarioLayer(layerId);
            }
          } else if (meta.label === "moveLayer") {
            moveScenarioLayer(layerId);
          } else if (meta.label === "updateLayer") {
            const layer = scenario.geo.getLayerById(layerId);
            if (layer) updateScenarioLayer(layerId, layer);
          } else if (meta.label === "batchLayer" || meta.label === "moveFeature") {
            refreshScenarioFeatureLayers({
              doClearCache: true,
              filterVisible: false,
            });
          } else if (meta.label === "updateFeature") {
            deleteScenarioFeature(layerId);
            const feature = scenario.geo.getGeometryLayerItemById(layerId).layerItem;
            if (feature && !feature._hidden) {
              addScenarioFeature(layerId);
            }
            invalidateStyle(layerId);
            getScenarioLayersCollection().forEach((layer: VectorLayer<any>) =>
              layer.changed(),
            );
          } else if (meta.label === "deleteFeature") {
            if (action === "undo") {
              addScenarioFeature(layerId);
            } else {
              deleteScenarioFeature(layerId);
            }
          } else if (meta.label === "addFeature") {
            if (action === "undo") {
              deleteScenarioFeature(layerId);
            } else {
              addScenarioFeature(layerId);
            }
          } else if (meta.label === "updateFeatureGeometry") {
            deleteScenarioFeature(layerId);
            addScenarioFeature(layerId);
          }
        }

        if (
          (mapLayerUndoActionLabels as readonly string[]).includes(meta.label) &&
          typeof layerId === "string"
        ) {
          if (meta.label === "addMapLayer") {
            if (action === "undo") {
              if (imageTransformIsActive.value) endTransform();
              refreshManagedLayers({ doClearCache: false, filterVisible: true });
            } else {
              refreshManagedLayers({ doClearCache: false, filterVisible: true });
            }
          } else if (meta.label === "deleteMapLayer") {
            if (action === "undo") {
              refreshManagedLayers({ doClearCache: false, filterVisible: true });
            } else {
              if (imageTransformIsActive.value) endTransform();
              refreshManagedLayers({ doClearCache: false, filterVisible: true });
            }
          } else if (meta.label === "updateMapLayer") {
            const data = scenario.geo.getMapLayerById(layerId);
            if (!data) return;
            updateMapLayer(layerId, data);
            if (imageTransformIsActive.value) {
              const olLayer = getMapOlLayerById(layerId);
              if (olLayer) startTransform(olLayer as any, layerId);
            }
          } else if (meta.label === "moveMapLayer") {
            moveMapLayer(layerId);
          }
        }
      }),
    ];

    cleanupScenarioBinding = () => {
      cleanups.forEach((cleanup) => runCleanup(cleanup));
      clearScenarioLayerVisibilityListeners();
      getScenarioLayersCollection().clear();
      endTransform();
      activeScenario = null;
    };

    return cleanupScenarioBinding;
  }

  const controller: ScenarioLayerController = {
    capabilities: {
      zoomToFeature: true,
      zoomToFeatureSet: true,
      panToFeature: true,
      zoomToScenarioLayer: true,
      zoomToMapLayer: true,
      featureTransform: true,
      mapLayerTransform: true,
      mapLayerExtent: true,
    },
    bindScenario,
    refreshScenarioFeatureLayers,
    zoomToFeature,
    zoomToFeatures,
    panToFeature,
    zoomToScenarioLayer,
    zoomToMapLayer,
    startMapLayerTransform,
    endMapLayerTransform: endTransform,
    onLayerEvent(handler) {
      layerEventHandlers.add(handler);
      return () => {
        layerEventHandlers.delete(handler);
      };
    },
  };

  return controller;
}
