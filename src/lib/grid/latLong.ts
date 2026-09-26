import type { Feature, LineString, Position } from "geojson";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import { gridLineFeature, isMajorGridIndex, type GridAppearance } from "./appearance";
import { MIN_VISIBLE_CELL_PX } from "./projected";
import {
  gridEdgeIntersection,
  resolveGridLabelCollisions,
  type GridReferenceLabel,
} from "./labels";
import { faithfulCoordinateAt, faithfulPixelFor } from "./roundTrip";
import { unwrapLongitude, wrapLongitude } from "./geo";
import type { LatLongGridDefinition } from "./types";

export interface LatLongGridPortrayal {
  features: Feature<LineString>[];
  labels: GridReferenceLabel[];
  spacing: number;
}

/**
 * Which parts of the portrayal the caller draws itself. Both callers want
 * labels, so the only axes are whether the linework comes with them and how
 * densely the lines are labelled.
 */
export interface LatLongPortrayalParts {
  features: boolean;
  labels: "all" | "major";
}

const ALL_LATLONG_PORTRAYAL_PARTS: LatLongPortrayalParts = {
  features: true,
  labels: "all",
};

/** MapLibre retains editor linework; only edge labels follow the live viewport. */
export const NATIVE_LATLONG_PORTRAYAL_PARTS: LatLongPortrayalParts = {
  features: false,
  labels: "major",
};

type AngularAxis = "longitude" | "latitude";
const MAX_GRID_LINES = 2_000;
const LABEL_LINE_SEGMENTS = 48;

export function visibleAngularInterval(
  configuredDegrees: number,
  degreesPerPixel: number,
): number {
  if (!Number.isFinite(configuredDegrees) || configuredDegrees <= 0) return 0;
  if (!Number.isFinite(degreesPerPixel) || degreesPerPixel <= 0) return configuredDegrees;
  const required = (degreesPerPixel * MIN_VISIBLE_CELL_PX) / configuredDegrees;
  if (required <= 1) return configuredDegrees;
  const exponent = Math.floor(Math.log10(required));
  const scaled = required / 10 ** exponent;
  const factor = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return configuredDegrees * factor * 10 ** exponent;
}

function decimalPlaces(value: number): number {
  for (let places = 0; places <= 8; places++) {
    if (Math.abs(value * 10 ** places - Math.round(value * 10 ** places)) < 1e-9)
      return places;
  }
  return 8;
}

export function formatAngularReference(
  value: number,
  axis: AngularAxis,
  spacing: number,
): string {
  const normalized = axis === "longitude" ? wrapLongitude(value) : value;
  const suffix =
    axis === "longitude" ? (normalized < 0 ? "W" : "E") : normalized < 0 ? "S" : "N";
  const number = Number(Math.abs(normalized).toFixed(decimalPlaces(spacing))).toString();
  return `${number}°${suffix}`;
}

export function angularResolutionForAdapter(adapter: MapAdapter): number | null {
  const { width, height } = adapter.getViewportSize();
  const centerPixel: PixelCoordinate = [width / 2, height / 2];
  const center = faithfulCoordinateAt(adapter, centerPixel);
  if (!center) return null;
  const horizontal = faithfulCoordinateAt(adapter, [centerPixel[0] + 1, centerPixel[1]]);
  const vertical = faithfulCoordinateAt(adapter, [centerPixel[0], centerPixel[1] + 1]);
  const values = [horizontal, vertical]
    .filter((coordinate): coordinate is [number, number] => Boolean(coordinate))
    .map((coordinate) =>
      Math.hypot(
        unwrapLongitude(center[0], coordinate[0]) - center[0],
        coordinate[1] - center[1],
      ),
    );
  const resolution = Math.max(...values, 0);
  return resolution > 0 && Number.isFinite(resolution) ? resolution : null;
}

function interpolate(
  a: readonly [number, number],
  b: readonly [number, number],
  ratio: number,
) {
  return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio] as [number, number];
}

