import OLMap from "ol/Map";
import { useScenarioStore } from "../stores/scenarioStore";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import { nanoid } from "nanoid";
import { Collection } from "ol";
import { isCircle, useOlEvent } from "./openlayersHelpers";
import { SimpleGeometry } from "ol/geom";
import { GeoJSON } from "ol/format";
import { point } from "@turf/helpers";
import Feature from "ol/Feature";
import { ScenarioFeature } from "../types/scenarioGeoModels";
import Circle from "ol/geom/Circle";
import { fromLonLat, ProjectionLike, toLonLat } from "ol/proj";
import { getLength } from "ol/sphere";
import LineString from "ol/geom/LineString";
import { add as addCoordinate } from "ol/coordinate";
import { Feature as GeoJsonFeature, Point } from "geojson";
import destination from "@turf/destination";
import { Style } from "ol/style";
import {
  createSimpleStyle,
  defaultSimplestyleFill,
  defaultSimplestyleStroke,
} from "../geo/simplestyle";

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
        id: feature.id,
        ...feature.properties,
      });
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

/**
 * Create and manage scenario layers
 *
 */
export function useScenarioLayers(olMap: OLMap) {
  const scenarioStore = useScenarioStore();
  const scenarioLayersGroup = getOrCreateLayerGroup(olMap);
  const scenarioLayersOl = scenarioLayersGroup.getLayers() as Collection<
    VectorLayer<any>
  >;

  function initializeFromStore() {
    scenarioLayersOl.clear();
    scenarioStore.scenarioLayers.forEach((l) => {
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: createScenarioLayerFeatures(
            l.features,
            olMap.getView().getProjection()
          ),
        }),
        style: new Style({
          stroke: defaultSimplestyleStroke,
          fill: defaultSimplestyleFill,
        }),
        properties: { id: l.id, title: l.name, layerType: LayerType.overlay },
      });
      scenarioLayersOl.push(vectorLayer);
    });
  }

  function getLayerById(id: string | number) {
    return scenarioLayersOl
      .getArray()
      .find((e) => e.get("id") === id) as VectorLayer<any>;
  }

  return {
    scenarioLayersGroup,
    initializeFromStore,
    scenarioLayers: scenarioStore.scenarioLayers,
    getLayerById,
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

    properties.radius = getLength(new LineString([center, r]));
    return point(toLonLat(circle.getCenter()), properties, {
      id: olFeature.getId() || nanoid(),
    }) as ScenarioFeature;
  }

  const gj = new GeoJSON({ featureProjection: "EPSG:3857" }).writeFeatureObject(
    olFeature
  ) as ScenarioFeature;
  // @ts-ignore
  return { id: nanoid(), ...gj, properties: gj.properties || {} };
}

export function useScenarioLayerSync(olLayers: Collection<VectorLayer<any>>) {
  const scenarioStore = useScenarioStore();

  function addListener(l: VectorLayer<any>) {
    const source = l.getSource() as VectorSource<SimpleGeometry>;
    useOlEvent(
      source.on("addfeature", (event1) => {
        event1.feature?.setId(nanoid());
        const scenarioFeature = convertOlFeatureToScenarioFeature(event1.feature!);
        const la = scenarioStore.scenarioLayers.find((e) => e.id === l.get("id"));
        la?.features.push(scenarioFeature);
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
}
