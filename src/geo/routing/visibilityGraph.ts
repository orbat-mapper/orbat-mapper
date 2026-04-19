import { lineString } from "@turf/helpers";
import turfLength from "@turf/length";
import { distance, flatten } from "@turf/turf";
import type { Feature, FeatureCollection, LineString, Polygon, Position } from "geojson";
import {
  unwindCoordinates,
  unwrapLongitude,
  unwrapPositionRelative,
  wrapLongitude,
} from "@/geo/longitude";
import { sampleGeodesicCoordinates } from "@/geo/routing/geodesicSegments";
import { RoutingError, type RoutingObstacleCollection } from "@/geo/routing/types";

const NUMERIC_EPSILON = 1e-9;

type GraphNode = {
  id: number;
  coordinate: Position;
  polygonId: string | null;
  ringId: string | null;
  vertexIndex: number | null;
};

type GraphEdge = {
  to: number;
  lengthMeters: number;
};

type GeodesicSegment = {
  coordinates: Position[];
  lengthMeters: number;
  bounds: CorridorBounds;
};

type PairEvaluation = {
  visible: boolean;
  segment: GeodesicSegment;
};

type ObstacleRingEdge = {
  ringId: string;
  start: Position;
  end: Position;
  startIndex: number;
  endIndex: number;
  bbox: CorridorBounds;
};

type ObstaclePolygon = {
  id: string;
  worldShift: number;
  feature: Feature<Polygon>;
  bbox: CorridorBounds;
  ringVertexCounts: Map<string, number>;
  ringEdges: ObstacleRingEdge[];
  // Edges sorted by bbox.minLongitude for fast range queries.
  sortedEdges: ObstacleRingEdge[];
  sortedEdgeMinLons: Float64Array;
  vertices: Array<{
    ringId: string;
    coordinate: Position;
    vertexIndex: number;
  }>;
};

type SegmentIntersectionKind = "none" | "touch" | "proper" | "overlap";
type CorridorBounds = {
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
};

const PRECOMPUTED_WORLD_SHIFTS = [-360, 0, 360] as const;
const NEIGHBOR_ANGLE_BUCKET_COUNT = 24;
const NEIGHBOR_BUCKET_LIMIT = 4;
const NEIGHBOR_NEAREST_LIMIT = 24;
const NEIGHBOR_GOAL_BIASED_LIMIT = 12;

let cachedObstaclePolygonKey: string | null = null;
let cachedObstaclePolygons: ObstaclePolygon[] | null = null;

function positionsEqual(a: Position, b: Position) {
  return a[0] === b[0] && a[1] === b[1];
}

function createBoundsFromCoordinates(coordinates: Position[]): CorridorBounds {
  let minLongitude = Infinity;
  let maxLongitude = -Infinity;
  let minLatitude = Infinity;
  let maxLatitude = -Infinity;
  for (const coordinate of coordinates) {
    const longitude = coordinate[0]!;
    const latitude = coordinate[1]!;
    if (longitude < minLongitude) minLongitude = longitude;
    if (longitude > maxLongitude) maxLongitude = longitude;
    if (latitude < minLatitude) minLatitude = latitude;
    if (latitude > maxLatitude) maxLatitude = latitude;
  }
  return { minLongitude, maxLongitude, minLatitude, maxLatitude };
}

function createSegmentBounds(start: Position, end: Position): CorridorBounds {
  return {
    minLongitude: Math.min(start[0], end[0]),
    maxLongitude: Math.max(start[0], end[0]),
    minLatitude: Math.min(start[1], end[1]),
    maxLatitude: Math.max(start[1], end[1]),
  };
}

function boundsIntersect(a: CorridorBounds, b: CorridorBounds) {
  return !(
    a.maxLongitude < b.minLongitude ||
    a.minLongitude > b.maxLongitude ||
    a.maxLatitude < b.minLatitude ||
    a.minLatitude > b.maxLatitude
  );
}

function createEmptyPath(start: Position, end: Position) {
  return lineString([start, end]);
}

function corridorShifts(corridor: CorridorBounds): number[] {
  const shifts: number[] = [0];
  if (corridor.maxLongitude > 180) shifts.push(360);
  if (corridor.minLongitude < -180) shifts.push(-360);
  return shifts;
}

