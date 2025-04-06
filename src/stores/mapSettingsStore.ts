import { defineStore } from "pinia";
import { type CoordinateFormatType } from "@/composables/geoShowLocation";
import { useLocalStorage } from "@vueuse/core";
import { DEFAULT_BASEMAP_ID } from "@/config/constants";

export interface MapSettingsState {
  showLocation: boolean;
  coordinateFormat: CoordinateFormatType;
  baseLayerName: string;
  showScaleLine: boolean;
  showDayNightTerminator: boolean;
}
export const useMapSettingsStore = defineStore("mapSettings", {
  state: () => ({
    showLocation: useLocalStorage("showLocation", true),
    coordinateFormat: useLocalStorage<CoordinateFormatType>(
      "coordinateFormat",
      "DecimalDegrees",
    ),
    showScaleLine: useLocalStorage("showScaleLine", true),
    baseLayerName: DEFAULT_BASEMAP_ID,
    showDayNightTerminator: false,
  }),
});
