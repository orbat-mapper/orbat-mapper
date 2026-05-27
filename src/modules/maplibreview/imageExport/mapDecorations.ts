/**
 * Cartographic furniture drawn onto the exported map image: a distance scale bar
 * and a north arrow. Kept independent of MapLibre so the geometry/rounding logic
 * is unit-testable; the caller supplies meters-per-pixel and bearing.
 *
 * Visual direction is "published map", not "UI overlay": elements are stroked
 * with a white halo so they read on any basemap, the scale bar uses the classic
 * alternating-segment idiom, and the north arrow is a two-tone needle whose "N"
 * stays upright as it rotates with the map bearing.
 */

import type { MeasurementUnit } from "@/composables/geoMeasurement";

const INK = "#1a1a1a";
const PAPER = "#ffffff";
const HALO = "rgba(255, 255, 255, 0.92)";
const FONT_STACK =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Distance from the image edge to the decorations, in CSS pixels. */
const MARGIN = 16;

/**
 * Round a value down to the nearest "nice" cartographic value (1, 2, 3 or 5
 * times a power of ten) so the scale bar shows a readable number. Unit-agnostic:
 * the input may be meters, miles, feet, etc.
 */
export function niceScaleMeters(maxValue: number): number {
  if (!(maxValue > 0)) return 0;
  const pow10 = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const d = maxValue / pow10;
  const nice = d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
  return nice * pow10;
}

const METERS_PER_UNIT = {
  km: 1000,
  m: 1,
  mi: 1609.344,
  ft: 0.3048,
  nm: 1852,
} as const;

type ScaleLabelUnit = keyof typeof METERS_PER_UNIT;
type ScaleTier = { unit: ScaleLabelUnit; metersPerUnit: number };

/**
 * Pick the label unit for the bar's measurement system, switching to the larger
 * unit (km / mi / nm) once the bar spans at least one of it.
 */
function scaleTier(maxMeters: number, system: MeasurementUnit): ScaleTier {
  switch (system) {
    case "imperial":
      return maxMeters >= METERS_PER_UNIT.mi
        ? { unit: "mi", metersPerUnit: METERS_PER_UNIT.mi }
        : { unit: "ft", metersPerUnit: METERS_PER_UNIT.ft };
    case "nautical":
      return maxMeters >= METERS_PER_UNIT.nm
        ? { unit: "nm", metersPerUnit: METERS_PER_UNIT.nm }
        : { unit: "ft", metersPerUnit: METERS_PER_UNIT.ft };
    default:
      return maxMeters >= METERS_PER_UNIT.km
        ? { unit: "km", metersPerUnit: METERS_PER_UNIT.km }
        : { unit: "m", metersPerUnit: METERS_PER_UNIT.m };
  }
}

/** Format a rounded scale-bar distance already expressed in `unit`. */
export function formatScaleLabel(value: number, unit: ScaleLabelUnit): string {
  const text = Number.isInteger(value) ? `${value}` : value.toFixed(value < 10 ? 1 : 0);
  return `${text} ${unit}`;
}

export type ScaleBar = { meters: number; widthPx: number; label: string };

/**
 * Resolve the scale bar's rounded distance and on-image width given the map's
 * resolution, the maximum width we'll allow the bar to occupy, and the
 * measurement system whose units the label should use.
 */
export function computeScaleBar(
  metersPerPixel: number,
  maxWidthPx: number,
  system: MeasurementUnit = "metric",
): ScaleBar | null {
  if (!(metersPerPixel > 0) || !(maxWidthPx > 0)) return null;
  const maxMeters = metersPerPixel * maxWidthPx;
  const tier = scaleTier(maxMeters, system);
  const niceUnits = niceScaleMeters(maxMeters / tier.metersPerUnit);
  if (!(niceUnits > 0)) return null;
  const meters = niceUnits * tier.metersPerUnit;
  return {
    meters,
    widthPx: meters / metersPerPixel,
    label: formatScaleLabel(niceUnits, tier.unit),
  };
}

export type DecorationDrawOptions = {
  /** Image size in CSS pixels (the context is pre-scaled by the pixel ratio). */
  width: number;
  height: number;
  /**
   * Output pixel ratio the context is scaled by (final px = width × ratio).
   * Used to size attribution from the final resolution rather than the frame.
   */
  pixelRatio: number;
  /**
   * Short side (device px) of the full-resolution export, when this render is a
   * downscaled preview. Lets resolution-dependent furniture be sized as it will
   * appear in the export, then scaled down to match the preview. Defaults to
   * this image's own short side (i.e. a 1:1 export render).
   */
  referenceShortSide?: number;
  /** Ground meters per CSS pixel at the image center. */
  metersPerPixel: number;
  /** Map bearing in degrees clockwise from north. */
  bearing: number;
  scaleBar?: boolean;
  /** Measurement system for the scale bar's units. Defaults to metric. */
  scaleUnit?: MeasurementUnit;
  northArrow?: boolean;
  /** Basemap attribution text to print in the lower-right corner. */
  credits?: string;
};

/**
 * Draw the requested decorations onto a 2D context. The context is expected to
 * already be scaled to the output pixel ratio, so all sizes here are CSS pixels.
 */
export function drawMapDecorations(
  ctx: CanvasRenderingContext2D,
  opts: DecorationDrawOptions,
): void {
  if (opts.scaleBar) drawScaleBar(ctx, opts);
  if (opts.northArrow) drawNorthArrow(ctx, opts);
  if (opts.credits) drawCredits(ctx, opts);
}

