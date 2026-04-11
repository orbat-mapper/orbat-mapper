import type { ArrowType } from "./simplestyle";

type ArrowRenderableType = Exclude<ArrowType, "none">;
type ArrowSvgElement = {
  d: string;
  fill?: boolean;
  stroke?: boolean;
  strokeWidth?: number;
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "miter" | "round" | "bevel";
};

export type ArrowSymbolDefinition = {
  width: number;
  height: number;
  // Attach point in viewBox coordinates: the point that lands on the feature
  // endpoint and around which the arrow rotates. For directional arrows this
  // is intentionally set a few units *behind* the visual tip, so the arrow
  // overshoots the line endpoint and covers the line's round-cap overshoot.
  tip: [number, number];
  // Which MapLibre icon-anchor preset to use on the globe. `icon-offset` is
  // derived automatically to bring the anchor onto `tip`.
  anchorKind: "center" | "right";
  olScale: number;
  elements: ArrowSvgElement[];
};

// Base native pixel size used when rasterizing arrow sprites on the globe.
// Actual canvas size grows with sprite scale; see `getArrowSpriteCanvasSize`.
export const GLOBE_SPRITE_BASE_SIZE = 28;

const sharedLineJoin = "round" as const;
const sharedLineCap = "round" as const;

// Tips for stroked arrowheads are inset ~1 viewBox unit from the right edge so
// round joins/caps are not clipped by the SVG viewport (SVG clips strokes that
// extend beyond width/height). Filled arrowheads do not need the inset.
const ARROW_SYMBOL_DEFINITIONS: Record<ArrowRenderableType, ArrowSymbolDefinition> =
  Object.freeze({
    arrow: {
      width: 24,
      height: 24,
      tip: [20, 12],
      anchorKind: "right",
      olScale: 0.85,
      elements: [
        {
          d: "M2.84 4.32 L23 12 L2.84 19.68 Z",
          fill: true,
          stroke: true,
          strokeWidth: 2,
          lineJoin: sharedLineJoin,
        },
      ],
    },
    "arrow-open": {
      width: 24,
      height: 24,
      tip: [20, 12],
      anchorKind: "right",
      olScale: 0.85,
      elements: [
        {
          d: "M4.28 4.32 L23 12 L4.28 19.68",
          stroke: true,
          strokeWidth: 2,
          lineCap: sharedLineCap,
          lineJoin: sharedLineJoin,
        },
      ],
    },
    "arrow-curved": {
      width: 24,
      height: 24,
      tip: [21, 12],
      anchorKind: "right",
      olScale: 0.8,
      elements: [
        {
          d: "M2,12 Q6,12 10,4 L24,12 L10,20 Q6,12 2,12 Z",
          fill: true,
        },
      ],
    },
    "arrow-stealth": {
      width: 24,
      height: 24,
      tip: [21, 12],
      anchorKind: "right",
      olScale: 0.8,
      elements: [
        {
          d: "M2,2 L24,12 L2,22 L6,12 Z",
          fill: true,
        },
      ],
    },
    "arrow-double": {
      width: 24,
      height: 24,
      tip: [21, 12],
      anchorKind: "right",
      olScale: 0.8,
      elements: [
        {
          d: "M2,2 L12,12 L2,22 Z M10,2 L24,12 L10,22 Z",
          fill: true,
        },
      ],
    },
    "arrow-hand-drawn": {
      width: 48,
      height: 48,
      tip: [42, 24],
      anchorKind: "right",
      olScale: 0.4,
      elements: [
        {
          d: "M12 10 C18 16 34 22 47 24 C34 26 18 32 12 38",
          stroke: true,
          strokeWidth: 2.5,
          lineCap: sharedLineCap,
          lineJoin: sharedLineJoin,
        },
        {
          d: "M14 14 C20 18 30 22 43 24 C30 26 20 30 14 34",
          stroke: true,
          strokeWidth: 2,
          lineCap: sharedLineCap,
          lineJoin: sharedLineJoin,
        },
      ],
    },
    "arrow-double-hand-drawn": {
      width: 48,
      height: 48,
      tip: [42, 24],
      anchorKind: "right",
      olScale: 0.4,
      elements: [
        {
          d: "M4 10 C10 16 26 22 36 24 C26 26 10 32 4 38",
          stroke: true,
          strokeWidth: 2.5,
          lineCap: sharedLineCap,
          lineJoin: sharedLineJoin,
        },
        {
          d: "M6 14 C12 18 22 22 32 24 C22 26 12 30 6 34",
          stroke: true,
          strokeWidth: 2,
          lineCap: sharedLineCap,
          lineJoin: sharedLineJoin,
        },
        {
          d: "M12 10 C18 16 34 22 47 24 C34 26 18 32 12 38",
          stroke: true,
          strokeWidth: 2.5,
          lineCap: sharedLineCap,
          lineJoin: sharedLineJoin,
        },
        {
          d: "M14 14 C20 18 30 22 43 24 C30 26 20 30 14 34",
          stroke: true,
          strokeWidth: 2,
          lineCap: sharedLineCap,
          lineJoin: sharedLineJoin,
        },
      ],
    },
    dot: {
      width: 24,
      height: 24,
      tip: [12, 12],
      anchorKind: "center",
      olScale: 1,
      elements: [
        {
          d: "M7.68 12 A4.32 4.32 0 1 0 16.32 12 A4.32 4.32 0 1 0 7.68 12 Z",
          fill: true,
        },
      ],
    },
    square: {
      width: 24,
      height: 24,
      tip: [12, 12],
      anchorKind: "center",
      olScale: 1,
      elements: [
        {
          d: "M8.16 8.16 H15.84 V15.84 H8.16 Z",
          fill: true,
        },
      ],
    },
    diamond: {
      width: 24,
      height: 24,
      tip: [12, 12],
      anchorKind: "center",
      olScale: 1,
      elements: [
        {
          d: "M12 7.2 L16.8 12 L12 16.8 L7.2 12 Z",
          fill: true,
        },
      ],
    },
    bar: {
      width: 24,
      height: 24,
      tip: [12, 12],
      anchorKind: "center",
      olScale: 1,
      elements: [
        {
          d: "M12 4.32 L12 19.68",
          stroke: true,
          strokeWidth: 2.5,
          lineCap: sharedLineCap,
        },
      ],
    },
  });

