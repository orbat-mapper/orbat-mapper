import type { Feature, LineString, Position } from "geojson";

export const DEFAULT_GRID_COLOR = "#658cbb";
export const DEFAULT_GRID_OPACITY = 0.52;
export const DEFAULT_GRID_STROKE_WIDTH = 1;
export const MIN_GRID_STROKE_WIDTH = 0.1;
export const MAX_GRID_STROKE_WIDTH = 8;
const SUBDIVISION_OPACITY_RATIO = 0.24 / 0.52;
/** Major lines carry a touch more weight than the minor subdivisions. */
export const GRID_MAJOR_STROKE_FACTOR = 1.25;
/** Grids drawn from a single reference mark every fifth line as major. */
export const MAJOR_EVERY = 5;

/** The one cadence every grid mode's linework, labels and tiles agree on. */
export function isMajorGridIndex(index: number): boolean {
  return index % MAJOR_EVERY === 0;
}

export interface GridAppearance {
  color: string;
  opacity: number;
  strokeWidth: number;
}

export const DEFAULT_GRID_APPEARANCE: GridAppearance = {
  color: DEFAULT_GRID_COLOR,
  opacity: DEFAULT_GRID_OPACITY,
  strokeWidth: DEFAULT_GRID_STROKE_WIDTH,
};

export function isGridColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function gridStrokeColor(color: string, opacity: number): string {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Number(opacity.toFixed(3))})`;
}

/** Keep minor subdivisions lighter than the stronger five-cell grid. */
export function gridSubdivisionOpacity(opacity: number): number {
  return opacity * SUBDIVISION_OPACITY_RATIO;
}

/** Shared line styling for every Grid mode's portrayal. */
export function gridLineFeature(
  id: string,
  coordinates: Position[],
  major: boolean,
  appearance: GridAppearance,
): Feature<LineString> {
  return {
    type: "Feature",
    id,
    geometry: { type: "LineString", coordinates },
    properties: {
      major,
      style: {
        strokeColor: gridStrokeColor(
          appearance.color,
          major ? appearance.opacity : gridSubdivisionOpacity(appearance.opacity),
        ),
        strokeWidth: appearance.strokeWidth * (major ? GRID_MAJOR_STROKE_FACTOR : 1),
      },
    },
  };
}
