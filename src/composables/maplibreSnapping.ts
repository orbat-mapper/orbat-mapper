import type { PointLike } from "maplibre-gl";
import type { Geometry, Position } from "geojson";
import { isManagedScenarioFeatureLayerId } from "@/modules/maplibreview/maplibreScenarioFeatures";

const DEFAULT_SNAP_TOLERANCE_PX = 12;

type ScreenPoint = PointLike | { x: number; y: number };
type SnapFeature = {
  layer?: { id?: string | undefined };
  geometry?: Geometry | undefined;
};

type SnapMap = {
  project(position: [number, number]): ScreenPoint;
  queryRenderedFeatures(pointLike: PointLike): SnapFeature[];
};

export function getMapLibreSnapPosition(
  mlMap: SnapMap,
  pointLike: PointLike,
): Position | null {
  const renderedFeatures = mlMap
    .queryRenderedFeatures(pointLike)
    .filter(isSnappableFeature);
  const projectedPointer = toXY(pointLike);
  const candidates = renderedFeatures.flatMap((feature) =>
    getSnapCandidates(feature.geometry, mlMap, projectedPointer),
  );
  let best: { position: Position; distance: number; rank: number } | null = null;
  for (const candidate of candidates) {
    const projectedCandidate = toXY(
      mlMap.project(candidate.position as [number, number]),
    );
    const distance = Math.hypot(
      projectedCandidate.x - projectedPointer.x,
      projectedCandidate.y - projectedPointer.y,
    );
    if (distance > DEFAULT_SNAP_TOLERANCE_PX) continue;
    if (
      !best ||
      candidate.rank < best.rank ||
      (candidate.rank === best.rank && distance < best.distance)
    ) {
      best = { position: candidate.position, distance, rank: candidate.rank };
    }
  }
  return best?.position ?? null;
}

function isSnappableFeature(
  feature: SnapFeature,
): feature is SnapFeature & { geometry: Geometry } {
  const layerId = feature.layer?.id;
  return isManagedScenarioFeatureLayerId(layerId) && Boolean(feature.geometry);
}

function getSnapCandidates(
  geometry: Geometry,
  mlMap: SnapMap,
  projectedPointer: { x: number; y: number },
): Array<{ position: Position; rank: number }> {
  const vertices: Array<{ position: Position; rank: number }> = [];
  const segments: Array<{ position: Position; rank: number }> = [];
  visitGeometryLines(geometry, (coordinates) => {
    coordinates.forEach((coordinate) => vertices.push({ position: coordinate, rank: 0 }));
    for (let index = 0; index < coordinates.length - 1; index += 1) {
      const a = coordinates[index]!;
      const b = coordinates[index + 1]!;
      segments.push({
        position: closestRenderedSegmentPosition(mlMap, projectedPointer, a, b),
        rank: 1,
      });
    }
  });
  return [...vertices, ...segments];
}

function closestRenderedSegmentPosition(
  mlMap: SnapMap,
  projectedPointer: { x: number; y: number },
  a: Position,
  b: Position,
): Position {
  const projectedA = toXY(mlMap.project(a as [number, number]));
  const projectedB = toXY(mlMap.project(b as [number, number]));
  const dx = projectedB.x - projectedA.x;
  const dy = projectedB.y - projectedA.y;
  const lengthSquared = dx * dx + dy * dy;
  const ratio =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((projectedPointer.x - projectedA.x) * dx +
              (projectedPointer.y - projectedA.y) * dy) /
              lengthSquared,
          ),
        );
  return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
}

function visitGeometryLines(
  geometry: Geometry,
  visit: (coordinates: Position[]) => void,
) {
  if (geometry.type === "LineString" || geometry.type === "MultiPoint") {
    visit(geometry.coordinates);
  } else if (geometry.type === "Polygon" || geometry.type === "MultiLineString") {
    geometry.coordinates.forEach(visit);
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly) => poly.forEach(visit));
  } else if (geometry.type === "Point") {
    visit([geometry.coordinates]);
  } else if (geometry.type === "GeometryCollection") {
    geometry.geometries.forEach((child) => visitGeometryLines(child, visit));
  }
}

function toXY(pointLike: ScreenPoint) {
  if ("x" in pointLike) return pointLike;
  return { x: pointLike[0], y: pointLike[1] };
}
