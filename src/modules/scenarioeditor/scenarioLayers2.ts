import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import { click as clickCondition } from "ol/events/condition";
import { getCenter, isEmpty } from "ol/extent";
import { featureCollection, point } from "@turf/helpers";
import turfEnvelope from "@turf/envelope";
import { injectStrict, moveItemMutable, nanoid } from "@/utils";
import { Collection } from "ol";
import {
  getFeatureAndLayerById,
  isCircle,
  useOlEvent,
} from "@/composables/openlayersHelpers";
import { GeoJSON } from "ol/format";
import Feature from "ol/Feature";
import type {
  FeatureId,
  ScenarioFeature,
  ScenarioFeatureProperties,
  ScenarioLayer,
} from "@/types/scenarioGeoModels";
import Circle from "ol/geom/Circle";
import { fromLonLat, ProjectionLike, toLonLat } from "ol/proj";
import { getLength } from "ol/sphere";
import LineString from "ol/geom/LineString";
import { add as addCoordinate } from "ol/coordinate";
import type { Feature as GeoJsonFeature, Point } from "geojson";
import destination from "@turf/destination";
import { onUnmounted, ref, watch } from "vue";
import { unByKey } from "ol/Observable";
import { EventsKey } from "ol/events";
import { AnyVectorLayer } from "@/geo/types";
import {
  LayersOutline,
  MapMarker,
  VectorCircleVariant,
  VectorLine,
  VectorTriangle,
} from "mdue";
import { ScenarioFeatureActions } from "@/types/constants";
import Select, { SelectEvent } from "ol/interaction/Select";
import { MaybeRef } from "@vueuse/core";
import { activeFeaturesKey, activeScenarioKey } from "@/components/injects";
import {
  NScenarioFeature,
  NScenarioLayer,
  ScenarioLayerUpdate,
} from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import { TScenario } from "@/scenariostore";
import { UseFeatureStyles } from "@/geo/featureStyles";
import { MenuItemData } from "@/components/types";
import { useSelectedFeatures } from "@/stores/dragStore";

const { send } = useNotifications();

export enum LayerType {
  overlay = "OVERLAY",
  units = "UNITS",
}

const geometryIconMap: any = {
  Point: MapMarker,
  LineString: VectorLine,
  Polygon: VectorTriangle,
  Circle: VectorCircleVariant,
  layer: LayersOutline,
};

export function getGeometryIcon(feature: ScenarioFeature) {
  return geometryIconMap[feature.properties.type];
}

export function getItemsIcon(type: string) {
  return geometryIconMap[type];
}

export const featureMenuItems: MenuItemData<ScenarioFeatureActions>[] = [
  { label: "Zoom to", action: "zoom" },
  { label: "Pan to", action: "pan" },
  { label: "Move up", action: "moveUp" },
  { label: "Move down", action: "moveDown" },
  { label: "Delete", action: "delete" },
];

const layersMap = new WeakMap<OLMap, LayerGroup>();

function convertRadius(center: GeoJsonFeature<Point>, radiusInMeters: number): number {
  const p = destination(center, radiusInMeters / 1000, 90);
  const line = new LineString([center.geometry.coordinates, p.geometry.coordinates]);
  line.transform("EPSG:4326", "EPSG:3857");
  return line.getLength();
}

function createScenarioLayerFeatures(
  features: NScenarioFeature[] | ScenarioFeature[],
  featureProjection: ProjectionLike
) {
  const gjson = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection,
  });
  const olFeatures: Feature[] = [];
  features.forEach((feature, index) => {
    feature.properties._zIndex = index;
    if (feature.properties?.radius) {
      const newRadius = convertRadius(
        feature as GeoJsonFeature<Point>,
        feature.properties.radius
      );
      const circle = new Circle(
        fromLonLat(feature.geometry.coordinates as number[]),
        newRadius
      );
      let f = new Feature({
        geometry: circle,
        ...feature.properties,
      });
      f.setId(feature.id);
      olFeatures.push(f);
    } else {
      const f = gjson.readFeature(feature, {
        featureProjection: "EPSG:3857",
        dataProjection: "EPSG:4326",
      });
      olFeatures.push(f);
    }
  });
  return olFeatures;
}

