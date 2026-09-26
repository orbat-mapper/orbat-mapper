import type { GridCrs, GridMode, GridSettings, MgrsGridDefinition } from "./types";
import { selectGridCrs } from "./projection";
import { isMgrsInterval } from "./mgrs";

export const DEFAULT_GRID_INTERVAL = 100;
export const GRID_MODES = [
  "utm",
  "mgrs",
  "latlong",
  "local",
] as const satisfies readonly GridMode[];

export function isGridMode(value: unknown): value is GridMode {
  return GRID_MODES.includes(value as GridMode);
}

function positiveInterval(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_GRID_INTERVAL;
}

function mgrsInterval(value: unknown): MgrsGridDefinition["interval"] {
  return typeof value === "number" && isMgrsInterval(value) ? value : 1_000;
}

/** Normalize both parsed and runtime-built pre-mode v2 Grid definitions. */
export function normalizeGridSettings(
  value: Partial<GridSettings> & { crs?: GridCrs },
  pageCenter: readonly [number, number],
): GridSettings {
  const requestedMode =
    value.mode && GRID_MODES.includes(value.mode) ? value.mode : "utm";
  const mode = requestedMode === "utm" || value[requestedMode] ? requestedMode : "utm";
  return {
    visible: value.visible !== false,
    mode,
    utm: {
      crs: value.utm?.crs ?? value.crs ?? selectGridCrs(pageCenter),
      interval: positiveInterval(value.utm?.interval),
    },
    ...(value.mgrs ? { mgrs: { interval: mgrsInterval(value.mgrs.interval) } } : {}),
    ...(value.latlong ? { latlong: structuredClone(value.latlong) } : {}),
    ...(value.local ? { local: structuredClone(value.local) } : {}),
  };
}