function buildObstaclePolygons(obstacles: RoutingObstacleCollection): ObstaclePolygon[] {
  const polygons = flatten(obstacles) as FeatureCollection<Polygon>;
  const result: ObstaclePolygon[] = [];

  polygons.features.forEach((feature, featureIndex) => {
    const baseId = `${feature.id ?? "obstacle"}#${featureIndex}`;
    PRECOMPUTED_WORLD_SHIFTS.forEach((shift) => {
      const shiftedGeometry: Polygon = {
        type: "Polygon",
        coordinates: feature.geometry.coordinates.map((ring) => {
          if (ring.length === 0) {
            return ring;
          }

          const shiftedFirst = wrapLongitude(ring[0]![0]) + shift;
          const unwrappedRing: Position[] = [[shiftedFirst, ring[0]![1]]];

          for (let index = 1; index < ring.length; index += 1) {
            const current = ring[index]!;
            unwrappedRing.push([
              unwrapLongitude(unwrappedRing[index - 1]![0], current[0] + shift),
              current[1],
            ]);
          }

          return unwrappedRing;
        }),
      };

      const featureId = `${baseId}:${shift}`;
      const polygonFeature: Feature<Polygon> = {
        type: "Feature",
        id: featureId,
        properties: feature.properties ?? {},
        geometry: shiftedGeometry,
      };

      const vertices: ObstaclePolygon["vertices"] = [];
      const ringEdges: ObstaclePolygon["ringEdges"] = [];
      const ringVertexCounts = new Map<string, number>();

      shiftedGeometry.coordinates.forEach((ring, ringIndex) => {
        const ringVertices = ring.slice(0, -1);
        if (ringVertices.length === 0) {
          return;
        }
        const ringId = `${featureId}:${ringIndex}`;
        ringVertexCounts.set(ringId, ringVertices.length);

        ringVertices.forEach((coordinate, vertexIndex) => {
          vertices.push({
            ringId,
            coordinate,
            vertexIndex,
          });
        });

        for (let vertexIndex = 0; vertexIndex < ringVertices.length; vertexIndex += 1) {
          const nextIndex = (vertexIndex + 1) % ringVertices.length;
          ringEdges.push({
            ringId,
            start: ringVertices[vertexIndex]!,
            end: ringVertices[nextIndex]!,
            startIndex: vertexIndex,
            endIndex: nextIndex,
            bbox: createSegmentBounds(
              ringVertices[vertexIndex]!,
              ringVertices[nextIndex]!,
            ),
          });
        }
      });

      const polygonBounds = shiftedGeometry.coordinates.flat();
      const bbox = createBoundsFromCoordinates(polygonBounds);

      const sortedEdges = ringEdges
        .slice()
        .sort((a, b) => a.bbox.minLongitude - b.bbox.minLongitude);
      const sortedEdgeMinLons = new Float64Array(sortedEdges.length);
      for (let i = 0; i < sortedEdges.length; i += 1) {
        sortedEdgeMinLons[i] = sortedEdges[i]!.bbox.minLongitude;
      }

      result.push({
        id: featureId,
        worldShift: shift,
        feature: polygonFeature,
        bbox,
        ringVertexCounts,
        ringEdges,
        sortedEdges,
        sortedEdgeMinLons,
        vertices,
      });
    });
  });

  return result;
}

function selectObstaclePolygons(
  obstacles: ObstaclePolygon[],
  start: Position,
  end: Position,
  paddingScale: number,
) {
  const corridor = createCorridorBounds(start, end, paddingScale);
  const allowedShifts = new Set(corridorShifts(corridor));

  return obstacles.filter((obstacle) => {
    if (!allowedShifts.has(obstacle.worldShift)) {
      return false;
    }

    const { minLongitude, maxLongitude, minLatitude, maxLatitude } = obstacle.bbox;
    if (maxLongitude < start[0] - 360 || minLongitude > start[0] + 360) {
      return false;
    }

    return !(
      maxLongitude < corridor.minLongitude ||
      minLongitude > corridor.maxLongitude ||
      maxLatitude < corridor.minLatitude ||
      minLatitude > corridor.maxLatitude
    );
  });
}

function getObstaclePolygons(
  obstacles: RoutingObstacleCollection,
  obstacleCacheKey?: string,
) {
  if (!obstacleCacheKey) {
    return buildObstaclePolygons(obstacles);
  }

  if (cachedObstaclePolygonKey !== obstacleCacheKey || !cachedObstaclePolygons) {
    cachedObstaclePolygonKey = obstacleCacheKey;
    cachedObstaclePolygons = buildObstaclePolygons(obstacles);
  }

  return cachedObstaclePolygons;
}

