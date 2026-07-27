/**
 * The one place the UI loads a basemap archive from.
 *
 * The map context menu, the Layers panel button and the drag-and-drop handler all funnel through
 * here, so the toasts, the "make it active" step and the remembered archive stay consistent.
 *
 * A basemap archive stays on the user's disk. On Chromium the `FileSystemFileHandle` from
 * `showOpenFilePicker()` is stored in IndexedDB, so the archive can be opened again in a later
 * session; everywhere else the user selects the file again. See
 * docs/adr/0004-persisted-basemap-archive-handles.md.
 */
import { computed, ref } from "vue";
import {
  archiveKeyFromFileName,
  BASEMAP_ARCHIVE_EXTENSIONS,
  basemapArchiveKind,
  isBasemapArchiveFile,
  type BasemapArchiveKind,
} from "@/geo/basemapArchive";
import {
  deleteBasemapArchiveHandle,
  deleteOrphanBasemapArchiveHandles,
  fileFromHandle,
  isFileHandleSupported,
  loadBasemapArchiveHandle,
  pickBasemapArchiveHandles,
  queryBasemapArchivePermission,
  requestBasemapArchivePermission,
  saveBasemapArchiveHandle,
  type BasemapArchiveFileHandle,
} from "@/geo/basemapArchiveHandles";
import {
  getSupportedMaplibreBasemaps,
  NO_BASEMAP_ID,
} from "@/modules/maplibreview/maplibreBasemaps";
import { useNotifications } from "@/composables/notifications";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import {
  useMapSettingsStore,
  type RememberedBasemapArchive,
} from "@/stores/mapSettingsStore";

export type { RememberedBasemapArchive };

/** `accept` value for a file input that should offer basemap archives. */
export const BASEMAP_ARCHIVE_ACCEPT = BASEMAP_ARCHIVE_EXTENSIONS.join(",");

export interface BasemapArchiveSplit {
  /** Files that are basemap archives and belong on the basemap path. */
  archives: File[];
  /** Everything else, which belongs in the import wizard. */
  others: File[];
}

/**
 * Splits a dropped file list into basemap archives and everything else.
 *
 * Pure, so drop routing can be tested without a map, a store or a DOM drop event. A mixed drop is
 * split rather than rejected — both halves are handled.
 */
export function splitBasemapArchiveFiles(files: File[]): BasemapArchiveSplit {
  const archives: File[] = [];
  const others: File[] = [];
  for (const file of files) {
    if (isBasemapArchiveFile(file)) archives.push(file);
    else others.push(file);
  }
  return { archives, others };
}

/**
 * The handles the startup probe found, by archive key. Session state at module scope, so a restore
 * done in one view is reflected in every other view.
 *
 * Keyed, and never a bare handle: `basemapArchives` lives in localStorage and follows a `storage`
 * event from another tab, so what is remembered can change under this module without any code here
 * running. A handle must never be used for, or deleted under, a different key than its own.
 *
 * A handle is cached rather than read on demand so activatePendingBasemapArchive() can call
 * requestPermission() with no preceding await, and therefore keep the click's transient activation.
 */
const pendingHandles = ref(new Map<string, BasemapArchiveFileHandle>());

export type PendingBasemapArchiveAction = "pick" | "restore";

export interface PendingBasemapArchive {
  /** Archive key — also LayerInfo.name on the pending row. */
  key: string;
  fileName: string;
  kind: BasemapArchiveKind;
  action: PendingBasemapArchiveAction;
}

export interface LoadBasemapArchiveOptions {
  /** Handle for the picked file. Stored so the archive can be reopened next session. */
  handle?: BasemapArchiveFileHandle;
  /** Overrides the success toast. Used by the automatic reopen. */
  successMessage?: string;
}

/**
 * The key an archive was remembered under. Entries written before the `key` field existed fall back
 * to the same pure derivation `openBasemapArchiveFile` uses, so there is only one key derivation.
 */
function rememberedArchiveKey(remembered: RememberedBasemapArchive): string {
  return remembered.key ?? archiveKeyFromFileName(remembered.fileName);
}

