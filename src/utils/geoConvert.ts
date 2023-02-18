import type { Position } from "geojson";
import { forward } from "mgrs";

export function formatDecimalDegrees(p: Position, precision: number) {
  const [lon, lat] = p;
  return `${Math.abs(lat).toFixed(precision)}° ${lat >= 0 ? "N" : "S"} ${Math.abs(
    lon
  ).toFixed(precision)}° ${lon >= 0 ? "E" : "W"}`;
}

export function formatMGRS(p: Position | undefined, precision: 1 | 2 | 3 | 4 | 5 = 5) {
  const mgrs: string = p && forward(p, precision);
  const n = mgrs.length;
  const eastingI = n - precision * 2;
  return `${mgrs.slice(0, eastingI - 2)} ${mgrs.slice(
    eastingI - 2,
    eastingI
  )} ${mgrs.slice(eastingI, n - precision)} ${mgrs.slice(n - precision)}`;
}