/** Stroke a halo behind the glyph, then fill it — legible on any background. */
function haloText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  haloWidth = 3,
): void {
  ctx.lineJoin = "round";
  ctx.lineWidth = haloWidth;
  ctx.strokeStyle = HALO;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = INK;
  ctx.fillText(text, x, y);
}

function tracePath(ctx: CanvasRenderingContext2D, points: [number, number][]): void {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

function drawScaleBar(ctx: CanvasRenderingContext2D, opts: DecorationDrawOptions): void {
  const maxWidth = Math.min(opts.width * 0.25, 240);
  const bar = computeScaleBar(opts.metersPerPixel, maxWidth, opts.scaleUnit);
  if (!bar) return;

  const segments = 4;
  const segmentPx = bar.widthPx / segments;
  const barHeight = 6;
  const x0 = MARGIN;
  const barBottom = opts.height - MARGIN;
  const barTop = barBottom - barHeight;

  ctx.save();
  ctx.lineJoin = "round";

  // Alternating filled/empty segments — the classic map scale idiom.
  for (let i = 0; i < segments; i++) {
    ctx.fillStyle = i % 2 === 0 ? INK : PAPER;
    ctx.fillRect(x0 + i * segmentPx, barTop, segmentPx, barHeight);
  }

  // Outline: white halo first, then a crisp ink line on top.
  ctx.strokeStyle = HALO;
  ctx.lineWidth = 3;
  ctx.strokeRect(x0, barTop, bar.widthPx, barHeight);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.strokeRect(x0, barTop, bar.widthPx, barHeight);

  // End labels sit just above the bar.
  ctx.font = `600 12px ${FONT_STACK}`;
  ctx.textBaseline = "bottom";
  ctx.textAlign = "center";
  haloText(ctx, "0", x0, barTop - 4);
  haloText(ctx, bar.label, x0 + bar.widthPx, barTop - 4);

  ctx.restore();
}

/** Greedily wrap text to lines no wider than `maxWidth` (measured in context). */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCredits(ctx: CanvasRenderingContext2D, opts: DecorationDrawOptions): void {
  const text = opts.credits?.trim();
  if (!text) return;

  // Attribution is metadata, not map content: size it from the final image
  // resolution rather than the frame size × output scale, so it stays a modest,
  // consistent caption and wraps against the full output width (so a long credit
  // rarely wraps on a large export). The context is scaled by opts.pixelRatio,
  // so a device-pixel target is divided back into the context's user units. A
  // downscaled preview passes the export's short side as referenceShortSide so
  // the credit matches the export's size, then scales down with the preview.
  const ratio = opts.pixelRatio > 0 ? opts.pixelRatio : 1;
  const currentShortSide = Math.min(opts.width, opts.height) * ratio;
  const referenceShortSide =
    opts.referenceShortSide && opts.referenceShortSide > 0
      ? opts.referenceShortSide
      : currentShortSide;
  const referenceFontPx = Math.min(22, Math.max(11, referenceShortSide * 0.009));
  const fontDevicePx =
    referenceShortSide > 0
      ? referenceFontPx * (currentShortSide / referenceShortSide)
      : 0;
  const fontPx = fontDevicePx / ratio;
  const lineHeight = fontPx * 1.3;
  const haloWidth = Math.max(1, fontPx * 0.2);

  ctx.save();
  ctx.font = `500 ${fontPx}px ${FONT_STACK}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";

  const maxWidth = opts.width - MARGIN * 2;
  const lines = wrapText(ctx, text, maxWidth);
  const x = opts.width - MARGIN;
  let y = opts.height - MARGIN;
  // Draw bottom-up so the first line ends up on top.
  for (let i = lines.length - 1; i >= 0; i--) {
    haloText(ctx, lines[i], x, y, haloWidth);
    y -= lineHeight;
  }
  ctx.restore();
}

function drawNorthArrow(
  ctx: CanvasRenderingContext2D,
  opts: DecorationDrawOptions,
): void {
  const len = 20; // needle tip distance from center
  const tail = 8; // base spread below center
  const halfW = 7; // half-width at the base
  const labelGap = 11; // gap between tip and the "N"
  const cx = opts.width - MARGIN - halfW - 4;
  const cy = MARGIN + len + labelGap + 4;
  const ang = (-opts.bearing * Math.PI) / 180;

  const tip: [number, number] = [0, -len];
  const base: [number, number] = [0, tail * 0.5];
  const east: [number, number] = [halfW, tail];
  const west: [number, number] = [-halfW, tail];

  ctx.save();
  ctx.lineJoin = "round";
  ctx.translate(cx, cy);
  ctx.rotate(ang);

  // Halo backing for the whole needle.
  ctx.strokeStyle = HALO;
  ctx.lineWidth = 3;
  tracePath(ctx, [tip, east, base]);
  ctx.stroke();
  tracePath(ctx, [tip, west, base]);
  ctx.stroke();

  // Two-tone fill: west half ink, east half paper.
  ctx.fillStyle = INK;
  tracePath(ctx, [tip, west, base]);
  ctx.fill();
  ctx.fillStyle = PAPER;
  tracePath(ctx, [tip, east, base]);
  ctx.fill();

  // Crisp ink outline over both halves.
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  tracePath(ctx, [tip, east, base]);
  ctx.stroke();
  tracePath(ctx, [tip, west, base]);
  ctx.stroke();
  ctx.restore();

  // Keep the "N" upright at the north tip even when the needle is rotated:
  // move out along the (rotated) tip direction, then undo the rotation.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.translate(0, -(len + labelGap));
  ctx.rotate(-ang);
  ctx.font = `700 13px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  haloText(ctx, "N", 0, 0);
  ctx.restore();
}