function createCorridorBounds(
  start: Position,
  end: Position,
  paddingScale: number,
): CorridorBounds {
  const longitudeSpan = Math.abs(end[0] - start[0]);
  const latitudeSpan = Math.abs(end[1] - start[1]);
  const directDistanceKm = distance(
    [wrapLongitude(start[0]), start[1]],
    [wrapLongitude(end[0]), end[1]],
    {
      units: "kilometers",
    },
  );
  const longitudePadding = Math.min(
    120,
    Math.max(2, longitudeSpan * 0.35, (directDistanceKm / 250) * paddingScale),
  );
  const latitudePadding = Math.min(
    60,
    Math.max(2, latitudeSpan * 0.35, (directDistanceKm / 500) * paddingScale),
  );

  return {
    minLongitude: Math.min(start[0], end[0]) - longitudePadding,
    maxLongitude: Math.max(start[0], end[0]) + longitudePadding,
    minLatitude: Math.max(-90, Math.min(start[1], end[1]) - latitudePadding),
    maxLatitude: Math.min(90, Math.max(start[1], end[1]) + latitudePadding),
  };
}

// Ray-cast point-in-polygon. Returns true only for strictly interior points.
// Points on a polygon edge are treated as outside (matches turf's
// `ignoreBoundary: true` behavior used on per-segment midpoint checks).
function isCoordinateInsidePolygon(coord: Position, polygon: Polygon): boolean {
  const x = coord[0];
  const y = coord[1];
  let inside = false;
  for (const ring of polygon.coordinates) {
    if (ring.length < 3) continue;
    let ringInside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i]![0];
      const yi = ring[i]![1];
      const xj = ring[j]![0];
      const yj = ring[j]![1];
      const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (crosses) ringInside = !ringInside;
    }
    if (ringInside) inside = !inside;
  }
  return inside;
}

// Iterates obstacle edges whose bbox may overlap `bounds`, using the sorted
// minLongitude index to binary-search an upper bound. Returns true if `visit`
// returned true for any edge (short-circuit).
function anyCandidateEdge(
  obstacle: ObstaclePolygon,
  bounds: CorridorBounds,
  visit: (edge: ObstacleRingEdge) => boolean,
): boolean {
  const { sortedEdges, sortedEdgeMinLons } = obstacle;
  // Upper bound: first index where edge.minLongitude > bounds.maxLongitude.
  let lo = 0;
  let hi = sortedEdges.length;
  const target = bounds.maxLongitude;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sortedEdgeMinLons[mid]! > target) hi = mid;
    else lo = mid + 1;
  }
  for (let i = 0; i < lo; i += 1) {
    const edge = sortedEdges[i]!;
    const edgeBounds = edge.bbox;
    if (edgeBounds.maxLongitude < bounds.minLongitude) continue;
    if (edgeBounds.maxLatitude < bounds.minLatitude) continue;
    if (edgeBounds.minLatitude > bounds.maxLatitude) continue;
    if (visit(edge)) return true;
  }
  return false;
}

function isBlockedEndpoint(position: Position, obstacles: ObstaclePolygon[]) {
  return obstacles.some((obstacle) => {
    if (isCoordinateInsidePolygon(position, obstacle.feature.geometry)) {
      return true;
    }

    const pointBounds: CorridorBounds = {
      minLongitude: position[0],
      maxLongitude: position[0],
      minLatitude: position[1],
      maxLatitude: position[1],
    };
    return anyCandidateEdge(obstacle, pointBounds, (edge) =>
      isPointOnSegment(position, edge.start, edge.end),
    );
  });
}

function toSegmentKey(startIndex: number, endIndex: number) {
  return `${Math.min(startIndex, endIndex)}:${Math.max(startIndex, endIndex)}`;
}

function crossProduct(origin: Position, a: Position, b: Position) {
  return (
    (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0])
  );
}

function isPointOnSegment(pointCoordinate: Position, start: Position, end: Position) {
  if (Math.abs(crossProduct(start, end, pointCoordinate)) > NUMERIC_EPSILON) {
    return false;
  }

  return (
    pointCoordinate[0] <= Math.max(start[0], end[0]) + NUMERIC_EPSILON &&
    pointCoordinate[0] >= Math.min(start[0], end[0]) - NUMERIC_EPSILON &&
    pointCoordinate[1] <= Math.max(start[1], end[1]) + NUMERIC_EPSILON &&
    pointCoordinate[1] >= Math.min(start[1], end[1]) - NUMERIC_EPSILON
  );
}

