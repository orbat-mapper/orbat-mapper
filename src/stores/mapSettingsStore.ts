import { defineStore } from "pinia";
import { type CoordinateFormatType } from "@/composables/geoShowLocation";
import { useLocalStorage } from "@vueuse/core";
import { DEFAULT_BASEMAP_ID } from "@/config/constants";
import type { UnitClusterGroupingMode, UnitClusteringMode } from "@/types/mapSettings";

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
    showDayNightTerminator: false,
    mapIconSize: useLocalStorage("mapIconSize", 30),
    mapCustomIconScale: useLocalStorage("mapCustomIconScale", 1.7),
    mapUnitLabelBelow: useLocalStorage("mapUnitLabelBelow", false),
    mapWrapUnitLabels: useLocalStorage("mapWrapUnitLabels", false),
    mapWrapLabelWidth: useLocalStorage("mapWrapLabelWidth", 15),
    mapLabelSize: useLocalStorage("mapLabelSize", 12),
    unitClusteringMode: useLocalStorage<UnitClusteringMode>("unitClusteringMode", "off"),
    unitClusterGroupingMode: useLocalStorage<UnitClusterGroupingMode>(
      "unitClusterGroupingMode",
      "strict",
    ),
    unitClusteringDistancePx: useLocalStorage("unitClusteringDistancePx", 48),
    unitClusteringMinSize: useLocalStorage("unitClusteringMinSize", 2),
    unitClusteringMaxZoom: useLocalStorage("unitClusteringMaxZoom", 14),
    unitClusteringHierarchyMinDepth: useLocalStorage(
      "unitClusteringHierarchyMinDepth",
      1,
    ),
  }),
});