export function useScenarioFeatureSelect(
  olMap: OLMap,
  options: Partial<{
    enable: MaybeRef<boolean>;
  }> = {}
) {
  const scenarioLayersGroup = getOrCreateLayerGroup(olMap);
  const scenarioLayersOl = scenarioLayersGroup.getLayers() as Collection<
    VectorLayer<any>
  >;

  const { selectedFeatureIds: selectedIds } = useSelectedFeatures();

  const enableRef = ref(options.enable ?? true);

  const selectInteraction = new Select({
    condition: clickCondition,
    hitTolerance: 20,
    layers: scenarioLayersOl.getArray(),
  });
  const selectedFeatures = selectInteraction.getFeatures();
  let isInternal = false;

  useOlEvent(
    selectInteraction.on("select", (event: SelectEvent) => {
      isInternal = true;
      event.selected.forEach((f) => selectedIds.value.add(f.getId()!));
      event.deselected.forEach((f) => selectedIds.value.delete(f.getId()!));
    })
  );

  watch(
    () => [...selectedIds.value],
    (v) => {
      if (!isInternal) {
        selectedFeatures.clear();
        v.forEach((fid) => {
          const { feature } = getFeatureAndLayerById(fid, scenarioLayersOl) || {};
          if (feature) selectedFeatures.push(feature);
        });
      }
      isInternal = false;
    },
    { immediate: true }
  );

  olMap.addInteraction(selectInteraction);

  watch(
    enableRef,
    (enabled) => {
      selectInteraction.getFeatures().clear();
      selectInteraction.setActive(enabled);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    olMap.removeInteraction(selectInteraction);
  });

  return { selectedIds, selectedFeatures, selectInteraction };
}

/**
 * Create and manage scenario layers
 *
 */