function segmentIntersectionKind(
  firstStart: Position,
  firstEnd: Position,
  secondStart: Position,
  secondEnd: Position,
): SegmentIntersectionKind {
  const orientation1 = crossProduct(firstStart, firstEnd, secondStart);
  const orientation2 = crossProduct(firstStart, firstEnd, secondEnd);
  const orientation3 = crossProduct(secondStart, secondEnd, firstStart);
  const orientation4 = crossProduct(secondStart, secondEnd, firstEnd);

  const hasColinearEndpoint =
    Math.abs(orientation1) <= NUMERIC_EPSILON ||
    Math.abs(orientation2) <= NUMERIC_EPSILON ||
    Math.abs(orientation3) <= NUMERIC_EPSILON ||
    Math.abs(orientation4) <= NUMERIC_EPSILON;

  if (
    Math.abs(orientation1) <= NUMERIC_EPSILON &&
    Math.abs(orientation2) <= NUMERIC_EPSILON &&
    Math.abs(orientation3) <= NUMERIC_EPSILON &&
    Math.abs(orientation4) <= NUMERIC_EPSILON
  ) {
    const overlapMinX = Math.max(
      Math.min(firstStart[0], firstEnd[0]),
      Math.min(secondStart[0], secondEnd[0]),
    );
    const overlapMaxX = Math.min(
      Math.max(firstStart[0], firstEnd[0]),
      Math.max(secondStart[0], secondEnd[0]),
    );
    const overlapMinY = Math.max(
      Math.min(firstStart[1], firstEnd[1]),
      Math.min(secondStart[1], secondEnd[1]),
    );
    const overlapMaxY = Math.min(
      Math.max(firstStart[1], firstEnd[1]),
      Math.max(secondStart[1], secondEnd[1]),
    );

    if (
      overlapMinX > overlapMaxX + NUMERIC_EPSILON ||
      overlapMinY > overlapMaxY + NUMERIC_EPSILON
    ) {
      return "none";
    }

    const isSinglePointOverlap =
      Math.abs(overlapMaxX - overlapMinX) <= NUMERIC_EPSILON &&
      Math.abs(overlapMaxY - overlapMinY) <= NUMERIC_EPSILON;

    return isSinglePointOverlap ? "touch" : "overlap";
  }

  const properIntersection =
    ((orientation1 > NUMERIC_EPSILON && orientation2 < -NUMERIC_EPSILON) ||
      (orientation1 < -NUMERIC_EPSILON && orientation2 > NUMERIC_EPSILON)) &&
    ((orientation3 > NUMERIC_EPSILON && orientation4 < -NUMERIC_EPSILON) ||
      (orientation3 < -NUMERIC_EPSILON && orientation4 > NUMERIC_EPSILON));

  if (properIntersection) {
    return "proper";
  }

  if (
    (Math.abs(orientation1) <= NUMERIC_EPSILON &&
      isPointOnSegment(secondStart, firstStart, firstEnd)) ||
    (Math.abs(orientation2) <= NUMERIC_EPSILON &&
      isPointOnSegment(secondEnd, firstStart, firstEnd)) ||
    (Math.abs(orientation3) <= NUMERIC_EPSILON &&
      isPointOnSegment(firstStart, secondStart, secondEnd)) ||
    (Math.abs(orientation4) <= NUMERIC_EPSILON &&
      isPointOnSegment(firstEnd, secondStart, secondEnd))
  ) {
    return hasColinearEndpoint ? "touch" : "proper";
  }

  return "none";
}

// Returns true if the line between `start` and `end` is traversable without
// crossing any obstacle. When the path is a single straight segment and both
// endpoints are strictly outside an obstacle (per the precomputed inside
// flags) AND no candidate edge reports a "touch", the segment cannot enter
// the polygon — so the point-in-polygon midpoint check can be skipped.
// A touch (segment passes through a polygon vertex) leaves the diagonal-chord
// case ambiguous, so we fall back to the midpoint check when any touch is
// observed. Multi-segment geodesic paths (>100 km) always run the midpoint
// check.
function isVisibleBetweenSegment(
  segment: GeodesicSegment,
  obstacles: ObstaclePolygon[],
  startInside?: Uint8Array,
  endInside?: Uint8Array,
): boolean {
  const sampledPath = segment.coordinates;
  const pathBounds = segment.bounds;
  const relevantObstacleIndices: number[] = [];
  for (let i = 0; i < obstacles.length; i += 1) {
    if (boundsIntersect(pathBounds, obstacles[i]!.bbox)) {
      relevantObstacleIndices.push(i);
    }
  }
  if (relevantObstacleIndices.length === 0) {
    return true;
  }

  const isStraightPath = sampledPath.length === 2;

  for (let segmentIndex = 0; segmentIndex < sampledPath.length - 1; segmentIndex += 1) {
    const segmentStart = sampledPath[segmentIndex]!;
    const segmentEnd = sampledPath[segmentIndex + 1]!;
    const segmentBounds = createSegmentBounds(segmentStart, segmentEnd);

    for (const obstacleIndex of relevantObstacleIndices) {
      const obstacle = obstacles[obstacleIndex]!;
      if (!boundsIntersect(segmentBounds, obstacle.bbox)) {
        continue;
      }

      let sawTouch = false;
      let blocked = false;
      anyCandidateEdge(obstacle, segmentBounds, (edge) => {
        const kind = segmentIntersectionKind(
          segmentStart,
          segmentEnd,
          edge.start,
          edge.end,
        );
        if (kind === "proper" || kind === "overlap") {
          blocked = true;
          return true;
        }
        if (kind === "touch") {
          sawTouch = true;
        }
        return false;
      });
      if (blocked) {
        return false;
      }

      const canSkipContainment =
        isStraightPath &&
        !sawTouch &&
        startInside !== undefined &&
        endInside !== undefined &&
        startInside[obstacleIndex] === 0 &&
        endInside[obstacleIndex] === 0;

      if (canSkipContainment) {
        continue;
      }

      const midpoint: Position = [
        (segmentStart[0] + segmentEnd[0]) / 2,
        (segmentStart[1] + segmentEnd[1]) / 2,
      ];
      if (isCoordinateInsidePolygon(midpoint, obstacle.feature.geometry)) {
        return false;
      }
    }
  }

  return true;
}

