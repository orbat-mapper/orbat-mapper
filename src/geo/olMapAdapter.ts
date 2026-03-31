import type OLMap from "ol/Map";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import type { AllGeoJSON } from "@turf/helpers";
import type { Position } from "geojson";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import SimpleGeometry from "ol/geom/SimpleGeometry";
import turfEnvelope from "@turf/envelope";
import { unByKey } from "ol/Observable";
import type {
  AnimateOptions,
  FitOptions,
  MapAdapter,
  MapEventHandler,
  MapEventType,
} from "./mapAdapter";

export class OlMapAdapter implements MapAdapter {
  constructor(private olMap: OLMap) {}

  animateView(options: AnimateOptions): void {
    const view = this.olMap.getView();
    view.animate({
      zoom: options.zoom,
      center: options.center
        ? fromLonLat(options.center, view.getProjection())
        : undefined,
      duration: options.duration,
    });
  }

  fitExtent(bbox: [number, number, number, number], options: FitOptions = {}): void {
    const { duration = 900, maxZoom = 15, padding } = options;
    const extent = transformExtent(bbox, "EPSG:4326", "EPSG:3857");
    this.olMap.getView().fit(extent, { maxZoom, duration, padding });
  }

  fitGeometry(geojson: AllGeoJSON, options: FitOptions = {}): void {
    const { duration = 900, maxZoom = 15, padding } = options;
    const bb = new GeoJSON().readFeature(turfEnvelope(geojson), {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    }) as Feature;
    if (!bb) return;
    const geom = bb.getGeometry();
    if (geom instanceof SimpleGeometry) {
      this.olMap.getView().fit(geom, { maxZoom, duration, padding });
    }
  }

  getViewBbox(): [number, number, number, number] | undefined {
    const view = this.olMap.getView();
    const extent = view.calculateExtent(this.olMap.getSize());
    if (!extent) return;
    return transformExtent(extent, "EPSG:3857", "EPSG:4326") as [
      number,
      number,
      number,
      number,
    ];
  }

  getZoom(): number | undefined {
    return this.olMap.getView().getZoom();
  }

  getCenter(): Position | undefined {
    const center = this.olMap.getView().getCenter();
    if (!center) return;
    return toLonLat(center) as Position;
  }

  getResolution(): number | undefined {
    return this.olMap.getView().getResolution();
  }

  getRotation(): number {
    return this.olMap.getView().getRotation();
  }

  getResolutionForZoom(zoom: number): number | undefined {
    return this.olMap.getView().getResolutionForZoom(zoom);
  }

  updateSize(): void {
    this.olMap.updateSize();
  }

  toLonLat(coordinate: number[]): Position {
    return toLonLat(coordinate) as Position;
  }

  fromLonLat(position: Position): number[] {
    return fromLonLat(position, this.olMap.getView().getProjection());
  }

  getTargetElement(): HTMLElement | undefined {
    return this.olMap.getTargetElement() ?? undefined;
  }

  setCursor(cursor: string): void {
    const el = this.getTargetElement();
    if (el) el.style.cursor = cursor;
  }

  on(event: MapEventType, handler: MapEventHandler): () => void {
    const key = this.olMap.on(event as any, (e: any) => {
      handler({
        coordinate: e.coordinate ? (toLonLat(e.coordinate) as Position) : undefined,
        pixel: e.pixel as [number, number] | undefined,
        stopPropagation: () => e.stopPropagation(),
      });
    });
    return () => unByKey(key);
  }

  once(event: MapEventType, handler: MapEventHandler): () => void {
    const key = this.olMap.once(event as any, (e: any) => {
      handler({
        coordinate: e.coordinate ? (toLonLat(e.coordinate) as Position) : undefined,
        pixel: e.pixel as [number, number] | undefined,
        stopPropagation: () => e.stopPropagation(),
      });
    });
    return () => unByKey(key);
  }

  getNativeMap(): OLMap {
    return this.olMap;
  }
}
