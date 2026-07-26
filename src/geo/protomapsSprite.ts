/**
 * Serves the committed Protomaps sprite sheets to MapLibre over a `pmsprite://` protocol.
 *
 * A sprite cannot simply point at a bundled asset URL: MapLibre appends `@2x` and `.json`/`.png`
 * to whatever it is given, and it rejects anything that is not an absolute URL. A protocol URL
 * survives both — `pmsprite://protomaps/light` becomes `pmsprite://protomaps/light@2x.png`, which
 * we map back onto the bundled asset.
 *
 * The assets are imported through Vite, so the single-file build inlines them as `data:` URIs and
 * the sprite keeps working on a `file://` origin. `data:` URIs are decoded here instead of being
 * fetched, because `fetch` is exactly what a `file://` origin cannot be trusted with.
 *
 * See docs/adr/0003-vector-pmtiles-styling.md.
 */
import { addProtocol, removeProtocol } from "maplibre-gl";
import type { BasemapFlavor } from "@/geo/maplibreLayerConfigTypes";

export const PROTOMAPS_SPRITE_PROTOCOL = "pmsprite";

const SPRITE_URL_PREFIX = `${PROTOMAPS_SPRITE_PROTOCOL}://protomaps/`;

const spriteAssets = import.meta.glob("../assets/protomaps/sprites/*.{json,png}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Basename (`light@2x.png`) to the URL Vite emitted for it. */
const assetByFileName = new Map<string, string>(
  Object.entries(spriteAssets).map(([path, url]) => [
    path.slice(path.lastIndexOf("/") + 1),
    url,
  ]),
);

/** The sprite base URL to put in a generated style for a flavour. */
export function protomapsSpriteUrl(flavor: BasemapFlavor): string {
  return `${SPRITE_URL_PREFIX}${flavor}`;
}

function decodeBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** Reads a bundled asset without touching the network, so `file://` works. */
async function readAsset(url: string): Promise<ArrayBuffer> {
  if (url.startsWith("data:")) {
    const comma = url.indexOf(",");
    const meta = url.slice(0, comma);
    const payload = url.slice(comma + 1);
    return meta.endsWith(";base64")
      ? decodeBase64(payload)
      : new TextEncoder().encode(decodeURIComponent(payload)).buffer;
  }
  const response = await fetch(url);
  return response.arrayBuffer();
}

let registered = false;

/**
 * Registers the `pmsprite://` protocol with MapLibre. Idempotent, and meant to be called once at
 * application startup.
 */
export function registerProtomapsSpriteProtocol(): void {
  if (registered) return;
  addProtocol(PROTOMAPS_SPRITE_PROTOCOL, async (params) => {
    const fileName = decodeURIComponent(params.url.slice(SPRITE_URL_PREFIX.length));
    const assetUrl = assetByFileName.get(fileName);
    if (!assetUrl) throw new Error(`Unknown Protomaps sprite asset "${fileName}"`);
    const buffer = await readAsset(assetUrl);
    if (fileName.endsWith(".json")) {
      return { data: JSON.parse(new TextDecoder().decode(buffer)) };
    }
    return { data: buffer };
  });
  registered = true;
}

/** Test helper. */
export function resetProtomapsSpriteProtocol(): void {
  if (!registered) return;
  removeProtocol(PROTOMAPS_SPRITE_PROTOCOL);
  registered = false;
}