// Shared scale formula for arrow markers. Used by both the OpenLayers
// `createArrowStyles` and the globe `buildFeatureData` so the two renderers
// size arrowheads identically relative to stroke width.
export function getArrowRenderScale(strokeWidth: number): number {
  return Math.max(0.4, strokeWidth / 2.5);
}

// Native sprite canvas size (in pixels) for a given sprite scale bucket. The
// globe uses larger canvases at higher bucket scales to avoid upscaling raster
// data; OpenLayers does not use this and scales vector SVGs directly.
export function getArrowSpriteCanvasSize(spriteScale: number): number {
  return Math.max(
    GLOBE_SPRITE_BASE_SIZE,
    Math.round(GLOBE_SPRITE_BASE_SIZE * spriteScale),
  );
}

export function getArrowOlAnchor(def: ArrowSymbolDefinition): [number, number] {
  return [def.tip[0] / def.width, def.tip[1] / def.height];
}

// Returns the MapLibre `icon-offset` (in native sprite pixels at icon-size 1)
// needed to bring the definition's logical tip onto the feature endpoint.
// MapLibre places the preset `icon-anchor` at the feature coord then *displaces
// the icon* by `icon-offset`, so the offset is the vector from the tip (in
// sprite coords) back to the anchor preset — positive pushes the icon forward
// so its tip lands on the endpoint. Depends on sprite canvas size because
// MapLibre multiplies the declared offset by `icon-size`; groups that
// reference this must key on the sprite scale.
export function getArrowGlobeIconOffset(
  def: ArrowSymbolDefinition,
  spriteCanvasSize: number,
): [number, number] {
  const anchorX = def.anchorKind === "right" ? def.width : def.width / 2;
  const anchorY = def.height / 2;
  const offsetX = ((anchorX - def.tip[0]) / def.width) * spriteCanvasSize;
  const offsetY = ((anchorY - def.tip[1]) / def.height) * spriteCanvasSize;
  return [offsetX, offsetY];
}

// URL-encoded `data:image/svg+xml;utf8,...` is smaller and more debuggable
// than base64, and avoids the btoa non-ASCII trap.
function encodeSvgForDataUri(svg: string) {
  return svg
    .replace(/%/g, "%25")
    .replace(/"/g, "%22")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s+/g, " ");
}

export function getArrowSymbolDefinition(
  arrowType: ArrowType,
): ArrowSymbolDefinition | null {
  if (arrowType === "none") return null;
  return ARROW_SYMBOL_DEFINITIONS[arrowType];
}

export function getArrowSvgMarkup(arrowType: ArrowType, color: string): string | null {
  const definition = getArrowSymbolDefinition(arrowType);
  if (!definition) return null;
  const body = definition.elements
    .map((element) => {
      const attrs = [
        `d="${element.d}"`,
        `fill="${element.fill ? color : "none"}"`,
        `stroke="${element.stroke ? color : "none"}"`,
        typeof element.strokeWidth === "number"
          ? `stroke-width="${element.strokeWidth}"`
          : "",
        element.lineCap ? `stroke-linecap="${element.lineCap}"` : "",
        element.lineJoin ? `stroke-linejoin="${element.lineJoin}"` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `<path ${attrs} />`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${definition.width}" height="${definition.height}" viewBox="0 0 ${definition.width} ${definition.height}">${body}</svg>`;
}

export function getArrowSvgDataUri(arrowType: ArrowType, color: string): string | null {
  const svg = getArrowSvgMarkup(arrowType, color);
  if (!svg) return null;
  return `data:image/svg+xml;utf8,${encodeSvgForDataUri(svg)}`;
}

export function drawArrowSymbol(
  context: CanvasRenderingContext2D,
  arrowType: ArrowType,
  color: string,
  size: number,
) {
  const definition = getArrowSymbolDefinition(arrowType);
  if (!definition || typeof Path2D === "undefined") return;

  context.save();
  context.scale(size / definition.width, size / definition.height);
  for (const element of definition.elements) {
    const path = new Path2D(element.d);
    if (element.fill) {
      context.fillStyle = color;
      context.fill(path);
    }
    if (element.stroke) {
      context.strokeStyle = color;
      context.lineWidth = element.strokeWidth ?? 2;
      context.lineCap = element.lineCap ?? "butt";
      context.lineJoin = element.lineJoin ?? "miter";
      context.stroke(path);
    }
  }
  context.restore();
}
