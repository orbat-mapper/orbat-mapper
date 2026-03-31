import type { AllGeoJSON } from "@turf/helpers";
import type { Position } from "geojson";

export interface FitOptions {
  maxZoom?: number;
  duration?: number;
  padding?: number[];
}

export interface AnimateOptions {
  zoom?: number;
  center?: Position;
  duration?: number;
}

export type MapEventType = "moveend" | "click" | "pointermove" | "singleclick";

export type MapEventHandler = (event: {
  coordinate?: Position;
  pixel?: [number, number];
}) => void;

export interface MapAdapter {
  // View operations
  animateView(options: AnimateOptions): void;
  fitExtent(bbox: [number, number, number, number], options?: FitOptions): void;
  fitGeometry(geojson: AllGeoJSON, options?: FitOptions): void;
  getViewBbox(): [number, number, number, number] | undefined;
  getZoom(): number | undefined;
  getCenter(): Position | undefined;
  getResolution(): number | undefined;
  getRotation(): number;
  getResolutionForZoom(zoom: number): number | undefined;
  updateSize(): void;

  // Coordinate conversion
  toLonLat(coordinate: number[]): Position;
  fromLonLat(position: Position): number[];

  // DOM
  getTargetElement(): HTMLElement | undefined;
  setCursor(cursor: string): void;

  // Map events
  on(event: MapEventType, handler: MapEventHandler): () => void;
  once(event: MapEventType, handler: MapEventHandler): () => void;

  // Escape hatch for incremental migration — returns the underlying
  // library-specific map object. Callers using this are still coupled
  // to the concrete map library.
  getNativeMap(): unknown;
}
