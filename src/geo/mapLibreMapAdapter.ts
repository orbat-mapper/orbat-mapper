import type { GeoJSON, Position } from "geojson";
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONSource,
  LineLayerSpecification,
  Map as MlMap,
  MapMouseEvent,
} from "maplibre-gl";
import type { AllGeoJSON } from "@turf/helpers";
import turfBbox from "@turf/bbox";
import type {
  AnimateOptions,
  FitOptions,
  GeoJsonOverlayOptions,
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
  dblclick: "dblclick",
};

const UNIT_LAYER_ID = "unitLayer";
const UNIT_LAYER_PREFIX = `${UNIT_LAYER_ID}-`;

function isUnitLayerId(layerId: string | undefined) {
  return layerId === UNIT_LAYER_ID || layerId?.startsWith(UNIT_LAYER_PREFIX);
}

function toMapEventPayload(mlMap: MlMap, e: MapMouseEvent, includeUnitHit: boolean) {
  const originalEvent = e.originalEvent as Event | undefined;
  const unitFeature =
    includeUnitHit && e.point
      ? mlMap
          .queryRenderedFeatures(e.point)
          .find((feature) => isUnitLayerId(feature.layer.id))
      : undefined;
  const rawUnitId = unitFeature?.properties?.id;
  const unitId =
    rawUnitId === undefined || rawUnitId === null ? undefined : String(rawUnitId);

  return {
    coordinate: e.lngLat ? [e.lngLat.lng, e.lngLat.lat] : undefined,
    pixel: e.point ? ([e.point.x, e.point.y] as [number, number]) : undefined,
    unitId,
    targetUnitId: unitId,
    stopPropagation: () => {
      e.preventDefault();
      originalEvent?.preventDefault();
      originalEvent?.stopPropagation();
    },
  };
}

export class MapLibreMapAdapter implements MapAdapter {
  private _viewConstraints: ViewConstraints = {};
  private readonly geoJsonOverlays = new Map<
    string,
    { geojson: GeoJSON | null; options: GeoJsonOverlayOptions }
  >();

  constructor(private mlMap: MlMap) {
    this.mlMap.on("style.load", this.handleStyleLoad);
  }

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
      handler(
        toMapEventPayload(this.mlMap, e, event === "click" || event === "singleclick"),
      );
    };
    this.mlMap.on(mlEvent as any, wrappedHandler as any);
    return () => this.mlMap.off(mlEvent as any, wrappedHandler as any);
  }

  once(event: MapEventType, handler: MapEventHandler): () => void {
    const mlEvent = ML_EVENT_MAP[event];
    let removed = false;
    const wrappedHandler = (e: MapMouseEvent) => {
      if (removed) return;
      handler(
        toMapEventPayload(this.mlMap, e, event === "click" || event === "singleclick"),
      );
    };
    this.mlMap.once(mlEvent as any, wrappedHandler as any);
    return () => {
      removed = true;
      this.mlMap.off(mlEvent as any, wrappedHandler as any);
    };
  }

  addGeoJsonOverlay(
    id: string,
    geojson: GeoJSON | null | undefined,
    options: GeoJsonOverlayOptions = {},
  ): void {
    const normalizedGeoJson = geojson ?? null;
    this.geoJsonOverlays.set(id, { geojson: normalizedGeoJson, options });
    this.ensureGeoJsonOverlay(id, options);
    const source = this.mlMap.getSource(this.getGeoJsonOverlaySourceId(id)) as
      | GeoJSONSource
      | undefined;
    source?.setData(
      normalizedGeoJson ?? {
        type: "FeatureCollection",
        features: [],
      },
    );
  }

  removeGeoJsonOverlay(id: string): void {
    this.geoJsonOverlays.delete(id);
    this.removeGeoJsonOverlayFromMap(id);
  }

  getNativeMap(): MlMap {
    return this.mlMap;
  }

  private readonly handleStyleLoad = () => {
    for (const [id, overlay] of this.geoJsonOverlays.entries()) {
      this.ensureGeoJsonOverlay(id, overlay.options);
      const source = this.mlMap.getSource(this.getGeoJsonOverlaySourceId(id)) as
        | GeoJSONSource
        | undefined;
      source?.setData(
        overlay.geojson ?? {
          type: "FeatureCollection",
          features: [],
        },
      );
    }
  };

  private ensureGeoJsonOverlay(id: string, options: GeoJsonOverlayOptions) {
    const sourceId = this.getGeoJsonOverlaySourceId(id);
    if (!this.mlMap.getSource(sourceId)) {
      this.mlMap.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
    }

    const fillLayerId = this.getGeoJsonOverlayLayerId(id, "fill");
    const lineLayerId = this.getGeoJsonOverlayLayerId(id, "line");
    const circleLayerId = this.getGeoJsonOverlayLayerId(id, "circle");
    const style = options.style ?? {};
    const lineDashArray = toMapLibreLineDashArray(
      style.strokeLineDash ?? [10, 10],
      style.strokeWidth ?? 3,
    );

    this.upsertLayer(fillLayerId, {
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": style.fillColor ?? "rgba(188,35,65,0.2)",
      },
    } satisfies FillLayerSpecification);

    this.upsertLayer(lineLayerId, {
      id: lineLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": style.strokeColor ?? "red",
        "line-width": style.strokeWidth ?? 3,
        ...(lineDashArray ? { "line-dasharray": lineDashArray } : {}),
      },
    } satisfies LineLayerSpecification);

    this.upsertLayer(circleLayerId, {
      id: circleLayerId,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": style.circleRadius ?? 5,
        "circle-color": style.circleFillColor ?? "red",
        "circle-stroke-color": style.circleStrokeColor ?? "red",
        "circle-stroke-width": 1,
      },
    } satisfies CircleLayerSpecification);
  }

  private upsertLayer(
    id: string,
    spec: FillLayerSpecification | LineLayerSpecification | CircleLayerSpecification,
  ) {
    if (this.mlMap.getLayer(id)) {
      this.mlMap.removeLayer(id);
    }
    this.mlMap.addLayer(spec as any);
  }

  private removeGeoJsonOverlayFromMap(id: string) {
    const map = this.mlMap;
    if (
      !map ||
      typeof map.getLayer !== "function" ||
      typeof map.getSource !== "function"
    ) {
      return;
    }

    const fillLayerId = this.getGeoJsonOverlayLayerId(id, "fill");
    const lineLayerId = this.getGeoJsonOverlayLayerId(id, "line");
    const circleLayerId = this.getGeoJsonOverlayLayerId(id, "circle");
    for (const layerId of [circleLayerId, lineLayerId, fillLayerId]) {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    }

    const sourceId = this.getGeoJsonOverlaySourceId(id);
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  }

  private getGeoJsonOverlaySourceId(id: string) {
    return `geojson-overlay-source-${id}`;
  }

  private getGeoJsonOverlayLayerId(id: string, kind: "fill" | "line" | "circle") {
    return `geojson-overlay-${kind}-${id}`;
  }
}

function toMapLibreLineDashArray(lineDash: number[], lineWidth: number) {
  if (!lineDash.length || lineWidth <= 0) return undefined;
  return lineDash.map((segment) => segment / lineWidth);
}
