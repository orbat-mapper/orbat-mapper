export type Rgba = [number, number, number, number];

const HEX_RE = /^#([0-9a-f]{3,8})$/i;
const RGB_RE =
  /^rgba?\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*(?:,\s*([+-]?\d*\.?\d+)\s*)?\)$/i;

function clampByte(n: number) {
  return Math.max(0, Math.min(255, n));
}

function clampAlpha(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function parseCssColor(input: string): Rgba | null {
  const value = input.trim().toLowerCase();
  if (value === "transparent") return [0, 0, 0, 0];

  const hex = value.match(HEX_RE);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      const a = h.length === 4 ? parseInt(h[3] + h[3], 16) / 255 : 1;
      return [r, g, b, a];
    }
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return [r, g, b, a];
    }
    return null;
  }

  const rgb = value.match(RGB_RE);
  if (rgb) {
    return [
      clampByte(Number(rgb[1])),
      clampByte(Number(rgb[2])),
      clampByte(Number(rgb[3])),
      rgb[4] !== undefined ? clampAlpha(Number(rgb[4])) : 1,
    ];
  }

  return null;
}