function pickFilesFromDisk(accept: string, multiple = false): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = "none";
    input.addEventListener("change", () => {
      const files = input.files ? Array.from(input.files) : [];
      input.remove();
      resolve(files);
    });
    // A cancelled dialog fires `cancel` in modern browsers; without it the promise simply never
    // settles, which is harmless but leaks a listener, so clean up either way.
    input.addEventListener("cancel", () => {
      input.remove();
      resolve([]);
    });
    document.body.append(input);
    input.click();
  });
}

export function useBasemapArchives() {
  const layersStore = useMaplibreLayersStore();
  const mapSettings = useMapSettingsStore();
  const { send } = useNotifications();

  /**
   * Adds an archive to the remembered list, or updates the entry that is already there.
   *
   * Keyed by archive key, so opening the same file again updates one entry instead of adding a
   * second row for it. A new array is assigned rather than mutated, so localStorage is written.
   */
  function rememberBasemapArchive(archive: RememberedBasemapArchive) {
    const key = rememberedArchiveKey(archive);
    const rest = mapSettings.basemapArchives.filter(
      (entry) => rememberedArchiveKey(entry) !== key,
    );
    mapSettings.basemapArchives = [...rest, archive];
  }

  /**
   * A free archive key for this file.
   *
   * The derivation is lossy: "area map.pmtiles" and "area_map.pmtiles" both give `area_map`, and a
   * layer in `maplibreConfig.json` can be called that too. Everything about an archive hangs off
   * its key — the layer, the `pmtiles://` registration, the stored handle and the remembered row —
   * so letting a second file take a key in use would replace the first one silently.
   *
   * Reopening the SAME file must keep its key, or a handle and a remembered row would be stranded
   * on every reload. A taken key is therefore only stepped over when the archive behind it is a
   * different file.
   */
  function archiveKeyForFile(fileName: string): string {
    const base = archiveKeyFromFileName(fileName);
    const remembered = (key: string) =>
      mapSettings.basemapArchives.find((entry) => rememberedArchiveKey(entry) === key);
    const usable = (key: string) => {
      const entry = remembered(key);
      if (entry) return entry.fileName === fileName;
      return !layersStore.getLayer(key);
    };
    if (usable(base)) return base;
    for (let n = 2; n < 1000; n++) {
      if (usable(`${base}_${n}`)) return `${base}_${n}`;
    }
    return base;
  }

  /**
   * Opens one archive, makes it the active basemap and reports the outcome.
   *
   * Returns true when the archive was loaded. A `.mapbundle` fails here with the seam's own
   * "not yet supported" message, which is written to be shown as-is.
   */
  async function loadBasemapArchive(
    file: File,
    options: LoadBasemapArchiveOptions = {},
  ): Promise<boolean> {
    try {
      const layer = await layersStore.addBasemapArchive(file, {
        name: archiveKeyForFile(file.name),
      });
      layersStore.setActiveBasemap(layer.name);
      rememberBasemapArchive({
        fileName: file.name,
        kind: basemapArchiveKind(file.name) ?? "pmtiles",
        key: layer.name,
      });
      if (options.handle) {
        await saveBasemapArchiveHandle(layer.name, options.handle, file.name);
      }
      // The archive is open, so there is nothing pending for it any more.
      pendingHandles.value.delete(layer.name);
      send({
        message: options.successMessage ?? `Added ${file.name} as basemap`,
        type: "success",
      });
      return true;
    } catch (e) {
      send({
        message: e instanceof Error ? e.message : `Could not open ${file.name}`,
        type: "error",
      });
      return false;
    }
  }

  /** Opens several archives in order. The last one that loads becomes the active basemap. */
  async function loadBasemapArchives(files: File[]): Promise<number> {
    let loaded = 0;
    for (const file of files) {
      if (await loadBasemapArchive(file)) loaded += 1;
    }
    return loaded;
  }

  /**
   * Shows the file picker and loads whatever the user chose.
   *
   * The File System Access picker is preferred where it exists, because only it yields a handle
   * that can be stored. Everywhere else the `<input type="file">` path is used unchanged.
   *
   * "Where it exists" is not the same as "where it works": an enterprise policy can make every
   * `showOpenFilePicker` call reject while the function stays on the window. The seam reports that
   * as "unavailable", and this function then falls through to the `<input type="file">` picker
   * rather than doing nothing at all.
   */
  async function openBasemapArchivePicker(): Promise<void> {
    if (isFileHandleSupported()) {
      const outcome = await pickBasemapArchiveHandles(BASEMAP_ARCHIVE_EXTENSIONS);
      if (outcome.status === "picked") {
        for (const handle of outcome.handles) {
          const file = await fileFromHandle(handle);
          if (!file) continue;
          await loadBasemapArchive(file, { handle });
        }
        return;
      }
    }
    const files = await pickFilesFromDisk(BASEMAP_ARCHIVE_ACCEPT);
    if (files.length === 0) return;
    await loadBasemapArchives(files);
  }

  /**
   * Routes a dropped file list: archives become basemaps, everything else is handed back to the
   * caller for the import wizard. Returns true when at least one file was an archive.
   *
   * A drop hands over `File` objects only, so this path stores no handle.
   */
  async function handleDroppedFiles(
    files: File[],
    onOtherFiles: (files: File[]) => void,
  ): Promise<boolean> {
    const { archives, others } = splitBasemapArchiveFiles(files);
    if (others.length > 0) onOtherFiles(others);
    if (archives.length === 0) return false;
    await loadBasemapArchives(archives);
    return true;
  }

  /**
   * Every remembered basemap archive that is not loaded, each rendered as a row in the base layer
   * list. An archive that is already loaded has a real row, so it is not pending.
   */
  const pendingBasemapArchives = computed<PendingBasemapArchive[]>(() =>
    mapSettings.basemapArchives
      .map((remembered) => ({ remembered, key: rememberedArchiveKey(remembered) }))
      .filter(({ key }) => !layersStore.getLayer(key))
      .map(({ remembered, key }) => ({
        key,
        fileName: remembered.fileName,
        kind: remembered.kind,
        // Only an archive whose own handle was probed can be restored. Everything else — no handle
        // stored, a browser without the API, a handle probed for a different key — asks for the
        // file again.
        action: pendingHandles.value.has(key) ? "restore" : ("pick" as const),
      })),
  );

  /**
   * The startup probe. Reads the stored handle for the remembered archive and decides between
   * opening it again by itself, offering a restore row, and offering the picker.
   *
   * The archive is opened again without asking in exactly one case: the read permission is already
   * granted AND the archive was the active basemap when the user left. Anything else needs a click.
   */
  async function restoreRememberedBasemapArchive(): Promise<
    "reopened" | "pending" | "none"
  > {
    // First, and before any store read: the caller may be running with a layers store that has
    // nothing but `layers` and `initialize`.
    const remembered = mapSettings.basemapArchives;
    pendingHandles.value.clear();
    if (remembered.length === 0) {
      // Nothing is remembered, so every stored handle is an orphan.
      await deleteOrphanBasemapArchiveHandles([]);
      return "none";
    }

    const keys = remembered.map(rememberedArchiveKey);
    // Handles outlive the list they belong to: an archive removed in another tab, or a list cleared
    // by hand, leaves a handle nothing can reach. Drop those before probing the rest.
    await deleteOrphanBasemapArchiveHandles(keys);

    if (!isFileHandleSupported()) return "none";

    let reopened = false;
    for (const key of keys) {
      // Loaded already — by a drop, by an earlier iteration, or by another view.
      if (layersStore.getLayer(key)) continue;

      const record = await loadBasemapArchiveHandle(key);
      if (!record) continue;

      const permission = await queryBasemapArchivePermission(record.handle);
      if (permission !== "granted" && permission !== "prompt") continue;

      pendingHandles.value.set(key, record.handle);

      // Reopened without asking in exactly one case: the read permission is already granted AND
      // this archive was the active basemap when the user left. The others wait for a click, even
      // when their permission would allow opening them.
      if (permission !== "granted" || mapSettings.maplibreBaseLayerName !== key) continue;

      const file = await fileFromHandle(record.handle);
      if (!file) {
        // The file was moved, renamed or deleted. Drop the stale handle and say nothing: the user
        // asked for nothing at startup, so a toast here would be noise.
        await deleteBasemapArchiveHandle(key);
        pendingHandles.value.delete(key);
        continue;
      }
      await loadBasemapArchive(file, {
        handle: record.handle,
        successMessage: `Reopened ${file.name} as basemap`,
      });
      reopened = true;
    }

    if (reopened) return "reopened";
    return pendingBasemapArchives.value.length > 0 ? "pending" : "none";
  }

  /** Click handler of a pending row. */
  async function activatePendingBasemapArchive(key: string): Promise<void> {
    const pending = pendingBasemapArchives.value.find((entry) => entry.key === key);
    if (!pending) return;

    // The handle is looked up by the row's own key, so a row can only ever open its own archive,
    // whatever another tab did to the remembered list in the meantime.
    const handle = pendingHandles.value.get(key);
    if (pending.action === "pick" || !handle) {
      await openBasemapArchivePicker();
      return;
    }

    // FIRST statement on this branch, with no await before it, so the click's transient activation
    // is still live when the browser is asked for permission.
    const permission = await requestBasemapArchivePermission(handle);
    if (permission !== "granted") {
      pendingHandles.value.delete(key);
      send({
        message: `Permission to read ${pending.fileName} was not given.`,
        type: "error",
      });
      return;
    }

    const file = await fileFromHandle(handle);
    if (!file) {
      await deleteBasemapArchiveHandle(key);
      pendingHandles.value.delete(key);
      // Do not chain into openBasemapArchivePicker() here: requestPermission has consumed the
      // transient activation, so showOpenFilePicker would reject with a SecurityError. The row now
      // offers the picker instead, and a second click opens it.
      send({
        message: `${pending.fileName} could not be opened. Select the archive again.`,
        type: "error",
      });
      return;
    }

    await loadBasemapArchive(file, { handle });
  }

  /**
   * Removes a basemap archive the user opened from disk. The file on disk is not touched, so there
   * is no confirmation step.
   */
  async function removeBasemapArchive(key: string): Promise<void> {
    const layer = layersStore.getLayer(key);
    const remembered = mapSettings.basemapArchives.find(
      (entry) => rememberedArchiveKey(entry) === key,
    );
    const label = remembered?.fileName ?? layer?.title ?? key;
    const wasActive = mapSettings.maplibreBaseLayerName === key;

    // 1. Drop the stored file handle. A File System Access permission grant cannot be revoked from
    //    JavaScript — there is no revokePermission() — so deleting the handle IS the removal: with
    //    no handle nothing can name the file, and the browser-level grant is inert. If the user
    //    later picks the same file again, Chromium may grant it silently, because it remembers
    //    recently used per-origin grants.
    await deleteBasemapArchiveHandle(key);

    // 2 + 3. removeLayer() already calls unregisterArchive(name) for a pmtiles layer, which stops
    //        the pmtiles:// protocol serving it, and then drops the layer config.
    layersStore.removeLayer(key);

    // 4. Stop remembering this one, so no pending row for it comes back on the next load. The
    //    other remembered archives are left exactly as they are.
    forgetBasemapArchive(key);

    // 5. Do not leave the map on a basemap that no longer exists. maplibreBaseLayerName would keep
    //    a stale id otherwise, which resolveMaplibreBasemap() only masks by falling back to
    //    options[0].
    if (wasActive) {
      const options = getSupportedMaplibreBasemaps(layersStore.layers);
      const next =
        options.find((option) => option.id !== key && option.id !== NO_BASEMAP_ID) ??
        options[0];
      layersStore.setActiveBasemap(next.id);
    }

    send({ message: `Removed ${label}`, type: "success" });
  }

  /** Stops remembering one archive, so no pending row for it comes back on the next load. */
  function forgetBasemapArchive(key: string) {
    mapSettings.basemapArchives = mapSettings.basemapArchives.filter(
      (entry) => rememberedArchiveKey(entry) !== key,
    );
    pendingHandles.value.delete(key);
  }

  return {
    pendingBasemapArchives,
    activatePendingBasemapArchive,
    restoreRememberedBasemapArchive,
    removeBasemapArchive,
    forgetBasemapArchive,
    handleDroppedFiles,
    loadBasemapArchive,
    loadBasemapArchives,
    openBasemapArchivePicker,
  };
}

/** Test helper — clears the module-level session state between tests. */
export function resetBasemapArchiveSessionState() {
  pendingHandles.value.clear();
}
