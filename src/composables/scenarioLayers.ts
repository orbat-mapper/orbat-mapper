import OLMap from "ol/Map";
import { useScenarioStore } from "../stores/scenarioStore";
import VectorLayer from "ol/layer/Vector";

import { ref } from "vue";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import { nanoid } from "nanoid";
import { Collection } from "ol";
import { useOlEvent } from "./openlayersHelpers";
import { SimpleGeometry } from "ol/geom";
import { GeoJSON } from "ol/format";
import { featureCollection } from "@turf/helpers";

export enum LayerType {
  overlay = "OVERLAY",
  units = "UNITS",
}

const layersMap = new WeakMap<OLMap, LayerGroup>();

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
          features: new GeoJSON({
            featureProjection: olMap.getView().getProjection(),
          }).readFeatures(featureCollection(l.features)),
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

export function useScenarioLayerSync(olLayers: Collection<VectorLayer<any>>) {
  olLayers.forEach((l) => {
    const source = l.getSource() as VectorSource<SimpleGeometry>;
    useOlEvent(
      source.on("addfeature", (event1) => {
        const geometry = event1.feature?.getGeometry();

        if (!geometry) return;
        event1.feature?.setId(nanoid());
      })
    );
  });
  useOlEvent(
    olLayers.on("add", (event) => {
      const addedLayer = event.element as VectorLayer<any>;
    })
  );
}
