import GeographicLibMgrs from "geographiclib-mgrs";
import type { GridCrs } from "./types";

export type { GridCrs };

export interface GridPoint {
  readonly easting: number;
  readonly northing: number;
}

interface UtmUpsBackend {
  forward(
    latitude: number,
    longitude: number,
    zone?: number | false,
    mgrsLimits?: boolean,
  ): {
    readonly zone: number;
    readonly northp: boolean;
    readonly x: number;
    readonly y: number;
  };
  reverse(
    zone: number,
    north: boolean,
    easting: number,
    northing: number,
    mgrsLimits?: boolean,
  ): { readonly lat: number; readonly lon: number };
}

const utmUps = (GeographicLibMgrs as unknown as { readonly UTMUPS: UtmUpsBackend })
  .UTMUPS;

/** Select the standard UTM/UPS CRS, including the Norway and Svalbard exceptions. */
export function selectGridCrs(position: readonly [number, number]): GridCrs {
  const [longitude, latitude] = position;
  const projected = utmUps.forward(latitude, longitude, undefined, false);
  return projected.zone === 0
    ? { kind: "ups", hemisphere: projected.northp ? "north" : "south" }
    : {
        kind: "utm",
        zone: projected.zone,
        hemisphere: projected.northp ? "north" : "south",
      };
}

export function projectToGrid(
  crs: GridCrs,
  position: readonly [number, number],
): GridPoint {
  const [longitude, latitude] = position;
  if (crs.kind === "ups") {
    const projected = utmUps.forward(latitude, longitude, 0, false);
    return { easting: projected.x, northing: projected.y };
  }

  const projected = utmUps.forward(latitude, longitude, crs.zone, false);
  let northing = projected.y;
  const requestedNorth = crs.hemisphere === "north";
  if (requestedNorth !== projected.northp)
    northing += requestedNorth ? -10_000_000 : 10_000_000;
  return { easting: projected.x, northing };
}

export function unprojectFromGrid(
  crs: GridCrs,
  point: GridPoint,
): readonly [number, number] {
  const reversed = utmUps.reverse(
    crs.kind === "utm" ? crs.zone : 0,
    crs.hemisphere === "north",
    point.easting,
    point.northing,
    false,
  );
  return [reversed.lon, reversed.lat];
}
