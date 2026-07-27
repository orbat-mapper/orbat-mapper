/**
 * Remembering a basemap archive between sessions.
 *
 * A basemap archive stays on the user's disk — the app never copies it into browser storage. What
 * can be remembered is a reference to the file: the `FileSystemFileHandle` that
 * `showOpenFilePicker()` returns. It is structured-cloneable, so it can be stored in IndexedDB and
 * read back in a later session, and the browser remembers the read permission that goes with it.
 *
 * This module is the whole storage seam for that handle. It holds every try/catch on the path, so
 * callers never branch defensively: `isFileHandleSupported()` is checked inside every other export,
 * and where it is false everything here is a no-op that returns `null`/`[]`. The caller then uses
 * the existing `<input type="file">` picker, which is what Firefox, Safari and the `file://`
 * standalone build always do.
 *
 * ENTRY-CHUNK SAFETY: this file imports only the IndexedDB module and the runtime-environment
 * helpers. It must never import maplibre-gl, @/geo/basemapArchive, @/geo/pmtilesProtocol,
 * @/geo/protomapsSprite or anything under @/modules/maplibreview/ — that would drag ~1 MB of
 * maplibre-gl along with it and make this module untestable as a plain unit.
 */

import { useIndexedDb } from "@/scenariostore/localdb";
import { isFileProtocol } from "@/utils/runtimeEnvironment";

/** The three states the File System Access permission API returns. */
export type FilePermissionState = "granted" | "denied" | "prompt";

/**
 * A permission state, plus the case where the handle carries no `queryPermission`/
 * `requestPermission` method at all (a non-Chromium browser, or a test double). Callers treat
 * "unsupported" and "denied" identically: fall back to the picker.
 */
export type BasemapArchivePermission = FilePermissionState | "unsupported";

/**
 * The only part of a `FileSystemFileHandle` this app uses.
 *
 * Declared structurally, and deliberately not as `extends FileSystemFileHandle`: TypeScript's
 * lib.dom types `FileSystemFileHandle` but types neither the permission methods nor
 * `showOpenFilePicker`, and a structural interface lets a test build a fake handle from an object
 * literal. A real `FileSystemFileHandle` is assignable to it.
 */
export interface BasemapArchiveFileHandle {
  readonly name: string;
  getFile(): Promise<File>;
  queryPermission?(descriptor: {
    mode: "read" | "readwrite";
  }): Promise<FilePermissionState>;
  requestPermission?(descriptor: {
    mode: "read" | "readwrite";
  }): Promise<FilePermissionState>;
}

/** The IndexedDB record. One per archive key. */
export interface BasemapArchiveHandleRecord {
  /** Archive key: the same string as MlLayerConfig.name, the basemap id and the pmtiles registry key. */
  key: string;
  handle: BasemapArchiveFileHandle;
  fileName: string;
  savedAt: number;
}

type ShowOpenFilePicker = (options?: {
  multiple?: boolean;
  types?: { description: string; accept: Record<string, readonly string[]> }[];
}) => Promise<BasemapArchiveFileHandle[]>;

/**
 * The mandatory feature gate. True only in a browser that has the File System Access picker and can
 * store a handle.
 *
 * A `file://` origin is opaque: `showOpenFilePicker` throws a SecurityError there and IndexedDB is
 * blocked, and that is exactly the Level 3 standalone build. Firefox and Safari have no
 * `showOpenFilePicker` at all.
 */
export function isFileHandleSupported(): boolean {
  if (isFileProtocol()) return false;
  if (
    typeof (globalThis as { showOpenFilePicker?: unknown }).showOpenFilePicker !==
    "function"
  )
    return false;
  // The handle must be structured-cloneable into IndexedDB.
  return "FileSystemFileHandle" in globalThis;
}

/**
 * What the File System Access picker did.
 *
 * "picked" also covers a cancel, with an empty `handles` array — the user made a choice and the
 * caller must do nothing. "unavailable" means the picker never ran, so the caller has to offer the
 * `<input type="file">` picker instead.
 */
export type BasemapArchivePickOutcome =
  { status: "picked"; handles: BasemapArchiveFileHandle[] } | { status: "unavailable" };

/**
 * The `showOpenFilePicker` path, which is the only way to obtain a handle.
 *
 * The extensions are passed in rather than imported from @/geo/basemapArchive, which would drag
 * maplibre-gl and pmtiles into this module.
 *
 * A cancel is reported as `{ status: "picked", handles: [] }`, matching how `pickFilesFromDisk`
 * resolves [] on cancel. Every other rejection is reported as "unavailable", because the capability
 * check cannot see all of them in advance: Chromium keeps `showOpenFilePicker` on the window while
 * an enterprise policy (FileSystemAccessAPIEnabled=false, DefaultFileSystemReadGuardSetting=2)
 * makes every call reject. Without that distinction the caller's fallback would be unreachable and
 * the button a silent no-op.
 */
