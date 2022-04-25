import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import { getCenter, isEmpty } from "ol/extent";
import { nanoid } from "nanoid";
import { Collection } from "ol";
import {
  getFeatureAndLayerById,
  getFeatureIndex,
  isCircle,
  useOlEvent,
} from "./openlayersHelpers";
import { GeoJSON } from "ol/format";
import { point } from "@turf/helpers";
import Feature from "ol/Feature";
import {
  ScenarioFeature,
  ScenarioFeatureProperties,
  ScenarioLayer,
} from "../types/scenarioGeoModels";
import Circle from "ol/geom/Circle";
import { fromLonLat, ProjectionLike, toLonLat } from "ol/proj";
import { getLength } from "ol/sphere";
import LineString from "ol/geom/LineString";
import { add as addCoordinate } from "ol/coordinate";
import { Feature as GeoJsonFeature, Point } from "geojson";
import destination from "@turf/destination";
import { computed, onUnmounted, ref, watch } from "vue";
import { unByKey } from "ol/Observable";
import { EventsKey } from "ol/events";
import { useScenarioLayersStore } from "../stores/scenarioLayersStore";
import { AnyVectorLayer } from "../geo/types";
import { moveItemMutable } from "../utils";
import { MapMarker, VectorCircleVariant, VectorLine, VectorTriangle } from "mdue";
import { MenuItemData } from "../components/DotsMenu.vue";
import { ScenarioFeatureActions } from "../types/constants";
import { clearStyleCache, scenarioFeatureStyle } from "../geo/featureStyles";
import Select from "ol/interaction/Select";
import { MaybeRef } from "@vueuse/core";

export enum LayerType {
  overlay = "OVERLAY",
  units = "UNITS",
}

const geometryIconMap: any = {
  Point: MapMarker,
  LineString: VectorLine,
  Polygon: VectorTriangle,
  Circle: VectorCircleVariant,
};

export function getGeometryIcon(feature: ScenarioFeature) {
  return geometryIconMap[feature.properties.type];
}

export const featureMenuItems: MenuItemData<ScenarioFeatureActions>[] = [
  { label: "Zoom to", action: ScenarioFeatureActions.Zoom },
  { label: "Pan to", action: ScenarioFeatureActions.Pan },
  // { label: "Move up", action: ScenarioFeatureActions.MoveUp },
  // { label: "Move down", action: ScenarioFeatureActions.MoveDown },
  { label: "Delete", action: ScenarioFeatureActions.Delete },
];

const layersMap = new WeakMap<OLMap, LayerGroup>();

function convertRadius(center: GeoJsonFeature<Point>, radiusInMeters: number): number {
  const p = destination(center, radiusInMeters / 1000, 90);
  const line = new LineString([center.geometry.coordinates, p.geometry.coordinates]);
  line.transform("EPSG:4326", "EPSG:3857");
  return line.getLength();
}

function createScenarioLayerFeatures(
  features: ScenarioFeature[],
  featureProjection: ProjectionLike
) {
  const gjson = new GeoJSON({
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
      const f = gjson.readFeature(feature);
      olFeatures.push(f);
    }
  });
  return olFeatures;
}

function createScenarioVectorLayer(
  l: ScenarioLayer,
  projection: ProjectionLike = "EPSG:3837"
) {
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: createScenarioLayerFeatures(l.features, projection),
    }),
    style: scenarioFeatureStyle,
    properties: { id: l.id, title: l.name, layerType: LayerType.overlay },
  });
  if (l.isHidden) vectorLayer.setVisible(false);
  return vectorLayer;
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

  const enableRef = ref(options.enable ?? true);

  const select = new Select({
    hitTolerance: 20,
    layers: scenarioLayersOl.getArray(),
  });

  const selectedFeatures = select.getFeatures();
  useOlEvent(
    selectedFeatures.on(["add", "remove"], (event) => {
      // @ts-ignore
      const feature = event.element as Feature<any>;
      if (event.type === "add") selectedIds.value.add(feature.getId()!);
      if (event.type === "remove") selectedIds.value.delete(feature.getId()!);
    })
  );

  const selectedIds = ref<Set<string | number>>(new Set());

  olMap.addInteraction(select);
  useOlEvent(select.on("select", (event) => {}));

  watch(
    enableRef,
    (enabled) => {
      select.getFeatures().clear();
      select.setActive(enabled);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    olMap.removeInteraction(select);
  });

  return { selectedIds, selectedFeatures };
}

