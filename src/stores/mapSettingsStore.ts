import { defineStore } from "pinia";
import { CoordinateFormatType } from "@/composables/geoShowLocation";
import { useLocalStorage } from "@vueuse/core";

export interface MapSettingsState {
  showLocation: boolean;
  coordinateFormat: CoordinateFormatType;
}
export const useMapSettingsStore = defineStore("mapSettings", {
  state: () =>
    useLocalStorage<MapSettingsState>("mapSettings", {
      showLocation: true,
      coordinateFormat: "DecimalDegrees",
    }),
});
