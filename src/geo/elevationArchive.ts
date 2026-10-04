/**
 * The elevation-archive seam: turns a PMTiles archive of elevation tiles into the `raster-dem`
 * source that 3D terrain and hillshading read.
 *
 * An elevation archive cannot be told from imagery. Its header says webp or png, exactly as a
 * raster basemap does, thus the user says what the file is by opening it as elevation data. The
 * encoding cannot be read from the archive either: the TileJSON built from a PMTiles header carries
 * none, so it is set here. Terrarium is what Mapterhorn publishes, and an archive may override it
 * with an `encoding` field in its metadata.
 *
 * Read with `Blob.slice` like a basemap archive, so it works offline and on a `file://` origin.
 */
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import { TileType, type Header, type PMTiles } from "pmtiles";
import {
  readArchive,
  readAttribution,
  UnsupportedArchiveError,
} from "@/geo/basemapArchive";
import { latitudeToMercatorY } from "@/geo/mercator";
import {
  archiveSourceUrl,
  createFileArchive,
  createUrlArchive,
  publishArchive,
  unregisterArchive,
} from "@/geo/pmtilesProtocol";

/**
 * The one archive key elevation data is served under. The colon keeps it apart from every basemap
 * archive key, which `archiveKeyFromFileName` limits to word characters and dashes.
 */
export const ELEVATION_ARCHIVE_KEY = "elevation:archive";

export type ElevationEncoding = "terrarium" | "mapbox";

/** Mapterhorn's tile size, and MapLibre's default for a `raster-dem` source. */
const DEFAULT_DEM_TILE_SIZE = 512;

const DEM_TILE_TYPES = new Set<TileType>([TileType.Png, TileType.Webp]);

export interface ElevationArchiveInfo {
  encoding: ElevationEncoding;
  attribution?: string;
}

function readEncoding(metadata: unknown): ElevationEncoding {
  const value =
    metadata && typeof metadata === "object"
      ? (metadata as Record<string, unknown>).encoding
      : undefined;
  return value === "mapbox" ? "mapbox" : "terrarium";
}

/**
 * Reduces a header and metadata blob to what a `raster-dem` source needs, or says why the archive
 * cannot hold elevation data. Separate from the reading so it can be tested without an archive.
 *
 * Vector tiles are refused, and so is JPEG: lossy compression changes the colour channels that
 * encode the height, which shows as noise in the terrain.
 */
export function describeElevationArchive(
  header: Header,
  metadata: unknown,
  label = "archive",
): ElevationArchiveInfo {
  if (!DEM_TILE_TYPES.has(header.tileType)) {
    const type = TileType[header.tileType] ?? header.tileType;
    throw new UnsupportedArchiveError(
      `"${label}" holds ${type} tiles, not elevation data. An elevation archive holds PNG or WebP tiles.`,
    );
  }
  return { encoding: readEncoding(metadata), attribution: readAttribution(metadata) };
}

/** Longitude/latitude to the tile that holds it. */
function tileAt(lon: number, lat: number, z: number): [number, number] {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(((1 - latitudeToMercatorY(lat) / Math.PI) / 2) * n);
  return [Math.min(n - 1, Math.max(0, x)), Math.min(n - 1, Math.max(0, y))];
}

/**
 * The pixel size of the archive's tiles, read from one decoded tile.
 *
 * MapLibre must be told the size, because it decides which zoom level to request. Mapterhorn uses
 * 512 px tiles and many other DEM sets 256 px. When no tile can be decoded the MapLibre default is
 * used, which only changes the level of detail, never the position of the terrain.
 */
async function readTileSize(archive: PMTiles, header: Header): Promise<number> {
  if (typeof createImageBitmap !== "function") return DEFAULT_DEM_TILE_SIZE;
  try {
    const z = header.minZoom;
    const [x, y] = tileAt(header.centerLon, header.centerLat, z);
    const tile = await archive.getZxy(z, x, y);
    if (!tile) return DEFAULT_DEM_TILE_SIZE;
    const bitmap = await createImageBitmap(new Blob([tile.data]));
    const size = bitmap.width;
    bitmap.close();
    return size > 0 ? size : DEFAULT_DEM_TILE_SIZE;
  } catch {
    return DEFAULT_DEM_TILE_SIZE;
  }
}

export function elevationSourceSpec(
  info: ElevationArchiveInfo,
  tileSize = DEFAULT_DEM_TILE_SIZE,
): RasterDEMSourceSpecification {
  return {
    type: "raster-dem",
    url: archiveSourceUrl(ELEVATION_ARCHIVE_KEY),
    encoding: info.encoding,
    tileSize,
    ...(info.attribution ? { attribution: info.attribution } : {}),
  };
}

async function openElevationArchive(
  archive: PMTiles,
  label: string,
  signal?: AbortSignal,
): Promise<RasterDEMSourceSpecification> {
  // Validate before publishing, so a wrong file leaves the archive in use untouched.
  const { header, metadata } = await readArchive(archive, label);
  const info = describeElevationArchive(header, metadata, label);
  const tileSize = await readTileSize(archive, header);
  // The user may have chosen something else while the archive was read.
  signal?.throwIfAborted();
  publishArchive(ELEVATION_ARCHIVE_KEY, archive);
  return elevationSourceSpec(info, tileSize);
}

/**
 * Opens an elevation archive the user picked from disk. An aborted `signal` rejects before the
 * archive is published, leaving the one in use untouched.
 */
export function openElevationArchiveFile(
  file: File,
  signal?: AbortSignal,
): Promise<RasterDEMSourceSpecification> {
  return openElevationArchive(
    createFileArchive(ELEVATION_ARCHIVE_KEY, file),
    file.name,
    signal,
  );
}

/** Opens an elevation archive on a web server, read with HTTP range requests. */
export function openElevationArchiveUrl(
  url: string,
  signal?: AbortSignal,
): Promise<RasterDEMSourceSpecification> {
  return openElevationArchive(createUrlArchive(ELEVATION_ARCHIVE_KEY, url), url, signal);
}

export function closeElevationArchive(): void {
  unregisterArchive(ELEVATION_ARCHIVE_KEY);
}
