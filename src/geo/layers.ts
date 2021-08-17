import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Coordinate } from "ol/coordinate";
import { Unit } from "../types/models";
import { Feature } from "ol";
import { Geometry, LineString, MultiPoint, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import {
  createHistoryStylesFromFeature,
  createUnitStyleFromFeature,
} from "./styles";
import { PointVectorLayer } from "./types";

export function createUnitLayer(): PointVectorLayer {
  return new VectorLayer({
    source: new VectorSource(),
    style: createUnitStyleFromFeature,
    updateWhileInteracting: true,
    updateWhileAnimating: true,
  });
}

export function createHistoryLayer(): VectorLayer<
  VectorSource<Point | LineString>
> {
  return new VectorLayer({
    source: new VectorSource(),
    style: createHistoryStylesFromFeature,
  });
}

export function createUnitFeatureAt(
  position: Coordinate,
  unit: Unit
): Feature<Point> {
  const geometry = new Point(fromLonLat(position));
  const { sidc, name, id } = unit;
  const feature = new Feature<Point>({ geometry, sidc, name, id });
  feature.setId(id);
  return feature;
}
