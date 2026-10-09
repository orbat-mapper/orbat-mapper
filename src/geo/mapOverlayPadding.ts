/**
 * Padding for "zoom to" fits that keeps the target clear of UI floating over the map
 * (header, toolbars, an overlay details panel). Such UI marks itself with the
 * `data-map-overlay` attribute; a sidebar beside the map needs no mark, since it
 * never overlaps the map container. MapLibre's own controls count without one.
 */

import type { Padding } from "@/geo/contracts/mapAdapter";

const MAP_OVERLAY_ATTRIBUTE = "data-map-overlay";
const DEFAULT_FIT_PADDING: Padding = [40, 40, 40, 40];

/** The share of each map dimension the padding may take before it is scaled down. */
const MAX_PADDING_SHARE = 0.75;

interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Pads the map down to its largest area no overlay covers, plus `base` around that.
 * Picking the area rather than an edge per overlay matters on a short map, where a
 * tall overlay panel would otherwise push the target into a strip below it.
 */
export function computeOverlayPadding(
  container: Rect,
  overlays: Rect[],
  base: Padding = DEFAULT_FIT_PADDING,
): Padding {
  const clipped = overlays
    .map((rect) => ({
      top: Math.max(rect.top, container.top),
      right: Math.min(rect.right, container.right),
      bottom: Math.min(rect.bottom, container.bottom),
      left: Math.max(rect.left, container.left),
    }))
    .filter((rect) => rect.right > rect.left && rect.bottom > rect.top);
  const free = largestFreeRect(container, clipped) ?? container;
  const padding: Padding = [
    base[0] + free.top - container.top,
    base[1] + container.right - free.right,
    base[2] + container.bottom - free.bottom,
    base[3] + free.left - container.left,
  ];
  const width = container.right - container.left;
  const height = container.bottom - container.top;
  scalePair(padding, 1, 3, width * MAX_PADDING_SHARE);
  scalePair(padding, 0, 2, height * MAX_PADDING_SHARE);
  return padding;
}

/**
 * A free rectangle as large as possible has each side on the container's edge or on
 * an overlay's opposite edge, so trying every such combination finds it. There are a
 * dozen or so overlays, which keeps this cheap enough to run on each fit.
 */
function largestFreeRect(container: Rect, overlays: Rect[]): Rect | undefined {
  const edges = (own: number, from: (rect: Rect) => number) => [
    ...new Set([own, ...overlays.map(from)]),
  ];
  const lefts = edges(container.left, (rect) => rect.right);
  const rights = edges(container.right, (rect) => rect.left);
  const tops = edges(container.top, (rect) => rect.bottom);
  const bottoms = edges(container.bottom, (rect) => rect.top);
  let best: Rect | undefined;
  let bestArea = 0;
  for (const left of lefts) {
    for (const right of rights) {
      if (right <= left) continue;
      for (const top of tops) {
        for (const bottom of bottoms) {
          const area = (right - left) * (bottom - top);
          if (bottom <= top || area <= bestArea) continue;
          const blocked = overlays.some(
            (rect) =>
              rect.left < right &&
              rect.right > left &&
              rect.top < bottom &&
              rect.bottom > top,
          );
          if (blocked) continue;
          best = { top, right, bottom, left };
          bestArea = area;
        }
      }
    }
  }
  return best;
}

// MapLibre refuses to fit when the padding leaves no room, so a crowded small map
// gets proportionally less of it instead.
function scalePair(padding: Padding, a: number, b: number, max: number) {
  const total = padding[a] + padding[b];
  if (total <= max) return;
  const scale = Math.max(max, 0) / total;
  padding[a] = Math.floor(padding[a] * scale);
  padding[b] = Math.floor(padding[b] * scale);
}

function visibleRects(elements: Element[]): Rect[] {
  return elements
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);
}

export function getMapOverlayPadding(container: HTMLElement, base?: Padding): Padding {
  const overlays = [
    // An overlay's own box can miss children positioned outside it (the draw toolbar
    // stacked above the bottom toolbar), so each child box counts as well.
    ...Array.from(document.querySelectorAll(`[${MAP_OVERLAY_ATTRIBUTE}]`)).flatMap((el) =>
      visibleRects([el, ...Array.from(el.children)]),
    ),
    // MapLibre's own controls (zoom buttons, attribution) sit in the map's corners.
    ...visibleRects(Array.from(container.querySelectorAll(".maplibregl-ctrl"))),
  ];
  return computeOverlayPadding(container.getBoundingClientRect(), overlays, base);
}
