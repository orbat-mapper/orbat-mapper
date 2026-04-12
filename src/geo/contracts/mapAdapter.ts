import type { AllGeoJSON } from "@turf/helpers";
import type { Position } from "geojson";

export interface FitOptions {
  maxZoom?: number;
  duration?: number;
  padding?: [number, number, number, number];
}

export interface AnimateOptions {
  zoom?: number;
  center?: Position;
  duration?: number;
}

export interface ViewConstraints {
  extent?: [number, number, number, number] | null;
  minZoom?: number | null;
  maxZoom?: number | null;
}

export type MapEventType = "moveend" | "click" | "pointermove" | "singleclick";

export interface MapEvent {
  coordinate?: Position;
  pixel?: [number, number];
  stopPropagation(): void;
}

export type MapEventHandler = (event: MapEvent) => void;

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
  getViewConstraints(): ViewConstraints;
  setViewConstraints(constraints: ViewConstraints): void;
  updateSize(): void;

  // Coordinate conversion
  toLonLat(coordinate: number[]): Position;
  fromLonLat(position: Position): number[];
  getEventCoordinate(event: MouseEvent): Position;

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
