/**
 * Tile providers for terrain analysis that read the same elevation data the map shows: an opened
 * elevation archive, a DEM tile server, the config's source or the online default, as the
 * `raster-dem` source spec the map was given. Tiles are fetched independently of rendering, so
 * analysis works with 3D terrain off and at any zoom.
 */
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import type { PMTiles } from "pmtiles";
import {
  createElevationSampler,
  demEncoding,
  urlTemplateProvider,
  type DemTileProvider,
  type ElevationSampler,
} from "@/lib/terrain";
import { archiveFromUrl } from "@/geo/pmtilesProtocol";
import { DEFAULT_DEM_TILE_SIZE } from "@/geo/elevationTiles";

/** MapLibre's default for a `raster-dem` source. */
const DEFAULT_MAX_ZOOM = 22;

type Shared = Pick<DemTileProvider, "encoding" | "tileSize">;

function archiveProvider(
  archive: PMTiles,
  shared: Shared,
  zooms: { minZoom?: number; maxZoom: number },
): DemTileProvider {
  return {
    ...shared,
    ...zooms,
    getTile: async (z, x, y) => (await archive.getZxy(z, x, y))?.data ?? null,
  };
}

/** Reads the tiles of a template: an address, or a `pmtiles://` archive. */
function templateProvider(
  template: string,
  shared: Shared,
  zooms: { minZoom?: number; maxZoom?: number },
): DemTileProvider {
  const zoomRange = {
    minZoom: zooms.minZoom,
    maxZoom: zooms.maxZoom ?? DEFAULT_MAX_ZOOM,
  };
  const archive = archiveFromUrl(template);
  return archive
    ? archiveProvider(archive, shared, zoomRange)
    : urlTemplateProvider({ url: template, ...shared, ...zoomRange });
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
  const archive = archiveFromUrl(url);
  if (archive) {
    const { minZoom, maxZoom } = await archive.getHeader();
    return archiveProvider(archive, shared, { minZoom, maxZoom });
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

let sampler: {
  source: RasterDEMSourceSpecification;
  value: Promise<ElevationSampler>;
} | null = null;

/**
 * A main-thread sampler for an elevation source, whose tile cache outlives an edit; the viewshed
 * worker keeps a cache of its own. Replaced when the source changes, and made again after a failure.
 */
export function demSampler(
  source: RasterDEMSourceSpecification,
): Promise<ElevationSampler> {
  if (sampler?.source !== source) {
    const entry = {
      source,
      value: createDemTileProvider(source).then(createElevationSampler),
    };
    entry.value.catch(() => {
      if (sampler === entry) sampler = null;
    });
    sampler = entry;
  }
  return sampler.value;
}
