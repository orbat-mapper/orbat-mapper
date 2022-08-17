import { defineStore } from "pinia";
import { CoordinateFormatType } from "@/composables/geoShowLocation";

export interface MapSettingsState {
  showLocation: boolean;
  coordinateFormat: CoordinateFormatType;
}
export const useMapSettingsStore = defineStore("mapSettings", {
  state: (): MapSettingsState => ({
    showLocation: true,
    coordinateFormat: "DecimalDegrees",
  }),
});
