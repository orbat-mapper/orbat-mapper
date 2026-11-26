/**
 * The Phosphor sprite: a dot pattern for the sea and a scanline pattern for the screen, drawn in
 * the phosphor colour at whatever spacing the style asks for.
 *
 * MapLibre cannot tint a fill pattern, so the colour has to be in the image. Rather than ship a
 * sheet per palette, the sheet is generated: everything that shapes it is encoded in the sprite
 * URL (`phosphorsprite://3dff5a/6/1/3/1`) and the protocol handler draws it on request. Nothing is
 * fetched, so it also works from a `file://` origin.
 */
import { addProtocol } from "maplibre-gl";
import { encodePng } from "./png";

const PHOSPHOR_SPRITE_PROTOCOL = "phosphorsprite";

/** Image names in the sheet. */
export const DOTS_IMAGE = "phosphor-dots";
export const SCANLINES_IMAGE = "phosphor-scanlines";

/** Everything that shapes the sheet, in 1x pixels. */
export interface PhosphorSpriteParams {
  /** `#rrggbb` or `#rgb`. */
  color: string;
  dotSpacing: number;
  dotSize: number;
  scanlineSpacing: number;
  scanlineThickness: number;
}

function hexColor(color: string): string {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) {
    throw new Error(`Phosphor pattern colours must be hex (#rrggbb), got "${color}"`);
  }
  const hex = match[1]!.toLowerCase();
  return hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
}

function pixels(value: number, name: string): number {
  const n = Math.round(value);
  if (!(n >= 1 && n <= 64))
    throw new Error(`Phosphor ${name} must be 1–64 px, got ${value}`);
  return n;
}

/** The sprite base URL for a style (MapLibre appends `@2x` and `.json` / `.png`). */
export function phosphorSpriteUrl(params: PhosphorSpriteParams): string {
  const dotSpacing = pixels(params.dotSpacing, "dot spacing");
  const scanlineSpacing = pixels(params.scanlineSpacing, "scanline spacing");
  return [
    `${PHOSPHOR_SPRITE_PROTOCOL}://${hexColor(params.color)}`,
    dotSpacing,
    Math.min(pixels(params.dotSize, "dot size"), dotSpacing),
    scanlineSpacing,
    Math.min(pixels(params.scanlineThickness, "scanline thickness"), scanlineSpacing),
  ].join("/");
}

const FILE_PATTERN = new RegExp(
  `^${PHOSPHOR_SPRITE_PROTOCOL}://([0-9a-f]{6})/(\\d+)/(\\d+)/(\\d+)/(\\d+)(@2x)?\\.(json|png)$`,
);

interface SheetEntry {
  x: number;
  y: number;
  width: number;
  height: number;
  pixelRatio: number;
}

/**
 * The sprite file a `phosphorsprite://` URL names: the index as an object, or the sheet as PNG
 * bytes. Exported for hosts that route sprites through a protocol of their own.
 */
export function phosphorSpriteFile(
  url: string,
): { data: Record<string, SheetEntry> } | { data: ArrayBuffer } {
  const match = FILE_PATTERN.exec(url);
  if (!match) throw new Error(`Not a Phosphor sprite file: "${url}"`);
  const [, hex, dotSpacing, dotSize, scanSpacing, scanThickness, retina, ext] = match;
  const ratio = retina ? 2 : 1;
  const dots = { spacing: +dotSpacing! * ratio, size: +dotSize! * ratio };
  const scan = { spacing: +scanSpacing! * ratio, size: +scanThickness! * ratio };
  const width = dots.spacing + scan.spacing;
  const height = Math.max(dots.spacing, scan.spacing);

  const tile = (x: number, size: number): SheetEntry => ({
    x,
    y: 0,
    width: size,
    height: size,
    pixelRatio: ratio,
  });

  if (ext === "json") {
    return {
      data: {
        [DOTS_IMAGE]: tile(0, dots.spacing),
        [SCANLINES_IMAGE]: tile(dots.spacing, scan.spacing),
      },
    };
  }

  const color = Uint8Array.from([0, 2, 4, 6], (i) =>
    parseInt((hex! + "ff").slice(i, i + 2), 16),
  );
  const rgba = new Uint8Array(width * height * 4);
  const paint = (x: number, y: number) => rgba.set(color, (y * width + x) * 4);
  // A square dot in the top-left corner of each tile.
  for (let y = 0; y < dots.size; y++) for (let x = 0; x < dots.size; x++) paint(x, y);
  // A line across the top of each scanline tile.
  for (let y = 0; y < scan.size; y++)
    for (let x = 0; x < scan.spacing; x++) paint(dots.spacing + x, y);
  return { data: encodePng(width, height, rgba).buffer as ArrayBuffer };
}

let registered = false;

/** Registers the `phosphorsprite://` protocol with MapLibre. Idempotent. */
export function registerPhosphorSpriteProtocol(): void {
  if (registered) return;
  addProtocol(PHOSPHOR_SPRITE_PROTOCOL, async (params) => phosphorSpriteFile(params.url));
  registered = true;
}
