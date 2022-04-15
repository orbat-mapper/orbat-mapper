import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import { isEmpty } from "ol/extent";
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
import { Circle as CircleStyle, Style } from "ol/style";
import {
  createSimpleStyle,
  defaultSimplestyleFill,
  defaultSimplestyleStroke,
} from "../geo/simplestyle";
import { computed, onUnmounted } from "vue";
import { unByKey } from "ol/Observable";
import { EventsKey } from "ol/events";
import { useScenarioLayersStore } from "../stores/scenarioLayersStore";
import { AnyVectorLayer } from "../geo/types";
import { moveItemMutable } from "../utils";

export enum LayerType {
  overlay = "OVERLAY",
  units = "UNITS",
}

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
  features.forEach((feature) => {
    const style = createSimpleStyle(feature.properties);
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
      f.setStyle(style);
      olFeatures.push(f);
    } else {
      const f = gjson.readFeature(feature);
      f.setStyle(style);
      olFeatures.push(f);
    }
  });
  return olFeatures;
}

function createVectorLayer(l: ScenarioLayer, projection: ProjectionLike = "EPSG:3837") {
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: createScenarioLayerFeatures(l.features, projection),
    }),
    style: new Style({
      stroke: defaultSimplestyleStroke,
      fill: defaultSimplestyleFill,
      image: new CircleStyle({
        fill: defaultSimplestyleFill,
        stroke: defaultSimplestyleStroke,
        radius: 5,
      }),
    }),
    properties: { id: l.id, title: l.name, layerType: LayerType.overlay },
  });
  if (l.isHidden) vectorLayer.setVisible(false);
  return vectorLayer;
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

  function initializeFromStore() {
    scenarioLayersOl.clear();

    layersStore.layers.forEach((l) => {
      const vectorLayer = createVectorLayer(l, projection);
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
    scenarioLayersOl.push(createVectorLayer(newLayer, projection));
  }

  function zoomToFeature(feature: ScenarioFeature) {
    const { feature: olFeature } =
      getFeatureAndLayerById(feature.id, scenarioLayersOl) || {};
    if (!olFeature) return;
    olMap.getView().fit(olFeature.getGeometry(), { maxZoom: 17 });
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
    const la = layersStore.getLayerById(olLayer.get("id"));
    la && layersStore.addFeature(scenarioFeature, la);
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
