import { defineStore } from "pinia";
import type { Bbox } from "@/geo/contracts/mapAdapter";

export interface MapViewState {
  zoomLevel: number;
  /** The visible map area as [west, south, east, north] in lon/lat, updated after every
   * pan or zoom. West/east can fall outside ±180 when the view crosses the antimeridian. */
  viewBbox: Bbox | null;
}
export const useMapViewStore = defineStore("mapView", {
  state: (): MapViewState => ({
    zoomLevel: 0,
    viewBbox: null,
  }),
});
