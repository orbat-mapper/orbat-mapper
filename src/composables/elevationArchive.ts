/**
 * The one place the UI opens elevation data from: a PMTiles archive on disk or on a web server.
 *
 * There is at most one elevation archive. Opening one replaces the build's default source (online
 * Mapterhorn data), and removing it brings the default back. A file is remembered the way a basemap
 * archive is (ADR 0004): on Chromium its `FileSystemFileHandle` is kept in IndexedDB, and it is
 * opened again without asking in exactly one case — the read permission is already granted AND
 * terrain or hillshading was on when the user left. Every other case needs a click.
 */
import { computed, ref } from "vue";
import {
  closeElevationArchive,
  ELEVATION_ARCHIVE_KEY,
  openElevationArchiveFile,
  openElevationArchiveUrl,
} from "@/geo/elevationArchive";
import {
  deleteBasemapArchiveHandle,
  fileFromHandle,
  isFileHandleSupported,
  loadBasemapArchiveHandle,
  pickBasemapArchiveHandles,
  queryBasemapArchivePermission,
  requestBasemapArchivePermission,
  saveBasemapArchiveHandle,
  type BasemapArchiveFileHandle,
} from "@/geo/basemapArchiveHandles";
import { customBasemapFromUrl } from "@/geo/customBasemap";
import { pickFilesFromDisk } from "@/composables/basemapArchives";
import { useNotifications } from "@/composables/notifications";
import { elevationArchiveLabel, useTerrainStore } from "@/stores/terrainStore";

const ELEVATION_ARCHIVE_EXTENSIONS = [".pmtiles"] as const;

/**
 * The handle the startup probe found. Cached so activatePendingElevationArchive() can call
 * requestPermission() with no preceding await, and keep the click's transient activation.
 */
const pendingHandle = ref<BasemapArchiveFileHandle | null>(null);

/** "retry" is an address that could not be read at startup; a server can come back. */
export type PendingElevationArchiveAction = "pick" | "restore" | "retry";

const PENDING_ACTION_VERB: Record<PendingElevationArchiveAction, string> = {
  restore: "Restore",
  pick: "Select",
  retry: "Retry",
};

export interface PendingElevationArchive {
  /** File name or address. */
  label: string;
  action: PendingElevationArchiveAction;
  /** "Restore", "Select" or "Retry". */
  verb: string;
  /** The menu item that activates it, e.g. "Restore dem.pmtiles" or "Select dem.pmtiles…". */
  menuText: string;
}

