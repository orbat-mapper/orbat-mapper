import type { Feature, LineString, Position } from "geojson";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import {
  projectToGrid,
  selectGridCrs,
  unprojectFromGrid,
  type GridCrs,
  type GridPoint,
} from "./projection";
import { latitudeToMercatorY, mercatorYToLatitude } from "./geo";
import {
  DEFAULT_GRID_APPEARANCE,
  gridLineFeature,
  isMajorGridIndex,
  type GridAppearance,
} from "./appearance";

const EARTH_RADIUS = 6_378_137;
export const MIN_VISIBLE_CELL_PX = 24;
const MAX_LINE_CURVE_ERROR_PX = 0.75;
const MAX_LINE_SUBDIVISION_DEPTH = 10;

export function lonLatToMercator([lon, lat]: readonly [number, number]): [
  number,
  number,
] {
  return [(lon * Math.PI * EARTH_RADIUS) / 180, EARTH_RADIUS * latitudeToMercatorY(lat)];
}

export function mercatorToLonLat([x, y]: readonly [number, number]): [number, number] {
  return [(x / EARTH_RADIUS) * (180 / Math.PI), mercatorYToLatitude(y / EARTH_RADIUS)];
}

/** Preserve the configured interval while hiding subdivisions that would be too dense. */
const ADAPTIVE_MULTIPLE = 5;

export function visibleGridSpacing(configuredMeters: number, resolution: number): number {
  if (!Number.isFinite(configuredMeters) || configuredMeters <= 0) return 0;
  if (!Number.isFinite(resolution) || resolution <= 0) return configuredMeters;
  const required = (resolution * MIN_VISIBLE_CELL_PX) / configuredMeters;
  if (required <= 1) return configuredMeters;
  return (
    configuredMeters *
    ADAPTIVE_MULTIPLE ** Math.ceil(Math.log(required) / Math.log(ADAPTIVE_MULTIPLE))
  );
}

export function gridViewportCenter(adapter: MapAdapter): [number, number] | null {
  const fromPixel = adapter.getCoordinateFromPixel;
  if (!fromPixel) return null;
  const { width, height } = adapter.getViewportSize();
  if (width <= 0 || height <= 0) return null;
  const center = fromPixel.call(adapter, [width / 2, height / 2]);
  if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) return null;
  return [center[0]!, center[1]!];
}

/** Corners, edge midpoints and centre — the viewport probe every mode samples. */
export function viewportSamplePixels(width: number, height: number): PixelCoordinate[] {
  return [
    [0, 0],
    [width / 2, 0],
    [width, 0],
    [width, height / 2],
    [width, height],
    [width / 2, height],
    [0, height],
    [0, height / 2],
    [width / 2, height / 2],
  ];
}

