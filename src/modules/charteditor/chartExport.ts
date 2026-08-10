import { sizeToPhysicalWidthHeight } from "./orbatchart/sizes";

export type ChartExportFormat = "svg" | "png";
export type ChartExportBounds = "page" | "content";

export interface OrbatChartExportOptions {
  format: ChartExportFormat;
  bounds: ChartExportBounds;
  /** Raster multiplier. Ignored for SVG output. */
  scale?: number;
  /** Padding in chart user units when tightly cropping content. */
  padding?: number;
  /** Null keeps the exported image transparent. */
  backgroundColor?: string | null;
  pageSize?: string;
  title?: string;
  description?: string;
}

export interface PreparedOrbatChartExport {
  width: number;
  height: number;
  estimatedMemoryBytes: number;
  render(): Promise<Blob>;
}

type ViewBox = { x: number; y: number; width: number; height: number };

const SVG_NS = "http://www.w3.org/2000/svg";
const MAX_EXPORT_DIMENSION = 16_384;
const MAX_EXPORT_PIXELS = 64_000_000;
const DEFAULT_CONTENT_PADDING = 24;
// The decoded SVG image and destination canvas each use roughly four RGBA bytes/pixel.
const ESTIMATED_RASTER_BYTES_PER_PIXEL = 8;

function parseViewBox(svg: SVGSVGElement): ViewBox {
  const values = svg
    .getAttribute("viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  if (!values || values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("The chart does not have a valid SVG view box.");
  }
  const [x, y, width, height] = values;
  if (width <= 0 || height <= 0) {
    throw new Error("The chart has invalid export dimensions.");
  }
  return { x, y, width, height };
}

function parseWrapperTransform(transform: string | null) {
  if (!transform) return { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 };
  const match = transform.match(
    /^\s*translate\(\s*([-+\d.e]+)(?:[\s,]+([-+\d.e]+))?\s*\)\s*scale\(\s*([-+\d.e]+)(?:[\s,]+([-+\d.e]+))?\s*\)\s*$/i,
  );
  if (!match) {
    throw new Error("The chart uses an unsupported layout transform.");
  }
  const translateX = Number(match[1]);
  const translateY = Number(match[2] ?? 0);
  const scaleX = Number(match[3]);
  const scaleY = Number(match[4] ?? match[3]);
  return { translateX, translateY, scaleX, scaleY };
}

function contentViewBox(svg: SVGSVGElement, padding: number): ViewBox {
  const chart = svg.querySelector<SVGGElement>("g.o-chart");
  const wrapper = svg.querySelector<SVGGElement>("g.o-wrapper");
  if (!chart || !wrapper || typeof chart.getBBox !== "function") {
    throw new Error("The chart content is not ready to export.");
  }
  const box = chart.getBBox();
  if (![box.x, box.y, box.width, box.height].every(Number.isFinite)) {
    throw new Error("The chart content has invalid bounds.");
  }
  const { translateX, translateY, scaleX, scaleY } = parseWrapperTransform(
    wrapper.getAttribute("transform"),
  );
  const left = box.x * scaleX + translateX;
  const top = box.y * scaleY + translateY;
  return {
    x: left - padding,
    y: top - padding,
    width: Math.max(1, box.width * Math.abs(scaleX) + padding * 2),
    height: Math.max(1, box.height * Math.abs(scaleY) + padding * 2),
  };
}

function cleanExportStyle(style: string) {
  return style
    .replace(/\.o-unit:hover\s*\{[^}]*\}/g, "")
    .replace(/\.highlight(?::hover)?\s*\{[^}]*\}/g, "")
    .trim();
}

function addMetadata(
  svg: SVGSVGElement,
  options: OrbatChartExportOptions,
  viewBox: ViewBox,
) {
  const firstChild = svg.firstChild;
  if (options.title) {
    const title = document.createElementNS(SVG_NS, "title");
    title.setAttribute("id", "orbat-export-title");
    title.textContent = options.title;
    svg.insertBefore(title, firstChild);
  }
  if (options.description) {
    const description = document.createElementNS(SVG_NS, "desc");
    description.setAttribute("id", "orbat-export-description");
    description.textContent = options.description;
    const title = svg.querySelector(":scope > title");
    svg.insertBefore(description, title?.nextSibling ?? svg.firstChild);
  }
  const metadata = document.createElementNS(SVG_NS, "metadata");
  metadata.textContent = JSON.stringify({
    generator: "ORBAT Mapper",
    exportedAt: new Date().toISOString(),
    bounds: viewBox,
  });
  const description = svg.querySelector(":scope > desc");
  const title = svg.querySelector(":scope > title");
  svg.insertBefore(
    metadata,
    description?.nextSibling ?? title?.nextSibling ?? svg.firstChild,
  );
  const labelledBy = [
    options.title ? "orbat-export-title" : null,
    options.description ? "orbat-export-description" : null,
  ].filter(Boolean);
  if (labelledBy.length) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-labelledby", labelledBy.join(" "));
  }
}

