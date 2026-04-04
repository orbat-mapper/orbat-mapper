import OLMap from "ol/Map";
import { injectStrict, nanoid } from "@/utils";
import { activeFeatureStylesKey, activeScenarioKey } from "@/components/injects";
import type { ScenarioFeatureLayerEvent } from "@/scenariostore/geo";
import type { FeatureId, ScenarioFeatureMeta } from "@/types/scenarioGeoModels";
import type { NGeometryLayerItem, ScenarioLayerUpdate } from "@/types/internalModels";
import { type ProjectionLike, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import {
  createScenarioLayerItemFeatures,
  getOrCreateLayerGroup,
  LayerTypes,
} from "@/modules/scenarioeditor/featureLayerUtils";
import { type ActionLabel } from "@/scenariostore/newScenarioStore";
import VectorSource from "ol/source/Vector";
import { getFeatureAndLayerById, isCircle } from "@/composables/openlayersHelpers";
import Feature from "ol/Feature";
import Circle from "ol/geom/Circle";
import { add as addCoordinate } from "ol/coordinate";
import { getLength } from "ol/sphere";
import LineString from "ol/geom/LineString";
import { point } from "@turf/helpers";
import GeoJSON from "ol/format/GeoJSON";
import {
  type FullScenarioLayerItemsLayer,
  type GeometryLayerItem,
  isNGeometryLayerItem,
} from "@/types/scenarioLayerItems";

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

// A composable responsible for keeping scenario feature layers in sync with the OpenLayers map.
export function useScenarioFeatureLayers(olMap: OLMap) {
  const scn = injectStrict(activeScenarioKey);
  const { scenarioFeatureStyle, clearCache, invalidateStyle } =
    injectStrict(activeFeatureStylesKey);

  const olFeatureLayersGroup = getOrCreateLayerGroup(olMap);

  scn.geo.onFeatureLayerEvent(featureLayerEventHandler);

  function featureLayerEventHandler(event: ScenarioFeatureLayerEvent) {
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
        olDeleteFeature(event.id);
        const { layerItem } = scn.geo.getGeometryLayerItemById(event.id);
        if (layerItem && !layerItem._hidden) {
          olAddFeature(event.id);
        }
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
        break;
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
      olDeleteFeature(layerOrFeatureId);
      const { layerItem } = scn.geo.getGeometryLayerItemById(layerOrFeatureId);
      if (layerItem && !layerItem._hidden) {
        olAddFeature(layerOrFeatureId);
      }
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
    const layer = scn.geo.getFullLayerItemsLayer(layerId);
    layer && olFeatureLayersGroup.getLayers().push(olCreateScenarioFeatureLayer(layer));
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
    const { layerItem } = scn.geo.getGeometryLayerItemById(featureId);
    if (!layerItem) return;
    const olLayer = getOlLayerById(layerItem._pid);
    if (!olLayer) return;
    const olFeature = createScenarioLayerItemFeatures([layerItem], "EPSG:3857");
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
    scn.geo.layerItemsLayers.value.forEach((layer) => {
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

  return {
    initializeFeatureLayersFromStore,
  };
}

// Fixme: Should only return properties needed to represent the geometry
export function convertOlFeatureToScenarioFeature(olFeature: Feature): GeometryLayerItem {
  if (isCircle(olFeature)) {
    const circle = olFeature.getGeometry() as Circle;
    const { geometry, properties = {} } = olFeature.getProperties();
    const center = circle.getCenter();
    const r = addCoordinate([...center], [0, circle.getRadius()]);
    const meta: ScenarioFeatureMeta = {
      type: "Circle",
      radius: getLength(new LineString([center, r])),
    };

    return {
      kind: "geometry",
      type: "Feature",
      id: String(olFeature.getId() || nanoid()),
      geometry: point(toLonLat(circle.getCenter())).geometry,
      properties,
      meta,
      style: {},
    };
  }

  const gj = new GeoJSON({ featureProjection: "EPSG:3857" }).writeFeatureObject(
    olFeature,
  );

  return {
    kind: "geometry",
    type: gj.type,
    id: String(gj.id ?? nanoid()),
    geometry: gj.geometry,
    properties: gj.properties ?? {},
    style: {},
    meta: { type: gj.geometry.type },
  };
}
