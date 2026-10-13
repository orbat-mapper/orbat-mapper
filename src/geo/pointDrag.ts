import {
  distancePx,
  HANDLE_HIT_TOLERANCE_PX,
  TOUCH_HANDLE_HIT_TOLERANCE_PX,
} from "@/composables/maplibreTouchDrawing";

type LngLat = [number, number];

/** What of a MapLibre map the drag needs. */
export interface DraggableMap {
  getCanvasContainer(): HTMLElement;
  getCanvas(): HTMLElement;
  project(position: LngLat): { x: number; y: number };
  unproject(point: [number, number]): { lng: number; lat: number };
}

export interface PointDragOptions {
  /** Where the points are now; none when there is nothing to drag. */
  points: () => readonly LngLat[];
  /** A drag of the point at this index in `points` begins. */
  onStart: (index: number) => void;
  onMove: (position: LngLat) => void;
  onEnd: () => void;
}

/**
 * Lets points on the map be dragged, the nearest under the press. The press is claimed in the capture
 * phase, before it reaches the canvas: MapLibre would pan, and the map's own
 * handlers would start a selection or a box zoom under it. The
 * drag then follows pointer events on the window, so it works for mouse and
 * touch alike and survives the pointer leaving the map.
 */
export function attachPointDrag(
  map: DraggableMap,
  { points, onStart, onMove, onEnd }: PointDragOptions,
): () => void {
  const container = map.getCanvasContainer();
  const canvas = map.getCanvas();
  let cursorSet = false;

  function local(clientX: number, clientY: number): [number, number] {
    const box = container.getBoundingClientRect();
    return [clientX - box.left, clientY - box.top];
  }

  /** The index of the nearest point within `tolerance`, or -1. */
  function hit(clientX: number, clientY: number, tolerance: number): number {
    const [x, y] = local(clientX, clientY);
    let nearest = -1;
    let best = tolerance;
    points().forEach((point, index) => {
      const distance = distancePx(map.project(point), { x, y });
      if (distance <= best) {
        nearest = index;
        best = distance;
      }
    });
    return nearest;
  }

  function setCursor(cursor: string | null) {
    if (cursor !== null) {
      canvas.style.cursor = cursor;
      cursorSet = true;
    } else if (cursorSet) {
      canvas.style.cursor = "";
      cursorSet = false;
    }
  }

  function onPress(event: MouseEvent | TouchEvent) {
    const point =
      "touches" in event
        ? event.touches.length === 1
          ? event.touches[0]!
          : null
        : event.button === 0
          ? event
          : null;
    // A modifier makes the press a marquee or lasso, which the map owns.
    if (!point || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey)
      return;
    const tolerance =
      "touches" in event ? TOUCH_HANDLE_HIT_TOLERANCE_PX : HANDLE_HIT_TOLERANCE_PX;
    const index = hit(point.clientX, point.clientY, tolerance);
    if (index < 0) return;
    event.preventDefault();
    event.stopPropagation();
    setCursor("grabbing");
    onStart(index);
    const move = (moved: PointerEvent) => {
      const lngLat = map.unproject(local(moved.clientX, moved.clientY));
      onMove([lngLat.lng, lngLat.lat]);
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      setCursor(null);
      // The press never reached the map, but the browser still clicks where the
      // drag ends; that click would pick or deselect what lies under the point.
      container.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() =>
        container.removeEventListener("click", swallow, { capture: true }),
      );
      onEnd();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  function swallow(event: MouseEvent) {
    event.stopPropagation();
  }

  function onHover(event: MouseEvent) {
    if (event.buttons) return;
    setCursor(
      hit(event.clientX, event.clientY, HANDLE_HIT_TOLERANCE_PX) >= 0 ? "grab" : null,
    );
  }

  container.addEventListener("mousedown", onPress, { capture: true });
  container.addEventListener("touchstart", onPress, { capture: true, passive: false });
  container.addEventListener("mousemove", onHover);
  return () => {
    container.removeEventListener("mousedown", onPress, { capture: true });
    container.removeEventListener("touchstart", onPress, { capture: true });
    container.removeEventListener("mousemove", onHover);
    setCursor(null);
  };
}
