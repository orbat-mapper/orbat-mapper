import type { Feature, LineString, Position } from "geojson";
import type { MapAdapter } from "@orbat-mapper/tactical-draw";
import {
  lonLatToMercator,
  mercatorToLonLat,
  viewportSamplePixels,
  visibleGridSpacing,
} from "./projected";
import { clipSampledLine, gridLineSampleCount } from "./clipping";
import { WEB_MERCATOR_MAX_LATITUDE } from "./geo";
import { gridLineFeature, type GridAppearance } from "./appearance";
import type { LocalGridDefinition, MeasurementUnits } from "./types";

export interface LocalGridPoint {
  readonly x: number;
  readonly y: number;
}

export type LocalGridAccuracy = "ok" | "notice" | "warning" | "clipped";

export interface LocalGridPortrayal {
  features: Feature<LineString>[];
  spacing: number;
  accuracy: LocalGridAccuracy;
  maxVariation: number;
}

export { WEB_MERCATOR_MAX_LATITUDE };

const MAX_GRID_LINES = 500;

export function normalizeLocalGridBearing(value: number): number {
  return ((value % 360) + 360) % 360;
}

/**
 * The pin's frame, resolved once. Every point projected into a Local Grid needs
 * the same origin, calibration scale and bearing rotation, so callers in a loop
 * build this first instead of re-deriving four transcendentals per point.
 */
export interface LocalGridFrame {
  readonly originX: number;
  readonly originY: number;
  readonly scale: number;
  readonly cos: number;
  readonly sin: number;
}

export function localGridFrame(definition: LocalGridDefinition): LocalGridFrame {
  const [originX, originY] = lonLatToMercator(definition.origin as [number, number]);
  const angle = (normalizeLocalGridBearing(definition.bearing) * Math.PI) / 180;
  return {
    originX,
    originY,
    scale: Math.cos((definition.origin[1]! * Math.PI) / 180),
    cos: Math.cos(angle),
    sin: Math.sin(angle),
  };
}

export function projectWithFrame(
  frame: LocalGridFrame,
  coordinate: readonly [number, number],
): LocalGridPoint {
  const projected = lonLatToMercator(coordinate);
  const east = (projected[0] - frame.originX) * frame.scale;
  const north = (projected[1] - frame.originY) * frame.scale;
  return {
    x: east * frame.cos - north * frame.sin,
    y: east * frame.sin + north * frame.cos,
  };
}

export function unprojectWithFrame(
  frame: LocalGridFrame,
  point: LocalGridPoint,
): [number, number] {
  const east = point.x * frame.cos + point.y * frame.sin;
  const north = -point.x * frame.sin + point.y * frame.cos;
  return mercatorToLonLat([
    frame.originX + east / frame.scale,
    frame.originY + north / frame.scale,
  ]);
}

export function projectToLocalGrid(
  definition: LocalGridDefinition,
  coordinate: readonly [number, number],
): LocalGridPoint {
  return projectWithFrame(localGridFrame(definition), coordinate);
}

export function unprojectFromLocalGrid(
  definition: LocalGridDefinition,
  point: LocalGridPoint,
): [number, number] {
  return unprojectWithFrame(localGridFrame(definition), point);
}

/** Relative ground cell-size drift from the one-time calibration at the pin. */
export function localGridVariationAt(
  definition: LocalGridDefinition,
  coordinate: readonly [number, number],
): number {
  const originCosine = Math.cos((definition.origin[1]! * Math.PI) / 180);
  const coordinateCosine = Math.cos((coordinate[1] * Math.PI) / 180);
  return Math.abs(coordinateCosine / originCosine - 1);
}

export function isLocalGridCoordinateValid(
  definition: LocalGridDefinition,
  coordinate: readonly [number, number],
): boolean {
  return (
    Math.abs(coordinate[1]) <= WEB_MERCATOR_MAX_LATITUDE &&
    localGridVariationAt(definition, coordinate) <= 0.05 + 1e-12
  );
}

export function localGridAccuracy(maxVariation: number): LocalGridAccuracy {
  if (maxVariation <= 0.01) return "ok";
  if (maxVariation <= 0.02) return "notice";
  if (maxVariation <= 0.05) return "warning";
  return "clipped";
}

export function localGridResolutionForAdapter(
  adapter: MapAdapter,
  definition: LocalGridDefinition,
): number | null {
  const fromPixel = adapter.getCoordinateFromPixel;
  if (!fromPixel) return null;
  const { width, height } = adapter.getViewportSize();
  const center = fromPixel.call(adapter, [width / 2, height / 2]);
  const adjacent = fromPixel.call(adapter, [width / 2 + 1, height / 2]);
  if (!center || !adjacent) return null;
  const frame = localGridFrame(definition);
  const a = projectWithFrame(frame, center as [number, number]);
  const b = projectWithFrame(frame, adjacent as [number, number]);
  const resolution = Math.hypot(b.x - a.x, b.y - a.y);
  return Number.isFinite(resolution) && resolution > 0 ? resolution : null;
}

