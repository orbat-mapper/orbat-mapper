/**
 * The `raster-dem` sources that 3D terrain and hillshading read, and the DEM tile servers the user
 * adds by address: a tile template with `{z}`, `{x}` and `{y}`, or a TileJSON document.
 *
 * DEM tiles look like imagery and carry no encoding, so the user says how they encode elevation.
 * The tile size is read once, when a server is added, and kept with the address: MapLibre needs it
 * to pick the zoom level, and a reload must not depend on the server answering at once.
 */
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import { isTileTemplate } from "@/geo/customBasemap";
import {
  DEFAULT_ELEVATION_ENCODING,
  type ElevationEncoding,
} from "@/geo/maplibreLayerConfigTypes";

/** Mapterhorn's tile size, and MapLibre's default for a `raster-dem` source. */
export const DEFAULT_DEM_TILE_SIZE = 512;

/**
 * The pixel width of a DEM tile. MapLibre must be told the size, because it decides which zoom
 * level to request. When the tile cannot be decoded the default is used, which only changes the
 * level of detail, never the position of the terrain.
 */
export async function demTileSize(tile: Blob): Promise<number> {
  if (typeof createImageBitmap !== "function") return DEFAULT_DEM_TILE_SIZE;
  try {
    const bitmap = await createImageBitmap(tile);
    const size = bitmap.width;
    bitmap.close();
    return size > 0 ? size : DEFAULT_DEM_TILE_SIZE;
  } catch {
    return DEFAULT_DEM_TILE_SIZE;
  }
}

/** Where DEM tiles come from and how they read, in the words of a MapLibre source. */
export interface DemSourceOptions {
  /** URL of a TileJSON document. Mutually exclusive with `tiles`. */
  url?: string;
  tiles?: string[];
  encoding?: ElevationEncoding;
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  attribution?: string;
}

/**
 * A `raster-dem` source for tiles on a server. A TileJSON that declares its own `encoding` wins
 * over the one set here, as MapLibre reads the TileJSON last.
 */
export function demSource(options: DemSourceOptions): RasterDEMSourceSpecification {
  const { url, tiles, encoding, tileSize, minzoom, maxzoom, bounds, attribution } =
    options;
  return {
    type: "raster-dem",
    ...(url ? { url } : { tiles }),
    encoding: encoding ?? DEFAULT_ELEVATION_ENCODING,
    ...(tileSize !== undefined ? { tileSize } : {}),
    ...(minzoom !== undefined ? { minzoom } : {}),
    ...(maxzoom !== undefined ? { maxzoom } : {}),
    ...(bounds ? { bounds } : {}),
    ...(attribution ? { attribution } : {}),
  };
}

/** What is kept between visits for a DEM tile server, and all its source is built from. */
export interface ElevationTiles {
  /** A tile template, or the address of a TileJSON document. */
  url: string;
  encoding: ElevationEncoding;
  /** Absent for a TileJSON document, which gives its own size or uses MapLibre's default. */
  tileSize?: number;
}

export function elevationTilesSource({
  url,
  encoding,
  tileSize,
}: ElevationTiles): RasterDEMSourceSpecification {
  return demSource({
    ...(isTileTemplate(url) ? { tiles: [url] } : { url }),
    encoding,
    tileSize,
  });
}

/**
 * The tile size behind a template, read from the tile that covers the world.
 *
 * A server that does not answer at all is an error, as the address is then most likely wrong. A
 * server that has no tile at zoom 0, which a regional data set may not, is not: the default size is
 * used.
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
  return response.ok ? demTileSize(await response.blob()) : DEFAULT_DEM_TILE_SIZE;
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
