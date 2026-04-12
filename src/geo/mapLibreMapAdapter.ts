import type { Map as MlMap, MapMouseEvent } from "maplibre-gl";
import type { AllGeoJSON } from "@turf/helpers";
import type { Position } from "geojson";
import turfBbox from "@turf/bbox";
import type {
  AnimateOptions,
  FitOptions,
  MapAdapter,
  MapEventHandler,
  MapEventType,
  ViewConstraints,
} from "@/geo/contracts/mapAdapter";

const ML_EVENT_MAP: Record<MapEventType, string> = {
  moveend: "moveend",
  click: "click",
  pointermove: "mousemove",
  singleclick: "click",
};

function toMapEventPayload(e: MapMouseEvent) {
  const originalEvent = e.originalEvent as Event | undefined;

  return {
    coordinate: e.lngLat ? [e.lngLat.lng, e.lngLat.lat] : undefined,
    pixel: e.point ? ([e.point.x, e.point.y] as [number, number]) : undefined,
    stopPropagation: () => {
      e.preventDefault();
      originalEvent?.preventDefault();
      originalEvent?.stopPropagation();
    },
  };
}

export class MapLibreMapAdapter implements MapAdapter {
  private _viewConstraints: ViewConstraints = {};

  constructor(private mlMap: MlMap) {}

  animateView(options: AnimateOptions): void {
    this.mlMap.flyTo({
      zoom: options.zoom,
      center: options.center as [number, number] | undefined,
      duration: options.duration,
    });
  }

  fitExtent(bbox: [number, number, number, number], options: FitOptions = {}): void {
    const { duration = 900, maxZoom = 15, padding } = options;
    this.mlMap.fitBounds(bbox, {
      maxZoom,
      duration,
      padding: padding
        ? { top: padding[0], right: padding[1], bottom: padding[2], left: padding[3] }
        : undefined,
    });
  }

  fitGeometry(geojson: AllGeoJSON, options: FitOptions = {}): void {
    const bbox = turfBbox(geojson) as [number, number, number, number];
    this.fitExtent(bbox, options);
  }

  getViewBbox(): [number, number, number, number] | undefined {
    const bounds = this.mlMap.getBounds();
    if (!bounds) return undefined;
    return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
  }

  getZoom(): number | undefined {
    return this.mlMap.getZoom();
  }

  getCenter(): Position | undefined {
    const center = this.mlMap.getCenter();
    return [center.lng, center.lat];
  }

  getResolution(): number | undefined {
    return undefined;
  }

  getRotation(): number {
    return (this.mlMap.getBearing() * Math.PI) / 180;
  }

  getResolutionForZoom(_zoom: number): number | undefined {
    return undefined;
  }

  getViewConstraints(): ViewConstraints {
    return this._viewConstraints;
  }

  setViewConstraints(constraints: ViewConstraints): void {
    this._viewConstraints = { ...this._viewConstraints, ...constraints };
    if (constraints.extent !== undefined) {
      this.mlMap.setMaxBounds(constraints.extent || null);
    }
    if (constraints.minZoom !== undefined) {
      this.mlMap.setMinZoom(constraints.minZoom ?? null);
    }
    if (constraints.maxZoom !== undefined) {
      this.mlMap.setMaxZoom(constraints.maxZoom ?? null);
    }
  }

  updateSize(): void {
    this.mlMap.resize();
  }

  toLonLat(coordinate: number[]): Position {
    return coordinate as Position;
  }

  fromLonLat(position: Position): number[] {
    return position as number[];
  }

  getEventCoordinate(event: MouseEvent): Position {
    const container = this.mlMap.getContainer();
    const rect = container.getBoundingClientRect();
    const lngLat = this.mlMap.unproject([
      event.clientX - rect.left,
      event.clientY - rect.top,
    ]);
    return [lngLat.lng, lngLat.lat];
  }

  getTargetElement(): HTMLElement | undefined {
    return this.mlMap.getContainer() ?? undefined;
  }

  setCursor(cursor: string): void {
    this.mlMap.getCanvas().style.cursor = cursor;
  }

  on(event: MapEventType, handler: MapEventHandler): () => void {
    const mlEvent = ML_EVENT_MAP[event];
    const wrappedHandler = (e: MapMouseEvent) => {
      handler(toMapEventPayload(e));
    };
    this.mlMap.on(mlEvent as any, wrappedHandler as any);
    return () => this.mlMap.off(mlEvent as any, wrappedHandler as any);
  }

  once(event: MapEventType, handler: MapEventHandler): () => void {
    const mlEvent = ML_EVENT_MAP[event];
    let removed = false;
    const wrappedHandler = (e: MapMouseEvent) => {
      if (removed) return;
      handler(toMapEventPayload(e));
    };
    this.mlMap.once(mlEvent as any, wrappedHandler as any);
    return () => {
      removed = true;
      this.mlMap.off(mlEvent as any, wrappedHandler as any);
    };
  }

  getNativeMap(): MlMap {
    return this.mlMap;
  }
}
