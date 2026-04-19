import { lineString } from "@turf/helpers";
import { distance, greatCircle } from "@turf/turf";
import type { Feature, LineString, MultiLineString, Position } from "geojson";
import { unwindCoordinates, unwrapLongitude, wrapLongitude } from "@/geo/longitude";

const GEODESIC_SEGMENT_SAMPLE_DISTANCE_METERS = 100_000;
const MAX_GEODESIC_SEGMENT_SAMPLES = 256;

function createSampledGeodesicFeature(
  start: Position,
  end: Position,
): Feature<LineString | MultiLineString> {
  const wrappedStart: Position = [wrapLongitude(start[0]), start[1]];
  const wrappedEnd: Position = [wrapLongitude(end[0]), end[1]];
  const segmentDistanceMeters =
    distance(wrappedStart, wrappedEnd, { units: "kilometers" }) * 1000;
  if (segmentDistanceMeters <= GEODESIC_SEGMENT_SAMPLE_DISTANCE_METERS) {
    return lineString([
      [start[0], start[1]],
      [end[0], end[1]],
    ]);
  }

  try {
    return greatCircle(wrappedStart, wrappedEnd, {
      npoints: Math.min(
        Math.max(
          2,
          Math.ceil(segmentDistanceMeters / GEODESIC_SEGMENT_SAMPLE_DISTANCE_METERS),
        ),
        MAX_GEODESIC_SEGMENT_SAMPLES,
      ),
    });
  } catch {
    return lineString([
      [start[0], start[1]],
      [end[0], end[1]],
    ]);
  }
}

export function sampleGeodesicCoordinates(start: Position, end: Position) {
  const feature = createSampledGeodesicFeature(start, end);
  const coordinates =
    feature.geometry.type === "LineString"
      ? feature.geometry.coordinates
      : feature.geometry.coordinates.flat();

  if (coordinates.length === 0) {
    return [start, end];
  }

  const unwound: Position[] = [[start[0], start[1]]];
  for (let index = 1; index < coordinates.length - 1; index += 1) {
    const current = coordinates[index]!;
    unwound.push([unwrapLongitude(unwound[index - 1]![0], current[0]), current[1]]);
  }
  unwound.push([end[0], end[1]]);
  return unwindCoordinates(unwound);
}
