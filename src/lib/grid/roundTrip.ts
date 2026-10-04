import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import { unwrapLongitude } from "./geo";

const ROUND_TRIP_TOLERANCE_DEG = 1e-6;
const ROUND_TRIP_TOLERANCE_PX = 1;

/** Return the pixel only when coordinate -> pixel -> coordinate is faithful. */
export function faithfulPixelFor(
  adapter: MapAdapter,
  coordinate: readonly [number, number],
): PixelCoordinate | null {
  const pixel = adapter.getPixelFromCoordinate([coordinate[0], coordinate[1]]);
  if (!pixel) return null;
  const back = adapter.getCoordinateFromPixel?.([pixel[0], pixel[1]]);
  if (!back) return null;
  const longitude = unwrapLongitude(coordinate[0], back[0]!);
  if (Math.abs(longitude - coordinate[0]) > ROUND_TRIP_TOLERANCE_DEG) return null;
  if (Math.abs(back[1]! - coordinate[1]) > ROUND_TRIP_TOLERANCE_DEG) return null;
  return [pixel[0], pixel[1]];
}

/** Return the coordinate only when pixel -> coordinate -> pixel is faithful. */
export function faithfulCoordinateAt(
  adapter: MapAdapter,
  pixel: readonly [number, number],
): [number, number] | null {
  const coordinate = adapter.getCoordinateFromPixel?.([pixel[0], pixel[1]]);
  if (!coordinate) return null;
  const back = adapter.getPixelFromCoordinate([coordinate[0]!, coordinate[1]!]);
  if (!back) return null;
  if (Math.hypot(back[0] - pixel[0], back[1] - pixel[1]) > ROUND_TRIP_TOLERANCE_PX)
    return null;
  return [coordinate[0]!, coordinate[1]!];
}
