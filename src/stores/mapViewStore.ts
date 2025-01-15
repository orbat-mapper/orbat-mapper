import { defineStore } from "pinia";

export interface MapViewState {
  zoomLevel: number;
}
export const useMapViewStore = defineStore("mapView", {
  state: (): MapViewState => ({
    zoomLevel: 0,
  }),
});