function interpolate(
  a: LocalGridPoint,
  b: LocalGridPoint,
  ratio: number,
): LocalGridPoint {
  return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio };
}

function clippedLocalLine(
  definition: LocalGridDefinition,
  frame: LocalGridFrame,
  start: LocalGridPoint,
  end: LocalGridPoint,
  spacing: number,
): Position[][] {
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  return clipSampledLine(start, end, gridLineSampleCount(length, spacing), {
    lerp: interpolate,
    toCoordinate: (point) => unprojectWithFrame(frame, point),
    isValid: (coordinate) =>
      isLocalGridCoordinateValid(definition, coordinate as [number, number]),
  });
}

export function buildLocalGridPortrayal(
  adapter: MapAdapter,
  definition: LocalGridDefinition,
  appearance: GridAppearance,
  includeFeatures = true,
): LocalGridPortrayal | null {
  const fromPixel = adapter.getCoordinateFromPixel;
  if (!fromPixel) return null;
  const { width, height } = adapter.getViewportSize();
  if (width <= 0 || height <= 0) return null;
  const pixels = viewportSamplePixels(width, height);
  const coordinates = pixels
    .map((pixel) => fromPixel.call(adapter, pixel))
    .filter((coordinate): coordinate is Position => Boolean(coordinate));
  if (!coordinates.length) return null;
  let maxVariation = Math.max(
    ...coordinates.map((coordinate) =>
      localGridVariationAt(definition, coordinate as [number, number]),
    ),
  );
  const frame = localGridFrame(definition);
  const local = coordinates.map((coordinate) =>
    projectWithFrame(frame, coordinate as [number, number]),
  );
  const minX = Math.min(...local.map((point) => point.x));
  const maxX = Math.max(...local.map((point) => point.x));
  const minY = Math.min(...local.map((point) => point.y));
  const maxY = Math.max(...local.map((point) => point.y));
  maxVariation = Math.max(
    maxVariation,
    ...[
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ].map((point) => localGridVariationAt(definition, unprojectWithFrame(frame, point))),
  );
  const accuracy = localGridAccuracy(maxVariation);
  const resolution = localGridResolutionForAdapter(adapter, definition);
  if (!resolution) return null;
  const spacing = visibleGridSpacing(definition.interval, resolution);
  const firstX = Math.floor(minX / spacing);
  const lastX = Math.ceil(maxX / spacing);
  const firstY = Math.floor(minY / spacing);
  const lastY = Math.ceil(maxY / spacing);
  if (lastX - firstX + lastY - firstY > MAX_GRID_LINES) return null;

  const features: Feature<LineString>[] = [];
  if (!includeFeatures) return { features, spacing, accuracy, maxVariation };
  for (let index = firstX; index <= lastX; index++) {
    const x = index * spacing;
    clippedLocalLine(definition, frame, { x, y: minY }, { x, y: maxY }, spacing).forEach(
      (segment, segmentIndex) =>
        features.push(
          gridLineFeature(
            `local-x-${index}-${segmentIndex}`,
            segment,
            index % 5 === 0,
            appearance,
          ),
        ),
    );
  }
  for (let index = firstY; index <= lastY; index++) {
    const y = index * spacing;
    clippedLocalLine(definition, frame, { x: minX, y }, { x: maxX, y }, spacing).forEach(
      (segment, segmentIndex) =>
        features.push(
          gridLineFeature(
            `local-y-${index}-${segmentIndex}`,
            segment,
            index % 5 === 0,
            appearance,
          ),
        ),
    );
  }
  return { features, spacing, accuracy, maxVariation };
}

export function localGridIntervalForDisplay(
  metres: number,
  units: MeasurementUnits,
): number {
  if (units === "imperial") return metres / 0.3048;
  if (units === "nautical") return metres / 1_852;
  return metres;
}

export function localGridIntervalFromDisplay(
  value: number,
  units: MeasurementUnits,
): number {
  if (units === "imperial") return value * 0.3048;
  if (units === "nautical") return value * 1_852;
  return value;
}

export function localGridUnitLabel(units: MeasurementUnits): string {
  return units === "imperial" ? "ft" : units === "nautical" ? "nm" : "m";
}

/** Parse an edited Local Grid origin/interval/bearing, in display units. */
export function parseLocalGridDefinition(
  draft: {
    longitude: string;
    latitude: string;
    interval: string;
    bearing: string;
  },
  units: MeasurementUnits,
): LocalGridDefinition | null {
  const longitude = Number(draft.longitude);
  const latitude = Number(draft.latitude);
  const displayInterval = Number(draft.interval);
  const bearing = Number(draft.bearing);
  if (
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180 ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > WEB_MERCATOR_MAX_LATITUDE ||
    !Number.isFinite(displayInterval) ||
    displayInterval <= 0 ||
    !Number.isFinite(bearing)
  ) {
    return null;
  }
  return {
    origin: [longitude, latitude],
    interval: localGridIntervalFromDisplay(displayInterval, units),
    bearing: normalizeLocalGridBearing(bearing),
  };
}
