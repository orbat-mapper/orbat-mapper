import { EARTH_RADIUS } from "./line";
import type { ElevationProfile } from "./profile";

/** The coefficient of refraction of the standard atmosphere. */
export const STANDARD_REFRACTION = 0.13;

/** How far the ground at `distance` metres drops below a level sight line: the
 *  Earth's curvature, less what refraction bends back, d²/(2R)·(1−k). */
export function curvatureDrop(
  distance: number,
  refraction = STANDARD_REFRACTION,
): number {
  return ((distance * distance) / (2 * EARTH_RADIUS)) * (1 - refraction);
}

export interface LineOfSightOptions {
  /** Metres above the ground at the start of the profile. */
  observerHeight: number;
  /** Metres above the ground at the end of the profile. */
  targetHeight: number;
  /** Coefficient of atmospheric refraction; 0.13 is the standard atmosphere. */
  refraction?: number;
}

export interface LineOfSight {
  /** Null when either end has no elevation data. */
  visible: boolean | null;
  /** The first sample that rises above the sight line. */
  obstructionIndex: number | null;
}

/** Whether the end of a profile is visible from its start. Each sample is lowered
 *  by the Earth's curvature, less what refraction bends back: d²/(2R)·(1−k).
 *  Samples without data cannot block the view. */
export function lineOfSight(
  { distances, elevations }: ElevationProfile,
  { observerHeight, targetHeight, refraction = STANDARD_REFRACTION }: LineOfSightOptions,
): LineOfSight {
  const last = elevations.length - 1;
  const start = elevations[0];
  const end = elevations[last];
  if (last < 1 || start == null || end == null)
    return { visible: null, obstructionIndex: null };
  const drop = (d: number) => curvatureDrop(d, refraction);
  const eye = start + observerHeight;
  const range = distances[last]!;
  const target = end + targetHeight - drop(range);
  for (let i = 1; i < last; i++) {
    const elevation = elevations[i];
    if (elevation == null) continue;
    const d = distances[i]!;
    const sight = eye + ((target - eye) * d) / range;
    if (elevation - drop(d) > sight) return { visible: false, obstructionIndex: i };
  }
  return { visible: true, obstructionIndex: null };
}