function createGraphNodes(start: Position, end: Position, obstacles: ObstaclePolygon[]) {
  const nodes: GraphNode[] = [
    { id: 0, coordinate: start, polygonId: null, ringId: null, vertexIndex: null },
    { id: 1, coordinate: end, polygonId: null, ringId: null, vertexIndex: null },
  ];

  obstacles.forEach((obstacle) => {
    obstacle.vertices.forEach((vertex) => {
      nodes.push({
        id: nodes.length,
        coordinate: vertex.coordinate,
        polygonId: obstacle.id,
        ringId: vertex.ringId,
        vertexIndex: vertex.vertexIndex,
      });
    });
  });

  return nodes;
}

function isAdjacentRingVertex(
  a: GraphNode,
  b: GraphNode,
  obstaclesById: Map<string, ObstaclePolygon>,
) {
  if (
    !a.polygonId ||
    !b.polygonId ||
    !a.ringId ||
    !b.ringId ||
    a.polygonId !== b.polygonId ||
    a.ringId !== b.ringId
  ) {
    return false;
  }

  const ringId = a.ringId;
  const obstacle = obstaclesById.get(a.polygonId);
  if (!obstacle) {
    return false;
  }

  const ringLength = obstacle.ringVertexCounts.get(ringId) ?? 0;
  if (ringLength <= 1 || a.vertexIndex === null || b.vertexIndex === null) {
    return false;
  }

  const delta = Math.abs(a.vertexIndex - b.vertexIndex);
  return delta === 1 || delta === ringLength - 1;
}

function createGeodesicSegment(start: Position, end: Position): GeodesicSegment {
  const coordinates = sampleGeodesicCoordinates(start, end);
  return {
    coordinates,
    lengthMeters: turfLength(lineString(coordinates), { units: "kilometers" }) * 1000,
    bounds: createBoundsFromCoordinates(coordinates),
  };
}

function squaredDistance(a: Position, b: Position) {
  const deltaLongitude = a[0] - b[0];
  const deltaLatitude = a[1] - b[1];
  return deltaLongitude * deltaLongitude + deltaLatitude * deltaLatitude;
}

function angleBucketIndex(from: Position, to: Position) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const normalized = angle < 0 ? angle + Math.PI * 2 : angle;
  return Math.min(
    NEIGHBOR_ANGLE_BUCKET_COUNT - 1,
    Math.floor((normalized / (Math.PI * 2)) * NEIGHBOR_ANGLE_BUCKET_COUNT),
  );
}

function insertLimitedCandidate(
  entries: Array<{ index: number; score: number }>,
  candidate: { index: number; score: number },
  limit: number,
) {
  const existingIndex = entries.findIndex((entry) => entry.index === candidate.index);
  if (existingIndex >= 0) {
    if (entries[existingIndex]!.score <= candidate.score) {
      return;
    }
    entries.splice(existingIndex, 1);
  }

  let insertIndex = 0;
  while (insertIndex < entries.length && entries[insertIndex]!.score <= candidate.score) {
    insertIndex += 1;
  }
  entries.splice(insertIndex, 0, candidate);
  if (entries.length > limit) {
    entries.length = limit;
  }
}

class MinPriorityQueue<T> {
  private readonly items: Array<{ priority: number; value: T }> = [];

  push(priority: number, value: T) {
    this.items.push({ priority, value });
    this.bubbleUp(this.items.length - 1);
  }