export function useElevationArchive() {
  const terrain = useTerrainStore();
  const { send } = useNotifications();

  function errorMessage(e: unknown, fallback: string) {
    return e instanceof Error ? e.message : fallback;
  }

  /** Forgets the stored handle, so a stale one neither restores nor keeps its read grant. */
  async function dropHandle() {
    await deleteBasemapArchiveHandle(ELEVATION_ARCHIVE_KEY);
    pendingHandle.value = null;
  }

  async function forgetArchive() {
    await dropHandle();
    terrain.clearArchive();
    closeElevationArchive();
  }

  /** Turns on whatever the user switched off, so opening elevation data shows it. */
  function showTerrain() {
    if (terrain.terrainEnabled || terrain.hillshadeEnabled) return;
    terrain.terrainEnabled = true;
    terrain.hillshadeEnabled = true;
  }

  async function loadElevationArchiveFile(
    file: File,
    options: { handle?: BasemapArchiveFileHandle; successMessage?: string } = {},
  ): Promise<boolean> {
    try {
      const source = await openElevationArchiveFile(file);
      terrain.setArchiveSource({ kind: "file", fileName: file.name }, source);
      // A different file, or one that was dropped, must not leave the previous file's handle behind.
      if (options.handle) {
        await saveBasemapArchiveHandle(ELEVATION_ARCHIVE_KEY, options.handle, file.name);
      } else {
        await deleteBasemapArchiveHandle(ELEVATION_ARCHIVE_KEY);
      }
      pendingHandle.value = null;
      showTerrain();
      send({
        message: options.successMessage ?? `Using ${file.name} for elevation data`,
        type: "success",
      });
      return true;
    } catch (e) {
      send({ message: errorMessage(e, `Could not open ${file.name}`), type: "error" });
      return false;
    }
  }

  /**
   * Shows the file picker and opens the chosen archive as elevation data. Returns true when an
   * archive was opened. Falls through to `<input type="file">` where the File System Access picker
   * is missing or refuses, as the basemap picker does.
   */
  async function openElevationArchivePicker(): Promise<boolean> {
    if (isFileHandleSupported()) {
      const outcome = await pickBasemapArchiveHandles(
        ELEVATION_ARCHIVE_EXTENSIONS,
        false,
        "Elevation archive",
      );
      if (outcome.status === "picked") {
        const handle = outcome.handles[0];
        if (!handle) return false;
        const file = await fileFromHandle(handle);
        return file ? loadElevationArchiveFile(file, { handle }) : false;
      }
    }
    const [file] = await pickFilesFromDisk(ELEVATION_ARCHIVE_EXTENSIONS.join(","));
    return file ? loadElevationArchiveFile(file) : false;
  }

  /** Uses an archive on a web server. The address is kept, so it is opened again by itself. */
  async function addElevationArchiveUrl(url: string): Promise<boolean> {
    // The same rules as a basemap address: http or https, and a file on disk has its own control.
    const parsed = customBasemapFromUrl(url);
    if (!parsed.ok) {
      send({ message: parsed.message, type: "error" });
      return false;
    }
    const address = parsed.basemap.url;
    try {
      const source = await openElevationArchiveUrl(address);
      terrain.setArchiveSource({ kind: "url", url: address }, source);
      await dropHandle();
      showTerrain();
      send({
        message: `Using ${parsed.basemap.title} for elevation data`,
        type: "success",
      });
      return true;
    } catch (e) {
      send({ message: errorMessage(e, `Could not open ${address}`), type: "error" });
      return false;
    }
  }

  /** The remembered archive that is not open, or null. */
  const pendingElevationArchive = computed<PendingElevationArchive | null>(() => {
    const remembered = terrain.elevationArchive;
    if (!remembered || !terrain.elevationArchivePending) return null;
    const label = elevationArchiveLabel(remembered);
    const action: PendingElevationArchiveAction =
      remembered.kind === "url" ? "retry" : pendingHandle.value ? "restore" : "pick";
    const verb = PENDING_ACTION_VERB[action];
    return {
      label,
      action,
      verb,
      menuText: `${verb} ${label}${action === "pick" ? "…" : ""}`,
    };
  });

  /**
   * The startup probe. An address is opened again by itself. A file is opened again without asking
   * only when its read permission is granted and terrain or hillshading is on; otherwise the
   * Terrain menu offers to restore or select it.
   */
  async function restoreRememberedElevationArchive(): Promise<
    "reopened" | "pending" | "none"
  > {
    const remembered = terrain.elevationArchive;
    pendingHandle.value = null;
    if (!remembered || !terrain.elevationArchivePending) {
      // A handle with nothing remembered is an orphan holding a read grant.
      if (!remembered) await deleteBasemapArchiveHandle(ELEVATION_ARCHIVE_KEY);
      return "none";
    }

    if (remembered.kind === "url") {
      try {
        terrain.setArchiveSource(
          remembered,
          await openElevationArchiveUrl(remembered.url),
        );
        return "reopened";
      } catch {
        // The server may be down now and up later. The source stays missing, and the menu says so.
        return "pending";
      }
    }

    const record = await loadBasemapArchiveHandle(ELEVATION_ARCHIVE_KEY);
    if (!record) return "pending";
    const permission = await queryBasemapArchivePermission(record.handle);
    if (permission !== "granted" && permission !== "prompt") return "pending";
    pendingHandle.value = record.handle;

    const inUse = terrain.terrainEnabled || terrain.hillshadeEnabled;
    if (permission !== "granted" || !inUse) return "pending";

    const file = await fileFromHandle(record.handle);
    if (!file) {
      await dropHandle();
      return "pending";
    }
    const reopened = await loadElevationArchiveFile(file, {
      handle: record.handle,
      successMessage: `Reopened ${file.name} for elevation data`,
    });
    return reopened ? "reopened" : "pending";
  }

  /**
   * Opens elevation data for a control that has none: the pending archive, or the picker when
   * nothing is pending. Returns true when an archive was opened.
   */
  async function activatePendingElevationArchive(): Promise<boolean> {
    const pending = pendingElevationArchive.value;
    if (pending?.action === "retry") return addElevationArchiveUrl(pending.label);
    const handle = pendingHandle.value;
    if (!pending || !handle) return openElevationArchivePicker();

    // FIRST await on this branch, so the click's transient activation is still live.
    const permission = await requestBasemapArchivePermission(handle);
    if (permission !== "granted") {
      pendingHandle.value = null;
      send({
        message: `Permission to read ${pending.label} was not given.`,
        type: "error",
      });
      return false;
    }
    const file = await fileFromHandle(handle);
    if (!file) {
      await dropHandle();
      // requestPermission consumed the activation, so the picker cannot be chained here.
      send({
        message: `${pending.label} could not be opened. Select the archive again.`,
        type: "error",
      });
      return false;
    }
    return loadElevationArchiveFile(file, { handle });
  }

  /**
   * Uses online elevation data in a build that leaves it off until the user chooses it. An archive
   * would take precedence, so the remembered one is forgotten. The file is not touched.
   */
  async function chooseOnlineElevation(): Promise<void> {
    if (terrain.elevationArchive) await forgetArchive();
    terrain.onlineElevationChosen = true;
    showTerrain();
    send({ message: "Using Mapterhorn online for elevation data", type: "success" });
  }

  function stopOnlineElevation() {
    terrain.onlineElevationChosen = false;
    send({
      message: "Stopped using Mapterhorn online for elevation data",
      type: "success",
    });
  }

  /** Stops using the archive and returns to the build's default source. The file is not touched. */
  async function removeElevationArchive(): Promise<void> {
    const remembered = terrain.elevationArchive;
    if (!remembered) return;
    await forgetArchive();
    send({
      message: `Stopped using ${elevationArchiveLabel(remembered)} for elevation data`,
      type: "success",
    });
  }

  return {
    pendingElevationArchive,
    loadElevationArchiveFile,
    openElevationArchivePicker,
    addElevationArchiveUrl,
    restoreRememberedElevationArchive,
    activatePendingElevationArchive,
    chooseOnlineElevation,
    stopOnlineElevation,
    removeElevationArchive,
  };
}

/** Test helper — clears the module-level session state between tests. */
export function resetElevationArchiveSessionState() {
  pendingHandle.value = null;
}
