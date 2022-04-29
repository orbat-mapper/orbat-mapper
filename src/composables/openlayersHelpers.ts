import { EventsKey } from "ol/events";
import { onUnmounted } from "vue";
import { unByKey } from "ol/Observable";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import { Collection } from "ol";
import { AnyVectorLayer } from "../geo/types";
import VectorSource from "ol/source/Vector";
import { FeatureId } from "../types/scenarioGeoModels";

/**
 * Unregister open layers event automatically on unmount
 * @param eventKey
 */
export function useOlEvent(eventKey: EventsKey | EventsKey[]): EventsKey | EventsKey[] {
  const eKey = eventKey;
  onUnmounted(() => {
    if (Array.isArray(eKey)) {
      eKey.forEach((key) => unByKey(key));
    } else unByKey(eKey);
  });
  return eventKey;
}

export function isCircle(feature: Feature) {
  return feature.getGeometry()?.getType() === "Circle";
}

export function getFeatureAndLayerById(
  featureId: FeatureId,
  layerCollection: Collection<AnyVectorLayer>
) {
  for (let index = 0, ii = layerCollection.getLength(); index < ii; ++index) {
    const layer = layerCollection.item(index);
    const feature = layer.getSource()?.getFeatureById(featureId);
    if (feature) {
      return { feature, layer, layerIndex: index };
    }
  }
  return null;
}

export function getFeatureIndex(feature: Feature, layer: VectorLayer<any>) {
  const features = layer.getSource().getFeaturesCollection();
  if (!features) return;
  for (let index = 0, ii = features.getLength(); index < ii; ++index) {
    const currentFeature = features.item(index);
    if (feature === currentFeature) {
      return index;
    }
  }
  return -1;
}