  pop() {
    const first = this.items[0];
    const last = this.items.pop();
    if (!first) {
      return null;
    }

    if (last && this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    return first.value;
  }

  get size() {
    return this.items.length;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.items[parentIndex]!.priority <= this.items[index]!.priority) {
        break;
      }

      [this.items[parentIndex], this.items[index]] = [
        this.items[index]!,
        this.items[parentIndex]!,
      ];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number) {
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;

      if (
        left < this.items.length &&
        this.items[left]!.priority < this.items[smallest]!.priority
      ) {
        smallest = left;
      }

      if (
        right < this.items.length &&
        this.items[right]!.priority < this.items[smallest]!.priority
      ) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      [this.items[index], this.items[smallest]] = [
        this.items[smallest]!,
        this.items[index]!,
      ];
      index = smallest;
    }
  }
}

function reconstructNodePath(previousNode: number[], targetNode: number) {
  const nodePath: number[] = [];
  let currentNode = targetNode;

  while (currentNode !== -1) {
    nodePath.push(currentNode);
    currentNode = previousNode[currentNode]!;
  }

  nodePath.reverse();
  return nodePath;
}

// For every (node, obstacle) pair, precompute whether the node lies strictly
// inside the obstacle polygon. Obstacle-vertex nodes are treated as outside
// their parent polygon (they sit on the boundary). This table lets
// `isVisibleBetweenNodes` skip the per-segment point-in-polygon midpoint check
// on the straight-line common case.
function buildNodeInsideTable(
  nodes: GraphNode[],
  obstacles: ObstaclePolygon[],
): Uint8Array {
  const table = new Uint8Array(nodes.length * obstacles.length);
  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
    const node = nodes[nodeIndex]!;
    for (let obstacleIndex = 0; obstacleIndex < obstacles.length; obstacleIndex += 1) {
      const obstacle = obstacles[obstacleIndex]!;
      if (node.polygonId === obstacle.id) continue;
      const coord = node.coordinate;
      const bbox = obstacle.bbox;
      if (
        coord[0] < bbox.minLongitude ||
        coord[0] > bbox.maxLongitude ||
        coord[1] < bbox.minLatitude ||
        coord[1] > bbox.maxLatitude
      ) {
        continue;
      }
      if (isCoordinateInsidePolygon(coord, obstacle.feature.geometry)) {
        table[nodeIndex * obstacles.length + obstacleIndex] = 1;
      }
    }
  }
  return table;
}