/** Local metres represented by one horizontal CSS pixel in the locked CRS. */
export function gridResolutionForAdapter(
  adapter: MapAdapter,
  crs: GridCrs,
): number | null {
  const fromPixel = adapter.getCoordinateFromPixel;
  if (!fromPixel) return null;
  const { width, height } = adapter.getViewportSize();
  if (width <= 1 || height <= 1) return null;
  const centerPixel: [number, number] = [width / 2, height / 2];
  const center = fromPixel.call(adapter, centerPixel);
  const adjacent = fromPixel.call(adapter, [centerPixel[0] + 1, centerPixel[1]]);
  if (!center || !adjacent) return null;

  try {
    const projectedCenter = projectToGrid(crs, center as [number, number]);
    const projectedAdjacent = projectToGrid(crs, adjacent as [number, number]);
    const value = Math.hypot(
      projectedAdjacent.easting - projectedCenter.easting,
      projectedAdjacent.northing - projectedCenter.northing,
    );
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function gridSpacingForAdapter(
  adapter: MapAdapter,
  configuredGroundMeters: number,
  crs?: GridCrs,
): number | null {
  const center = gridViewportCenter(adapter);
  if (!center) return null;
  try {
    const resolvedCrs = crs ?? selectGridCrs(center);
    const metresPerPixel = gridResolutionForAdapter(adapter, resolvedCrs);
    if (!metresPerPixel) return null;
    const visibleMeters = visibleGridSpacing(configuredGroundMeters, metresPerPixel);
    if (!visibleMeters) return null;
    return visibleMeters;
  } catch {
    return null;
  }
}

/** Number of whole cells that fit in the compact scale graphic. */
export function gridScaleCellCount(cellPixels: number, maxWidthPixels = 180): number {
  if (!Number.isFinite(cellPixels) || cellPixels <= 0 || maxWidthPixels <= 0) return 0;
  return Math.min(5, Math.max(0, Math.floor(maxWidthPixels / cellPixels)));
}

/** Build a viewport-bounded grid in the Page's locked CRS, safe for a rotated map. */
export function buildGridFeatures(
  adapter: MapAdapter,
  configuredMeters: number,
  crs?: GridCrs,
  appearance: GridAppearance = DEFAULT_GRID_APPEARANCE,
): { features: Feature<LineString>[]; spacing: number } | null {
  const fromPixel = adapter.getCoordinateFromPixel;
  if (!fromPixel) return null;

  const { width, height } = adapter.getViewportSize();
  if (width <= 0 || height <= 0) return null;
  const corners = [
    fromPixel.call(adapter, [0, 0]),
    fromPixel.call(adapter, [width, 0]),
    fromPixel.call(adapter, [width, height]),
    fromPixel.call(adapter, [0, height]),
  ];
  if (corners.some((corner) => !corner)) return null;
  const resolvedCrs = crs ?? selectGridCrs(corners[0] as [number, number]);
  const spacing = gridSpacingForAdapter(adapter, configuredMeters, resolvedCrs);
  if (!spacing) return null;

  let projected: GridPoint[];
  try {
    projected = corners.map((corner) =>
      projectToGrid(resolvedCrs, corner as [number, number]),
    );
  } catch {
    return null;
  }
  const minX = Math.min(...projected.map(({ easting }) => easting));
  const maxX = Math.max(...projected.map(({ easting }) => easting));
  const minY = Math.min(...projected.map(({ northing }) => northing));
  const maxY = Math.max(...projected.map(({ northing }) => northing));
  const firstX = Math.floor(minX / spacing);
  const lastX = Math.ceil(maxX / spacing);
  const firstY = Math.floor(minY / spacing);
  const lastY = Math.ceil(maxY / spacing);
  const features: Feature<LineString>[] = [];

  for (let index = firstX; index <= lastX; index++) {
    const x = index * spacing;
    features.push(
      gridLineFeature(
        `grid-x-${index}`,
        projectedGridLine(
          adapter,
          resolvedCrs,
          { easting: x, northing: minY },
          { easting: x, northing: maxY },
        ),
        isMajorGridIndex(index),
        appearance,
      ),
    );
  }
  for (let index = firstY; index <= lastY; index++) {
    const y = index * spacing;
    features.push(
      gridLineFeature(
        `grid-y-${index}`,
        projectedGridLine(
          adapter,
          resolvedCrs,
          { easting: minX, northing: y },
          { easting: maxX, northing: y },
        ),
        isMajorGridIndex(index),
        appearance,
      ),
    );
  }
  return { features, spacing };
}

function projectedGridLine(
  adapter: MapAdapter,
  crs: GridCrs,
  start: GridPoint,
  end: GridPoint,
): Position[] {
  const pointAt = (ratio: number): [number, number] => {
    const coordinate = unprojectFromGrid(crs, {
      easting: start.easting + (end.easting - start.easting) * ratio,
      northing: start.northing + (end.northing - start.northing) * ratio,
    });
    return [coordinate[0], coordinate[1]];
  };
  const first = pointAt(0);
  const last = pointAt(1);
  const coordinates: Position[] = [first];

  function appendSegment(
    startRatio: number,
    endRatio: number,
    startCoordinate: [number, number],
    endCoordinate: [number, number],
    depth: number,
  ) {
    const middleRatio = (startRatio + endRatio) / 2;
    const middleCoordinate = pointAt(middleRatio);
    const toPixel = adapter.getPixelFromCoordinate;
    const startPixel = toPixel?.call(adapter, startCoordinate);
    const middlePixel = toPixel?.call(adapter, middleCoordinate);
    const endPixel = toPixel?.call(adapter, endCoordinate);
    const error =
      startPixel && middlePixel && endPixel
        ? Math.hypot(
            middlePixel[0] - (startPixel[0] + endPixel[0]) / 2,
            middlePixel[1] - (startPixel[1] + endPixel[1]) / 2,
          )
        : 0;

    if (error > MAX_LINE_CURVE_ERROR_PX && depth < MAX_LINE_SUBDIVISION_DEPTH) {
      appendSegment(
        startRatio,
        middleRatio,
        startCoordinate,
        middleCoordinate,
        depth + 1,
      );
      appendSegment(middleRatio, endRatio, middleCoordinate, endCoordinate, depth + 1);
      return;
    }
    coordinates.push(endCoordinate);
  }

  appendSegment(0, 1, first, last, 0);
  return coordinates;
}
