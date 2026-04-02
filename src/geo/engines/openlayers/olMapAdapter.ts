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
} from "@/geo/contracts/mapAdapter";

export class OlMapAdapter implements MapAdapter {
  constructor(private olMap: OLMap) {}

  private get projection() {
    return this.olMap.getView().getProjection();
  }

  animateView(options: AnimateOptions): void {
    const view = this.olMap.getView();
    view.animate({
      zoom: options.zoom,
      center: options.center ? fromLonLat(options.center, this.projection) : undefined,
      duration: options.duration,
    });
  }

  fitExtent(bbox: [number, number, number, number], options: FitOptions = {}): void {
    const { duration = 900, maxZoom = 15, padding } = options;
    const extent = transformExtent(bbox, "EPSG:4326", this.projection);
    this.olMap.getView().fit(extent, { maxZoom, duration, padding });
  }

  fitGeometry(geojson: AllGeoJSON, options: FitOptions = {}): void {
    const { duration = 900, maxZoom = 15, padding } = options;
    const bb = new GeoJSON().readFeature(turfEnvelope(geojson), {
      featureProjection: this.projection,
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
    const size = this.olMap.getSize();
    if (!size) return;
    const extent = view.calculateExtent(size);
    if (!extent) return;
    return transformExtent(extent, this.projection, "EPSG:4326") as [
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
    return toLonLat(center, this.projection) as Position;
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
    return toLonLat(coordinate, this.projection) as Position;
  }

  fromLonLat(position: Position): number[] {
    return fromLonLat(position, this.projection);
  }

  getEventCoordinate(event: MouseEvent): Position {
    return toLonLat(this.olMap.getEventCoordinate(event), this.projection) as Position;
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
        coordinate: e.coordinate
          ? (toLonLat(e.coordinate, this.projection) as Position)
          : undefined,
        pixel: e.pixel as [number, number] | undefined,
        stopPropagation: () => e.stopPropagation(),
      });
    });
    return () => unByKey(key);
  }

  once(event: MapEventType, handler: MapEventHandler): () => void {
    const key = this.olMap.once(event as any, (e: any) => {
      handler({
        coordinate: e.coordinate
          ? (toLonLat(e.coordinate, this.projection) as Position)
          : undefined,
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
