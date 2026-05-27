import maplibregl, {
  type LngLatBoundsLike,
  type Map as MlMap,
  type StyleImage,
} from "maplibre-gl";
import { saveBlobToLocalFile } from "@/utils/files";
import {
  getSymbolImageSource,
  type MaplibreSymbolImageSource,
} from "@/modules/maplibreview/symbolImageRegistry";
import { isUnitLayerId } from "@/geo/engines/maplibre/unitLayer";
import { drawMapDecorations } from "@/modules/maplibreview/imageExport/mapDecorations";
import type { MeasurementUnit } from "@/composables/geoMeasurement";

export const MAX_EXPORT_DIMENSION = 16384;
export const MAX_EXPORT_PIXELS = 64_000_000;

export type PaperPreset = "a4" | "letter" | "slide-16-9" | "uhd-4k";
export type PaperOrientation = "landscape" | "portrait";

const PAPER_MM: Record<PaperPreset, { width: number; height: number } | null> = {
  a4: { width: 297, height: 210 },
  letter: { width: 279.4, height: 215.9 },
  "slide-16-9": null,
  "uhd-4k": null,
};

const SCREEN_PRESET_PX: Partial<Record<PaperPreset, { width: number; height: number }>> =
  {
    "slide-16-9": { width: 1920, height: 1080 },
    "uhd-4k": { width: 3840, height: 2160 },
  };

export function isPaperPreset(preset: PaperPreset): boolean {
  return PAPER_MM[preset] !== null;
}

export function pixelsFromPaperPreset(
  preset: PaperPreset,
  dpi: number,
  orientation: PaperOrientation = "landscape",
): { width: number; height: number } {
  const screen = SCREEN_PRESET_PX[preset];
  if (screen) return { ...screen };
  const mm = PAPER_MM[preset];
  if (!mm) throw new Error(`Unknown paper preset: ${preset}`);
  const longSide = Math.max(mm.width, mm.height);
  const shortSide = Math.min(mm.width, mm.height);
  const widthMm = orientation === "landscape" ? longSide : shortSide;
  const heightMm = orientation === "landscape" ? shortSide : longSide;
  return {
    width: Math.round((widthMm / 25.4) * dpi),
    height: Math.round((heightMm / 25.4) * dpi),
  };
}

export function checkExportSize(width: number, height: number): string | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return "Width and height must be positive numbers.";
  }
  if (width > MAX_EXPORT_DIMENSION || height > MAX_EXPORT_DIMENSION) {
    return `Maximum dimension is ${MAX_EXPORT_DIMENSION}px per side.`;
  }
  if (width * height > MAX_EXPORT_PIXELS) {
    return `Image too large (${(width * height).toLocaleString()} pixels). Limit is ${MAX_EXPORT_PIXELS.toLocaleString()}.`;
  }
  return null;
}

function ensureFileName(name: string | undefined, fallback = "map.png"): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return fallback;
  return /\.(png|jpe?g)$/i.test(trimmed) ? trimmed : `${trimmed}.png`;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType = "image/png",
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
}

/**
 * Deep-copy a MapLibre style for use in a secondary map. A style is JSON by
 * spec, but the live object returned by `getStyle()` can carry stray
 * non-cloneable values (e.g. functions) that make `structuredClone` throw, so
 * copy it via a JSON round-trip instead.
 */
function cloneStyleForExport(
  style: ReturnType<MlMap["getStyle"]>,
): ReturnType<MlMap["getStyle"]> {
  return JSON.parse(JSON.stringify(style));
}

/** Cartographic furniture drawn onto the exported image. */
export type MapDecorations = {
  scaleBar?: boolean;
  /** Measurement system for the scale bar's units. Defaults to metric. */
  scaleUnit?: MeasurementUnit;
  northArrow?: boolean;
  /** Print the basemap attribution in the lower-right corner. */
  credits?: boolean;
};

export type ViewportExportOptions = {
  /** Multiplies the final image size; see {@link BoundsExportOptions.outputScale}. */
  outputScale?: number;
  resetRotation?: boolean;
  /** Scale bar / north arrow to bake into the image. */
  decorations?: MapDecorations;
  /**
   * Short side (device px) of the full-resolution export. Set when rendering a
   * downscaled preview so resolution-dependent decorations (credits) are sized
   * as they will appear in the export. Defaults to this render's own size.
   */
  decorationReferenceShortSide?: number;
  fileName?: string;
};