function runAStar(nodes: GraphNode[], obstacles: ObstaclePolygon[]) {
  const open = new MinPriorityQueue<number>();
  const bestDistance = new Array<number>(nodes.length).fill(Infinity);
  const previousNode = new Array<number>(nodes.length).fill(-1);
  const neighborCache = new Map<number, GraphEdge[]>();
  const candidateIndexCache = new Map<number, number[]>();
  const pairCache = new Map<string, PairEvaluation>();
  const obstaclesById = new Map(
    obstacles.map((obstacle) => [obstacle.id, obstacle] as const),
  );
  const obstacleCount = obstacles.length;
  const nodeInside = buildNodeInsideTable(nodes, obstacles);
  const heuristicToGoal = new Float64Array(nodes.length);
  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
    heuristicToGoal[nodeIndex] =
      nodeIndex === 1
        ? 0
        : distance(nodes[nodeIndex]!.coordinate, nodes[1]!.coordinate, {
            units: "kilometers",
          }) * 1000;
  }
  const insideFlagsFor = (nodeIndex: number) =>
    obstacleCount === 0
      ? undefined
      : nodeInside.subarray(
          nodeIndex * obstacleCount,
          nodeIndex * obstacleCount + obstacleCount,
        );

  const getPairEvaluation = (
    startIndex: number,
    endIndex: number,
    startFlags?: Uint8Array,
    endFlags?: Uint8Array,
  ) => {
    const pairKey = toSegmentKey(startIndex, endIndex);
    const cached = pairCache.get(pairKey);
    if (cached) {
      return cached;
    }

    const startNode = nodes[startIndex]!;
    const endNode = nodes[endIndex]!;
    const segment = createGeodesicSegment(startNode.coordinate, endNode.coordinate);
    const evaluation: PairEvaluation = {
      visible:
        isAdjacentRingVertex(startNode, endNode, obstaclesById) ||
        isVisibleBetweenSegment(segment, obstacles, startFlags, endFlags),
      segment,
    };
    pairCache.set(pairKey, evaluation);
    return evaluation;
  };

  const getCandidateIndices = (nodeIndex: number) => {
    const cached = candidateIndexCache.get(nodeIndex);
    if (cached) {
      return cached;
    }

    const node = nodes[nodeIndex]!;
    const nearestOverall: Array<{ index: number; score: number }> = [];
    const goalBiased: Array<{ index: number; score: number }> = [];
    const bucketCandidates = Array.from({ length: NEIGHBOR_ANGLE_BUCKET_COUNT }, () => {
      return [] as Array<{ index: number; score: number }>;
    });
    const directCandidates = new Set<number>();

    directCandidates.add(0);
    directCandidates.add(1);
    directCandidates.delete(nodeIndex);

    for (let otherIndex = 0; otherIndex < nodes.length; otherIndex += 1) {
      if (otherIndex === nodeIndex) continue;
      const otherNode = nodes[otherIndex]!;
      if (positionsEqual(node.coordinate, otherNode.coordinate)) continue;

      if (isAdjacentRingVertex(node, otherNode, obstaclesById)) {
        directCandidates.add(otherIndex);
        continue;
      }

      const score = squaredDistance(node.coordinate, otherNode.coordinate);
      insertLimitedCandidate(
        nearestOverall,
        { index: otherIndex, score },
        NEIGHBOR_NEAREST_LIMIT,
      );
      insertLimitedCandidate(
        goalBiased,
        { index: otherIndex, score: heuristicToGoal[otherIndex]! },
        NEIGHBOR_GOAL_BIASED_LIMIT,
      );
      insertLimitedCandidate(
        bucketCandidates[angleBucketIndex(node.coordinate, otherNode.coordinate)]!,
        { index: otherIndex, score },
        NEIGHBOR_BUCKET_LIMIT,
      );
    }

    const candidates = new Set<number>(directCandidates);
    nearestOverall.forEach((entry) => candidates.add(entry.index));
    goalBiased.forEach((entry) => candidates.add(entry.index));
    bucketCandidates.forEach((entries) =>
      entries.forEach((entry) => candidates.add(entry.index)),
    );
    const result = [...candidates];
    candidateIndexCache.set(nodeIndex, result);
    return result;
  };

  const getNeighbors = (nodeIndex: number) => {
    const cached = neighborCache.get(nodeIndex);
    if (cached) {
      return cached;
    }

    const node = nodes[nodeIndex]!;
    const neighbors: GraphEdge[] = [];
    const startFlags = insideFlagsFor(nodeIndex);
    const tryCandidate = (otherIndex: number) => {
      if (otherIndex === nodeIndex) return;
      const otherNode = nodes[otherIndex]!;
      if (positionsEqual(node.coordinate, otherNode.coordinate)) return;

      const pairEvaluation = getPairEvaluation(
        nodeIndex,
        otherIndex,
        startFlags,
        insideFlagsFor(otherIndex),
      );
      if (!pairEvaluation.visible) return;
      neighbors.push({
        to: otherIndex,
        lengthMeters: pairEvaluation.segment.lengthMeters,
      });
    };

    const candidateIndices = getCandidateIndices(nodeIndex);
    candidateIndices.forEach(tryCandidate);

    const shouldFallbackToDenseSearch =
      candidateIndices.length < nodes.length - 1 &&
      ((nodeIndex === 0 && neighbors.length < 2) || neighbors.length === 0);

    if (shouldFallbackToDenseSearch) {
      const seenTargets = new Set(neighbors.map((edge) => edge.to));
      for (let otherIndex = 0; otherIndex < nodes.length; otherIndex += 1) {
        if (seenTargets.has(otherIndex)) continue;
        tryCandidate(otherIndex);
      }
    }

    neighborCache.set(nodeIndex, neighbors);
    return neighbors;
  };

  bestDistance[0] = 0;
  open.push(0, 0);
  const settled = new Uint8Array(nodes.length);

  while (open.size > 0) {
    const currentNode = open.pop();
    if (currentNode === null) {
      break;
    }

    if (settled[currentNode]) {
      continue;
    }
    settled[currentNode] = 1;

    if (currentNode === 1) {
      return {
        nodePath: reconstructNodePath(previousNode, currentNode),
        getSegment: (startIndex: number, endIndex: number) =>
          getPairEvaluation(startIndex, endIndex).segment,
      };
    }

    for (const edge of getNeighbors(currentNode)) {
      const candidateDistance = bestDistance[currentNode]! + edge.lengthMeters;
      if (candidateDistance >= bestDistance[edge.to]!) {
        continue;
      }

      bestDistance[edge.to] = candidateDistance;
      previousNode[edge.to] = currentNode;
      open.push(candidateDistance + heuristicToGoal[edge.to]!, edge.to);
    }
  }

  return {
    nodePath: null,
    getSegment: (startIndex: number, endIndex: number) =>
      getPairEvaluation(startIndex, endIndex).segment,
  };
}

