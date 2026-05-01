import { imageCache } from "@/importexport/fileHandling";

export function resolveKmlIconHref(href: unknown): string | undefined {
  if (typeof href !== "string") return;
  const trimmed = href.trim();
  if (!trimmed) return;
  const cacheKey = decodeURIComponent(trimmed).replace(/^\.?\//, "");
  return imageCache.get(cacheKey) ?? imageCache.get(trimmed) ?? trimmed;
}

export function getKmlIconImageId(layerId: string, href: string) {
  return `kml-icon-${layerId}-${stableHash(href)}`;
}

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
