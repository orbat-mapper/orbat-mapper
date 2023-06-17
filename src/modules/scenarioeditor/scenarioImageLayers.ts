import OLMap from "ol/Map";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import LayerGroup from "ol/layer/Group";
import { FeatureId, ScenarioImageLayer } from "@/types/scenarioGeoModels";
import GeoImageLayer from "ol-ext/layer/GeoImage";
import GeoImage from "ol-ext/source/GeoImage";
import { fromLonLat, toLonLat } from "ol/proj";
import { useEventBus } from "@vueuse/core";
import { imageLayerAction } from "@/components/eventKeys";
import { isEmpty } from "ol/extent";

const layersMap = new WeakMap<OLMap, LayerGroup>();

// Responsible for creating and managing the OpenLayers image layers for the scenario editor
export function useScenarioMapLayers(olMap: OLMap) {
  const scn = injectStrict(activeScenarioKey);
  const bus = useEventBus(imageLayerAction);
  const mapLayersGroup = getOrCreateLayerGroup(olMap);

  const { onUndoRedo } = scn.store;

  function initializeFromStore() {
    mapLayersGroup.getLayers().clear();
    scn.geo.mapLayers.value.forEach((mapLayer) => addImageLayer(mapLayer));
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
        scn.geo.updateMapLayer(
          data.id,
          {
            imageCenter: toLonLat(
              newLayer.getSource().getCenter(),
              olMap.getView().getProjection()
            ),
            imageRotate: newLayer.getSource().getRotation(),
            imageScale: newLayer.getSource().getScale(),
          },
          { noEmit: true }
        );
      });
    } else {
      newLayer.setVisible(!(data.isHidden ?? false));
    }
    mapLayersGroup.getLayers().push(newLayer);
  }

  scn.geo.onMapLayerEvent((event) => {
    if (event.type === "add") {
      addImageLayer(event.data);
    }
    if (event.type === "update") {
      const layer = getOlLayerById(event.id) as any;
      if (layer) {
        if (event.data.isHidden !== undefined) {
          layer.setVisible(!event.data.isHidden);
        }
        if (event.data.opacity !== undefined) {
          layer.setOpacity(event.data.opacity);
        }
        if (event.data.imageRotate !== undefined) {
          layer.getSource().setRotation(event.data.imageRotate);
        }
      }
    }
  });

  bus.on(({ action, id }) => {
    const olLayer = getOlLayerById(id);
    if (olLayer) {
      if (action === "zoom") {
        // @ts-ignore
        const layerExtent = olLayer.getSource().getExtent();

        !isEmpty(layerExtent) && layerExtent && olMap.getView().fit(layerExtent);
      }
    }
  });

  onUndoRedo(({ action, meta }) => {
    if (
      !meta ||
      !["addImageLayer", "updateImageLayer", "deleteImageLayer"].includes(meta.label)
    )
      return;
    console.warn("undo/redo for image layers not implemented yet");
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
