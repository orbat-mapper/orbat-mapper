import { defineStore } from "pinia";
import { type CoordinateFormatType } from "@/composables/geoShowLocation";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";
import { DEFAULT_BASEMAP_ID } from "@/config/constants";
import type { BasemapArchiveKind } from "@/geo/basemapArchive";

export type MapProjection = "globe" | "mercator";

/**
 * What we remember about a basemap archive between sessions. Not the bytes — a basemap archive is
 * a file on the user's disk that only the user can hand us again.
 */
export interface RememberedBasemapArchive {
  fileName: string;
  kind: BasemapArchiveKind;
  /** Archive key. Optional because entries written before this change do not have it. */
  key?: string;
}
export type MapLibreUnitRotationMode = "screen" | "mixed" | "map";

const LEGACY_REMEMBERED_ARCHIVE_KEY = "lastBasemapArchive";

/**
 * Reads the superseded single-archive key once and folds it into the list, so a user who opened an
 * archive before archives were remembered plural does not lose it.
 *
 * Deliberately not a VueUse ref: it runs once, when the store is first created, and then the key is
 * gone. Guarded for a missing `localStorage`, because the test environment has none.
 */
function migrateLegacyRememberedArchive(): RememberedBasemapArchive[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(LEGACY_REMEMBERED_ARCHIVE_KEY);
    if (!raw) return [];
    localStorage.removeItem(LEGACY_REMEMBERED_ARCHIVE_KEY);
    const parsed = JSON.parse(raw) as RememberedBasemapArchive | null;
    return parsed?.fileName ? [parsed] : [];
  } catch {
    return [];
  }
}

export const useMapSettingsStore = defineStore("mapSettings", {
  state: () => ({
    showLocation: useLocalStorage("showLocation", true),
    coordinateFormat: useLocalStorage<CoordinateFormatType>(
      "coordinateFormat",
      "DecimalDegrees",
    ),
    showScaleLine: useLocalStorage("showScaleLine", true),
    showFeatureTooltip: useLocalStorage("showFeatureTooltip", true),
    baseLayerName: DEFAULT_BASEMAP_ID,
    maplibreBaseLayerName: useLocalStorage("maplibreBaseLayerName", ""),
    // Only each archive's name, kind and key — never the bytes. On Chromium a file handle for the
    // same key may also be stored in IndexedDB, which lets the archive be opened again; elsewhere
    // all we can do after a reload is ask the user to select the file again.
    //
    // A list, because several archives can be open at once: the pmtiles protocol keys them
    // individually and each is its own base layer. Remembering only the last one lost the others
    // on reload and orphaned their stored handles.
    basemapArchives: useLocalStorage<RememberedBasemapArchive[]>(
      "basemapArchives",
      migrateLegacyRememberedArchive(),
      { serializer: StorageSerializers.object },
    ),
    showDayNightTerminator: false,
    mapIconSize: useLocalStorage("mapIconSize", 25),
    mapCustomIconScale: useLocalStorage("mapCustomIconScale", 1.7),
    mapUnitLabelBelow: useLocalStorage("mapUnitLabelBelow", false),
    mapWrapUnitLabels: useLocalStorage("mapWrapUnitLabels", false),
    mapWrapLabelWidth: useLocalStorage("mapWrapLabelWidth", 15),
    mapLabelSize: useLocalStorage("mapLabelSize", 12),
    mapProjection: useLocalStorage<MapProjection>("mapProjection", "globe"),
    mapLibreUnitRotationMode: useLocalStorage<MapLibreUnitRotationMode>(
      "mapLibreUnitRotationMode",
      "screen",
    ),
  }),
});
