/**
 * Screen (px) and ground (m) sizes for point symbols, after tactrace's
 * `symbolSizing.ts`. Conversions keep a symbol's *apparent* size at the current zoom,
 * so switching unit never makes it jump.
 */
import { effectivePointSymbolPixelSize } from "@orbat-mapper/tactical-draw";
import type { PointSymbolSize } from "@/types/scenarioLayerItems";
import { DEFAULT_POINT_SYMBOL_SIZE } from "@/geo/pointSymbols";

/** On-screen floor for a ground-sized symbol, so it stays legible zoomed far out. */
export const MIN_GROUND_SIZE_PX = 12;

/** A ground size for when there is no map zoom to derive one from. */
export const DEFAULT_GROUND_SIZE_METERS = 500;

/**
 * Web Mercator world circumference in meters, as tactical-draw's MapLibre adapter
 * uses it for its own `getResolution()` and ground icon ramp.
 */
const WEB_MERCATOR_CIRCUMFERENCE = 40075016.686;

/** Ground meters per CSS pixel at `zoom`; like the renderer, independent of latitude. */
export function metersPerPixelAtZoom(zoom: number): number {
  return WEB_MERCATOR_CIRCUMFERENCE / 2 ** (zoom + 9);
}

/** A ground size that reads at most `screenPixels` on screen, and at least the floor. */
export function groundPointSymbolSize(
  meters: number,
  screenPixels: number,
): PointSymbolSize {
  return {
    value: meters,
    unit: "meters",
    minPixels: Math.min(MIN_GROUND_SIZE_PX, screenPixels),
    maxPixels: screenPixels,
  };
}

/** The on-screen size the renderer draws `size` at, at `zoom`. */
export function apparentPointSymbolPixels(size: PointSymbolSize, zoom?: number): number {
  if (size.unit === "pixels") return size.value;
  if (zoom === undefined || !Number.isFinite(zoom)) {
    return size.maxPixels ?? DEFAULT_POINT_SYMBOL_SIZE.value;
  }
  return effectivePointSymbolPixelSize({ size }, metersPerPixelAtZoom(zoom));
}

export function isPointSymbolSizeUnit(unit: unknown): unit is PointSymbolSize["unit"] {
  return unit === "pixels" || unit === "meters";
}

/** Whole pixels and meters, except below 10 m where a whole meter is too coarse. */
function roundSize(value: number): number {
  return value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
}

/**
 * `size` in `unit`, looking the same at `zoom` as it does now. Without a zoom a
 * ground size falls back to {@link DEFAULT_GROUND_SIZE_METERS}.
 */
export function convertPointSymbolSize(
  size: PointSymbolSize,
  unit: PointSymbolSize["unit"],
  zoom?: number,
): PointSymbolSize {
  if (size.unit === unit) return size;
  const pixels = roundSize(apparentPointSymbolPixels(size, zoom));
  if (unit === "pixels") return { value: pixels, unit: "pixels" };
  const meters =
    zoom !== undefined && Number.isFinite(zoom)
      ? roundSize(pixels * metersPerPixelAtZoom(zoom))
      : DEFAULT_GROUND_SIZE_METERS;
  return groundPointSymbolSize(meters, pixels);
}

/** What a new symbol is born with: the default on-screen size, in `unit`. */
export function newPointSymbolSize(
  unit: PointSymbolSize["unit"],
  zoom?: number,
): PointSymbolSize {
  return convertPointSymbolSize(DEFAULT_POINT_SYMBOL_SIZE, unit, zoom);
}
