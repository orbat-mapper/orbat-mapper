import { defineStore } from "pinia";
import { computed, markRaw, ref, shallowRef, watch } from "vue";
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";
import {
  DEFAULT_TERRAIN_DISPLAY,
  MAPTERHORN_ELEVATION_SOURCE,
  TERRAIN_EXAGGERATION_DEFAULT,
  TERRAIN_EXAGGERATION_MIN,
  TERRAIN_EXAGGERATION_MAX,
  type TerrainDisplay,
} from "@/modules/maplibreview/mapTerrain";
import type { HillshadeSettings } from "@/modules/maplibreview/hillshadeSettings";
import { isOnlineElevationAvailable } from "@/utils/runtimeEnvironment";

function clampExaggeration(value: number) {
  return Number.isFinite(value)
    ? Math.min(TERRAIN_EXAGGERATION_MAX, Math.max(TERRAIN_EXAGGERATION_MIN, value))
    : TERRAIN_EXAGGERATION_DEFAULT;
}

export const ELEVATION_UNAVAILABLE_MESSAGE =
  "Elevation data is unavailable. Check your connection or toggle the feature off and on.";

export const ELEVATION_ARCHIVE_UNAVAILABLE_MESSAGE =
  "The elevation archive could not be read. Open it again or toggle the feature off and on.";

/**
 * The elevation archive the user chose, remembered between visits. Never the bytes: a file stays on
 * the user's disk, and on Chromium a handle to it may be stored in IndexedDB under
 * `ELEVATION_ARCHIVE_KEY`. An address is the whole archive, so it survives a reload by itself.
 */
export type RememberedElevationArchive =
  { kind: "file"; fileName: string } | { kind: "url"; url: string };

export function isSameElevationArchive(
  a: RememberedElevationArchive | null,
  b: RememberedElevationArchive | null,
): boolean {
  if (!a || !b) return a === b;
  return a.kind === b.kind && elevationArchiveLabel(a) === elevationArchiveLabel(b);
}

/** File name or address. */
export function elevationArchiveLabel(archive: RememberedElevationArchive): string {
  return archive.kind === "file" ? archive.fileName : archive.url;
}

const ONLINE_ELEVATION_SOURCE = markRaw(MAPTERHORN_ELEVATION_SOURCE);

/** Display preferences remembered between visits; never scenario content. */
export const useTerrainStore = defineStore("terrain", () => {
  const terrainEnabled = useLocalStorage(
    "terrainEnabled",
    DEFAULT_TERRAIN_DISPLAY.enabled,
  );
  const hillshadeEnabled = useLocalStorage(
    "hillshadeEnabled",
    DEFAULT_TERRAIN_DISPLAY.hillshadeEnabled,
  );
  const exaggeration = useLocalStorage(
    "terrainExaggeration",
    DEFAULT_TERRAIN_DISPLAY.exaggeration,
  );
  // A stored value may predate the current bounds.
  exaggeration.value = clampExaggeration(exaggeration.value);
  const hillshadeSettings = useLocalStorage<HillshadeSettings>(
    "hillshadeSettings",
    { ...DEFAULT_TERRAIN_DISPLAY.hillshadeSettings },
    { serializer: StorageSerializers.object, mergeDefaults: true },
  );
  const elevationArchive = useLocalStorage<RememberedElevationArchive | null>(
    "elevationArchive",
    null,
    { serializer: StorageSerializers.object },
  );
  /**
   * The user asked for online elevation data in a build that does not offer it by default (the
   * standalone file). Remembered, so the choice is made once.
   */
  const onlineElevationChosen = useLocalStorage("onlineElevationChosen", false);
  /**
   * The archive opened in this session, with the descriptor it was opened for. A file must be
   * opened again after a reload.
   */
  const openedArchive = shallowRef<{
    archive: RememberedElevationArchive;
    source: RasterDEMSourceSpecification;
  } | null>(null);
  /**
   * The opened source, while it still belongs to the remembered archive. Another tab may choose a
   * different archive; this tab then has none open until it opens that one too.
   */
  const archiveSource = computed(() =>
    openedArchive.value &&
    isSameElevationArchive(openedArchive.value.archive, elevationArchive.value)
      ? openedArchive.value.source
      : null,
  );
  /** Aborted whenever the archive choice changes, here or in another tab. */
  let selection = new AbortController();
  watch(
    elevationArchive,
    () => {
      selection.abort();
      selection = new AbortController();
    },
    { flush: "sync" },
  );
  const terrainError = ref(false);
  const hillshadeError = ref(false);

  function setExaggeration(value: number) {
    exaggeration.value = clampExaggeration(value);
  }

  function resetHillshade() {
    hillshadeSettings.value = { ...DEFAULT_TERRAIN_DISPLAY.hillshadeSettings };
  }

  function setArchiveSource(
    remembered: RememberedElevationArchive,
    source: RasterDEMSourceSpecification,
  ) {
    elevationArchive.value = remembered;
    openedArchive.value = { archive: remembered, source: markRaw(source) };
  }

  function clearArchive() {
    elevationArchive.value = null;
    openedArchive.value = null;
  }

  /**
   * Starts opening an archive. Any earlier opening is abandoned, and the returned signal aborts
   * when the archive choice changes before this one commits.
   */
  function beginArchiveSelection(): AbortSignal {
    selection.abort();
    selection = new AbortController();
    return selection.signal;
  }

  /**
   * Where elevation tiles come from: a chosen archive replaces the build default. An archive that is
   * remembered but not open yet gives no source, rather than falling back to the internet without
   * the user knowing.
   */
  const elevationSource = computed(() => {
    if (elevationArchive.value) return archiveSource.value;
    return isOnlineElevationAvailable || onlineElevationChosen.value
      ? ONLINE_ELEVATION_SOURCE
      : null;
  });

  /** An archive is remembered, but its file has not been opened in this session. */
  const elevationArchivePending = computed(
    () => !!elevationArchive.value && !archiveSource.value,
  );

  const display = computed<TerrainDisplay>(() => ({
    source: elevationSource.value,
    enabled: terrainEnabled.value,
    hillshadeEnabled: hillshadeEnabled.value,
    exaggeration: exaggeration.value,
    hillshadeSettings: hillshadeSettings.value,
  }));

  /** Elevation tiles failed for a feature that is switched on. */
  const elevationUnavailable = computed(
    () =>
      (terrainEnabled.value && terrainError.value) ||
      (hillshadeEnabled.value && hillshadeError.value),
  );

  const elevationUnavailableMessage = computed(() =>
    elevationArchive.value
      ? ELEVATION_ARCHIVE_UNAVAILABLE_MESSAGE
      : ELEVATION_UNAVAILABLE_MESSAGE,
  );

  return {
    terrainEnabled,
    hillshadeEnabled,
    exaggeration,
    hillshadeSettings,
    terrainError,
    hillshadeError,
    elevationUnavailable,
    elevationUnavailableMessage,
    elevationArchive,
    archiveSource,
    elevationSource,
    elevationArchivePending,
    /** The build leaves online elevation data off until the user chooses it. */
    onlineElevationOptional: !isOnlineElevationAvailable,
    onlineElevationChosen,
    display,
    setArchiveSource,
    clearArchive,
    beginArchiveSelection,
    setExaggeration,
    resetHillshade,
  };
});
