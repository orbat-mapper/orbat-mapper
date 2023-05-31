import { defineStore } from "pinia";
import { CoordinateFormatType } from "@/composables/geoShowLocation";
import { useLocalStorage } from "@vueuse/core";

export interface MapSettingsState {
  showLocation: boolean;
  coordinateFormat: CoordinateFormatType;
  baseLayerName: string;
}
export const useMapSettingsStore = defineStore("mapSettings", {
  state: () =>
    useLocalStorage<MapSettingsState>("mapSettings4", {
      showLocation: true,
      coordinateFormat: "DecimalDegrees",
      baseLayerName: "osm",
    }),
});
