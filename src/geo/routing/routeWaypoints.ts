import type { Position } from "geojson";

function positionsEqual(a: Position, b: Position) {
  return a[0] === b[0] && a[1] === b[1];
}

export function appendRouteWaypoints(
  existing: Position[],
  nextSegment: Position[],
): Position[] {
  if (nextSegment.length === 0) return [...existing];
  if (existing.length === 0) return [...nextSegment];

  const merged = [...existing];
  const shouldSkipFirst = positionsEqual(merged[merged.length - 1]!, nextSegment[0]!);

  for (const coordinate of nextSegment.slice(shouldSkipFirst ? 1 : 0)) {
    merged.push(coordinate);
  }

  return merged;
}

export function combineRouteWaypoints(segments: Position[][]): Position[] {
  return segments.reduce<Position[]>(
    (combined, segment) => appendRouteWaypoints(combined, segment),
    [],
  );
}
