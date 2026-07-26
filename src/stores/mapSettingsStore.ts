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
}
export type MapLibreUnitRotationMode = "screen" | "mixed" | "map";

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
    // Only the archive's name and kind — the file itself cannot be persisted, so all we can do
    // after a reload is ask the user to select it again.
    lastBasemapArchive: useLocalStorage<RememberedBasemapArchive | null>(
      "lastBasemapArchive",
      null,
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
