import type { Position } from "geojson";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";

export type GridLabelAnchor = "bottom" | "left" | "square" | "zone";

/**
 * The one geometry the collision solver and both renderers — the DOM overlay
 * and the export canvas — must agree on. ADR-0040 keeps the two renderers
 * independent; the boxes they are laid out against are not.
 */
export const GRID_LABEL_METRICS = {
  fontPx: 12,
  weight: 600,
  lineHeightPx: 16,
  charWidthPx: 7,
  paddingPx: 6,
  /** Gap between a left-anchored label and the line it names. */
  edgeOffsetPx: 4,
  /** Lift of a bottom-anchored label off the viewport edge. */
  baselineOffsetPx: 2,
  /** Inset of a zone designation from its clipped lower-left corner. */
  zoneInsetPx: 4,
} as const;

/** A map-surface halo, deliberately independent of the application theme. */
export const GRID_LABEL_HALO_COLOR = "rgba(255, 255, 255, 0.92)";

/**
 * The DOM overlay's halo, composed once. MapLibre and the export canvas stroke
 * their own haloes from {@link GRID_LABEL_HALO_COLOR}; this is the same design
 * token expressed as a text shadow.
 */
export const GRID_LABEL_TEXT_SHADOW = [
  `-1px -1px 0 ${GRID_LABEL_HALO_COLOR}`,
  `1px -1px 0 ${GRID_LABEL_HALO_COLOR}`,
  `-1px 1px 0 ${GRID_LABEL_HALO_COLOR}`,
  `1px 1px 0 ${GRID_LABEL_HALO_COLOR}`,
  `0 0 2px ${GRID_LABEL_HALO_COLOR}`,
].join(", ");

export interface GridReferenceLabel {
  id: string;
  text: string;
  pixel: PixelCoordinate;
  anchor: GridLabelAnchor;
  priority: number;
}

export function gridEdgeIntersection(
  coordinates: Position[],
  adapter: MapAdapter,
  edge: "bottom" | "left",
  width: number,
  height: number,
): PixelCoordinate | null {
  let a = coordinates.length ? adapter.getPixelFromCoordinate(coordinates[0]!) : null;
  for (let index = 1; index < coordinates.length; index++) {
    const b = adapter.getPixelFromCoordinate(coordinates[index]!);
    const previous = a;
    a = b;
    if (!previous || !b) continue;
    const av = edge === "bottom" ? previous[1] - height : previous[0];
    const bv = edge === "bottom" ? b[1] - height : b[0];
    if (av === bv || av * bv > 0) continue;
    const ratio = av / (av - bv);
    const x = previous[0] + (b[0] - previous[0]) * ratio;
    const y = previous[1] + (b[1] - previous[1]) * ratio;
    if (x >= 0 && x <= width && y >= 0 && y <= height) return [x, y];
  }
  return null;
}

function labelBox(
  label: GridReferenceLabel,
  scale = 1,
): [number, number, number, number] {
  const width =
    (label.text.length * GRID_LABEL_METRICS.charWidthPx + GRID_LABEL_METRICS.paddingPx) *
    scale;
  const height = GRID_LABEL_METRICS.lineHeightPx * scale;
  if (label.anchor === "bottom") {
    return [
      label.pixel[0] - width / 2,
      label.pixel[1] - height,
      label.pixel[0] + width / 2,
      label.pixel[1],
    ];
  }
  if (label.anchor === "zone") {
    return [
      label.pixel[0],
      label.pixel[1] - height,
      label.pixel[0] + width,
      label.pixel[1],
    ];
  }
  return [
    label.pixel[0],
    label.pixel[1] - height / 2,
    label.pixel[0] + width,
    label.pixel[1] + height / 2,
  ];
}

function boxesOverlap(a: readonly number[], b: readonly number[]) {
  return a[0]! < b[2]! && a[2]! > b[0]! && a[1]! < b[3]! && a[3]! > b[1]!;
}

/** Higher semantic priority wins; ids make equal-priority collisions stable. */
export function resolveGridLabelCollisions(
  candidates: readonly GridReferenceLabel[],
  scale = 1,
): GridReferenceLabel[] {
  const accepted: GridReferenceLabel[] = [];
  const boxes: [number, number, number, number][] = [];
  const ordered = [...candidates].sort(
    (a, b) => b.priority - a.priority || a.id.localeCompare(b.id),
  );
  for (const candidate of ordered) {
    const box = labelBox(candidate, scale);
    if (boxes.some((other) => boxesOverlap(box, other))) continue;
    accepted.push(candidate);
    boxes.push(box);
  }
  return accepted;
}
