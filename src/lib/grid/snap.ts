import type {
  MapAdapter,
  SnapCandidate,
  SnapCandidateProvider,
} from "@orbat-mapper/tactical-draw";
import {
  gridResolutionForAdapter,
  gridSpacingForAdapter,
  visibleGridSpacing,
} from "./projected";
import { projectToGrid, unprojectFromGrid, type GridCrs } from "./projection";
import {
  isCoordinateInMgrsZone,
  mgrsVisibleSpacing,
  type ActiveMgrsGridDefinition,
} from "./mgrs";
import {
  isLocalGridCoordinateValid,
  localGridFrame,
  localGridResolutionForAdapter,
  projectWithFrame,
  unprojectWithFrame,
} from "./local";
import type { GridMode, LocalGridDefinition } from "./types";
import {
  angularResolutionForAdapter,
  nearestPointOnAngularLine,
  visibleAngularInterval,
} from "./latLong";
import { faithfulPixelFor } from "./roundTrip";
import type { LatLongGridDefinition } from "./types";

const INTERSECTION_RADIUS_PX = 12;

type SnapRequest = Parameters<SnapCandidateProvider>[0];

function withinIntersectionRadius(
  pixel: readonly [number, number] | null,
  request: SnapRequest,
): boolean {
  if (!pixel) return false;
  return (
    Math.hypot(pixel[0] - request.pixel[0], pixel[1] - request.pixel[1]) <=
    INTERSECTION_RADIUS_PX
  );
}

function latLongCandidates(
  adapter: MapAdapter,
  definition: LatLongGridDefinition | null,
  request: SnapRequest,
): SnapCandidate[] {
  const resolution = angularResolutionForAdapter(adapter);
  if (!definition || !resolution) return [];
  const spacing = visibleAngularInterval(definition.interval, resolution);
  const longitude = Math.round(request.coordinate[0]! / spacing) * spacing;
  const latitude = Math.max(
    -90,
    Math.min(90, Math.round(request.coordinate[1]! / spacing) * spacing),
  );
  const intersectionCoordinate: [number, number] = [longitude, latitude];
  if (
    withinIntersectionRadius(faithfulPixelFor(adapter, intersectionCoordinate), request)
  ) {
    return [
      {
        id: "latlong:grid:intersection",
        coordinate: intersectionCoordinate,
        kind: "grid-intersection",
      },
    ];
  }
  const meridian = nearestPointOnAngularLine(
    adapter,
    request.pixel,
    "longitude",
    longitude,
    request.coordinate[0]!,
  );
  const parallel = nearestPointOnAngularLine(
    adapter,
    request.pixel,
    "latitude",
    latitude,
    request.coordinate[0]!,
  );
  return [
    ...(meridian
      ? [
          {
            id: "latlong:grid:longitude",
            coordinate: meridian,
            kind: "grid-line" as const,
          },
        ]
      : []),
    ...(parallel
      ? [
          {
            id: "latlong:grid:latitude",
            coordinate: parallel,
            kind: "grid-line" as const,
          },
        ]
      : []),
  ];
}

function localCandidates(
  adapter: MapAdapter,
  definition: LocalGridDefinition | null,
  request: SnapRequest,
): SnapCandidate[] {
  if (!definition) return [];
  const resolution = localGridResolutionForAdapter(adapter, definition);
  if (!resolution) return [];
  const spacing = visibleGridSpacing(definition.interval, resolution);
  const frame = localGridFrame(definition);
  const point = projectWithFrame(frame, request.coordinate as [number, number]);
  const gx = Math.round(point.x / spacing) * spacing;
  const gy = Math.round(point.y / spacing) * spacing;
  const intersectionCoordinate = unprojectWithFrame(frame, { x: gx, y: gy });
  const valid = (coordinate: readonly [number, number]) =>
    isLocalGridCoordinateValid(definition, coordinate);
  if (
    valid(intersectionCoordinate) &&
    withinIntersectionRadius(
      adapter.getPixelFromCoordinate(intersectionCoordinate),
      request,
    )
  ) {
    return [
      {
        id: "local:grid:intersection",
        coordinate: intersectionCoordinate,
        kind: "grid-intersection",
      },
    ];
  }
  return [
    {
      id: "local:grid:line-x",
      coordinate: unprojectWithFrame(frame, { x: gx, y: point.y }),
      kind: "grid-line" as const,
    },
    {
      id: "local:grid:line-y",
      coordinate: unprojectWithFrame(frame, { x: point.x, y: gy }),
      kind: "grid-line" as const,
    },
  ].filter((candidate) => valid(candidate.coordinate));
}

