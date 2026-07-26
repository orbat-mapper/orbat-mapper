/**
 * Registers the `pmtiles://` MapLibre protocol and keeps the archives it can serve.
 *
 * An archive is addressed by a stable key rather than by its own URL or file name, so a
 * basemap style can keep pointing at `pmtiles://archive:<key>` no matter whether the bytes
 * come from a file the user picked or from a URL declared in `maplibreConfig.json`.
 *
 * File-backed archives are read with `Blob.slice` (pmtiles' `FileSource`), never fetched.
 * That is what makes a basemap archive work on a `file://` origin, where `fetch` is blocked.
 */
import { addProtocol, removeProtocol } from "maplibre-gl";
import { FetchSource, FileSource, PMTiles, Protocol, type Source } from "pmtiles";

export const PMTILES_PROTOCOL = "pmtiles";

/** Prefix that separates our archive keys from a plain `pmtiles://https://…` URL. */
const ARCHIVE_PREFIX = "archive:";

/**
 * Gives a `Source` a stable key of our choosing.
 *
 * `FileSource.getKey()` returns the file name, which is neither unique nor stable across
 * re-picks, and `FetchSource.getKey()` returns the URL. Both are wrapped so one archive key
 * addresses the same archive whatever it is backed by.
 */
class KeyedSource implements Source {
  constructor(
    private readonly inner: Source,
    private readonly key: string,
  ) {}

  getKey() {
    return this.key;
  }

  getBytes(offset: number, length: number, signal?: AbortSignal, etag?: string) {
    return this.inner.getBytes(offset, length, signal, etag);
  }
}

let protocol: Protocol | undefined;
const archives = new Map<string, PMTiles>();

/**
 * Registers the `pmtiles://` protocol with MapLibre. Idempotent, and meant to be called once
 * at application startup rather than per map instance.
 */
export function registerPmtilesProtocol(): Protocol {
  if (protocol) return protocol;
  // metadata: false — attribution is read by the basemap-archive seam and set on the source,
  // so the protocol does not need the extra metadata read on every source refresh.
  const created = new Protocol({ metadata: false });
  addProtocol(PMTILES_PROTOCOL, created.tile);
  protocol = created;
  return created;
}

/**
 * The string the `pmtiles://` URL carries. `Protocol` keys its archive map by exactly this,
 * so it has to match what the wrapped source reports from `getKey()`.
 */
function archiveId(key: string): string {
  return `${ARCHIVE_PREFIX}${key}`;
}

/**
 * Builds an archive for a key without publishing it.
 *
 * Kept separate from {@link publishArchive} so a caller can read the header — and reject a file
 * that is not a usable archive — before anything already registered under the same key is
 * replaced. Picking a corrupt `foo.pmtiles` must not kill the working `foo.pmtiles` in use.
 */
function createArchive(key: string, inner: Source): PMTiles {
  return new PMTiles(new KeyedSource(inner, archiveId(key)));
}

/** Makes an archive servable under its key, replacing whatever was registered there before. */
export function publishArchive(key: string, archive: PMTiles): PMTiles {
  const proto = registerPmtilesProtocol();
  archives.set(key, archive);
  proto.add(archive);
  return archive;
}

/** Builds a file-backed archive without publishing it, so its header can be validated first. */
export function createFileArchive(key: string, file: File): PMTiles {
  return createArchive(key, new FileSource(file));
}

/** Builds a URL-backed archive without publishing it, so its header can be validated first. */
export function createUrlArchive(key: string, url: string): PMTiles {
  return createArchive(key, new FetchSource(url));
}

/** Registers an archive read from a `File` the user picked. Session-only: a File cannot be persisted. */
export function registerFileArchive(key: string, file: File): PMTiles {
  return publishArchive(key, createFileArchive(key, file));
}

/** Registers an archive read over HTTP range requests, for archives declared in the config. */
export function registerUrlArchive(key: string, url: string): PMTiles {
  return publishArchive(key, createUrlArchive(key, url));
}

export function getArchive(key: string): PMTiles | undefined {
  return archives.get(key);
}

export function unregisterArchive(key: string): void {
  archives.delete(key);
  protocol?.tiles.delete(archiveId(key));
}

/** URL for a MapLibre source `url` field (TileJSON style). */
export function archiveSourceUrl(key: string): string {
  return `${PMTILES_PROTOCOL}://${archiveId(key)}`;
}

/** URL template for a MapLibre source `tiles` field. */
export function archiveTileUrl(key: string): string {
  return `${archiveSourceUrl(key)}/{z}/{x}/{y}`;
}

/** Test helper — drops every registered archive and unregisters the protocol. */
export function resetPmtilesProtocol(): void {
  archives.clear();
  if (protocol) {
    removeProtocol(PMTILES_PROTOCOL);
    protocol = undefined;
  }
}