function horizonBoundary(
  adapter: MapAdapter,
  visible: readonly [number, number],
  hidden: readonly [number, number],
): [number, number] {
  let accepted: [number, number] = [visible[0], visible[1]];
  let rejected: [number, number] = [hidden[0], hidden[1]];
  for (let index = 0; index < 16; index++) {
    const middle = interpolate(accepted, rejected, 0.5);
    if (faithfulPixelFor(adapter, middle)) accepted = middle;
    else rejected = middle;
  }
  return accepted;
}

function visibleSegments(
  adapter: MapAdapter,
  coordinates: readonly (readonly [number, number])[],
): [number, number][][] {
  const samples = coordinates.map((coordinate) => ({
    coordinate: [coordinate[0], coordinate[1]] as [number, number],
    visible: Boolean(faithfulPixelFor(adapter, coordinate)),
  }));
  const segments: [number, number][][] = [];
  let current: [number, number][] = [];
  for (let index = 0; index < samples.length; index++) {
    const sample = samples[index]!;
    const previous = samples[index - 1];
    if (sample.visible) {
      if (previous && !previous.visible) {
        current.push(horizonBoundary(adapter, sample.coordinate, previous.coordinate));
      }
      current.push(sample.coordinate);
    } else if (previous?.visible) {
      current.push(horizonBoundary(adapter, previous.coordinate, sample.coordinate));
      if (current.length >= 2) segments.push(current);
      current = [];
    }
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

/** Normalize to the canonical world and split instead of drawing across ±180°. */
export function splitAtAntimeridian(coordinates: readonly (readonly [number, number])[]) {
  const segments: Position[][] = [];
  let current: Position[] = [];
  for (const coordinate of coordinates) {
    const normalized: Position = [wrapLongitude(coordinate[0]), coordinate[1]];
    const previous = current[current.length - 1];
    if (previous && Math.abs(normalized[0]! - previous[0]!) > 180) {
      const eastward = previous[0]! > 0;
      current.push([eastward ? 180 : -180, coordinate[1]]);
      if (current.length >= 2) segments.push(current);
      current = [[eastward ? -180 : 180, coordinate[1]]];
    }
    current.push(normalized);
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

function samplesBetween(
  axis: AngularAxis,
  value: number,
  minimum: number,
  maximum: number,
  count = Math.max(2, Math.ceil(maximum - minimum)),
): [number, number][] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const varying = minimum + ((maximum - minimum) * index) / count;
    return axis === "longitude" ? [value, varying] : [varying, value];
  });
}

function viewportCoordinates(adapter: MapAdapter): [number, number][] {
  const { width, height } = adapter.getViewportSize();
  const steps = 10;
  const pixelAt = (row: number, column: number): PixelCoordinate => [
    (width * column) / steps,
    (height * row) / steps,
  ];
  // Probe the lattice once; both sweeps below reuse these round-tripped samples.
  const probed = Array.from({ length: steps + 1 }, (_, row) =>
    Array.from({ length: steps + 1 }, (_, column) =>
      faithfulCoordinateAt(adapter, pixelAt(row, column)),
    ),
  );
  const coordinates: [number, number][] = [];
  for (const rowSamples of probed) {
    for (const coordinate of rowSamples) if (coordinate) coordinates.push(coordinate);
  }

  const coordinateAtBoundary = (
    validPixel: PixelCoordinate,
    invalidPixel: PixelCoordinate,
  ): [number, number] | null => {
    let accepted: PixelCoordinate = [...validPixel];
    let rejected: PixelCoordinate = [...invalidPixel];
    for (let index = 0; index < 16; index++) {
      const middle: PixelCoordinate = [
        (accepted[0] + rejected[0]) / 2,
        (accepted[1] + rejected[1]) / 2,
      ];
      if (faithfulCoordinateAt(adapter, middle)) accepted = middle;
      else rejected = middle;
    }
    return faithfulCoordinateAt(adapter, accepted);
  };

  /** Bisect wherever the horizon falls between two adjacent lattice samples. */
  const scan = (at: (index: number) => { pixel: PixelCoordinate; visible: boolean }) => {
    for (let index = 1; index <= steps; index++) {
      const previous = at(index - 1);
      const current = at(index);
      if (current.visible === previous.visible) continue;
      const boundary = current.visible
        ? coordinateAtBoundary(current.pixel, previous.pixel)
        : coordinateAtBoundary(previous.pixel, current.pixel);
      if (boundary) coordinates.push(boundary);
    }
  };
  for (let row = 0; row <= steps; row++) {
    scan((column) => ({
      pixel: pixelAt(row, column),
      visible: Boolean(probed[row]![column]),
    }));
  }
  for (let column = 0; column <= steps; column++) {
    scan((row) => ({
      pixel: pixelAt(row, column),
      visible: Boolean(probed[row]![column]),
    }));
  }
  return coordinates;
}

function referenceEdgePoint(
  segments: readonly Position[][],
  adapter: MapAdapter,
  edge: "bottom" | "left",
  width: number,
  height: number,
): PixelCoordinate | null {
  const intersection = segments
    .map((segment) => gridEdgeIntersection(segment, adapter, edge, width, height))
    .find((value): value is PixelCoordinate => Boolean(value));
  if (intersection) return intersection;
  const pixels = segments
    .flatMap((segment) =>
      segment.map((coordinate) =>
        faithfulPixelFor(adapter, coordinate as [number, number]),
      ),
    )
    .filter((pixel): pixel is PixelCoordinate => Boolean(pixel))
    .filter(
      (pixel) =>
        pixel[0] >= 0 && pixel[0] <= width && pixel[1] >= 0 && pixel[1] <= height,
    );
  if (!pixels.length) return null;
  return [...pixels].sort((a, b) => (edge === "bottom" ? b[1] - a[1] : a[0] - b[0]))[0]!;
}

export function buildLatLongGridPortrayal(
  adapter: MapAdapter,
  definition: LatLongGridDefinition,
  appearance: GridAppearance,
  parts: LatLongPortrayalParts = ALL_LATLONG_PORTRAYAL_PARTS,
): LatLongGridPortrayal | null {
  const { width, height } = adapter.getViewportSize();
  const coordinates = viewportCoordinates(adapter);
  if (!coordinates.length || width <= 0 || height <= 0) return null;
  const center =
    faithfulCoordinateAt(adapter, [width / 2, height / 2]) ?? coordinates[0]!;
  const longitudes = coordinates.map((coordinate) =>
    unwrapLongitude(center[0], coordinate[0]),
  );
  let minLongitude = Math.min(...longitudes);
  let maxLongitude = Math.max(...longitudes);
  if (maxLongitude - minLongitude > 360) {
    minLongitude = center[0] - 180;
    maxLongitude = center[0] + 180;
  }
  const minLatitude = Math.max(
    -90,
    Math.min(...coordinates.map((coordinate) => coordinate[1])),
  );
  const maxLatitude = Math.min(
    90,
    Math.max(...coordinates.map((coordinate) => coordinate[1])),
  );
  const resolution = angularResolutionForAdapter(adapter);
  if (!resolution) return null;
  const spacing = visibleAngularInterval(definition.interval, resolution);
  const firstLongitude = Math.floor(minLongitude / spacing);
  const lastLongitude = Math.ceil(maxLongitude / spacing);
  const firstLatitude = Math.floor(minLatitude / spacing);
  const lastLatitude = Math.ceil(maxLatitude / spacing);
  if (lastLongitude - firstLongitude + lastLatitude - firstLatitude > MAX_GRID_LINES)
    return null;

  // The canvas path samples a line densely enough to follow the projection's
  // curvature; the label-only pass just needs enough samples to find where the
  // line crosses the viewport edge. Both spans are loop-invariant.
  const lineSamples = (span: number) =>
    parts.features ? Math.max(2, Math.ceil(span)) : LABEL_LINE_SEGMENTS;
  const meridianSamples = lineSamples(maxLatitude - minLatitude);
  const parallelSamples = lineSamples(maxLongitude - minLongitude);

  const features: Feature<LineString>[] = [];
  const labels: GridReferenceLabel[] = [];
  for (let index = firstLongitude; index <= lastLongitude; index++) {
    const showLabel = parts.labels === "all" || isMajorGridIndex(index);
    if (!parts.features && !showLabel) continue;
    const longitude = index * spacing;
    const segments = visibleSegments(
      adapter,
      samplesBetween("longitude", longitude, minLatitude, maxLatitude, meridianSamples),
    );
    if (parts.features)
      segments.forEach((segment, segmentIndex) =>
        splitAtAntimeridian(segment).forEach((part, partIndex) =>
          features.push(
            gridLineFeature(
              `latlong-lon-${index}-${segmentIndex}-${partIndex}`,
              part,
              isMajorGridIndex(index),
              appearance,
            ),
          ),
        ),
      );
    const pixel = showLabel
      ? referenceEdgePoint(segments, adapter, "bottom", width, height)
      : null;
    if (pixel) {
      labels.push({
        id: `latlong-label-lon-${index}`,
        text: formatAngularReference(longitude, "longitude", spacing),
        pixel,
        anchor: "bottom",
        priority: spacing,
      });
    }
  }
  for (let index = firstLatitude; index <= lastLatitude; index++) {
    const latitude = index * spacing;
    if (latitude < -90 || latitude > 90) continue;
    const showLabel = parts.labels === "all" || isMajorGridIndex(index);
    if (!parts.features && !showLabel) continue;
    const segments = visibleSegments(
      adapter,
      samplesBetween("latitude", latitude, minLongitude, maxLongitude, parallelSamples),
    );
    if (parts.features)
      segments.forEach((segment, segmentIndex) =>
        splitAtAntimeridian(segment).forEach((part, partIndex) =>
          features.push(
            gridLineFeature(
              `latlong-lat-${index}-${segmentIndex}-${partIndex}`,
              part,
              isMajorGridIndex(index),
              appearance,
            ),
          ),
        ),
      );
    const pixel = showLabel
      ? referenceEdgePoint(segments, adapter, "left", width, height)
      : null;
    if (pixel && Math.abs(latitude) < 90) {
      labels.push({
        id: `latlong-label-lat-${index}`,
        text: formatAngularReference(latitude, "latitude", spacing),
        pixel,
        anchor: "left",
        priority: spacing,
      });
    }
  }
  return { features, labels: resolveGridLabelCollisions(labels), spacing };
}

function closestPointOnSegment(
  pixel: readonly [number, number],
  a: readonly [number, number],
  b: readonly [number, number],
) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  const ratio = lengthSquared
    ? Math.max(
        0,
        Math.min(1, ((pixel[0] - a[0]) * dx + (pixel[1] - a[1]) * dy) / lengthSquared),
      )
    : 0;
  return {
    ratio,
    distance: Math.hypot(a[0] + dx * ratio - pixel[0], a[1] + dy * ratio - pixel[1]),
  };
}

/** Nearest point on the same dense, horizon-filtered curve used by portrayal. */
export function nearestPointOnAngularLine(
  adapter: MapAdapter,
  pixel: readonly [number, number],
  axis: AngularAxis,
  value: number,
  referenceLongitude: number,
): [number, number] | null {
  const coordinates =
    axis === "longitude"
      ? samplesBetween(axis, value, -90, 90)
      : samplesBetween(axis, value, referenceLongitude - 180, referenceLongitude + 180);
  let best: { coordinate: [number, number]; distance: number } | null = null;
  for (const segment of visibleSegments(adapter, coordinates)) {
    for (let index = 1; index < segment.length; index++) {
      const a = segment[index - 1]!;
      const b = segment[index]!;
      const ap = faithfulPixelFor(adapter, a);
      const bp = faithfulPixelFor(adapter, b);
      if (!ap || !bp) continue;
      const closest = closestPointOnSegment(pixel, ap, bp);
      if (best && best.distance <= closest.distance) continue;
      best = { coordinate: interpolate(a, b, closest.ratio), distance: closest.distance };
    }
  }
  return best?.coordinate ?? null;
}
