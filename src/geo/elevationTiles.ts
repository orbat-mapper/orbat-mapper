/**
 * Elevation data from a DEM tile server the user adds by address: a tile template with `{z}`, `{x}`
 * and `{y}`, or a TileJSON document.
 *
 * The tiles look like imagery and carry no encoding, so the user says how they encode elevation.
 * The tile size is read once, when the server is added, and kept with the address: MapLibre needs
 * it to pick the zoom level, and a reload must not depend on the server answering at once.
 */
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import type { ElevationEncoding } from "@/geo/maplibreLayerConfigTypes";
import { rasterDemElevationSource } from "@/geo/mapConfig";

/** Mapterhorn's tile size, and MapLibre's default for a `raster-dem` source. */
const DEFAULT_DEM_TILE_SIZE = 512;

/** What is kept between visits for a DEM tile server, and all a source is built from. */
export interface ElevationTiles {
  /** A tile template, or the address of a TileJSON document. */
  url: string;
  encoding: ElevationEncoding;
  /** Absent for a TileJSON document, which gives its own size or uses MapLibre's default. */
  tileSize?: number;
}

export function isTileTemplate(url: string): boolean {
  return url.includes("{z}") && url.includes("{x}") && url.includes("{y}");
}

export function elevationTilesSource(
  tiles: ElevationTiles,
): RasterDEMSourceSpecification {
  return rasterDemElevationSource({
    sourceType: "raster-dem",
    ...(isTileTemplate(tiles.url) ? { tiles: [tiles.url] } : { url: tiles.url }),
    encoding: tiles.encoding,
    ...(tiles.tileSize !== undefined ? { tileSize: tiles.tileSize } : {}),
  });
}

/**
 * The pixel width of the tiles behind a template, read from the tile that covers the world.
 *
 * A server that does not answer at all is an error, as the address is then most likely wrong. A
 * server that has no tile at zoom 0, which a regional data set may not, is not: the default size is
 * used, which only changes the level of detail.
 */
async function readTemplateTileSize(template: string, signal?: AbortSignal) {
  const url = template.replace("{z}", "0").replace("{x}", "0").replace("{y}", "0");
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (e) {
    signal?.throwIfAborted();
    throw new Error(`Could not reach ${new URL(url).host} for elevation tiles.`, {
      cause: e,
    });
  }
  if (!response.ok || typeof createImageBitmap !== "function") {
    return DEFAULT_DEM_TILE_SIZE;
  }
  try {
    const bitmap = await createImageBitmap(await response.blob());
    const size = bitmap.width;
    bitmap.close();
    return size > 0 ? size : DEFAULT_DEM_TILE_SIZE;
  } catch {
    return DEFAULT_DEM_TILE_SIZE;
  }
}

/** Reads a TileJSON document, and refuses an address that does not give one. */
async function checkTileJson(url: string, signal?: AbortSignal): Promise<void> {
  let tileJson: unknown;
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    tileJson = await response.json();
  } catch (e) {
    signal?.throwIfAborted();
    throw new Error(`Could not read a TileJSON document from ${url}.`, { cause: e });
  }
  const tiles = (tileJson as { tiles?: unknown } | null)?.tiles;
  if (!Array.isArray(tiles) || tiles.length === 0) {
    throw new Error(
      `${url} is not a TileJSON document. Use a tile address with {z}, {x} and {y}, or the address of a TileJSON document.`,
    );
  }
}

/**
 * Checks a DEM tile server the user typed in and says what to keep for it. Rejects with a message
 * for the user when the server cannot be used.
 */
export async function openElevationTiles(
  url: string,
  encoding: ElevationEncoding,
  signal?: AbortSignal,
): Promise<ElevationTiles> {
  if (isTileTemplate(url)) {
    const tileSize = await readTemplateTileSize(url, signal);
    return { url, encoding, tileSize };
  }
  await checkTileJson(url, signal);
  return { url, encoding };
}