function addBackground(svg: SVGSVGElement, viewBox: ViewBox, color: string | null) {
  if (!color) return;
  const background = document.createElementNS(SVG_NS, "rect");
  background.setAttribute("data-export-background", "");
  background.setAttribute("x", String(viewBox.x));
  background.setAttribute("y", String(viewBox.y));
  background.setAttribute("width", String(viewBox.width));
  background.setAttribute("height", String(viewBox.height));
  background.setAttribute("fill", color);
  const firstVisualChild = Array.from(svg.children).find(
    (child) => !["title", "desc", "metadata", "style", "defs"].includes(child.tagName),
  );
  svg.insertBefore(background, firstVisualChild ?? null);
}

function cloneForExport(
  source: SVGSVGElement,
  options: OrbatChartExportOptions,
  viewBox: ViewBox,
  outputWidth: number,
  outputHeight: number,
) {
  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute("id");
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("color", source.getAttribute("color") ?? "#000000");
  clone.setAttribute(
    "font-family",
    source.getAttribute("font-family") ||
      globalThis.getComputedStyle?.(source).fontFamily ||
      "sans-serif",
  );
  if (clone.querySelector("[href], [xlink\\:href]")) {
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }
  clone.setAttribute(
    "viewBox",
    `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`,
  );

  const physicalSize =
    options.bounds === "page" && options.pageSize
      ? sizeToPhysicalWidthHeight(options.pageSize)
      : null;
  if (options.format === "svg" && physicalSize) {
    clone.setAttribute("width", `${physicalSize.width}mm`);
    clone.setAttribute("height", `${physicalSize.height}mm`);
  } else {
    clone.setAttribute("width", String(outputWidth));
    clone.setAttribute("height", String(outputHeight));
  }

  clone
    .querySelectorAll("#o-highlight-layer, .o-page-boundary, .dbg-rect, .dbg-point")
    .forEach((element) => element.remove());
  clone.querySelectorAll("style").forEach((style) => {
    style.textContent = cleanExportStyle(style.textContent ?? "");
  });
  addMetadata(clone, options, viewBox);
  addBackground(clone, viewBox, options.backgroundColor ?? null);
  return clone;
}

function serializeSvg(svg: SVGSVGElement) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}`;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The browser could not encode the chart as PNG."));
    }, "image/png");
  });
}

function loadSvgImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("The browser could not render the chart SVG."));
    image.src = url;
  });
}

async function renderPng(svgText: string, width: number, height: number) {
  const objectUrl = URL.createObjectURL(
    new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = await loadSvgImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable in this browser.");
    context.drawImage(image, 0, 0, width, height);
    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function prepareOrbatChartExport(
  source: SVGSVGElement,
  options: OrbatChartExportOptions,
): PreparedOrbatChartExport {
  const padding = Math.max(0, options.padding ?? DEFAULT_CONTENT_PADDING);
  const viewBox =
    options.bounds === "content" ? contentViewBox(source, padding) : parseViewBox(source);
  const scale = options.format === "png" ? Math.max(0.1, options.scale ?? 2) : 1;
  const width = Math.max(1, Math.ceil(viewBox.width * scale));
  const height = Math.max(1, Math.ceil(viewBox.height * scale));
  if (
    options.format === "png" &&
    (width > MAX_EXPORT_DIMENSION || height > MAX_EXPORT_DIMENSION)
  ) {
    throw new Error(
      `Export dimensions cannot exceed ${MAX_EXPORT_DIMENSION}px per side.`,
    );
  }
  if (options.format === "png" && width * height > MAX_EXPORT_PIXELS) {
    throw new Error(
      `Export is too large (${(width * height).toLocaleString()} pixels). The limit is ${MAX_EXPORT_PIXELS.toLocaleString()} pixels.`,
    );
  }
  const clone = cloneForExport(source, options, viewBox, width, height);
  const svgText = serializeSvg(clone);
  return {
    width,
    height,
    estimatedMemoryBytes:
      options.format === "png" ? width * height * ESTIMATED_RASTER_BYTES_PER_PIXEL : 0,
    render: () =>
      options.format === "svg"
        ? Promise.resolve(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }))
        : renderPng(svgText, width, height),
  };
}
