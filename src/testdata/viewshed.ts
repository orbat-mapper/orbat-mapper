/**
 * Helpers for the viewshed tests: a stand-in for the viewshed worker, a fake MapLibre map, and a
 * hand on the observer drag. Mock `@/geo/pointDrag` with `attachPointDragMock` to drive drags.
 */
import { nextTick } from "vue";
import type { Map as MlMap, MapMouseEvent } from "maplibre-gl";
import {
  gridAround,
  gridSizeFor,
  maskingHeights,
  maskToPolygons,
  visibleAt,
  visibleShare,
  type LngLat,
  type ViewshedRequest,
  type ViewshedResult,
} from "@/lib/terrain";
import type { DraggableMap, PointDragOptions } from "@/geo/pointDrag";

/** What the viewshed worker would answer: flat ground at 100 m. */
export function flatResult(request: ViewshedRequest): ViewshedResult {
  const grid = gridAround(
    request.center,
    request.radius,
    gridSizeFor(request.radius, request),
  );
  const heights = new Float32Array(grid.width * grid.height).fill(100);
  const masking = maskingHeights(grid, heights, request);
  const mask = visibleAt(masking, request.targetHeight);
  return {
    grid,
    mask,
    masking,
    sweep: 0,
    outline: request.outline === false ? null : maskToPolygons(grid, mask),
    visibleShare: visibleShare(mask),
  };
}

/** Lets a mocked viewshed client answer and the store and the DOM catch up. */
export async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) await new Promise((resolve) => setTimeout(resolve));
  await nextTick();
}

/** jsdom has no ImageData; the store hands one to the image source. */
export class FakeImageData {
  constructor(
    readonly data: Uint8ClampedArray,
    readonly width: number,
    readonly height: number,
  ) {}
}

/** Just enough of a MapLibre map to record what the store puts on it, and when. */
export function fakeMap() {
  const updates: string[] = [];
  const sources = new Map<string, Record<string, unknown>>();
  const layers = new Set<string>();
  const data = new Map<string, unknown>();
  const container = document.createElement("div");
  const clicks = new Set<(event: MapMouseEvent) => void>();
  const map = {
    getSource: (id: string) => sources.get(id),
    addSource(id: string, spec: { type: string; data?: unknown }) {
      const source: Record<string, unknown> =
        spec.type === "geojson"
          ? {
              setData(next: unknown) {
                data.set(id, next);
                updates.push(id);
              },
            }
          : {
              updateImage(options: { image: unknown }) {
                data.set(id, options.image);
                updates.push(id);
              },
            };
      sources.set(id, source);
      if (spec.data) data.set(id, spec.data);
    },
    removeSource: (id: string) => sources.delete(id),
    getLayer: (id: string) => (layers.has(id) ? { id } : undefined),
    addLayer: ({ id }: { id: string }) => layers.add(id),
    removeLayer: (id: string) => layers.delete(id),
    getLayersOrder: () => [...layers],
    hasImage: () => true,
    addImage: () => {},
    setPaintProperty: () => {},
    setLayoutProperty: () => {},
    on: (type: string, handler: (event: MapMouseEvent) => void) => {
      if (type === "click") clicks.add(handler);
    },
    off: (type: string, handler: (event: MapMouseEvent) => void) => {
      if (type === "click") clicks.delete(handler);
    },
    getCanvasContainer: () => container,
  };
  /** Clicks the map at `[lng, lat]`. */
  const click = ([lng, lat]: LngLat) =>
    clicks.forEach((handler) => handler({ lngLat: { lng, lat } } as MapMouseEvent));
  return { map: map as unknown as MlMap, updates, data, container, click };
}

let dragOptions: PointDragOptions | null = null;

/** Stands in for `attachPointDrag`, so a test drags an observer by hand. */
export function attachPointDragMock(_map: DraggableMap, options: PointDragOptions) {
  dragOptions = options;
  return () => {
    if (dragOptions === options) dragOptions = null;
  };
}

/** The observer drag on the map attached last. */
export const observerDrag = {
  /** Presses the observer at this index, by number. */
  start(index: number) {
    if (!dragOptions?.points().length) throw new Error("No observer to drag");
    dragOptions.onStart(index);
  },
  move(position: LngLat) {
    dragOptions!.onMove(position);
  },
  end() {
    dragOptions!.onEnd();
  },
};
