import OLMap from "ol/Map";
import { injectStrict, nanoid } from "@/utils";
import { activeFeatureStylesKey, activeScenarioKey } from "@/components/injects";
import LayerGroup from "ol/layer/Group";
import { ScenarioFeatureLayerEvent } from "@/scenariostore/geo";
import { FeatureId, ScenarioImageLayer, ScenarioLayer } from "@/types/scenarioGeoModels";
import { ScenarioLayerUpdate } from "@/types/internalModels";
import { fromLonLat, ProjectionLike } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import {
  createScenarioLayerFeatures,
  getOrCreateLayerGroup,
  LayerTypes,
} from "@/modules/scenarioeditor/scenarioLayers2";
import { ActionLabel } from "@/scenariostore/newScenarioStore";
import VectorSource from "ol/source/Vector";
import { getFeatureAndLayerById } from "@/composables/openlayersHelpers";

const layersMap = new WeakMap<OLMap, LayerGroup>();

const undoActionLabels: ActionLabel[] = [
  "deleteLayer",
  "moveLayer",
  "updateLayer",
  "batchLayer",
  "moveFeature",
  "deleteFeature",
  "addFeature",
  "updateFeatureGeometry",
];

// A composable responsible for keeping scenario feature layers in sync with the OpenLayers map.
export function useScenarioFeatureLayers(olMap: OLMap) {
  const scn = injectStrict(activeScenarioKey);
  const { scenarioFeatureStyle, clearCache, invalidateStyle } =
    injectStrict(activeFeatureStylesKey);

  const olFeatureLayersGroup = getOrCreateLayerGroup(olMap);

  scn.geo.onFeatureLayerEvent(featureLayerEventHandler);

  function featureLayerEventHandler(event: ScenarioFeatureLayerEvent) {
    console.log("FeatureEvent", event);
    switch (event.type) {
      case "removeLayer":
        olDeleteLayer(event.id);
        break;
      case "addLayer":
        olAddLayer(event.id);
        break;
      case "moveLayer":
        moveLayer(event.id);
        break;
      case "updateLayer":
        olUpdateLayer(event.id, event.data);
        break;
      case "updateFeature":
        invalidateStyle(event.id);
        olFeatureLayersGroup.getLayers().forEach((layer) => layer.changed());
        break;
      case "moveFeature":
        initializeFeatureLayersFromStore({ doClearCache: false, filterVisible: false });
        break;
      case "deleteFeature":
        olDeleteFeature(event.id);
        break;

      case "addFeature":
        olAddFeature(event.id);

      default:
        console.warn("Unhandled feature layer event", event);
    }
  }

  scn.store.onUndoRedo(({ meta, action }) => {
    if (!meta || !undoActionLabels.includes(meta.label)) return;
    const { label, value: layerOrFeatureId } = meta;

    if (label === "deleteLayer") {
      if (action === "undo") {
        olDeleteLayer(layerOrFeatureId);
      } else {
        olAddLayer(layerOrFeatureId);
      }
    } else if (label === "moveLayer") {
      moveLayer(layerOrFeatureId);
    } else if (label === "updateLayer") {
      const layer = scn.geo.getLayerById(layerOrFeatureId);
      if (layer) {
        olUpdateLayer(layerOrFeatureId, layer);
      }
    } else if (label === "batchLayer") {
      // FIXME ugly hack
      initializeFeatureLayersFromStore({ doClearCache: true, filterVisible: false });
    } else if (label === "moveFeature") {
      initializeFeatureLayersFromStore({ doClearCache: true, filterVisible: false });
    } else if (label === "updateFeature") {
      invalidateStyle(layerOrFeatureId);
      olFeatureLayersGroup.getLayers().forEach((layer) => layer.changed());
    } else if (label === "deleteFeature") {
      if (action === "undo") {
        olAddFeature(layerOrFeatureId);
      } else {
        olDeleteFeature(layerOrFeatureId);
      }
    } else if (label === "addFeature") {
      if (action === "undo") {
        olDeleteFeature(layerOrFeatureId);
      } else {
        olAddFeature(layerOrFeatureId);
      }
    } else if (label === "updateFeatureGeometry") {
      olDeleteFeature(layerOrFeatureId);
      olAddFeature(layerOrFeatureId);
    }
  });

  function olDeleteLayer(layerId: FeatureId) {
    const layer = getOlLayerById(layerId);
    if (layer) {
      layer.getSource()?.clear();
      olFeatureLayersGroup.getLayers().remove(layer);
    }
  }

  function olAddLayer(layerId: FeatureId) {
    const featureLayer = scn.geo.getFullLayer(layerId);
    featureLayer &&
      olFeatureLayersGroup.getLayers().push(olCreateScenarioFeatureLayer(featureLayer));
  }

  function olUpdateLayer(layerId: FeatureId, data: ScenarioLayerUpdate) {
    const layer = getOlLayerById(layerId);
    if (!layer) {
      olAddLayer(layerId);
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

  function moveLayer(layerId: FeatureId) {
    const layer = getOlLayerById(layerId);
    const newIndex = scn.geo.getLayerIndex(layerId);
    if (!layer) return;

    olFeatureLayersGroup.getLayers().remove(layer);
    olFeatureLayersGroup.getLayers().insertAt(newIndex, layer);
  }

  function olAddFeature(featureId: FeatureId) {
    const { feature } = scn.geo.getFeatureById(featureId);
    const olLayer = getOlLayerById(feature._pid);
    if (!olLayer) return;
    const olFeature = createScenarioLayerFeatures([feature], "EPSG:3837");
    olLayer.getSource()?.addFeatures(olFeature);
  }

  function olDeleteFeature(featureId: FeatureId) {
    const { feature: olFeature, layer } =
      getFeatureAndLayerById(featureId, olFeatureLayersGroup.getLayers() as any) || {};
    if (!(olFeature && layer)) return;
    layer.getSource()?.removeFeature(olFeature);
  }

  function initializeFeatureLayersFromStore(
    options: {
      doClearCache?: boolean;
      filterVisible?: boolean;
    } = {},
  ) {
    const { doClearCache = true, filterVisible = true } = options;
    if (doClearCache) {
      clearCache();
    }
    const olLayers = olFeatureLayersGroup.getLayers();
    olLayers.clear();
    const projection = olMap.getView().getProjection();
    scn.geo.layers.value.forEach((layer) => {
      if (filterVisible && layer._hidden) return;
      const olLayer = olCreateScenarioFeatureLayer(layer, { projection, filterVisible });
      olLayers.push(olLayer);
    });
  }

  function getOlLayerById(layerId: FeatureId) {
    return olFeatureLayersGroup
      .getLayers()
      .getArray()
      .find((e) => e.get("id") === layerId) as VectorLayer<any>;
  }

  function olCreateScenarioFeatureLayer(
    layer: ScenarioLayer,
    options: { projection?: ProjectionLike; filterVisible?: boolean } = {},
  ) {
    const { projection = "EPSG:3837", filterVisible = true } = options;

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: createScenarioLayerFeatures(
          layer.features.filter((f) => !filterVisible || !f._hidden),
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

  return {
    initializeFeatureLayersFromStore,
  };
}

/*
function getOrCreateLayerGroup(olMap: OLMap) {
  if (layersMap.has(olMap)) return layersMap.get(olMap)!;

  const layerGroup = new LayerGroup({
    properties: { id: nanoid(), title: "Scenario feature layers" },
  });
  layersMap.set(olMap, layerGroup);
  olMap.addLayer(layerGroup);
  return layerGroup;
}
*/