/**
 * Create and manage scenario layers
 *
 */
export function useScenarioLayers(olMap: OLMap) {
  const layersStore = useScenarioLayersStore();
  const scenarioLayersGroup = getOrCreateLayerGroup(olMap);
  const scenarioLayersOl = scenarioLayersGroup.getLayers() as Collection<
    VectorLayer<any>
  >;
  const projection = olMap.getView().getProjection();

  const featureLayerCache = new Map<string | number, ScenarioLayer>();

  function initializeFromStore() {
    clearStyleCache();
    scenarioLayersOl.clear();

    layersStore.layers.forEach((l) => {
      const vectorLayer = createScenarioVectorLayer(l, projection);
      scenarioLayersOl.push(vectorLayer);
    });
  }

  function getOlLayerById(id: string | number) {
    return scenarioLayersOl
      .getArray()
      .find((e) => e.get("id") === id) as VectorLayer<any>;
  }

  function addLayer(newLayer: ScenarioLayer) {
    layersStore.add(newLayer);
    scenarioLayersOl.push(createScenarioVectorLayer(newLayer, projection));
  }

  function zoomToFeature(feature: ScenarioFeature) {
    const { feature: olFeature } =
      getFeatureAndLayerById(feature.id, scenarioLayersOl) || {};
    if (!olFeature) return;
    olMap.getView().fit(olFeature.getGeometry(), { maxZoom: 17 });
  }

  function panToFeature(feature: ScenarioFeature) {
    const { feature: olFeature } =
      getFeatureAndLayerById(feature.id, scenarioLayersOl) || {};
    if (!olFeature) return;
    const view = olMap.getView();
    view.animate({
      center: getCenter(olFeature.getGeometry().getExtent()),
    });
  }

  function zoomToLayer(layer: ScenarioLayer) {
    const olLayer = getOlLayerById(layer.id);
    if (!olLayer) return;
    const layerExtent = olLayer.getSource().getExtent();

    !isEmpty(layerExtent) && layerExtent && olMap.getView().fit(layerExtent);
  }

  function deleteFeature(feature: ScenarioFeature, scenarioLayer: ScenarioLayer) {
    const { feature: olFeature, layer } =
      getFeatureAndLayerById(feature.id, scenarioLayersOl) || {};
    if (!(olFeature && layer)) return;
    layer.getSource()?.removeFeature(olFeature);
    layersStore.removeFeature(feature, scenarioLayer);
  }

  function addOlFeature(olFeature: Feature, olLayer: AnyVectorLayer) {
    if (!olFeature.getId()) olFeature.setId(nanoid());

    const scenarioFeature = convertOlFeatureToScenarioFeature(olFeature);
    const scenarioLayer = layersStore.getLayerById(olLayer.get("id"))!;
    const _zIndex = Math.max(
      scenarioLayer.features.length,
      (scenarioLayer.features[scenarioLayer.features.length - 1]?.properties._zIndex ||
        0) + 1
    );
    scenarioFeature.properties.name = `${scenarioFeature.properties.type} ${_zIndex + 1}`;
    scenarioFeature.properties._zIndex = _zIndex;
    olFeature.set("_zIndex", _zIndex);
    scenarioLayer && layersStore.addFeature(scenarioFeature, scenarioLayer);
    return scenarioFeature;
  }

  function moveFeature(feature: ScenarioFeature, direction: "up" | "down") {
    const { feature: olFeature, layer } =
      getFeatureAndLayerById(feature.id, scenarioLayersOl) || {};
    if (!(olFeature && layer)) return;
    const olFeatures = layer.getSource();
    console.log(olFeatures, layer);
    const idx = getFeatureIndex(olFeature, layer);
    console.log("index", idx);
  }

  function moveLayer(layer: ScenarioLayer, direction: "up" | "down") {
    let toIndex = layersStore.getLayerIndex(layer);

    if (direction === "up") toIndex--;
    if (direction === "down") toIndex++;
    layersStore.moveLayer(layer, toIndex);
    const olLayer = getOlLayerById(layer.id);

    const layersCopy = [...scenarioLayersGroup.getLayers().getArray()];
    const fromIndex = layersCopy.indexOf(olLayer as any);
    scenarioLayersGroup.getLayers().clear();
    scenarioLayersGroup
      .getLayers()
      .extend(moveItemMutable(layersCopy, fromIndex, toIndex));
  }

  function deleteLayer(layer: ScenarioLayer) {
    const olLayer = getOlLayerById(layer.id);
    if (!olLayer) return;
    scenarioLayersGroup.getLayers().remove(olLayer);
    olLayer.getSource().clear();
    layersStore.removeLayer(layer);
  }

  function updateLayer(scenarioLayer: ScenarioLayer, data: Partial<ScenarioLayer>) {
    layersStore.updateLayer(scenarioLayer, data);
    const olLayer = getOlLayerById(scenarioLayer.id);

    if (!olLayer) return;
    for (const [key, value] of Object.entries(data)) {
      olLayer.set(key, value);
    }
  }

  function updateFeature(
    scenarioFeature: ScenarioFeature,
    data: Partial<ScenarioFeatureProperties>
  ) {
    const id = scenarioFeature.id;
    const { feature, layer } = layersStore.getFeatureById(id) || {};
    if (!(feature && layer)) return;
    const dataUpdate = {
      properties: { ...feature.properties, ...data },
    };
    layersStore.updateFeature(id, dataUpdate, layer);
  }

  function updateFeatureFromOlFeature(olFeature: Feature) {
    const t = convertOlFeatureToScenarioFeature(olFeature);
    const id = olFeature.getId();
    if (!id) return;
    const { feature, layer } = layersStore.getFeatureById(id) || {};
    if (!(feature && layer)) return;
    const dataUpdate = {
      properties: { ...feature.properties, ...t.properties },
      geometry: t.geometry,
    };
    layersStore.updateFeature(id, dataUpdate, layer);
  }

  function toggleLayerVisibility(scenarioLayer: ScenarioLayer) {
    const olLayer = getOlLayerById(scenarioLayer.id);
    if (!olLayer) return;
    const isVisible = olLayer.getVisible();
    olLayer.setVisible(!isVisible);
    layersStore.updateLayer(scenarioLayer, { isHidden: isVisible });
  }

  function getFeatureLayer(feature: ScenarioFeature): ScenarioLayer | undefined | null {
    const cached = featureLayerCache.get(feature.id);
    if (cached) return cached;
    const { layer } = layersStore.getFeatureById(feature.id) || {};
    if (layer) {
      featureLayerCache.set(feature.id, layer);
      return layer;
    }
  }

  return {
    scenarioLayersGroup,
    initializeFromStore,
    scenarioLayers: computed(() => layersStore.layers),
    getOlLayerById,
    addLayer,
    zoomToFeature,
    deleteFeature,
    updateLayer,
    toggleLayerVisibility,
    zoomToLayer,
    deleteLayer,
    moveFeature,
    addOlFeature,
    moveLayer,
    updateFeatureFromOlFeature,
    getFeatureLayer,
    updateFeature,
    panToFeature,
    getOlFeatureById: (id: string | number) => {
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

function convertOlFeatureToScenarioFeature(olFeature: Feature): ScenarioFeature {
  if (isCircle(olFeature)) {
    const circle = olFeature.getGeometry() as Circle;
    const { geometry, properties = {} } = olFeature.getProperties();
    const center = circle.getCenter();
    const r = addCoordinate([...center], [0, circle.getRadius()]);
    properties.type = "Circle";
    properties.radius = getLength(new LineString([center, r]));
    return point<ScenarioFeatureProperties>(toLonLat(circle.getCenter()), properties, {
      id: olFeature.getId() || nanoid(),
    }) as ScenarioFeature;
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
  const layerStore = useScenarioLayersStore();
  const eventKeys = [] as EventsKey[];

  function addListener(l: VectorLayer<any>) {
    eventKeys.push(
      l.on("change:visible", (event) => {
        const isVisible = l.getVisible();
        const scenarioLayer = layerStore.getLayerById(l.get("id"));
        scenarioLayer && layerStore.updateLayer(scenarioLayer, { isHidden: !isVisible });
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