export type ViewportFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Per-edge inset fractions (0–1) for the viewfinder safe-zone guide. */
export type SafeZoneInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function boundsFromViewportFrame(
  map: MlMap,
  frame: ViewportFrame,
): LngLatBoundsLike {
  const corners = [
    map.unproject([frame.x, frame.y]),
    map.unproject([frame.x + frame.width, frame.y]),
    map.unproject([frame.x + frame.width, frame.y + frame.height]),
    map.unproject([frame.x, frame.y + frame.height]),
  ];
  const lngs = corners.map((corner) => corner.lng);
  const lats = corners.map((corner) => corner.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export type BoundsExportOptions = {
  bounds: LngLatBoundsLike;
  width: number;
  height: number;
  /**
   * Multiplies the final pixel dimensions: the image is `width*outputScale` by
   * `height*outputScale`. Higher values give every layer — including symbols —
   * more pixels (genuinely higher resolution), at the cost of a larger file.
   * Defaults to 1 (exact `width`×`height`).
   */
  outputScale?: number;
  /** Raster scale used for programmatic symbols when it differs from outputScale. */
  symbolPixelRatio?: number;
  /** Visual scale for unit symbol/text layers when rendering at final layout size. */
  symbolDisplayScale?: number;
  resetRotation?: boolean;
  /** Scale bar / north arrow to bake into the image. */
  decorations?: MapDecorations;
  /** See {@link ViewportExportOptions.decorationReferenceShortSide}. */
  decorationReferenceShortSide?: number;
  fileName?: string;
};

export async function saveMapLibreMapAsPng(
  map: MlMap,
  options: { fileName?: string } = {},
) {
  const fileName = ensureFileName(options.fileName, "image.png");
  const canvas = map.getCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const blob = await canvasToBlob(canvas, "image/png");
  if (!blob) return;
  await saveBlobToLocalFile(blob, fileName);
}

/**
 * Render a rectangular viewfinder crop from the current visual viewport.
 *
 * Unlike a bounds export, this preserves the live camera composition: bearing,
 * pitch and zoom are rendered exactly as the user sees them. The hidden map is
 * centered on the screen point at the middle of the frame so it only needs to
 * render the requested output area, not the whole viewport before cropping.
 */
export async function renderViewportFrameToBlob(
  map: MlMap,
  frame: ViewportFrame,
  options: ViewportExportOptions = {},
): Promise<Blob | null> {
  const outputScale = Math.max(1, Math.round(options.outputScale ?? 1));
  const frameWidth = Math.max(1, Math.round(frame.width));
  const frameHeight = Math.max(1, Math.round(frame.height));
  const sizeError = checkExportSize(frameWidth * outputScale, frameHeight * outputScale);
  if (sizeError) throw new Error(sizeError);

  const centerPoint: [number, number] = [
    frame.x + frameWidth / 2,
    frame.y + frameHeight / 2,
  ];
  const center = map.unproject(centerPoint);

  return renderViaHiddenMap(map, {
    width: frameWidth,
    height: frameHeight,
    outputScale,
    symbolPixelRatio: outputScale,
    symbolDisplayScale: 1,
    resetRotation: options.resetRotation,
    decorations: options.decorations,
    decorationReferenceShortSide: options.decorationReferenceShortSide,
    camera: { center: [center.lng, center.lat], zoom: map.getZoom() },
  });
}

export async function exportViewportFrame(
  map: MlMap,
  frame: ViewportFrame,
  options: ViewportExportOptions = {},
): Promise<void> {
  const fileName = ensureFileName(options.fileName, "map.png");
  const blob = await renderViewportFrameToBlob(map, frame, {
    outputScale: options.outputScale,
    resetRotation: options.resetRotation,
    decorations: options.decorations,
  });
  if (!blob) return;
  await saveBlobToLocalFile(blob, fileName);
}

type HiddenMapCamera = {
  bounds?: LngLatBoundsLike;
  center?: [number, number];
  zoom?: number;
};

/**
 * Shared core for the bounds and viewport exports: render the source map's style
 * through a hidden MapLibre map (so the visible map is untouched) at the given
 * base size and output scale, and return the PNG blob.
 *
 * The blob is `width*outputScale` by `height*outputScale`. The map renders at a
 * device pixel ratio of `outputScale`, so every layer — basemap, labels and
 * re-rasterized symbols — gets that many more pixels with no downscaling, i.e.
 * genuinely higher resolution rather than just supersampled antialiasing.
 */
async function renderViaHiddenMap(
  sourceMap: MlMap,
  options: {
    width: number;
    height: number;
    outputScale: number;
    symbolPixelRatio?: number;
    symbolDisplayScale?: number;
    resetRotation?: boolean;
    decorations?: MapDecorations;
    decorationReferenceShortSide?: number;
    camera: HiddenMapCamera;
  },
): Promise<Blob | null> {
  const {
    width,
    height,
    outputScale,
    symbolPixelRatio = outputScale,
    symbolDisplayScale = 1,
    resetRotation,
    decorations,
    decorationReferenceShortSide,
    camera,
  } = options;

  const container = document.createElement("div");
  container.style.cssText = [
    "position:fixed",
    "left:-99999px",
    "top:0",
    `width:${width}px`,
    `height:${height}px`,
    "pointer-events:none",
    "visibility:hidden",
  ].join(";");
  document.body.appendChild(container);

  let hiddenMap: MlMap | null = null;
  try {
    const style = cloneStyleForExport(sourceMap.getStyle());
    hiddenMap = new maplibregl.Map({
      container,
      style,
      ...(camera.bounds
        ? { bounds: camera.bounds, fitBoundsOptions: { padding: 0, animate: false } }
        : { center: camera.center, zoom: camera.zoom }),
      interactive: false,
      attributionControl: false,
      pixelRatio: outputScale,
      // MapLibre clamps the canvas to maxCanvasSize (default [4096, 4096]) and
      // silently lowers the effective pixel ratio to fit. At high output scales
      // that would cap the export below the requested resolution; raise it to
      // the export limit (checkExportSize already bounds the final size).
      maxCanvasSize: [MAX_EXPORT_DIMENSION, MAX_EXPORT_DIMENSION],
      fadeDuration: 0,
      bearing: resetRotation ? 0 : sourceMap.getBearing(),
      pitch: resetRotation ? 0 : sourceMap.getPitch(),
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });

    // Symbols the live map generated (unit/custom symbols) are re-rasterized at
    // the output scale by prepopulateSymbolImages below. Those ids must NOT be
    // copied here: the missing-image event fires during the initial load, and
    // copying the low-res on-screen bitmap first would make the hidden map
    // already have the image, so the high-res regeneration would be skipped and
    // the export would stay blurry. Everything else (basemap sprite icons, KML
    // markers, etc.) is copied from the source map as-is.
    const symbolSource = getSymbolImageSource(sourceMap);
    const ownedIds = symbolSource ? new Set(symbolSource.usedImageIds()) : null;
    hiddenMap.on("styleimagemissing", (e) => {
      if (ownedIds?.has(e.id)) return;
      copyImageBetweenMaps(sourceMap, hiddenMap!, e.id);
    });

    await new Promise<void>((resolve, reject) => {
      hiddenMap!.once("load", () => resolve());
      hiddenMap!.once("error", (err) => reject(err.error ?? err));
    });

    if (symbolSource) {
      await prepopulateSymbolImages(hiddenMap, symbolSource, symbolPixelRatio);
    }

    scaleUnitSymbolLayers(hiddenMap, symbolDisplayScale);

    await waitForIdle(hiddenMap);

    const canvas = hiddenMap.getCanvas();
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    if (
      decorations &&
      (decorations.scaleBar || decorations.northArrow || decorations.credits)
    ) {
      // Composite the furniture onto a 2D copy: the live backing canvas is
      // WebGL, so it has no 2D context to draw scale bar / arrow / credits on.
      return await composeDecoratedBlob(canvas, {
        width,
        height,
        referenceShortSide: decorationReferenceShortSide,
        metersPerPixel: metersPerCssPixel(hiddenMap, width, height),
        bearing: hiddenMap.getBearing(),
        scaleBar: !!decorations.scaleBar,
        scaleUnit: decorations.scaleUnit,
        northArrow: !!decorations.northArrow,
        credits: decorations.credits ? getMapAttributionText(sourceMap) : undefined,
      });
    }
    // The backing canvas is already width*outputScale × height*outputScale; emit
    // it directly so symbols keep every pixel they were rendered with.
    return await canvasToBlob(canvas, "image/png");
  } finally {
    hiddenMap?.remove();
    container.remove();
  }
}

/**
 * Render a geographic bounding box and return the PNG blob. See
 * {@link renderViaHiddenMap} for the rendering/scaling behavior.
 */
export async function renderBoundsToBlob(
  sourceMap: MlMap,
  options: Omit<BoundsExportOptions, "fileName">,
): Promise<Blob | null> {
  const outputScale = Math.max(1, Math.round(options.outputScale ?? 1));
  // Validate the final dimensions (base × scale) so an oversized export fails
  // with a clear message instead of silently producing a blank/clamped canvas.
  const sizeError = checkExportSize(
    options.width * outputScale,
    options.height * outputScale,
  );
  if (sizeError) throw new Error(sizeError);

  return renderViaHiddenMap(sourceMap, {
    width: options.width,
    height: options.height,
    outputScale,
    symbolPixelRatio: options.symbolPixelRatio,
    symbolDisplayScale: options.symbolDisplayScale,
    resetRotation: options.resetRotation,
    decorations: options.decorations,
    decorationReferenceShortSide: options.decorationReferenceShortSide,
    camera: { bounds: options.bounds },
  });
}

/** Ground meters per CSS pixel at the image center, sampled horizontally. */
function metersPerCssPixel(map: MlMap, width: number, height: number): number {
  const cx = width / 2;
  const cy = height / 2;
  const span = 50;
  const left = map.unproject([cx - span, cy]);
  const right = map.unproject([cx + span, cy]);
  return left.distanceTo(right) / (span * 2);
}

/**
 * Copy the rendered WebGL canvas into a 2D canvas of the same size and draw the
 * requested decorations on top. The 2D context is scaled so {@link
 * drawMapDecorations} can work in CSS pixels.
 *
 * The scale is derived from the *actual* backing-canvas size rather than the
 * requested output scale: MapLibre may clamp the canvas (maxCanvasSize / GPU
 * limits) and render at a lower effective pixel ratio, so trusting the requested
 * scale would place the edge-anchored furniture (scale bar, credits, north
 * arrow) off the real canvas and make it vanish.
 */
async function composeDecoratedBlob(
  source: HTMLCanvasElement,
  opts: {
    width: number;
    height: number;
    referenceShortSide?: number;
    metersPerPixel: number;
    bearing: number;
    scaleBar: boolean;
    scaleUnit?: MeasurementUnit;
    northArrow: boolean;
    credits?: string;
  },
): Promise<Blob | null> {
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d");
  if (!ctx) return canvasToBlob(source, "image/png");
  ctx.drawImage(source, 0, 0);
  const pixelRatio = opts.width > 0 ? source.width / opts.width : 1;
  ctx.save();
  ctx.scale(pixelRatio, pixelRatio);
  drawMapDecorations(ctx, {
    width: opts.width,
    height: opts.height,
    pixelRatio,
    referenceShortSide: opts.referenceShortSide,
    metersPerPixel: opts.metersPerPixel,
    bearing: opts.bearing,
    scaleBar: opts.scaleBar,
    scaleUnit: opts.scaleUnit,
    northArrow: opts.northArrow,
    credits: opts.credits,
  });
  ctx.restore();
  return canvasToBlob(out, "image/png");
}

/** Strip HTML markup from an attribution string, collapsing whitespace. */
function stripHtml(html: string): string {
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Collect the basemap attribution into a single de-duplicated, plain-text credit
 * line for the export.
 *
 * Vector basemaps load their attribution from TileJSON asynchronously, so it
 * lives on the resolved source instance (`getSource(id).attribution`), not in
 * the serialized style spec — read the instance first and fall back to the spec
 * (which is where raster basemaps declare it inline).
 */
export function getMapAttributionText(map: MlMap): string {
  const specs = map.getStyle().sources ?? {};
  const parts = new Set<string>();
  for (const id of Object.keys(specs)) {
    const live = map.getSource?.(id) as { attribution?: string } | undefined;
    const spec = specs[id] as { attribution?: string };
    const attribution = live?.attribution ?? spec?.attribution;
    if (attribution) {
      const text = stripHtml(attribution);
      if (text) parts.add(text);
    }
  }
  return [...parts].join(" · ");
}

function multiplyStyleValue(value: unknown, scale: number): unknown {
  if (typeof value === "number") return value * scale;
  if (value === undefined || value === null) return scale;
  return ["*", value, scale];
}

function scaledTextOffsetExpression(scale: number): unknown[] {
  const offset = ["get", "textOffset"];
  return ["array", ["*", ["at", 0, offset], scale], ["*", ["at", 1, offset], scale]];
}

function scaleUnitSymbolLayers(map: MlMap, scale: number) {
  if (!Number.isFinite(scale) || scale <= 0 || scale === 1) return;
  const layers = map.getStyle().layers ?? [];
  for (const layer of layers) {
    if (!isUnitLayerId(layer.id) || layer.type !== "symbol") continue;
    const layout = layer.layout ?? {};
    map.setLayoutProperty(
      layer.id,
      "icon-size",
      multiplyStyleValue(layout["icon-size"], scale),
    );
    map.setLayoutProperty(
      layer.id,
      "text-size",
      multiplyStyleValue(layout["text-size"], scale),
    );
    map.setLayoutProperty(layer.id, "text-offset", scaledTextOffsetExpression(scale));

    const paint = layer.paint ?? {};
    map.setPaintProperty(
      layer.id,
      "text-halo-width",
      multiplyStyleValue(paint["text-halo-width"], scale),
    );
    map.setPaintProperty(
      layer.id,
      "text-halo-blur",
      multiplyStyleValue(paint["text-halo-blur"], scale),
    );
  }
}

export async function exportMapByBounds(
  sourceMap: MlMap,
  options: BoundsExportOptions,
): Promise<void> {
  const { fileName: rawFileName, ...renderOptions } = options;
  const fileName = ensureFileName(rawFileName, "map.png");
  const blob = await renderBoundsToBlob(sourceMap, renderOptions);
  if (!blob) return;
  await saveBlobToLocalFile(blob, fileName);
}

/**
 * Add freshly-rasterized, render-scale symbols to the hidden export map. Renders
 * all in-use ids in parallel; if an id can't be regenerated it falls back to
 * copying the on-screen bitmap so the symbol still appears (just not sharper).
 */
export async function prepopulateSymbolImages(
  map: MlMap,
  source: MaplibreSymbolImageSource,
  pixelRatio: number,
): Promise<void> {
  const ids = [...source.usedImageIds()];
  const failedIds: string[] = [];
  await Promise.all(
    ids.map(async (id) => {
      if (map.hasImage(id)) return;
      try {
        const result = await source.renderImage(id, pixelRatio);
        if (result && !map.hasImage(id)) {
          map.addImage(id, result.data, { pixelRatio: result.pixelRatio });
          return;
        }
      } catch {
        // Report below. Programmatic symbols should not silently fall back to
        // the low-resolution on-screen bitmap; that produces blurry exports.
      }
      failedIds.push(id);
    }),
  );
  if (failedIds.length) {
    throw new Error(
      `Could not render high-resolution map symbol${failedIds.length === 1 ? "" : "s"} for export: ${failedIds.join(", ")}`,
    );
  }
}

function copyImageBetweenMaps(from: MlMap, to: MlMap, id: string) {
  if (to.hasImage(id)) return;
  const img = from.getImage(id) as StyleImage | undefined;
  if (!img) return;
  // Forward the full metadata, not just pixelRatio/sdf: stretch and text-fit
  // settings determine how stretchable/text-fit icons render, so dropping them
  // would scale or distort those icons in the exported image.
  to.addImage(id, img.data, {
    pixelRatio: img.pixelRatio ?? 1,
    sdf: !!img.sdf,
    stretchX: img.stretchX,
    stretchY: img.stretchY,
    content: img.content,
    textFitWidth: img.textFitWidth,
    textFitHeight: img.textFitHeight,
  });
}

function waitForIdle(map: MlMap): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      map.off("idle", done);
      resolve();
    };
    map.on("idle", done);
  });
}
