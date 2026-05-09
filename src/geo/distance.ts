import type { Position } from "geojson";
import { distance } from "@turf/turf";

const ZERO_LENGTH_SEGMENT_TOLERANCE_METERS = 0.01;

export function distanceMeters(a: Position, b: Position) {
  return distance(a, b, { units: "meters" });
}

export function isZeroLengthSegment(a: Position, b: Position) {
  return distanceMeters(a, b) <= ZERO_LENGTH_SEGMENT_TOLERANCE_METERS;
}
