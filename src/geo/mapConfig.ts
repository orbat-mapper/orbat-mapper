/**
 * Reads `maplibreConfig.json`: the basemaps, and the elevation data that replaces the build default.
 *
 * The file is either a plain array of basemaps, the original form, or an object with `basemaps` and
 * `elevation`. Elevation comes from a tile server (`raster-dem`) or from a PMTiles archive on a web
 * server (`pmtiles`). The archive is opened here, so its tile size and metadata are read once at
 * start, as a basemap archive declared in the config is.
 */
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import {
  ELEVATION_ENCODINGS,
  isElevationEncoding,
  type MlElevationConfig,
  type MlLayerConfig,
  type MlPmtilesElevationConfig,
  type MlRasterDemElevationConfig,
} from "@/geo/maplibreLayerConfigTypes";
import { openConfigElevationArchive } from "@/geo/elevationArchive";
import { demSource } from "@/geo/elevationTiles";

export interface MapConfig {
  /** Empty when the file declares none; the caller then uses its built-in basemaps. */
  basemaps: MlLayerConfig[];
  /** The unchecked `elevation` entry. Absent when the file declares none. */
  elevation?: unknown;
}

/** Splits the parsed config file into basemaps and elevation, whichever form it has. */
export function readMapConfigFile(json: unknown): MapConfig {
  if (Array.isArray(json)) return { basemaps: json };
  if (!json || typeof json !== "object") return { basemaps: [] };
  const { basemaps, elevation } = json as Record<string, unknown>;
  return {
    basemaps: Array.isArray(basemaps) ? basemaps : [],
    elevation: elevation ?? undefined,
  };
}

function checkEncoding(value: unknown) {
  if (value === undefined || isElevationEncoding(value)) return;
  throw new Error(
    `Unknown elevation encoding "${String(value)}". Use ${ELEVATION_ENCODINGS.map((e) => `"${e}"`).join(" or ")}.`,
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value !== "";
}

/** Checks the `elevation` entry, and says what is wrong with it. */
export function parseElevationConfig(value: unknown): MlElevationConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The elevation entry must be an object.");
  }
  const entry = value as Record<string, unknown>;
  checkEncoding(entry.encoding);
  switch (entry.sourceType) {
    case "pmtiles":
      if (!isNonEmptyString(entry.url)) {
        throw new Error('A "pmtiles" elevation entry needs the "url" of the archive.');
      }
      return entry as unknown as MlPmtilesElevationConfig;
    case "raster-dem": {
      const hasUrl = isNonEmptyString(entry.url);
      const hasTiles =
        Array.isArray(entry.tiles) &&
        entry.tiles.length > 0 &&
        entry.tiles.every(isNonEmptyString);
      if (hasUrl === hasTiles) {
        throw new Error(
          'A "raster-dem" elevation entry needs either "url" (a TileJSON address) or "tiles", not both.',
        );
      }
      return entry as unknown as MlRasterDemElevationConfig;
    }
    default:
      throw new Error(
        `Unknown elevation sourceType "${String(entry.sourceType)}". Use "raster-dem" or "pmtiles".`,
      );
  }
}

/** The MapLibre source for an elevation entry on a tile server. */
export function rasterDemElevationSource(
  config: MlRasterDemElevationConfig,
): RasterDEMSourceSpecification {
  const { url, tiles, encoding, tileSize, minZoom, maxZoom, bounds, attribution } =
    config;
  return demSource({
    url,
    tiles,
    encoding,
    tileSize,
    minzoom: minZoom,
    maxzoom: maxZoom,
    bounds,
    attribution,
  });
}

/** Elevation data declared in the config, ready for 3D terrain and hillshading. */
export interface ConfigElevation {
  /** The `title` of the entry, if it has one. */
  title?: string;
  source: RasterDEMSourceSpecification;
}

/**
 * Turns the `elevation` entry into a source. Rejects with the reason when the entry is not
 * correct, or when the archive it names cannot be read or holds no elevation data.
 */
export async function resolveElevationConfig(value: unknown): Promise<ConfigElevation> {
  const config = parseElevationConfig(value);
  const title = isNonEmptyString(config.title) ? { title: config.title } : {};
  if (config.sourceType === "pmtiles") {
    const source = await openConfigElevationArchive(config.url, {
      encoding: config.encoding,
      attribution: config.attribution,
    });
    return { ...title, source };
  }
  return { ...title, source: rasterDemElevationSource(config) };
}