export function useScenarioLayers(
  olMap: OLMap,
  {
    activeScenario,
    activeScenarioFeatures,
  }: { activeScenario?: TScenario; activeScenarioFeatures?: UseFeatureStyles } = {}
) {
  const {
    geo,
    store: { state },
  } = activeScenario || injectStrict(activeScenarioKey);
  const { scenarioFeatureStyle, clearCache, invalidateStyle } =
    activeScenarioFeatures || injectStrict(activeFeaturesKey);
  const scenarioLayersGroup = getOrCreateLayerGroup(olMap);
  const scenarioLayersOl = scenarioLayersGroup.getLayers() as Collection<
    VectorLayer<any>
  >;
  const projection = olMap.getView().getProjection();

  function createScenarioVectorLayer(
    l: ScenarioLayer,
    projection: ProjectionLike = "EPSG:3837",
    filterVisible = true
  ) {
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: createScenarioLayerFeatures(
          l.features.filter((f) => !filterVisible || !f._hidden),
          projection
        ),
      }),
      style: scenarioFeatureStyle,
      properties: { id: l.id, title: l.name, layerType: LayerType.overlay },
      updateWhileAnimating: true,
    });
    if (l.isHidden) vectorLayer.setVisible(false);
    return vectorLayer;
  }

  function initializeFromStore(doClearCache = true, filterVisible = true) {
    if (doClearCache) clearCache();
    scenarioLayersOl.clear();

    geo.layers.value
      .filter((l) => !filterVisible || !l._hidden)
      .forEach((l) => {
        const vectorLayer = createScenarioVectorLayer(l, projection, filterVisible);
        scenarioLayersOl.push(vectorLayer);
      });
  }

  function getOlLayerById(id: FeatureId) {
    return scenarioLayersOl
      .getArray()
      .find((e) => e.get("id") === id) as VectorLayer<any>;
  }

  function addLayer(newLayer: NScenarioLayer, isUndoRedo = false) {
    const addedLayer = isUndoRedo ? newLayer : geo.addLayer(newLayer);
    scenarioLayersOl.push(createScenarioVectorLayer(geo.getFullLayer(addedLayer.id)!));
    return newLayer;
  }

  function zoomToFeature(featureId: FeatureId) {
    const { feature: olFeature } =
      getFeatureAndLayerById(featureId, scenarioLayersOl) || {};
    if (!olFeature) return;
    olMap.getView().fit(olFeature.getGeometry(), { maxZoom: 17 });
  }

  function zoomToFeatures(featureIds: FeatureId[]) {
    const c = featureCollection(featureIds.map((fid) => state.featureMap[fid]));
    const bb = new GeoJSON().readFeature(turfEnvelope(c), {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    }) as Feature<any>;
    if (!bb) return;
    olMap.getView().fit(bb.getGeometry(), { maxZoom: 17 });
  }

  function panToFeature(featureId: FeatureId) {
    const { feature: olFeature } =
      getFeatureAndLayerById(featureId, scenarioLayersOl) || {};
    if (!olFeature) return;
    const view = olMap.getView();
    view.animate({
      center: getCenter(olFeature.getGeometry().getExtent()),
    });
  }

  function zoomToLayer(layerId: FeatureId) {
    const olLayer = getOlLayerById(layerId);
    if (!olLayer) return;
    const layerExtent = olLayer.getSource().getExtent();

    !isEmpty(layerExtent) && layerExtent && olMap.getView().fit(layerExtent);
  }

  function addFeature(feature: NScenarioFeature, isUndoRedo = false) {
    if (!isUndoRedo) geo.addFeature(feature, feature._pid);
    const olLayer = getOlLayerById(feature._pid);
    const olFeature = createScenarioLayerFeatures([feature], "EPSG:3837");
    olLayer.getSource().addFeatures(olFeature);
  }

  function deleteFeature(featureId: FeatureId, isUndoRedo = false) {
    const { feature: olFeature, layer } =
      getFeatureAndLayerById(featureId, scenarioLayersOl) || {};
    if (!(olFeature && layer)) return;
    layer.getSource()?.removeFeature(olFeature);
    if (!isUndoRedo) geo.deleteFeature(featureId);
  }

  function addOlFeature(olFeature: Feature, olLayer: AnyVectorLayer) {
    if (!olFeature.getId()) olFeature.setId(nanoid());

    const scenarioFeature = convertOlFeatureToScenarioFeature(olFeature);
    const scenarioLayer = geo.getLayerById(olLayer.get("id"))!;

    const { feature: lastFeatureInLayer } = geo.getFeatureById(
      scenarioLayer.features[scenarioLayer.features.length - 1]
    );

    const _zIndex = Math.max(
      scenarioLayer.features.length,
      (lastFeatureInLayer?.properties._zIndex || 0) + 1
    );
    scenarioFeature.properties.name = `${scenarioFeature.properties.type} ${_zIndex + 1}`;
    scenarioFeature.properties._zIndex = _zIndex;
    scenarioFeature._pid = scenarioLayer.id;
    olFeature.set("_zIndex", _zIndex);
    scenarioLayer && geo.addFeature(scenarioFeature, scenarioLayer.id);
    return scenarioFeature;
  }

  function moveFeature(
    feature: NScenarioFeature,
    direction: "up" | "down",
    isUndoRedo = false
  ) {
    const layer = geo.getLayerById(feature._pid);
    let toIndex = layer.features.indexOf(feature.id);

    if (!isUndoRedo) {
      if (direction === "up") toIndex--;
      if (direction === "down") toIndex++;
      geo.moveFeature(feature.id, toIndex);
    }

    layer.features.forEach((id) => invalidateStyle(id));
    scenarioLayersOl.forEach((l) => l.changed());
  }

  function moveLayer(layerId: FeatureId, direction: "up" | "down", isUndoRedo = false) {
    let toIndex = geo.getLayerIndex(layerId);

    if (!isUndoRedo) {
      if (direction === "up") toIndex--;
      if (direction === "down") toIndex++;
      geo.moveLayer(layerId, toIndex);
    }
    const olLayer = getOlLayerById(layerId);

    const layersCopy = [...scenarioLayersGroup.getLayers().getArray()];
    const fromIndex = layersCopy.indexOf(olLayer as any);
    scenarioLayersGroup.getLayers().clear();
    scenarioLayersGroup
      .getLayers()
      .extend(moveItemMutable(layersCopy, fromIndex, toIndex));
  }

  function deleteLayer(layerId: FeatureId, isUndoRedo = false) {
    const olLayer = getOlLayerById(layerId);
    if (!olLayer) return;
    scenarioLayersGroup.getLayers().remove(olLayer);
    olLayer.getSource().clear();
    if (!isUndoRedo) geo.deleteLayer(layerId);
  }

  function updateLayer(
    layerId: FeatureId,
    data: ScenarioLayerUpdate,
    isUndoRedo = false
  ) {
    if (!isUndoRedo) geo.updateLayer(layerId, data);
    const olLayer = getOlLayerById(layerId);

    if (!olLayer) return;
    for (const [key, value] of Object.entries(data)) {
      olLayer.set(key, value);
    }
  }

  function updateFeature(
    featureId: FeatureId,
    data: Partial<ScenarioFeatureProperties>,
    isUndoRedo = false
  ) {
    const { feature, layer } = geo.getFeatureById(featureId) || {};
    if (!(feature && layer)) return;

    if (!isUndoRedo) {
      const dataUpdate = {
        properties: { ...feature.properties, ...data },
      };
      geo.updateFeature(featureId, dataUpdate);
    }
    invalidateStyle(featureId);
    scenarioLayersOl.forEach((l) => l.changed());
  }

  function updateFeatureGeometryFromOlFeature(olFeature: Feature) {
    const t = convertOlFeatureToScenarioFeature(olFeature);
    const id = olFeature.getId();
    if (!id) return;
    const { feature, layer } = geo.getFeatureById(id) || {};
    if (!(feature && layer)) return;
    const dataUpdate = {
      properties: { ...feature.properties, ...t.properties },
      geometry: t.geometry,
    };
    geo.updateFeature(id, dataUpdate, true, true);
  }

  function toggleLayerVisibility(scenarioLayer: ScenarioLayer) {
    const olLayer = getOlLayerById(scenarioLayer.id);
    if (!olLayer) return;
    const isVisible = olLayer.getVisible();
    olLayer.setVisible(!isVisible);
    geo.updateLayer(scenarioLayer.id, { isHidden: isVisible }, false);
  }

  function getFeatureLayer(feature: ScenarioFeature): NScenarioLayer | undefined | null {
    const { layer } = geo.getFeatureById(feature.id) || {};
    return layer;
  }

  return {
    scenarioLayersGroup,
    initializeFromStore,
    scenarioLayers: geo.layers,
    getOlLayerById,
    addLayer,
    zoomToFeature,
    zoomToFeatures,
    deleteFeature,
    updateLayer,
    toggleLayerVisibility,
    zoomToLayer,
    deleteLayer,
    moveFeature,
    addOlFeature,
    moveLayer,
    updateFeatureGeometryFromOlFeature,
    getFeatureLayer,
    addFeature,
    updateFeature,
    panToFeature,
    getOlFeatureById: (id: FeatureId) => {
      const { feature, layer } = getFeatureAndLayerById(id, scenarioLayersOl) || {};
      return feature;
    },
  };
}

