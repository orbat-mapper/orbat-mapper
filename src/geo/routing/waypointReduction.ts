import { lineString } from "@turf/helpers";
import { booleanDisjoint } from "@turf/turf";
import type { Position } from "geojson";
import { sampleGeodesicCoordinates } from "@/geo/routing/geodesicSegments";
import type { RoutingObstacleCollection } from "@/geo/routing/types";

function segmentClearsObstacles(
  start: Position,
  end: Position,
  obstacles: RoutingObstacleCollection,
) {
  if (obstacles.features.length === 0) return true;
  const segment = lineString(sampleGeodesicCoordinates(start, end));
  return obstacles.features.every((feature) => booleanDisjoint(segment, feature));
}

export function reduceObstacleSafeWaypoints(
  waypoints: Position[],
  obstacles: RoutingObstacleCollection,
) {
  if (waypoints.length <= 2) {
    return [...waypoints];
  }

  const reduced: Position[] = [waypoints[0]!];

  for (let index = 1; index < waypoints.length - 1; index += 1) {
    const previous = reduced[reduced.length - 1]!;
    const current = waypoints[index]!;
    const next = waypoints[index + 1]!;
    if (!segmentClearsObstacles(previous, next, obstacles)) {
      reduced.push(current);
    }
  }

  reduced.push(waypoints[waypoints.length - 1]!);
  return reduced;
}
