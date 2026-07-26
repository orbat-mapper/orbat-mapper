/**
 * The one place the UI loads a basemap archive from.
 *
 * The map context menu, the Layers panel button and the drag-and-drop handler all funnel through
 * here, so the toasts, the "make it active" step and the remembered archive stay consistent.
 *
 * An archive is session-only: a `File` reference cannot survive a reload. Only the archive's name
 * and kind are remembered, and the user is prompted to pick the file again on the next visit.
 */
import { computed, ref } from "vue";
import {
  BASEMAP_ARCHIVE_EXTENSIONS,
  basemapArchiveKind,
  isBasemapArchiveFile,
} from "@/geo/basemapArchive";
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

// Session state: dismissing the prompt should not outlive the tab, and reopening the archive in
// one view should clear the prompt in every other view too.
const promptDismissed = ref(false);
const reselectedThisSession = ref(false);

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
   * Opens one archive, makes it the active basemap and reports the outcome.
   *
   * Returns true when the archive was loaded. A `.mapbundle` fails here with the seam's own
   * "not yet supported" message, which is written to be shown as-is.
   */
  async function loadBasemapArchive(file: File): Promise<boolean> {
    try {
      const layer = await layersStore.addBasemapArchive(file);
      layersStore.setActiveBasemap(layer.name);
      mapSettings.lastBasemapArchive = {
        fileName: file.name,
        kind: basemapArchiveKind(file.name) ?? "pmtiles",
      };
      reselectedThisSession.value = true;
      promptDismissed.value = false;
      send({ message: `Added ${file.name} as basemap`, type: "success" });
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

  /** Shows the file picker and loads whatever the user chose. */
  async function openBasemapArchivePicker(): Promise<void> {
    const files = await pickFilesFromDisk(BASEMAP_ARCHIVE_ACCEPT);
    if (files.length === 0) return;
    await loadBasemapArchives(files);
  }

  /**
   * Routes a dropped file list: archives become basemaps, everything else is handed back to the
   * caller for the import wizard. Returns true when at least one file was an archive.
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
   * The archive we should ask the user to pick again, or null when there is nothing to ask for.
   *
   * There is nothing to ask for when no archive was ever opened, when the user has dismissed the
   * prompt, or when an archive has already been opened in this session.
   */
  const archiveToReselect = computed<RememberedBasemapArchive | null>(() => {
    if (promptDismissed.value || reselectedThisSession.value) return null;
    return mapSettings.lastBasemapArchive ?? null;
  });

  function dismissArchivePrompt() {
    promptDismissed.value = true;
  }

  function forgetBasemapArchive() {
    mapSettings.lastBasemapArchive = null;
    promptDismissed.value = true;
  }

  return {
    archiveToReselect,
    dismissArchivePrompt,
    forgetBasemapArchive,
    handleDroppedFiles,
    loadBasemapArchive,
    loadBasemapArchives,
    openBasemapArchivePicker,
  };
}

/** Test helper — clears the module-level session state between tests. */
export function resetBasemapArchivePromptState() {
  promptDismissed.value = false;
  reselectedThisSession.value = false;
}