export async function pickBasemapArchiveHandles(
  extensions: readonly string[],
  multiple = false,
): Promise<BasemapArchivePickOutcome> {
  if (!isFileHandleSupported()) return { status: "unavailable" };
  const showPicker = (globalThis as { showOpenFilePicker?: ShowOpenFilePicker })
    .showOpenFilePicker;
  if (!showPicker) return { status: "unavailable" };
  try {
    const handles = await showPicker({
      multiple,
      types: [
        {
          description: "Basemap archive",
          accept: { "application/octet-stream": [...extensions] },
        },
      ],
    });
    return { status: "picked", handles: handles ?? [] };
  } catch (e) {
    if ((e as { name?: string } | null)?.name === "AbortError")
      return { status: "picked", handles: [] };
    console.warn("The file picker could not be shown", e);
    return { status: "unavailable" };
  }
}

/**
 * `handle.getFile()` wrapped. Returns null instead of throwing when the file was moved, renamed or
 * deleted (NotFoundError) — the stale-handle case the caller must recover from. Never throws.
 */
export async function fileFromHandle(
  handle: BasemapArchiveFileHandle,
): Promise<File | null> {
  try {
    return await handle.getFile();
  } catch {
    return null;
  }
}

/**
 * Reads the current read permission. Safe at startup: `queryPermission` never prompts.
 */
export async function queryBasemapArchivePermission(
  handle: BasemapArchiveFileHandle,
): Promise<BasemapArchivePermission> {
  if (typeof handle.queryPermission !== "function") return "unsupported";
  try {
    return await handle.queryPermission({ mode: "read" });
  } catch {
    return "denied";
  }
}

/**
 * Asks the user for read permission.
 *
 * MUST be reached from a click handler with no preceding await, so the caller still holds the
 * click's transient activation. Without it the call throws a SecurityError, which is reported here
 * as "denied".
 */
export async function requestBasemapArchivePermission(
  handle: BasemapArchiveFileHandle,
): Promise<BasemapArchivePermission> {
  if (typeof handle.requestPermission !== "function") return "unsupported";
  try {
    return await handle.requestPermission({ mode: "read" });
  } catch {
    return "denied";
  }
}

/**
 * Stores the handle so the archive can be reopened in a later session.
 *
 * Every error is swallowed behind a console.warn: failing to remember a handle must never make
 * opening a basemap archive fail.
 */
export async function saveBasemapArchiveHandle(
  key: string,
  handle: BasemapArchiveFileHandle,
  fileName: string,
): Promise<void> {
  if (!isFileHandleSupported()) return;
  try {
    const { putArchiveHandle } = await useIndexedDb();
    await putArchiveHandle({ key, handle, fileName, savedAt: Date.now() });
  } catch (e) {
    console.warn("Could not remember the basemap archive file", e);
  }
}

/** Reads the stored record. Returns null when unsupported, unknown, or when the read throws. */
export async function loadBasemapArchiveHandle(
  key: string,
): Promise<BasemapArchiveHandleRecord | null> {
  if (!isFileHandleSupported()) return null;
  try {
    const { getArchiveHandle } = await useIndexedDb();
    return (await getArchiveHandle(key)) ?? null;
  } catch (e) {
    console.warn("Could not read the remembered basemap archive file", e);
    return null;
  }
}

/**
 * Deletes the stored record.
 *
 * A File System Access permission grant cannot be revoked from JavaScript — there is no
 * `revokePermission()`. Deleting the stored handle IS the removal: with no handle nothing can name
 * the file, so the browser-level grant is inert. Note also that if the user later picks the same
 * file again, Chromium may grant it silently, because it remembers recently used per-origin grants.
 */
export async function deleteBasemapArchiveHandle(key: string): Promise<void> {
  if (!isFileHandleSupported()) return;
  try {
    const { deleteArchiveHandle } = await useIndexedDb();
    await deleteArchiveHandle(key);
  } catch (e) {
    console.warn("Could not forget the remembered basemap archive file", e);
  }
}

/**
 * Deletes every stored handle whose archive is no longer remembered, and reports how many went.
 *
 * A handle with no matching entry in the remembered list is unreachable: nothing can restore it,
 * and the remove control cannot delete it, because both work from the remembered list. It would sit
 * in IndexedDB holding a read grant on a file the user believes the application has forgotten.
 */
export async function deleteOrphanBasemapArchiveHandles(
  rememberedKeys: readonly string[],
): Promise<number> {
  if (!isFileHandleSupported()) return 0;
  try {
    const { listArchiveHandleKeys, deleteArchiveHandle } = await useIndexedDb();
    const keep = new Set(rememberedKeys);
    const orphans = (await listArchiveHandleKeys()).filter((key) => !keep.has(key));
    for (const key of orphans) await deleteArchiveHandle(key);
    return orphans.length;
  } catch (e) {
    console.warn("Could not clean up remembered basemap archive files", e);
    return 0;
  }
}
