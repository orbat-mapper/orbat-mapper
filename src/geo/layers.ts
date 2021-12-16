import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Coordinate } from "ol/coordinate";
import { Unit } from "../types/models";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { createHistoryStylesFromFeature, createUnitStyleFromFeature } from "./styles";
import { PointVectorLayer } from "./types";
import View from "ol/View";

export function createUnitLayer(): PointVectorLayer {
  return new VectorLayer({
    source: new VectorSource(),
    style: createUnitStyleFromFeature,
    updateWhileInteracting: true,
    updateWhileAnimating: true,
  });
}

export function createHistoryLayer(): VectorLayer<VectorSource<Point | LineString>> {
  return new VectorLayer({
    source: new VectorSource(),
    style: createHistoryStylesFromFeature,
  });
}

export function createUnitFeatureAt(position: Coordinate, unit: Unit): Feature<Point> {
  const geometry = new Point(fromLonLat(position));
  const { sidc, name, id, shortName } = unit;
  const feature = new Feature<Point>({ geometry, sidc, name, id, shortName });
  feature.setId(id);
  return feature;
}

// Based on https://openlayers.org/en/latest/examples/animation.html
export function flyTo(
  view: View,
  {
    location,
    zoom,
    duration = 2000,
  }: { location: number[]; zoom?: number; duration?: number }
): Promise<boolean> {
  const zoom_ = zoom || view.getZoom();
  let parts = 2;
  let called = false;

  return new Promise((resolve) => {
    function callback(complete: boolean) {
      --parts;
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
        resolve(complete);
      }
    }

    view.animate(
      {
        center: location,
        duration: duration,
      },
      callback
    );

    if (zoom_)
      view.animate(
        {
          zoom: zoom_ - 1,
          duration: duration / 2,
        },
        {
          zoom: zoom_,
          duration: duration / 2,
        },
        callback
      );
  });
}
