/**
 * The basemap-archive seam: turns a single file on disk (or a URL) into a layer config the
 * existing basemap machinery can render.
 *
 * A basemap archive holds tiles only, so the archive header is what decides how it is rendered —
 * raster or vector — never the file name. Attribution comes from the archive's own metadata if it
 * carries one; nothing is invented when it does not.
 *
 * Archives are session-only. A `File` reference cannot survive a reload, so callers should
 * remember the archive's name and kind and ask the user to pick it again, not copy the bytes.
 */
import type { Header, PMTiles } from "pmtiles";
import { TileType } from "pmtiles";
import {
  DEFAULT_BASEMAP_FLAVOR,
  type BasemapFlavor,
  type MlLayerConfig,
  type MlMapbundleLayerConfig,
  type MlPmtilesLayerConfig,
  type PmtilesArchiveInfo,
} from "@/geo/maplibreLayerConfigTypes";
import {
  createFileArchive,
  createUrlArchive,
  publishArchive,
  registerPmtilesProtocol,
} from "@/geo/pmtilesProtocol";
import { registerProtomapsSpriteProtocol } from "@/geo/protomapsSprite";

/** The archive kinds we can recognise from a file name. */
export type BasemapArchiveKind = "pmtiles" | "mapbundle";

export const BASEMAP_ARCHIVE_EXTENSIONS = [".pmtiles", ".mapbundle"] as const;

/** Raised when a file is not an archive we can render. Carries a message fit for a toast. */
export class UnsupportedArchiveError extends Error {}

/**
 * Registers every map protocol the application needs. Call once at startup, not per map.
 */
export function registerBasemapProtocols(): void {
  registerPmtilesProtocol();
  registerProtomapsSpriteProtocol();
}

/** The archive kind a file name implies, or `null` when it is not an archive at all. */
export function basemapArchiveKind(fileName: string): BasemapArchiveKind | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pmtiles")) return "pmtiles";
  if (lower.endsWith(".mapbundle")) return "mapbundle";
  return null;
}

export function isBasemapArchiveFile(file: { name: string }): boolean {
  return basemapArchiveKind(file.name) !== null;
}

/** Strips the extension and anything awkward, so the name works as a layer name and source id. */
export function archiveKeyFromFileName(fileName: string): string {
  return (
    fileName
      .replace(/\.(pmtiles|mapbundle)$/i, "")
      .replace(/[^\w-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "basemap"
  );
}

function readAttribution(metadata: unknown): string | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const value = (metadata as Record<string, unknown>).attribution;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

const RASTER_TILE_TYPES = new Set<TileType>([
  TileType.Png,
  TileType.Jpeg,
  TileType.Webp,
  TileType.Avif,
]);

/**
 * Reduces a PMTiles header and metadata blob to the facts a basemap config needs.
 *
 * Exported separately from the file reading so the raster/vector decision and the attribution
 * passthrough can be tested without a real archive.
 */
export function describePmtilesArchive(
  header: Header,
  metadata: unknown,
  fileName?: string,
): PmtilesArchiveInfo {
  const kind = pmtilesArchiveKind(header.tileType, fileName);
  return {
    kind,
    fileName,
    minZoom: header.minZoom,
    maxZoom: header.maxZoom,
    bounds: [header.minLon, header.minLat, header.maxLon, header.maxLat],
    attribution: readAttribution(metadata),
  };
}

function pmtilesArchiveKind(tileType: TileType, label = "archive"): "raster" | "vector" {
  if (tileType === TileType.Mvt) return "vector";
  if (RASTER_TILE_TYPES.has(tileType)) return "raster";
  throw new UnsupportedArchiveError(
    `"${label}" holds an unsupported tile type (${TileType[tileType] ?? tileType}).`,
  );
}

async function readArchive(
  archive: PMTiles,
  label: string,
): Promise<{ header: Header; metadata: unknown }> {
  let header: Header;
  try {
    header = await archive.getHeader();
  } catch {
    throw new UnsupportedArchiveError(
      `"${label}" could not be read as a PMTiles archive.`,
    );
  }
  // Metadata is optional — an archive without a usable one simply gets no attribution.
  let metadata: unknown;
  try {
    metadata = await archive.getMetadata();
  } catch {
    metadata = undefined;
  }
  return { header, metadata };
}

export interface OpenBasemapArchiveOptions {
  /** Protomaps flavour for a vector archive. Defaults to `light`. */
  flavor?: BasemapFlavor;
  /** Label language for the generated Protomaps layers. */
  lang?: string;
  /** Opt-in glyphs URL. Left unset by default, per ADR 0003. */
  glyphs?: string;
  /** Overrides the derived layer name. Mostly useful in tests. */
  name?: string;
  title?: string;
}

/**
 * Opens a basemap archive the user picked from disk and produces a renderable layer config.
 *
 * The file is read with `Blob.slice`, never fetched, so this works on a `file://` origin.
 */
export async function openBasemapArchiveFile(
  file: File,
  options: OpenBasemapArchiveOptions = {},
): Promise<MlPmtilesLayerConfig> {
  const kind = basemapArchiveKind(file.name);
  if (kind === "mapbundle") {
    // TODO(mapbundle): drop in maplibre-mapbundle-protocol here once it ships a usable build.
    throw new UnsupportedArchiveError(
      `Mapbundle files are not yet supported — "${file.name}" cannot be opened.`,
    );
  }

  const name = options.name ?? archiveKeyFromFileName(file.name);
  // Read the header before the archive is published: a file that turns out to be unreadable must
  // leave whatever is already registered under this key — often a working archive of the same
  // name — untouched.
  const archive = createFileArchive(name, file);
  const { header, metadata } = await readArchive(archive, file.name);
  const info = describePmtilesArchive(header, metadata, file.name);
  publishArchive(name, archive);
  return {
    sourceType: "pmtiles",
    name,
    title: options.title ?? `${file.name} (local)`,
    flavor: options.flavor ?? DEFAULT_BASEMAP_FLAVOR,
    lang: options.lang,
    glyphs: options.glyphs,
    archive: info,
  };
}

/**
 * Resolves a layer declared in `maplibreConfig.json` into one the basemap machinery can render.
 *
 * Layers that need no archive are returned unchanged. A `pmtiles` layer has its archive registered
 * and its header read; a `mapbundle` layer is rejected for now.
 */
export async function resolveBasemapArchiveLayer(
  layer: MlLayerConfig,
): Promise<MlLayerConfig> {
  if (layer.sourceType === "mapbundle") {
    // TODO(mapbundle): load the bundle and hand MapLibre the style it carries.
    throw new UnsupportedArchiveError(
      `Mapbundle basemaps are not yet supported ("${layer.name}").`,
    );
  }
  if (layer.sourceType !== "pmtiles") return layer;
  if (layer.archive) return layer;
  if (!layer.url) {
    throw new UnsupportedArchiveError(
      `PMTiles basemap "${layer.name}" has no url and no opened archive.`,
    );
  }

  const archive = createUrlArchive(layer.name, layer.url);
  const { header, metadata } = await readArchive(archive, layer.title ?? layer.name);
  const info = describePmtilesArchive(header, metadata);
  publishArchive(layer.name, archive);
  return { ...layer, archive: info };
}

/** Convenience for the mapbundle branch a caller has to handle but cannot yet satisfy. */
export function isMapbundleLayer(layer: MlLayerConfig): layer is MlMapbundleLayerConfig {
  return layer.sourceType === "mapbundle";
}