/** UTM and MGRS share one projected lattice; MGRS additionally clips to its zone. */
function projectedCandidates(
  adapter: MapAdapter,
  crs: GridCrs,
  mgrs: ActiveMgrsGridDefinition | null,
  configuredMeters: number,
  request: SnapRequest,
): SnapCandidate[] {
  const resolution = mgrs ? gridResolutionForAdapter(adapter, crs) : null;
  const spacing = mgrs
    ? resolution && mgrsVisibleSpacing(mgrs.interval, resolution)
    : gridSpacingForAdapter(adapter, configuredMeters, crs);
  if (!spacing) return [];
  let projected;
  try {
    projected = projectToGrid(crs, request.coordinate as [number, number]);
  } catch {
    return [];
  }
  const gx = Math.round(projected.easting / spacing) * spacing;
  const gy = Math.round(projected.northing / spacing) * spacing;
  const intersectionCoordinate = [
    ...unprojectFromGrid(crs, { easting: gx, northing: gy }),
  ];
  const isValid = (coordinate: readonly number[]) =>
    !mgrs || isCoordinateInMgrsZone(mgrs, coordinate as [number, number]);
  const idPrefix = mgrs ? "mgrs:grid" : "grid";

  const intersectionPixel = adapter.getPixelFromCoordinate(intersectionCoordinate);
  if (
    isValid(intersectionCoordinate) &&
    withinIntersectionRadius(intersectionPixel, request)
  ) {
    return [
      {
        id: `${idPrefix}:intersection`,
        coordinate: intersectionCoordinate,
        kind: "grid-intersection",
      },
    ];
  }

  return [
    {
      id: `${idPrefix}:line-x`,
      coordinate: [
        ...unprojectFromGrid(crs, { easting: gx, northing: projected.northing }),
      ],
      kind: "grid-line",
    },
    {
      id: `${idPrefix}:line-y`,
      coordinate: [
        ...unprojectFromGrid(crs, { easting: projected.easting, northing: gy }),
      ],
      kind: "grid-line",
    },
  ].filter((candidate) => isValid(candidate.coordinate));
}

export function createGridSnapProvider(deps: {
  getAdapter: () => MapAdapter | null;
  getConfiguredSpacing: () => number;
  getGridCrs: () => GridCrs | null;
  getGridMode?: () => GridMode;
  getMgrsDefinition?: () => ActiveMgrsGridDefinition | null;
  getLocalDefinition?: () => LocalGridDefinition | null;
  getLatLongDefinition?: () => LatLongGridDefinition | null;
  isActive: () => boolean;
}): SnapCandidateProvider {
  return (request) => {
    if (!deps.isActive()) return [];
    const adapter = deps.getAdapter();
    if (!adapter) return [];
    const mode = deps.getGridMode?.() ?? "utm";
    if (mode === "latlong") {
      return latLongCandidates(adapter, deps.getLatLongDefinition?.() ?? null, request);
    }
    if (mode === "local") {
      return localCandidates(adapter, deps.getLocalDefinition?.() ?? null, request);
    }
    const mgrs = mode === "mgrs" ? (deps.getMgrsDefinition?.() ?? null) : null;
    if (mode === "mgrs" && !mgrs) return [];
    const crs = mgrs?.crs ?? deps.getGridCrs();
    if (!crs) return [];
    return projectedCandidates(
      adapter,
      crs,
      mgrs,
      mgrs?.interval ?? deps.getConfiguredSpacing(),
      request,
    );
  };
}
