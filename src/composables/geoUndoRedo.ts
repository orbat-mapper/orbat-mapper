import type OLMap from "ol/Map";
import { FeatureId } from "@/types/scenarioGeoModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";

export function useGeoLayersUndoRedo(olMap: OLMap) {
  const {
    store: { onUndoRedo },
    geo,
  } = injectStrict(activeScenarioKey);

  const {
    addLayer,
    deleteLayer,
    deleteFeature,
    addFeature,
    updateLayer,
    moveLayer,
    updateFeature,
    moveFeature,
    initializeFromStore,
  } = useScenarioLayers(olMap);

  onUndoRedo(({ meta, patch, action }) => {
    if (!meta) return;
    const { label, value } = meta;
    if (label === "deleteLayer") {
      if (action === "undo") {
        const layer = geo.getLayerById(value);
        addLayer(layer, true);
      } else deleteLayer(value as FeatureId, true);
    } else if (label === "deleteFeature") {
      if (action === "undo") {
        const { feature } = geo.getFeatureById(value);
        addFeature(feature, true);
      } else {
        deleteFeature(value, true);
      }
    } else if (label === "addFeature") {
      if (action === "undo") {
        deleteFeature(value, true);
      } else {
        const { feature } = geo.getFeatureById(value);
        addFeature(feature, true);
      }
    } else if (label === "updateFeatureGeometry") {
      deleteFeature(value, true);
      const { feature } = geo.getFeatureById(value);
      addFeature(feature, true);
    } else if (label === "updateLayer") {
      const layer = geo.getLayerById(value);
      updateLayer(value, layer, true);
    } else if (label === "moveLayer") {
      moveLayer(value, "down", true);
    } else if (label === "updateFeature") {
      updateFeature(value, {}, true);
    } else if (label === "moveFeature") {
      const { feature } = geo.getFeatureById(value);
      moveFeature(feature, "down", true);
    } else if (label === "batchLayer") {
      // FIXME ugly hack
      initializeFromStore(true, false);
    }
  });
}
