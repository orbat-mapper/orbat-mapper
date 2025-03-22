import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import Feature from "ol/Feature";
import type OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import { Collection } from "ol";
import { FeatureId } from "@/types/scenarioGeoModels";
import { tryOnBeforeUnmount } from "@vueuse/core";
import { Vector as VectorSource } from "ol/source";
import { GeoJSON as GeoJSONFormat } from "ol/format";
import type { GeoJSON } from "geojson";
import { saveBlobToLocalFile } from "@/utils/files";

/**
 * Unregister open layers event automatically on unmount
 * @param eventKey
 */
export function useOlEvent(eventKey: EventsKey | EventsKey[]): EventsKey | EventsKey[] {
  const eKey = eventKey;
  tryOnBeforeUnmount(() => {
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
  layerCollection: Collection<VectorLayer>,
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
  const features = layer.getSource()?.getFeaturesCollection();
  if (!features) return;
  for (let index = 0, ii = features.getLength(); index < ii; ++index) {
    const currentFeature = features.item(index);
    if (feature === currentFeature) {
      return index;
    }
  }
  return -1;
}

export function getSnappableFeatures(olMap: OLMap, options = {}) {
  return olMap
    .getAllLayers()
    .filter((l) => l.getVisible() && l.getSource() instanceof VectorSource)
    .map((l) => (l.getSource() as VectorSource)?.getFeatures())
    .flat();
}

// Copied from https://openlayers.org/en/latest/examples/export-map.html
export async function saveMapAsPng(map: OLMap, options: { fileName?: string } = {}) {
  const fileName = options.fileName ?? "image.png";
  map.once("rendercomplete", async function () {
    const mapCanvas = document.createElement("canvas");
    const size = map.getSize();
    if (!size) return;
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContext = mapCanvas.getContext("2d");
    if (!mapContext) return;
    Array.prototype.forEach.call(
      map.getViewport().querySelectorAll(".ol-layer canvas, canvas.ol-layer"),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
          mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
          let matrix;
          const transform = canvas.style.transform;
          if (transform) {
            // Get the transform parameters from the style's transform matrix
            matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(",")
              .map(Number);
          } else {
            matrix = [
              parseFloat(canvas.style.width) / canvas.width,
              0,
              0,
              parseFloat(canvas.style.height) / canvas.height,
              0,
              0,
            ];
          }
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
          const backgroundColor = canvas.parentNode.style.backgroundColor;
          if (backgroundColor) {
            mapContext.fillStyle = backgroundColor;
            mapContext.fillRect(0, 0, canvas.width, canvas.height);
          }
          mapContext.drawImage(canvas, 0, 0);
        }
      },
    );
    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);
    const blob: Blob | null = await new Promise((resolve) => mapCanvas.toBlob(resolve));

    blob && (await saveBlobToLocalFile(blob, fileName));
  });
  map.renderSync();
}

const gjs = new GeoJSONFormat({
  featureProjection: "EPSG:3857",
  dataProjection: "EPSG:4326",
});

export function drawGeoJsonLayer<T extends GeoJSON>(
  layer: VectorLayer<any>,
  geoJson?: T | null,
) {
  layer.getSource()?.clear();
  geoJson && layer.getSource()?.addFeatures(gjs.readFeatures(geoJson));
}
