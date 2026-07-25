import type { Map as MlMap } from "maplibre-gl";
import type { Position } from "geojson";
import { unwrapPositionRelative } from "@/geo/longitude";
import {
  isGlobeProjection,
  latitudeToMercatorY,
  mercatorYToLatitude,
} from "@/geo/mercator";

const SEGMENT_SAMPLES = 64;

export function midpoint(a: Position, b: Position): Position {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/**
 * The midpoint of a segment as it is drawn on screen, so a handle placed there
 * sits visually halfway along the line even when the projection curves it.
 */
export function getRenderedMidpoint(map: MlMap, a: Position, b: Position): Position {
  if (isGlobeProjection(map)) {
    return projectedMercatorSegmentMidpoint(map, a, b);
  }
  try {
    const projectedA = map.project(a as [number, number]);
    const projectedB = map.project(b as [number, number]);
    const renderedMidpoint = map.unproject([
      (projectedA.x + projectedB.x) / 2,
      (projectedA.y + projectedB.y) / 2,
    ]);
    return [renderedMidpoint.lng, renderedMidpoint.lat];
  } catch {
    return midpoint(a, b);
  }
}

function projectedMercatorSegmentMidpoint(
  map: MlMap,
  a: Position,
  b: Position,
): Position {
  try {
    const coordinates = sampleMercatorSegmentCoordinates(a, b);
    const projected = coordinates.map((coordinate) => ({
      coordinate,
      point: map.project(coordinate as [number, number]),
    }));
    const lengths: number[] = [];
    let totalLength = 0;

    for (let index = 0; index < projected.length - 1; index++) {
      const start = projected[index]!.point;
      const end = projected[index + 1]!.point;
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      lengths.push(length);
      totalLength += length;
    }

    if (totalLength === 0) return midpoint(a, b);

    let remaining = totalLength / 2;
    for (let index = 0; index < lengths.length; index++) {
      const length = lengths[index]!;
      if (remaining > length) {
        remaining -= length;
        continue;
      }
      const start = projected[index]!.coordinate;
      const end = projected[index + 1]!.coordinate;
      const ratio = length === 0 ? 0 : remaining / length;
      return unwrapPositionRelative(a, [
        start[0] + (end[0] - start[0]) * ratio,
        start[1] + (end[1] - start[1]) * ratio,
      ]);
    }

    return coordinates[Math.floor(coordinates.length / 2)]!;
  } catch {
    return midpoint(a, b);
  }
}

function sampleMercatorSegmentCoordinates(a: Position, b: Position): Position[] {
  const end = unwrapPositionRelative(a, b);
  const startY = latitudeToMercatorY(a[1]);
  const endY = latitudeToMercatorY(end[1]);
  const coordinates: Position[] = [];

  for (let index = 0; index <= SEGMENT_SAMPLES; index++) {
    const ratio = index / SEGMENT_SAMPLES;
    coordinates.push([
      a[0] + (end[0] - a[0]) * ratio,
      mercatorYToLatitude(startY + (endY - startY) * ratio),
    ]);
  }

  return coordinates;
}
