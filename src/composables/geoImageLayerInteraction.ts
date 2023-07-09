import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import TransformInteraction from "ol-ext/interaction/Transform";
import { onUnmounted } from "vue";
import { fromExtent } from "ol/geom/Polygon";
import Feature from "ol/Feature";
import { boundingExtent, getCenter, getHeight, getWidth } from "ol/extent";
import { Collection } from "ol";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { EntityId } from "@/types/base";
import { FeatureId } from "@/types/scenarioGeoModels";

export interface TransformUpdate {
  id: FeatureId;
  rotation: number;
  center: number[];
  scale: number[];
  active: boolean;
}

export interface GeoImageLayerInteractionOptions {
  updateHandler?: (update: TransformUpdate) => void;
}

export function useImageLayerTransformInteraction(
  olMap: OLMap,
  options: GeoImageLayerInteractionOptions = {}
) {
  const features = new Collection<Feature>();
  const overlayLayer = createOverlayLayer();
  const interaction = new TransformInteraction({
    translateFeature: false,
    // noFlip: true,
    features,
    selection: false,
    keepRectangle: true,
  });
  interaction.setActive(false);
  olMap.addInteraction(interaction);
  olMap.addLayer(overlayLayer);
  onUnmounted(() => {
    olMap.removeInteraction(interaction);
    interaction.setMap(null);
  });

  let rotation = 0;
  let startRotation = 0;
  let center = [0, 0];
  let scale = [1, 1];
  let newScale = [1, 1];
  let currentLayerId: FeatureId | null = null;
  let currentLayer: any = null;
  let iWidth = 0;
  let iHeight = 0;

  function initializeTransform(newLayer: any) {
    startRotation = newLayer.getSource().getRotation();
    center = [...newLayer.getSource().getCenter()];
    scale = [...newLayer.getSource().getScale()];
    rotation = startRotation;

    console.log("initializeTransform", startRotation, center, scale);
  }

  useOlEvent(
    interaction.on(["translatestart", "rotatestart", "scalestart"], (e: any) => {
      const geom = e.feature.getGeometry().clone();

      geom.rotate(rotation, getCenter(geom.getExtent()));
      const extent = geom.getExtent();
      iWidth = getWidth(extent);
      iHeight = getHeight(extent);
      initializeTransform(currentLayer);
      currentLayerId &&
        options.updateHandler?.({
          rotation,
          center,
          scale,
          active: true,
          id: currentLayerId,
        });
    })
  );

  useOlEvent(
    interaction.on(["translating", "rotating", "scaling"], (e: any) => {
      const feature = e.feature;
      const geom = feature.getGeometry().clone();
      if (e.type === "rotating") {
        rotation = startRotation - e.angle;
      }
      const c = getCenter(geom.getExtent());
      geom.rotate(rotation, c);
      const extent = geom.getExtent();
      const width = getWidth(extent);
      const height = getHeight(extent);
      if (e.type === "scaling") {
        // console.log("scaling", e);
        newScale[0] = (scale[0] * width) / iWidth;
        newScale[1] = (scale[1] * height) / iHeight;
      } else {
        newScale = scale;
      }

      center = c;

      currentLayerId &&
        options.updateHandler?.({
          rotation,
          center,
          scale: newScale,
          active: true,
          id: currentLayerId,
        });
    })
  );

  useOlEvent(
    interaction.on(["rotateend", "translateend", "scaleend"], (e: any) => {
      currentLayerId &&
        options.updateHandler?.({
          rotation,
          center,
          scale: newScale,
          active: false,
          id: currentLayerId,
        });
    })
  );

  function startTransform(newLayer: any, layerId: FeatureId) {
    currentLayerId = layerId;
    currentLayer = newLayer;
    const polygon = fromExtent(newLayer.getSource().getExtent());
    polygon.rotate(-newLayer.getSource().getRotation(), newLayer.getSource().getCenter());
    const f = new Feature(getPolygonfromImage(newLayer));
    overlayLayer.getSource()?.clear();
    overlayLayer.getSource()?.addFeature(f);
    features.clear();
    features.push(f);
    interaction.setActive(true);
    interaction.select(f, true);
  }

  function endTransform() {
    currentLayerId = null;
    interaction.setActive(false);
    overlayLayer.getSource()?.clear();
    features.clear();
  }

  return { startTransform, endTransform };
}

function createOverlayLayer() {
  return new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      fill: new Fill({ color: "rgba(0, 0, 0, 0)" }),
      stroke: new Stroke({ color: "rgb(238,3,3)", width: 2 }),
    }),
  });
}

function getPolygonfromImage(layer: any) {
  const source = layer.getSource();
  const center = source.getCenter();
  const scale = source.getScale();
  const width = source.getGeoImage().width * scale[0];
  const height = source.getGeoImage().height * scale[1];
  const p1 = [center[0] - width / 2, center[1] - height / 2];
  const p2 = [center[0] + width / 2, center[1] + height / 2];
  const extent = boundingExtent([p1, p2]);
  const polygon = fromExtent(extent);
  // The resulting polygon
  polygon.rotate(-source.getRotation(), center);
  return polygon;
}
