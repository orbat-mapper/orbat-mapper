import type { KmlColor } from "@/geo/kml/types";

export function parseKmlColor(value: unknown): KmlColor | undefined {
  if (typeof value !== "string") return;
  let raw = value.trim();
  if (!raw) return;
  if (raw.startsWith("#")) raw = raw.slice(1);
  if (/^[0-9a-f]{3}$/i.test(raw) || /^[0-9a-f]{6}$/i.test(raw)) {
    return { color: `#${raw}`, opacity: 1 };
  }
  if (!/^[0-9a-f]{8}$/i.test(raw)) return;
  const alpha = Number.parseInt(raw.slice(0, 2), 16) / 255;
  const blue = raw.slice(2, 4);
  const green = raw.slice(4, 6);
  const red = raw.slice(6, 8);
  return {
    color: `#${red}${green}${blue}`,
    opacity: alpha,
  };
}

export function normalizeCssColor(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  const parsed = parseKmlColor(value);
  return parsed?.color ?? value;
}

export function normalizeOpacity(value: unknown): number | undefined {
  if (typeof value !== "number") return;
  if (!Number.isFinite(value)) return;
  return Math.max(0, Math.min(1, value));
}