function getOrCreateLayerGroup(olMap: OLMap) {
  if (layersMap.has(olMap)) return layersMap.get(olMap)!;

  const layerGroup = new LayerGroup({
    properties: { id: nanoid(), title: "Scenario layers" },
  });
  layersMap.set(olMap, layerGroup);
  olMap.addLayer(layerGroup);
  return layerGroup;
}

// Fixme: Should only return properties needed to represent the geometry
function convertOlFeatureToScenarioFeature(olFeature: Feature): NScenarioFeature {
  if (isCircle(olFeature)) {
    const circle = olFeature.getGeometry() as Circle;
    const { geometry, properties = {} } = olFeature.getProperties();
    const center = circle.getCenter();
    const r = addCoordinate([...center], [0, circle.getRadius()]);
    properties.type = "Circle";
    properties.radius = getLength(new LineString([center, r]));
    return point<ScenarioFeatureProperties>(toLonLat(circle.getCenter()), properties, {
      id: olFeature.getId() || nanoid(),
    }) as NScenarioFeature;
  }

  const gj = new GeoJSON({ featureProjection: "EPSG:3857" }).writeFeatureObject(
    olFeature
  );

  gj.properties = { ...gj.properties, type: gj.geometry.type };

  const properties = { ...gj.properties, type: gj.geometry.type };
  //@ts-ignore
  return gj;
}

export function useScenarioLayerSync(olLayers: Collection<VectorLayer<any>>) {
  const { geo } = injectStrict(activeScenarioKey);

  const eventKeys = [] as EventsKey[];

  function addListener(l: VectorLayer<any>) {
    eventKeys.push(
      l.on("change:visible", (event) => {
        const isVisible = l.getVisible();
        geo.updateLayer(l.get("id"), { isHidden: !isVisible }, false);
      })
    );
  }

  olLayers.forEach((l) => {
    addListener(l);
  });
  useOlEvent(
    olLayers.on("add", (event) => {
      const addedLayer = event.element as VectorLayer<any>;
      addListener(addedLayer);
    })
  );

  onUnmounted(() => {
    eventKeys.forEach((key) => unByKey(key));
  });
}
