import OLMap from "ol/Map";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import LayerGroup from "ol/layer/Group";
import {
  FeatureId,
  ScenarioImageLayer,
  ScenarioMapLayer,
  ScenarioTileJSONLayer,
  ScenarioXYZLayer,
} from "@/types/scenarioGeoModels";
import GeoImageLayer from "ol-ext/layer/GeoImage";
import GeoImage from "ol-ext/source/GeoImage";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import { useEventBus } from "@vueuse/core";
import { imageLayerAction } from "@/components/eventKeys";
import { isEmpty } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import { TileJSON } from "ol/source";
import { unByKey } from "ol/Observable";
import { fixExtent } from "@/utils/geoConvert";
import { IconImage as ImageIcon, IconWebBox } from "@iconify-prerendered/vue-mdi";
import {
  ScenarioMapLayerUpdate,
  ScenarioTileJSONLayerUpdate,
} from "@/types/internalModels";
import XYZ from "ol/source/XYZ";

const layersMap = new WeakMap<OLMap, LayerGroup>();

// Responsible for creating and managing the OpenLayers image layers for the scenario editor
export function useScenarioMapLayers(olMap: OLMap) {
  const scn = injectStrict(activeScenarioKey);
  const bus = useEventBus(imageLayerAction);
  const mapLayersGroup = getOrCreateLayerGroup(olMap);

  const { onUndoRedo } = scn.store;

  function initializeFromStore() {
    mapLayersGroup.getLayers().clear();
    scn.geo.mapLayers.value.forEach((mapLayer) => {
      if (mapLayer.type === "ImageLayer") addImageLayer(mapLayer);
      if (mapLayer.type === "TileJSONLayer") addTileJSONLayer(mapLayer);
    });
  }

  function getOlLayerById(layerId: FeatureId) {
    return mapLayersGroup
      .getLayers()
      .getArray()
      .find((e) => e.get("id") === layerId);
  }

  function addImageLayer(data: ScenarioImageLayer) {
    const imageCenter = data.imageCenter
      ? fromLonLat(data.imageCenter, olMap.getView().getProjection())
      : olMap.getView().getCenter();
    const newLayer = new GeoImageLayer({
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
    if (!data.imageScale) {
      newLayer.getSource().once("change", () => {
        const res = olMap.getView().getResolution() || 1;
        //  scale to resolution of image
        const w = newLayer.getSource().getGeoImage().width as number;
        newLayer.getSource().setScale((res * 96 * 10) / w);
        newLayer.setVisible(true);
        const layerExtent = newLayer.getExtent();
        scn.geo.updateMapLayer(
          data.id,
          {
            imageCenter: toLonLat(
              newLayer.getSource().getCenter(),
              olMap.getView().getProjection()
            ),
            imageRotate: newLayer.getSource().getRotation(),
            imageScale: newLayer.getSource().getScale(),
            extent: layerExtent,
          },
          { noEmit: true }
        );
      });
    } else {
      newLayer.setVisible(!(data.isHidden ?? false));
    }
    mapLayersGroup.getLayers().push(newLayer);
  }

  function addTileJSONLayer(data: ScenarioTileJSONLayer) {
    if (!data.url) {
      console.warn("Missing url for tile layer");
      return;
    }
    const source = new TileJSON({
      url: data.url,
      crossOrigin: "anonymous",
    });
    const newLayer = new TileLayer({
      opacity: data.opacity ?? 0.7,
      visible: false,
      source,
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });
    scn.geo.updateMapLayer(
      data.id,
      { _status: "loading" },
      { noEmit: true, undoable: false }
    );

    let key = source.on("change", function () {
      if (source.getState() == "ready") {
        unByKey(key);
        const tileJson = source.getTileJSON();
        const dataUpdate: ScenarioTileJSONLayerUpdate = {};
        if (tileJson?.bounds) {
          const extent = fixExtent(
            transformExtent(tileJson.bounds, "EPSG:4326", olMap.getView().getProjection())
          );
          if (extent && !isEmpty(extent)) {
            newLayer.setExtent(extent);
            dataUpdate.extent = extent;
          }
          if (tileJson?.attribution) {
            dataUpdate.attributions = tileJson.attribution;
          }
          scn.geo.updateMapLayer(data.id, dataUpdate, { noEmit: true, undoable: false });
          scn.geo.updateMapLayer(
            data.id,
            { _status: "initialized" },
            { noEmit: true, undoable: false }
          );
        }
        newLayer.setVisible(!(data.isHidden ?? false));
      } else if (source.getState() == "error") {
        unByKey(key);
        scn.geo.updateMapLayer(
          data.id,
          { _status: "error" },
          { noEmit: true, undoable: false }
        );
        mapLayersGroup.getLayers().remove(newLayer);
      }
    });
    mapLayersGroup.getLayers().push(newLayer);
  }
  function addXYZLayer(data: ScenarioXYZLayer) {
    if (!data.url) {
      console.warn("Missing url for tile layer");
      return;
    }
    const source = new XYZ({
      url: data.url,
      attributions: data.attributions,
    });

    const newLayer = new TileLayer({
      opacity: data.opacity ?? 0.7,
      visible: !(data.isHidden ?? false),
      source,
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });
    scn.geo.updateMapLayer(
      data.id,
      { _status: "initialized" },
      { noEmit: true, undoable: false }
    );

    mapLayersGroup.getLayers().push(newLayer);
  }

  function deleteLayer(layerId: FeatureId) {
    const layer = getOlLayerById(layerId);
    if (layer) {
      // @ts-ignore
      layer.getSource?.().clear?.();
      mapLayersGroup.getLayers().remove(layer);
    }
  }

  function addLayer(layerId: FeatureId) {
    const mapLayer = scn.geo.getMapLayerById(layerId);
    if (mapLayer.type === "ImageLayer") addImageLayer(mapLayer);
    if (mapLayer.type === "TileJSONLayer") addTileJSONLayer(mapLayer);
    if (mapLayer.type === "XYZLayer") addXYZLayer(mapLayer);
  }

  function updateLayer(layerId: FeatureId, data: ScenarioMapLayerUpdate) {
    const mapLayer = scn.geo.getMapLayerById(layerId);
    const layer = getOlLayerById(layerId) as any;
    if (!layer) {
      addLayer(layerId);
      return;
    }

    if (data.isHidden !== undefined) {
      layer.setVisible(!data.isHidden);
    }
    if (data.opacity !== undefined) {
      layer.setOpacity(data.opacity);
    }

    if (mapLayer.type === "TileJSONLayer" || mapLayer.type === "XYZLayer") {
      if ("url" in data && data.url !== undefined) {
        deleteLayer(layerId);
        addLayer(layerId);
      }
    }

    if (mapLayer.type === "ImageLayer") {
      const d = data as ScenarioImageLayer;
      if (d.imageRotate !== undefined) {
        layer.getSource().setRotation(d.imageRotate);
      }
    }
  }

  scn.geo.onMapLayerEvent((event) => {
    if (event.type === "add") {
      addLayer(event.id);
    } else if (event.type === "remove") {
      deleteLayer(event.id);
    } else if (event.type === "update") {
      updateLayer(event.id, event.data as ScenarioMapLayerUpdate);
    }
  });

  bus.on(({ action, id }) => {
    const olLayer = getOlLayerById(id);
    if (olLayer) {
      if (action === "zoom") {
        // @ts-ignore
        let layerExtent = olLayer.getExtent() || olLayer.getSource()?.getExtent?.();
        if (!layerExtent) {
          // @ts-ignore
          layerExtent = olLayer.getSource()?.getTileGrid?.().getExtent();
        }
        layerExtent = fixExtent(layerExtent);
        layerExtent && !isEmpty(layerExtent) && olMap.getView().fit(layerExtent);
      }
    }
  });

  onUndoRedo(({ action, meta }) => {
    if (
      !meta ||
      !["addMapLayer", "updateMapLayer", "deleteMapLayer"].includes(meta.label)
    )
      return;
    const { label, value: layerId } = meta;
    if (label === "addMapLayer") {
      if (action === "undo") {
        deleteLayer(layerId);
      } else {
        addLayer(layerId);
      }
    } else if (label === "deleteMapLayer") {
      if (action === "undo") {
        addLayer(layerId);
      } else {
        deleteLayer(layerId);
      }
    } else if (label === "updateMapLayer") {
      const data = scn.geo.getMapLayerById(layerId);
      updateLayer(layerId, data);
    }
  });

  return { initializeFromStore };
}

function getOrCreateLayerGroup(olMap: OLMap) {
  if (layersMap.has(olMap)) return layersMap.get(olMap)!;

  const layerGroup = new LayerGroup({
    properties: { id: nanoid(), title: "Map layers" },
  });
  layersMap.set(olMap, layerGroup);
  olMap.addLayer(layerGroup);
  return layerGroup;
}

export function getMapLayerIcon(mapLayer: ScenarioMapLayer) {
  if (mapLayer.type === "ImageLayer") return ImageIcon;
  if (mapLayer.type === "TileJSONLayer") return IconWebBox;
  return ImageIcon;
}
