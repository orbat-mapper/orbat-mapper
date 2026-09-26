import type { Position } from "geojson";

export type GridCrs =
  | { kind: "utm"; zone: number; hemisphere: "north" | "south" }
  | { kind: "ups"; hemisphere: "north" | "south" };

export type GridMode = "utm" | "mgrs" | "latlong" | "local";

export interface UtmGridDefinition {
  /** Fixed metric construction grid selected automatically from the page center. */
  crs: GridCrs;
  /** Finest authored lattice interval, stored canonically in metres. */
  interval: number;
}

export interface MgrsGridDefinition {
  /** Finest authored interval; the active MGRS zone follows the viewport center. */
  interval: 100 | 1_000 | 10_000 | 100_000;
}

export interface LatLongGridDefinition {
  /** Finest authored angular interval in decimal degrees. */
  interval: number;
}

export interface LocalGridDefinition {
  /** Local zero as [longitude, latitude]. */
  origin: Position;
  /** Cell size calibrated at the pin, stored canonically in metres. */
  interval: number;
  /** Positive local north clockwise from true north, in [0, 360). */
  bearing: number;
}

export interface GridSettings {
  visible: boolean;
  /** Exactly one portrayal is active; inactive definitions remain authored state. */
  mode: GridMode;
  utm: UtmGridDefinition;
  mgrs?: MgrsGridDefinition;
  latlong?: LatLongGridDefinition;
  local?: LocalGridDefinition;
}

export type MeasurementUnits = "metric" | "imperial" | "nautical";
