import type { ChangeGroup, TimelineChange } from "./timelineChanges";

/** The times a change snaps by, and can be snapped to: a mark's time, or a leg's start
 * and end. */
export function snapTimes({ t, leg }: TimelineChange): number[] {
  return leg ? [leg.start, leg.end] : [t];
}

/** The times a dragged mark can snap to: when the marks on the lanes change. Marks being
 * moved are left out, since they move along. */
export function snapTargets(lanes: ChangeGroup[], moving: Set<string>): number[] {
  return lanes.flatMap((lane) =>
    lane.changes.filter((c) => !moving.has(c.id)).flatMap(snapTimes),
  );
}

export interface Snap {
  /** How far to move the dragged item for its edge to land on the target. */
  delta: number;
  target: number;
}

/** The nearest target within `threshold` of any of a dragged item's edges, such as a
 * mark's time or a leg's start and end, once moved by `offset`. Targets the item can't
 * be moved to, by more than `bounds` allow, are passed over. The move is worked out from
 * the edge itself, so it lands exactly on the target. */
export function nearestSnap(
  edges: number[],
  offset: number,
  targets: number[],
  threshold: number,
  [min, max]: readonly [number, number] = [-Infinity, Infinity],
): Snap | null {
  let best: Snap | null = null;
  let bestDistance = Infinity;
  for (const edge of edges) {
    for (const target of targets) {
      const delta = target - edge;
      const distance = Math.abs(delta - offset);
      if (
        distance <= threshold &&
        distance < bestDistance &&
        delta >= min &&
        delta <= max
      ) {
        bestDistance = distance;
        best = { delta, target };
      }
    }
  }
  return best;
}
