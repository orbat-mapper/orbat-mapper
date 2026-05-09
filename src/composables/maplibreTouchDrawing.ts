import type { Position } from "geojson";
import { isZeroLengthSegment } from "@/geo/distance";

const TOUCH_DOUBLE_TAP_MS = 350;
const TOUCH_DOUBLE_TAP_TOLERANCE_PX = 30;

type PointLike = { x: number; y: number };
type TouchEventLike = {
  point: PointLike;
  originalEvent: { timeStamp?: number };
};

type SuppressibleMapEvent = {
  preventDefault: () => void;
  originalEvent: {
    cancelable?: boolean;
    type?: string;
    preventDefault: () => void;
    stopPropagation: () => void;
  };
};

export function createTouchDoubleTapTracker() {
  let lastTouchEnd: { time: number; point: { x: number; y: number } } | null = null;

  return {
    reset() {
      lastTouchEnd = null;
    },
    isDoubleTap(e: TouchEventLike, eligible: boolean) {
      const touchEnd = {
        time: getEventTime(e),
        point: e.point,
      };
      const doubleTap =
        eligible &&
        lastTouchEnd &&
        touchEnd.time - lastTouchEnd.time <= TOUCH_DOUBLE_TAP_MS &&
        distancePx(touchEnd.point, lastTouchEnd.point) <= TOUCH_DOUBLE_TAP_TOLERANCE_PX;

      lastTouchEnd = doubleTap ? null : touchEnd;
      return Boolean(doubleTap);
    },
  };
}

export function normalizePathCoordinates(coordinates: Position[]): Position[] {
  return coordinates.reduce<Position[]>((normalized, coordinate) => {
    const previous = normalized[normalized.length - 1];
    if (previous && isZeroLengthSegment(previous, coordinate)) return normalized;
    normalized.push(coordinate);
    return normalized;
  }, []);
}

export function getPreviousDistinctVertex(coordinates: Position[], beforeIndex: number) {
  const vertex = coordinates[beforeIndex];
  if (!vertex) return null;
  for (let index = beforeIndex - 1; index >= 0; index -= 1) {
    const candidate = coordinates[index]!;
    if (!isZeroLengthSegment(candidate, vertex)) return candidate;
  }
  return null;
}

export function suppressMapEvent(e: SuppressibleMapEvent) {
  e.preventDefault();
  if (canPreventDomDefault(e.originalEvent)) {
    e.originalEvent.preventDefault();
  }
  e.originalEvent.stopPropagation();
}

function canPreventDomDefault(event: SuppressibleMapEvent["originalEvent"]) {
  // Mobile browsers can still emit passive-listener warnings for touch events
  // even when the DOM event advertises cancelable: true.
  return event.cancelable !== false && !event.type?.startsWith("touch");
}

function getEventTime(e: TouchEventLike) {
  return typeof e.originalEvent.timeStamp === "number"
    ? e.originalEvent.timeStamp
    : Date.now();
}

function distancePx(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
