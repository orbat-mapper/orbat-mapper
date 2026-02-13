import OLMap from "ol/Map";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import LayerGroup from "ol/layer/Group";
import type {
  FeatureId,
  ScenarioImageLayer,
  ScenarioKMLLayer,
  ScenarioMapLayer,
  ScenarioMapLayerType,
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
import TileJSON from "ol/source/TileJSON";
import { unByKey } from "ol/Observable";
import { fixExtent } from "@/utils/geoConvert";
import {
  IconImage as ImageIcon,
  IconVectorSquare as VectorIcon,
  IconWebBox,
} from "@iconify-prerendered/vue-mdi";
import type {
  ScenarioMapLayerUpdate,
  ScenarioTileJSONLayerUpdate,
} from "@/types/internalModels";
import XYZ from "ol/source/XYZ";
import type { TGeo } from "@/scenariostore";
import {
  type TransformUpdate,
  useImageLayerTransformInteraction,
} from "@/composables/geoImageLayerInteraction";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { KMLZ } from "@/geo/kmlz";
import { imageCache } from "@/importexport/fileHandling";

const layersMap = new WeakMap<OLMap, LayerGroup>();

// Responsible for creating and managing the OpenLayers image layers for the scenario editor
export function useScenarioMapLayers(olMap: OLMap) {
  const scn = injectStrict(activeScenarioKey);
  const bus = useEventBus(imageLayerAction);
  const mapLayersGroup = getOrCreateLayerGroup(olMap);

  const { onUndoRedo } = scn.store;
  const {
    startTransform,
    endTransform,
    isActive: imageTransformIsActive,
  } = useImageLayerTransformInteraction(olMap, {
    updateHandler: handleTransformUpdate,
  });

  function initializeFromStore() {
    mapLayersGroup.getLayers().clear();
    scn.geo.mapLayers.value.forEach((mapLayer) => addLayer(mapLayer.id));
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

    newLayer.getSource().once("change", () => {
      const res = olMap.getView().getResolution() || 1;
      //  scale to resolution of image
      const w = newLayer.getSource().getGeoImage().width as number;
      if (w === 0) return;
      if (!data.imageScale) newLayer.getSource().setScale((res * 96 * 10) / w);
      newLayer.setVisible(!(data.isHidden ?? false));
      const layerExtent = newLayer.getExtent();
      scn.geo.updateMapLayer(
        data.id,
        {
          imageCenter: toLonLat(
            newLayer.getSource().getCenter(),
            olMap.getView().getProjection(),
          ),
          imageRotate: newLayer.getSource().getRotation(),
          imageScale: newLayer.getSource().getScale(),
          extent: layerExtent,
        },
        { noEmit: true, undoable: false },
      );
      scn.geo.updateMapLayer(
        data.id,
        { _status: "initialized", _isNew: false },
        { noEmit: true, undoable: false },
      );
    });

    mapLayersGroup.getLayers().push(newLayer);
  }

  async function addKMLLayer(data: ScenarioKMLLayer) {
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

    const newLayer = new VectorLayer({
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
      { noEmit: true, undoable: false },
    );
    mapLayersGroup.getLayers().push(newLayer);
    newLayer.getSource()?.once("featuresloadend", () => {
      console.log("Loaded KML layer");
      const layerExtent = fixExtent(source.getExtent() ?? undefined);
      console.log("layerExtent", layerExtent);
      layerExtent && !isEmpty(layerExtent) && olMap.getView().fit(layerExtent);
    });
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
      { noEmit: true, undoable: false },
    );

    let key = source.on("change", function () {
      if (source.getState() == "ready") {
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
            newLayer.setExtent(extent);
            dataUpdate.extent = extent;
          }
          if (tileJson?.attribution) {
            dataUpdate.attributions = tileJson.attribution;
          }
          scn.geo.updateMapLayer(data.id, dataUpdate, { noEmit: true, undoable: false });
          scn.geo.updateMapLayer(
            data.id,
            { _status: "initialized", _isNew: false },
            { noEmit: true, undoable: false },
          );
        }
        newLayer.setVisible(!(data.isHidden ?? false));
      } else if (source.getState() == "error") {
        unByKey(key);
        scn.geo.updateMapLayer(
          data.id,
          { _status: "error" },
          { noEmit: true, undoable: false },
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
      { noEmit: true, undoable: false },
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
    if (mapLayer.type === "KMLLayer") addKMLLayer(mapLayer);
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

    if (
      mapLayer.type === "TileJSONLayer" ||
      mapLayer.type === "XYZLayer" ||
      mapLayer.type === "ImageLayer"
    ) {
      if ("url" in data && data.url !== undefined) {
        deleteLayer(layerId);
        addLayer(layerId);
        if (imageTransformIsActive.value) startTransform(layer, layerId);
      }
    }

    if (mapLayer.type === "ImageLayer") {
      const d = data as ScenarioImageLayer;
      if (d.imageCenter !== undefined) {
        layer.getSource().setCenter(fromLonLat(d.imageCenter));
      }
      if (d.imageScale !== undefined) {
        layer.getSource().setScale(d.imageScale);
      }

      if (d.imageRotate !== undefined) {
        layer.getSource().setRotation(d.imageRotate);
      }

      if (d.attributions !== undefined) {
        layer.getSource().setAttributions(d.attributions);
      }
    }
  }

  function moveLayer(layerId: FeatureId) {
    const layer = getOlLayerById(layerId);
    const newIndex = scn.geo.getMapLayerIndex(layerId);
    if (layer) {
      mapLayersGroup.getLayers().remove(layer);
      mapLayersGroup.getLayers().insertAt(newIndex, layer);
    }
  }

  scn.geo.onMapLayerEvent((event) => {
    if (event.type === "add") {
      addLayer(event.id);
    } else if (event.type === "remove") {
      deleteLayer(event.id);
    } else if (event.type === "update") {
      updateLayer(event.id, event.data as ScenarioMapLayerUpdate);
    } else if (event.type === "move") {
      moveLayer(event.id);
    }
  });

  bus.on(({ action, id }) => {
    const olLayer = getOlLayerById(id);
    if (!olLayer) return;
    if (action === "zoom") {
      // @ts-ignore
      let layerExtent = olLayer.getExtent() || olLayer.getSource()?.getExtent?.();
      if (!layerExtent) {
        // @ts-ignore
        layerExtent = olLayer.getSource()?.getTileGrid?.().getExtent();
      }
      layerExtent = fixExtent(layerExtent);
      layerExtent && !isEmpty(layerExtent) && olMap.getView().fit(layerExtent);
    } else if (action === "startTransform") {
      startTransform(olLayer, id);
    } else if (action === "endTransform") {
      endTransform();
    }
  });

  function handleTransformUpdate(v: TransformUpdate) {
    const { id, rotation, center, scale, active } = v;

    scn.geo.updateMapLayer(
      id,
      { imageRotate: rotation, imageCenter: toLonLat(center), imageScale: scale },
      { emitOnly: active, undoable: !active },
    );
  }

  onUndoRedo(({ action, meta }) => {
    if (
      !meta ||
      !["addMapLayer", "updateMapLayer", "deleteMapLayer", "moveMapLayer"].includes(
        meta.label,
      )
    )
      return;
    const { label, value: layerId } = meta;
    if (label === "addMapLayer") {
      if (action === "undo") {
        if (imageTransformIsActive.value) endTransform();
        deleteLayer(layerId);
      } else {
        addLayer(layerId);
      }
    } else if (label === "deleteMapLayer") {
      if (action === "undo") {
        addLayer(layerId);
      } else {
        if (imageTransformIsActive.value) endTransform();
        deleteLayer(layerId);
      }
    } else if (label === "updateMapLayer") {
      const data = scn.geo.getMapLayerById(layerId);
      updateLayer(layerId, data);
      if (imageTransformIsActive.value) {
        const olLayer = getOlLayerById(layerId);
        startTransform(olLayer, layerId);
      }
    } else if (label === "moveMapLayer") {
      moveLayer(layerId);
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
  if (mapLayer.type === "KMLLayer") return VectorIcon;
  if (mapLayer.type === "TileJSONLayer" || mapLayer.type === "XYZLayer")
    return IconWebBox;
  return ImageIcon;
}

export function addMapLayer(
  layerType: ScenarioMapLayerType,
  geo: TGeo,
): ScenarioMapLayer {
  let newLayer: ScenarioMapLayer;
  if (layerType === "TileJSONLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "TileJSONLayer",
      name: "New TileJSON map layer",
      url: "",
      _status: "uninitialized",
      _isNew: true,
    });
  } else if (layerType === "XYZLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "XYZLayer",
      name: "New XYZ map layer",
      url: "",
      _status: "uninitialized",
      _isNew: true,
    });
  } else if (layerType === "ImageLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "ImageLayer",
      name: "New image layer",
      url: "",
      attributions: "",
      _status: "uninitialized",
      _isNew: true,
    });
  } else {
    throw new Error(`Unknown layer type ${layerType}`);
  }

  return newLayer;
}
