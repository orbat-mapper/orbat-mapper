import maplibregl, {
  type LngLatBoundsLike,
  type Map as MlMap,
  type StyleImage,
} from "maplibre-gl";
import { saveBlobToLocalFile } from "@/utils/files";

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

export type ViewportExportOptions = {
  pixelRatio?: number;
  fileName?: string;
};

export type BoundsExportOptions = {
  bounds: LngLatBoundsLike;
  width: number;
  height: number;
  spritePixelRatio?: number;
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
 * Render the current viewport at a target pixel ratio and return the PNG blob,
 * leaving the visible map's pixel ratio restored afterwards.
 */
export async function renderViewportToBlob(
  map: MlMap,
  options: { pixelRatio?: number } = {},
): Promise<Blob | null> {
  const targetRatio = Math.max(1, options.pixelRatio ?? window.devicePixelRatio ?? 1);

  const restore = await applyPixelRatio(map, targetRatio);
  try {
    await waitForIdle(map);
    const canvas = map.getCanvas();
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    return await canvasToBlob(canvas, "image/png");
  } finally {
    await restore();
  }
}

export async function exportViewportAtPixelRatio(
  map: MlMap,
  options: ViewportExportOptions = {},
): Promise<void> {
  const fileName = ensureFileName(options.fileName, "map.png");
  const blob = await renderViewportToBlob(map, { pixelRatio: options.pixelRatio });
  if (!blob) return;
  await saveBlobToLocalFile(blob, fileName);
}

/**
 * Render a geographic bounding box at explicit pixel dimensions and return the
 * PNG blob, using a hidden MapLibre map cloned from the source style so the
 * visible map is untouched.
 */
export async function renderBoundsToBlob(
  sourceMap: MlMap,
  options: Omit<BoundsExportOptions, "fileName">,
): Promise<Blob | null> {
  const sizeError = checkExportSize(options.width, options.height);
  if (sizeError) throw new Error(sizeError);

  const ratio = Math.max(1, options.spritePixelRatio ?? 2);

  const container = document.createElement("div");
  container.style.cssText = [
    "position:fixed",
    "left:-99999px",
    "top:0",
    `width:${options.width}px`,
    `height:${options.height}px`,
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
      bounds: options.bounds,
      fitBoundsOptions: { padding: 0, animate: false },
      interactive: false,
      attributionControl: false,
      pixelRatio: ratio,
      fadeDuration: 0,
      bearing: sourceMap.getBearing(),
      pitch: sourceMap.getPitch(),
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });

    // Programmatically-added images (unit symbols, custom symbols, KML icons,
    // feature markers) are not part of the style — copy them from the source
    // map so the hidden map can render them without re-running addUnits.
    hiddenMap.on("styleimagemissing", (e) => {
      copyImageBetweenMaps(sourceMap, hiddenMap!, e.id);
    });

    await new Promise<void>((resolve, reject) => {
      hiddenMap!.once("load", () => resolve());
      hiddenMap!.once("error", (err) => reject(err.error ?? err));
    });

    await waitForIdle(hiddenMap);

    const canvas = hiddenMap.getCanvas();
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    return await canvasToBlob(canvas, "image/png");
  } finally {
    hiddenMap?.remove();
    container.remove();
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

async function applyPixelRatio(map: MlMap, ratio: number): Promise<() => Promise<void>> {
  const current = map.getPixelRatio();
  map.setPixelRatio(ratio);
  return async () => {
    map.setPixelRatio(current);
    await waitForIdle(map).catch(() => {});
  };
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
