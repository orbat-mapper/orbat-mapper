import type { ExpressionSpecification } from "maplibre-gl";

/**
 * Atlas-plate elevation tints. Like the plates, a theatre picks where the
 * tints start: low ground such as Northwest Europe, mountainous ground such as
 * North Africa, or high plateaus such as the American Southwest. Alpine
 * follows the five-band scale of the plates for the Alps, where the high
 * ground needs more steps than three. A style opts in by naming its
 * color-relief layers with ELEVATION_BAND_LAYER_PREFIX.
 */
export const ELEVATION_BAND_PRESETS = [
  { value: "lowland", label: "Lowland", thresholds: [200, 400, 800] },
  { value: "upland", label: "Upland", thresholds: [500, 1000, 1500] },
  { value: "highland", label: "Highland", thresholds: [1500, 2000, 2500] },
  { value: "alpine", label: "Alpine", thresholds: [100, 200, 500, 1000, 2000] },
] as const satisfies readonly {
  value: string;
  label: string;
  /** Ascending; one per band color, at most as many as BAND_COLORS. */
  thresholds: readonly number[];
}[];

export type ElevationBandPreset = (typeof ELEVATION_BAND_PRESETS)[number]["value"];

export const DEFAULT_ELEVATION_BAND_PRESET: ElevationBandPreset = "alpine";
export const ELEVATION_BAND_LAYER_PREFIX = "elevation-bands-";

const LOW_GROUND = "rgba(255,255,255,0)";
/** Lightest first; a preset with fewer thresholds uses the lightest ones. */
const BAND_COLORS = ["#ffe8ba", "#e5d0a7", "#ccba95", "#b2a282", "#998b70"] as const;
/** color-relief only accepts `interpolate`, so a hard edge is a pair of stops this far apart. */
const EDGE = 0.1;

export function isElevationBandPreset(value: unknown): value is ElevationBandPreset {
  return ELEVATION_BAND_PRESETS.some((preset) => preset.value === value);
}

export function elevationBandRamp(preset: ElevationBandPreset): ExpressionSpecification {
  const thresholds: readonly number[] = ELEVATION_BAND_PRESETS.find(
    (entry) => entry.value === preset,
  )!.thresholds;
  const below = [LOW_GROUND, ...BAND_COLORS];
  const stops = thresholds.flatMap((threshold, i) => [
    threshold - EDGE,
    below[i]!,
    threshold,
    BAND_COLORS[i]!,
  ]);
  return ["interpolate", ["linear"], ["elevation"], ...stops] as ExpressionSpecification;
}

/** Repaints the style's elevation band layers; false when it has none. */
export function applyElevationBands(
  map: {
    getLayersOrder(): string[];
    setPaintProperty(layerId: string, name: string, value: unknown): unknown;
  },
  preset: ElevationBandPreset,
): boolean {
  const ids = map
    .getLayersOrder()
    .filter((id) => id.startsWith(ELEVATION_BAND_LAYER_PREFIX));
  const ramp = elevationBandRamp(preset);
  for (const id of ids) map.setPaintProperty(id, "color-relief-color", ramp);
  return ids.length > 0;
}
