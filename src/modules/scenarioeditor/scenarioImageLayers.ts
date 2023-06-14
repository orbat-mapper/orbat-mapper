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
export function useScenarioImageLayers(olMap: OLMap) {
  const scn = injectStrict(activeScenarioKey);
  const bus = useEventBus(imageLayerAction);
  const imageLayersGroup = getOrCreateLayerGroup(olMap);

  function initializeFromStore() {
    imageLayersGroup.getLayers().clear();
    scn.geo.imageLayers.value.forEach((imageLayer) => addImageLayer(imageLayer));
  }

  function getOlLayerById(layerId: FeatureId) {
    return imageLayersGroup
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
        scn.geo.updateImageLayer(
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
    imageLayersGroup.getLayers().push(newLayer);
  }

  scn.geo.onImageLayerEvent((event) => {
    if (event.type === "add") {
      addImageLayer(event.data);
    }
    if (event.type === "update") {
      const layer = getOlLayerById(event.id);
      if (layer) {
        if (event.data.isHidden !== undefined) {
          layer.setVisible(!event.data.isHidden);
        }
        if (event.data.opacity !== undefined) {
          layer.setOpacity(event.data.opacity);
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

  return { initializeFromStore };
}

function getOrCreateLayerGroup(olMap: OLMap) {
  if (layersMap.has(olMap)) return layersMap.get(olMap)!;

  const layerGroup = new LayerGroup({
    properties: { id: nanoid(), title: "Image layers" },
  });
  layersMap.set(olMap, layerGroup);
  olMap.addLayer(layerGroup);
  return layerGroup;
}