function simplifyRouteCoordinates(coordinates: Position[]): Position[] {
  if (coordinates.length <= 2) {
    return coordinates;
  }

  const deduped: Position[] = [coordinates[0]!];
  for (let index = 1; index < coordinates.length; index += 1) {
    const previous = deduped[deduped.length - 1]!;
    const current = coordinates[index]!;
    if (!positionsEqual(previous, current)) {
      deduped.push(current);
    }
  }

  if (deduped.length <= 2) {
    return deduped;
  }

  const simplified: Position[] = [deduped[0]!];
  for (let index = 1; index < deduped.length - 1; index += 1) {
    const previous = simplified[simplified.length - 1]!;
    const current = deduped[index]!;
    const next = deduped[index + 1]!;
    const cross = crossProduct(previous, current, next);
    const onSegment =
      current[0] >= Math.min(previous[0], next[0]) - NUMERIC_EPSILON &&
      current[0] <= Math.max(previous[0], next[0]) + NUMERIC_EPSILON &&
      current[1] >= Math.min(previous[1], next[1]) - NUMERIC_EPSILON &&
      current[1] <= Math.max(previous[1], next[1]) + NUMERIC_EPSILON;
    if (Math.abs(cross) <= NUMERIC_EPSILON && onSegment) {
      continue;
    }
    simplified.push(current);
  }
  simplified.push(deduped[deduped.length - 1]!);
  return simplified;
}

function buildRouteCoordinates(
  nodePath: number[],
  nodes: GraphNode[],
  getSegment: (startIndex: number, endIndex: number) => GeodesicSegment,
) {
  if (nodePath.length <= 1) {
    return [nodes[0]!.coordinate];
  }

  const coordinates: Position[] = [];
  for (let index = 1; index < nodePath.length; index += 1) {
    const previous = nodePath[index - 1]!;
    const current = nodePath[index]!;
    const segment = getSegment(previous, current);

    if (coordinates.length === 0) {
      coordinates.push(...segment.coordinates);
      continue;
    }

    coordinates.push(...segment.coordinates.slice(1));
  }

  return simplifyRouteCoordinates(unwindCoordinates(coordinates));
}

export function computeVisibilityGraphRoute(
  start: Position,
  end: Position,
  obstacles: RoutingObstacleCollection,
  obstacleCacheKey?: string,
): Feature<LineString> {
  const unwrappedStart: Position = [start[0], start[1]];
  const unwrappedEnd = unwrapPositionRelative(unwrappedStart, end);
  if (positionsEqual(unwrappedStart, unwrappedEnd)) {
    return createEmptyPath(unwrappedStart, unwrappedEnd);
  }

  const directSegment = createGeodesicSegment(unwrappedStart, unwrappedEnd);
  if (obstacles.features.length === 0) {
    return lineString(directSegment.coordinates);
  }

  const baseObstaclePolygons = getObstaclePolygons(obstacles, obstacleCacheKey);
  let lastObstacleSignature = "";
  for (const paddingScale of [1, 2, 4]) {
    const obstaclePolygons = selectObstaclePolygons(
      baseObstaclePolygons,
      unwrappedStart,
      unwrappedEnd,
      paddingScale,
    );
    const signature = obstaclePolygons
      .map((obstacle) => obstacle.id)
      .sort()
      .join("|");
    if (signature === lastObstacleSignature) {
      continue;
    }
    lastObstacleSignature = signature;

    if (isBlockedEndpoint(unwrappedStart, obstaclePolygons)) {
      throw new RoutingError(
        "The selected start point is inside a routing obstacle.",
        "blocked-endpoint",
      );
    }

    if (isBlockedEndpoint(unwrappedEnd, obstaclePolygons)) {
      throw new RoutingError(
        "The selected destination is inside a routing obstacle.",
        "blocked-endpoint",
      );
    }

    if (isVisibleBetweenSegment(directSegment, obstaclePolygons)) {
      return lineString(directSegment.coordinates);
    }

    const nodes = createGraphNodes(unwrappedStart, unwrappedEnd, obstaclePolygons);
    const { nodePath, getSegment } = runAStar(nodes, obstaclePolygons);
    if (!nodePath) {
      continue;
    }

    const routeCoordinates = buildRouteCoordinates(nodePath, nodes, getSegment);
    if (routeCoordinates.length === 0) {
      continue;
    }

    return lineString(routeCoordinates);
  }

  throw new RoutingError(
    "No route could be found for the selected destination.",
    "no-route",
  );
}
