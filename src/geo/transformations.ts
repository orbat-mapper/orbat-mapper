import type { Feature, FeatureCollection, LineString, Polygon } from "geojson";
import type { NScenarioFeature, NUnit } from "@/types/internalModels.ts";
import {
  feature as turfFeature,
  featureCollection as turfFeatureCollection,
  point,
  type Units as UnitOfMeasurement,
} from "@turf/helpers";
import { buffer as turfBuffer } from "@turf/buffer";
import { bboxPolygon } from "@turf/bbox-polygon";
import { bbox } from "@turf/bbox";
import { convex } from "@turf/convex";
import { simplify as turfSimplify } from "@turf/simplify";
import { bezierSpline as turfBezier } from "@turf/bezier-spline";
import { polygonSmooth as turfPolygonSmooth } from "@turf/polygon-smooth";
import { center as turfCenter } from "@turf/center";
import { centerOfMass as turfCenterOfMass } from "@turf/center-of-mass";
import { centroid as turfCentroid } from "@turf/centroid";
import { explode as turfExplode } from "@turf/explode";

export type BufferOptions = {
  radius: number;
  units?: UnitOfMeasurement;
  steps?: number;
};
export type SimplifyOptions = {
  tolerance?: number;
};
export type TransformationOperation =
  | {
      transform: "buffer";
      options: BufferOptions;
    }
  | { transform: "boundingBox"; options: {} }
  | { transform: "convexHull"; options: {} }
  | { transform: "concaveHull"; options: {} }
  | { transform: "simplify"; options: SimplifyOptions }
  | { transform: "smooth"; options: {} }
  | { transform: "center"; options: {} }
  | { transform: "centerOfMass"; options: {} }
  | { transform: "centroid"; options: {} }
  | { transform: "explode"; options: {} };

export type TransformationType = TransformationOperation["transform"];

export function isLineString(
  feature: Feature | FeatureCollection,
): feature is Feature<LineString> {
  return feature.type === "Feature" && feature.geometry.type === "LineString";
}

export function isPolygon(
  feature: Feature | FeatureCollection,
): feature is Feature<Polygon> {
  return feature.type === "Feature" && feature.geometry.type === "Polygon";
}

export function doScenarioFeatureTransformation(
  features: NScenarioFeature[],
  opts: TransformationOperation,
): Feature | FeatureCollection | null | undefined {
  if (features.length === 0 || !features[0]) return;
  const geoJSONFeatureOrFeatureCollection =
    features.length > 1
      ? turfFeatureCollection(
          features.map((f) => turfFeature(f?._state?.geometry ?? f.geometry)),
        )
      : turfFeature(features[0]?._state?.geometry ?? features[0].geometry);
  return doTransformation(geoJSONFeatureOrFeatureCollection, opts);
}

function unitToFeature(unit: NUnit): Feature {
  const location = unit?._state?.location ?? unit.location!;
  return point(location);
}

export function doUnitTransformation(units: NUnit[], opts: TransformationOperation) {
  const filteredUnits = units.filter((unit) => unit?._state?.location ?? unit.location);
  if (filteredUnits.length === 0) return;
  const geoJSONFeatureOrFeatureCollection =
    filteredUnits.length > 1
      ? turfFeatureCollection(filteredUnits.map(unitToFeature))
      : unitToFeature(filteredUnits[0]);
  return doTransformation(geoJSONFeatureOrFeatureCollection, opts);
}

function doTransformation(
  geoJSONFeatureOrFeatureCollection: Feature | FeatureCollection,
  { transform, options }: TransformationOperation,
): Feature | FeatureCollection | null | undefined {
  if (transform === "buffer") {
    const { radius, steps = 8, units = "kilometers" } = options;
    return turfBuffer(geoJSONFeatureOrFeatureCollection as any, radius, { units, steps });
  }
  if (transform === "boundingBox") {
    return bboxPolygon(bbox(geoJSONFeatureOrFeatureCollection));
  }

  if (transform === "convexHull") {
    return convex(geoJSONFeatureOrFeatureCollection);
  }

  if (transform === "concaveHull") {
    return convex(geoJSONFeatureOrFeatureCollection, { concavity: 1 });
  }

  if (transform === "simplify") {
    const { tolerance = 0.5 } = options;
    return turfSimplify(geoJSONFeatureOrFeatureCollection, {
      tolerance,
      highQuality: true,
    });
  }

  if (transform === "smooth") {
    if (isLineString(geoJSONFeatureOrFeatureCollection)) {
      return turfBezier(geoJSONFeatureOrFeatureCollection, {});
    } else if (isPolygon(geoJSONFeatureOrFeatureCollection)) {
      return turfPolygonSmooth(geoJSONFeatureOrFeatureCollection, { iterations: 4 });
    }
  }

  if (transform === "center") {
    return turfCenter(geoJSONFeatureOrFeatureCollection);
  }

  if (transform === "centerOfMass") {
    return turfCenterOfMass(geoJSONFeatureOrFeatureCollection);
  }

  if (transform === "centroid") {
    return turfCentroid(geoJSONFeatureOrFeatureCollection);
  }
  if (transform === "explode") {
    return turfExplode(geoJSONFeatureOrFeatureCollection);
  }

  return null;
}
