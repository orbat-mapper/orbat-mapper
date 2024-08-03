import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Coordinate } from "ol/coordinate";
import type { Unit } from "@/types/scenarioModels";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";

import { AnyVectorLayer } from "./types";
import View from "ol/View";
import { nanoid } from "@/utils";
import { NUnit } from "@/types/internalModels";
import { LayerTypes } from "@/modules/scenarioeditor/featureLayerUtils";

export function createUnitLayer(): AnyVectorLayer {
  return new VectorLayer({
    source: new VectorSource(),
    updateWhileInteracting: true,
    updateWhileAnimating: true,
    properties: {
      id: nanoid(),
      title: "Unit layer",
      layerType: LayerTypes.units,
    },
  });
}

export function createUnitFeatureAt(
  position: Coordinate,
  unit: Unit | NUnit,
): Feature<Point> {
  const geometry = new Point(fromLonLat(position));
  const feature = new Feature<Point>({
    geometry,
  });
  feature.setId(unit.id);
  return feature;
}

// Based on https://openlayers.org/en/latest/examples/animation.html
export function flyTo(
  view: View,
  {
    location,
    zoom,
    duration = 2000,
  }: { location: number[]; zoom?: number; duration?: number },
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
      callback,
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
        callback,
      );
  });
}
