/**
 * Tile providers for terrain analysis that read the same elevation data the map shows: an opened
 * elevation archive, a DEM tile server, the config's source or the online default, as the
 * `raster-dem` source spec the map was given. Tiles are fetched independently of rendering, so
 * analysis works with 3D terrain off and at any zoom.
 */
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import { PMTiles } from "pmtiles";
import { demEncoding, urlTemplateProvider, type DemTileProvider } from "@/lib/terrain";
import { getArchive, PMTILES_PROTOCOL } from "@/geo/pmtilesProtocol";
import { DEFAULT_DEM_TILE_SIZE } from "@/geo/elevationTiles";

const PMTILES_PREFIX = `${PMTILES_PROTOCOL}://`;
/** How `pmtilesProtocol` addresses an archive it serves under a key. */
const ARCHIVE_PREFIX = "archive:";

/** MapLibre's default for a `raster-dem` source. */
const DEFAULT_MAX_ZOOM = 22;

type Shared = Pick<DemTileProvider, "encoding" | "tileSize">;

async function readTile(archive: PMTiles, z: number, x: number, y: number) {
  return (await archive.getZxy(z, x, y))?.data ?? null;
}

/**
 * The archive a `pmtiles://` address names: one already published under a key, or an archive on a
 * server.
 */
function archiveAt(address: string): PMTiles {
  if (!address.startsWith(ARCHIVE_PREFIX)) return new PMTiles(address);
  const archive = getArchive(address.slice(ARCHIVE_PREFIX.length));
  if (!archive) throw new Error("The elevation archive is no longer open.");
  return archive;
}

/**
 * Reads the tiles of a template: an address, or an archive that is already published, whose
 * `pmtiles://archive:<key>/{z}/{x}/{y}` MapLibre resolves itself.
 */
function templateProvider(
  template: string,
  shared: Shared,
  zooms: { minZoom?: number; maxZoom?: number },
): DemTileProvider {
  const zoomRange = {
    minZoom: zooms.minZoom,
    maxZoom: zooms.maxZoom ?? DEFAULT_MAX_ZOOM,
  };
  if (!template.startsWith(PMTILES_PREFIX))
    return urlTemplateProvider({ url: template, ...shared, ...zoomRange });
  const address = template
    .slice(PMTILES_PREFIX.length)
    .replace(/\/\{z\}\/\{x\}\/\{y\}$/, "");
  return {
    ...shared,
    ...zoomRange,
    getTile: (z, x, y) => readTile(archiveAt(address), z, x, y),
  };
}

export async function createDemTileProvider(
  source: RasterDEMSourceSpecification,
): Promise<DemTileProvider> {
  const shared: Shared = {
    encoding: demEncoding(source.encoding),
    tileSize: source.tileSize ?? DEFAULT_DEM_TILE_SIZE,
  };
  const template = source.tiles?.[0];
  if (template)
    return templateProvider(template, shared, {
      minZoom: source.minzoom,
      maxZoom: source.maxzoom,
    });
  const url = source.url;
  if (!url) throw new Error("The elevation source has neither tiles nor an address.");
  if (url.startsWith(PMTILES_PREFIX)) {
    const archive = archiveAt(url.slice(PMTILES_PREFIX.length));
    const header = await archive.getHeader();
    return {
      ...shared,
      minZoom: header.minZoom,
      maxZoom: header.maxZoom,
      getTile: (z, x, y) => readTile(archive, z, x, y),
    };
  }
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`The elevation TileJSON failed: HTTP ${response.status}`);
  const tileJson = (await response.json()) as {
    tiles?: string[];
    minzoom?: number;
    maxzoom?: number;
  };
  const tiles = tileJson.tiles?.[0];
  if (!tiles) throw new Error("The elevation TileJSON lists no tiles.");
  // Resolve relative tiles against the TileJSON, keeping the placeholders.
  return templateProvider(decodeURI(new URL(tiles, response.url || url).href), shared, {
    minZoom: tileJson.minzoom,
    maxZoom: tileJson.maxzoom,
  });
}

type Source = RasterDEMSourceSpecification;

/**
 * Remembers what `make` returns for the newest elevation source only, so a change of source
 * replaces it (after `dispose`) and a value that fails is made again next time.
 */
export function perSource<T>(
  make: (source: Source) => Promise<T>,
  dispose?: (value: Promise<T>) => void,
): (source: Source) => Promise<T> {
  let current: { source: Source; value: Promise<T> } | null = null;
  return (source) => {
    if (current?.source !== source) {
      if (current) dispose?.(current.value);
      const entry = { source, value: make(source) };
      entry.value.catch(() => {
        if (current === entry) current = null;
      });
      current = entry;
    }
    return current.value;
  };
}
