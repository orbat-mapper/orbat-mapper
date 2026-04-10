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
  anchorKind: "center" | "right";
  globeOffset: [number, number];
  olAnchor: [number, number];
  olScale: number;
  elements: ArrowSvgElement[];
};

const sharedLineJoin = "round" as const;
const sharedLineCap = "round" as const;

const ARROW_SYMBOL_DEFINITIONS: Record<ArrowRenderableType, ArrowSymbolDefinition> = {
  arrow: {
    width: 24,
    height: 24,
    anchorKind: "right",
    globeOffset: [0, 0],
    olAnchor: [1, 0.5],
    olScale: 0.85,
    elements: [
      {
        d: "M3.84 4.32 L24 12 L3.84 19.68 Z",
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
    anchorKind: "right",
    globeOffset: [0.35, 0],
    olAnchor: [1, 0.5],
    olScale: 0.85,
    elements: [
      {
        d: "M5.28 4.32 L24 12 L5.28 19.68",
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
    anchorKind: "right",
    globeOffset: [0.2, 0],
    olAnchor: [1, 0.5],
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
    anchorKind: "right",
    globeOffset: [0, 0],
    olAnchor: [1, 0.5],
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
    anchorKind: "right",
    globeOffset: [0.2, 0],
    olAnchor: [1, 0.5],
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
    anchorKind: "right",
    globeOffset: [0.45, 0],
    olAnchor: [1, 0.5],
    olScale: 0.4,
    elements: [
      {
        d: "M12 10 C18 16 34 22 48 24 C34 26 18 32 12 38",
        stroke: true,
        strokeWidth: 2.5,
        lineCap: sharedLineCap,
        lineJoin: sharedLineJoin,
      },
      {
        d: "M14 14 C20 18 30 22 44 24 C30 26 20 30 14 34",
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
    anchorKind: "right",
    globeOffset: [0.45, 0],
    olAnchor: [1, 0.5],
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
        d: "M12 10 C18 16 34 22 48 24 C34 26 18 32 12 38",
        stroke: true,
        strokeWidth: 2.5,
        lineCap: sharedLineCap,
        lineJoin: sharedLineJoin,
      },
      {
        d: "M14 14 C20 18 30 22 44 24 C30 26 20 30 14 34",
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
    anchorKind: "center",
    globeOffset: [0, 0],
    olAnchor: [0.5, 0.5],
    olScale: 1,
    elements: [
      {
        d: "M12 7.68 A4.32 4.32 0 1 1 11.999 7.68 Z",
        fill: true,
      },
    ],
  },
  square: {
    width: 24,
    height: 24,
    anchorKind: "center",
    globeOffset: [0, 0],
    olAnchor: [0.5, 0.5],
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
    anchorKind: "center",
    globeOffset: [0, 0],
    olAnchor: [0.5, 0.5],
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
    anchorKind: "center",
    globeOffset: [0, 0],
    olAnchor: [0.5, 0.5],
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
};

function encodeSvg(svg: string) {
  if (typeof btoa === "function") {
    return btoa(svg);
  }
  return Buffer.from(svg).toString("base64");
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
  return `data:image/svg+xml;base64,${encodeSvg(svg)}`;
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
